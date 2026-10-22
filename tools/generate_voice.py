#!/usr/bin/env python3
"""VOICEVOX（ずんだもん）で読み上げ音声を作成し、audio/ フォルダに保存します。

使い方:
  1. VOICEVOX（https://voicevox.hiroshiba.jp/）をインストールして起動しておく
  2. このリポジトリのフォルダで次を実行する
       python tools/generate_voice.py
  3. できた audio/ フォルダを GitHub にアップロードする

オプション:
  --speaker 3        話者ID（3 = ずんだもん ノーマル）。--list-speakers で一覧を表示
  --speed 1.0        話す速さ（VOICEVOX の speedScale）
  --only 1           指定した設問だけ作成
  --format mp3       mp3 / wav（mp3 は ffmpeg が必要。無ければ自動で wav）
  --engine URL       VOICEVOX エンジンのURL（既定 http://127.0.0.1:50021）

Python 3.8 以降の標準ライブラリだけで動きます。
"""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, tempfile, urllib.parse, urllib.request, wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_js_json(name):
    """`window.X = <JSON>;` 形式のファイルから JSON 部分を読み込む"""
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        body = "\n".join(l for l in f.read().splitlines() if not l.lstrip().startswith("//"))
    body = body[body.index("=") + 1:].strip().rstrip(";")
    return json.loads(body)


def speakable_base(text):
    """アプリ側 app.js の speakableBase と同じ処理（記号を言葉に置き換える）"""
    text = re.sub(r"^①", "設問1。", text)
    text = re.sub(r"^②", "設問2。", text)
    text = re.sub(r"^\((\d)\)", r"項目\1。", text)
    text = re.sub(r"^・", "", text)
    return text.replace("「", "").replace("」", "")


def apply_readings(text, readings):
    for src, dst in readings:
        text = text.replace(src, dst)
    return text


def utterances(data, stories):
    """設問ごとに {kind: [base_text, ...]} を作る。並びはアプリの表示順と同じ"""
    out = {}
    for q in data:
        qid = str(q["id"])
        lines = [l for l in q["answer"].split("\n") if l.strip()]
        out[qid] = {"read": [speakable_base(l) for l in lines]}
        if qid in stories:
            out[qid]["story"] = [speakable_base(s["title"] + "。" + s["text"]) for s in stories[qid]]
    return out


def api(engine, path, params=None, body=None, raw=False):
    url = engine.rstrip("/") + path + ("?" + urllib.parse.urlencode(params) if params else "")
    data = json.dumps(body).encode("utf-8") if body is not None else (b"" if path != "/speakers" else None)
    req = urllib.request.Request(url, data=data, method="GET" if data is None else "POST",
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        payload = r.read()
    return payload if raw else json.loads(payload.decode("utf-8"))


def synthesize(engine, text, speaker, speed):
    q = api(engine, "/audio_query", {"text": text, "speaker": speaker})
    q["speedScale"] = speed
    q["prePhonemeLength"] = 0.05
    q["postPhonemeLength"] = 0.2
    q["outputSamplingRate"] = 24000
    return api(engine, "/synthesis", {"speaker": speaker}, body=q, raw=True)


# 1本につなぐときの、区切りの間の無音（秒）。紙芝居は場面の切り替えに少し間をあける
GAPS = {"read": 0.0, "story": 0.6}


def media_duration(path):
    if path.endswith(".wav"):
        with wave.open(path) as w:
            return w.getnframes() / w.getframerate()
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


def build_all(paths, out_path, gap, fmt):
    """行ごとの音声を1本につなぎ、各行の開始位置（秒）のリストを返す。
    画面を消しても途切れずに再生できるようにするための音声"""
    offsets, t = [], 0.0
    for p in paths:
        offsets.append(t)
        t += media_duration(p) + gap

    def fixed():
        # mp3 は1本ごとに前後の詰め物（数十ミリ秒）があり、つなぐと少しずつ短くなる。そのずれを均等に補正する
        delta = (t - media_duration(out_path)) / len(paths) if paths else 0
        return [round(max(0.0, o - i * delta), 3) for i, o in enumerate(offsets)]

    if os.path.exists(out_path):
        return fixed()
    if fmt == "wav":
        frames, params = [], None
        for p in paths:
            with wave.open(p) as w:
                params = params or w.getparams()
                frames.append(w.readframes(w.getnframes()))
                if gap:
                    frames.append(b"\x00" * int(gap * w.getframerate()) * w.getsampwidth() * w.getnchannels())
        with wave.open(out_path, "wb") as o:
            o.setparams(params)
            o.writeframes(b"".join(frames))
        return fixed()
    with tempfile.TemporaryDirectory() as td:
        silence = None
        if gap:
            silence = os.path.join(td, "gap.mp3")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                            "-t", str(gap), "-ac", "1", "-b:a", "64k", silence], check=True)
        lines = []
        for p in paths:
            lines.append("file '%s'" % os.path.abspath(p).replace("'", "'\\''"))
            if silence:
                lines.append("file '%s'" % silence)
        lst = os.path.join(td, "list.txt")
        with open(lst, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                        "-ac", "1", "-ar", "24000", "-b:a", "64k", out_path], check=True)
    return fixed()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--engine", default="http://127.0.0.1:50021")
    ap.add_argument("--speaker", type=int, default=3)
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--only", type=int)
    ap.add_argument("--format", choices=["mp3", "wav"], default="mp3")
    ap.add_argument("--list-speakers", action="store_true")
    args = ap.parse_args()

    try:
        speakers = api(args.engine, "/speakers")
    except Exception as e:
        sys.exit("VOICEVOX エンジンに接続できません（%s）。VOICEVOX を起動してから実行してください。\n%s" % (args.engine, e))
    if args.list_speakers:
        for sp in speakers:
            for st in sp["styles"]:
                print("%4d  %s（%s）" % (st["id"], sp["name"], st["name"]))
        return
    names = {st["id"]: "%s（%s）" % (sp["name"], st["name"]) for sp in speakers for st in sp["styles"]}
    if args.speaker not in names:
        sys.exit("話者ID %d が見つかりません。--list-speakers で確認してください。" % args.speaker)
    credit = "VOICEVOX:" + names[args.speaker].split("（")[0]

    fmt = args.format
    if fmt == "mp3" and not shutil.which("ffmpeg"):
        print("ffmpeg が見つからないため wav で保存します（ファイルが大きくなります）。")
        fmt = "wav"

    data = load_js_json("data.js")
    stories = load_js_json("story-data.js")
    readings = load_js_json("reading.js")
    plan = utterances(data, stories)

    audio_dir = os.path.join(ROOT, "audio")
    manifest_path = os.path.join(audio_dir, "manifest.js")
    manifest = {"credit": credit, "items": {}}
    if os.path.exists(manifest_path):  # --only のとき他の設問の情報を残す
        try:
            manifest = load_js_json(os.path.join("audio", "manifest.js"))
        except Exception:
            pass
    manifest["credit"] = credit

    total = sum(len(v) for qid, kinds in plan.items() if not args.only or int(qid) == args.only for v in kinds.values())
    done = 0
    for qid, kinds in plan.items():
        if args.only and int(qid) != args.only:
            continue
        qdir = os.path.join(audio_dir, "q" + qid)
        os.makedirs(qdir, exist_ok=True)
        keep = set()
        manifest["items"][qid] = {}
        for kind, texts in kinds.items():
            entries = []
            for i, base in enumerate(texts):
                voice_text = apply_readings(base, readings)
                h = hashlib.sha1(("%s|%d|%.2f" % (voice_text, args.speaker, args.speed)).encode("utf-8")).hexdigest()[:8]
                fname = "%s_%03d_%s.%s" % (kind, i, h, fmt)
                path = os.path.join(qdir, fname)
                done += 1
                if not os.path.exists(path):
                    print("[%d/%d] (%s) %s" % (done, total, qid, voice_text[:30]))
                    wav = synthesize(args.engine, voice_text, args.speaker, args.speed)
                    if fmt == "mp3":
                        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
                            t.write(wav)
                        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", t.name, "-ac", "1", "-b:a", "64k", path], check=True)
                        os.remove(t.name)
                    else:
                        with open(path, "wb") as f:
                            f.write(wav)
                keep.add(fname)
                entries.append({"text": base, "file": "audio/q%s/%s" % (qid, fname)})
            manifest["items"][qid][kind] = entries
            # 全体を1本につないだ音声（バックグラウンド再生用）
            names = [e["file"].rsplit("/", 1)[1] for e in entries]
            ah = hashlib.sha1(("|".join(names) + "|%.2f" % GAPS.get(kind, 0)).encode("utf-8")).hexdigest()[:8]
            all_name = "%s_all_%s.%s" % (kind, ah, fmt)
            print("(%s) %s を1本につないでいます…" % (qid, kind))
            offsets = build_all([os.path.join(qdir, n) for n in names], os.path.join(qdir, all_name), GAPS.get(kind, 0), fmt)
            keep.add(all_name)
            manifest["items"][qid][kind + "_all"] = {"file": "audio/q%s/%s" % (qid, all_name), "offsets": offsets}
        for old in os.listdir(qdir):  # 使われなくなった古い音声を削除
            if old not in keep:
                os.remove(os.path.join(qdir, old))

    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write("// tools/generate_voice.py が自動生成します。手で編集しないでください。\n")
        f.write("window.RCCM_AUDIO = " + json.dumps(manifest, ensure_ascii=False, indent=1) + ";\n")
    print("完了：%d 件。audio/ フォルダをアップロードしてください。クレジット表記：%s" % (done, credit))


if __name__ == "__main__":
    main()
