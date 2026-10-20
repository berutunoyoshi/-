(function () {
  "use strict";

  var DATA = window.RCCM_DATA || [];
  var KEY = "rccm3-memo-v1";
  var MIN = 1200, MAX = 1600;

  var HINTS = {
    story: "答案の流れを、絵と物語でつかみます。左右のスワイプかボタンでめくります。",
    read: "見本答案を通して読みます。「 」の用語は青字です。読み上げ中は行をタップするとそこから読みます。",
    outline: "各項目の書き出しだけを表示します。続きを思い出してからタップして確認します。",
    cloze: "指定用語と数値を隠しています。答えを思い浮かべてからタップしてめくります。",
    write: "何も見ずに答案を書きます。下書きはこの端末に自動で保存されます。"
  };

  // ---------- storage ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 保存できない環境では無視 */ }
  }
  var state = load();
  state.done = state.done || {};
  state.drafts = state.drafts || {};
  state.q = state.q || 1;
  state.mode = state.mode || "read";

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function current() {
    for (var i = 0; i < DATA.length; i++) if (DATA[i].id === state.q) return DATA[i];
    return DATA[0];
  }
  function kind(line) {
    if (/^[①②]/.test(line)) return "major";
    if (/^\(\d\)/.test(line)) return "minor";
    if (line.charAt(0) === "・") return "bullet";
    return "plain";
  }
  function lines(q) { return q.answer.split("\n").filter(function (l) { return l.trim(); }); }
  function countChars(s) { return s.replace(/\r?\n/g, "").length; }

  // 「用語」を青字にした要素を返す
  function withTerms(parent, text) {
    var re = /「[^」]+」/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      parent.appendChild(el("span", "term", m[0]));
      last = re.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
    return parent;
  }

  // ---------- header ----------
  function renderPicker() {
    var nav = document.getElementById("picker");
    nav.innerHTML = "";
    DATA.forEach(function (q) {
      var b = el("button");
      b.type = "button";
      b.textContent = "(" + q.id + ") " + q.short;
      if (state.done[q.id]) b.appendChild(el("span", "check", "✓"));
      b.setAttribute("aria-current", q.id === state.q ? "true" : "false");
      b.addEventListener("click", function () { state.q = q.id; save(); render(); });
      nav.appendChild(b);
      if (q.id === state.q) setTimeout(function () { b.scrollIntoView({ block: "nearest", inline: "nearest" }); }, 0);
    });
    var n = Object.keys(state.done).filter(function (k) { return state.done[k]; }).length;
    document.getElementById("progress").textContent = "覚えた " + n + " / " + DATA.length;
  }

  function renderHead(q) {
    document.getElementById("qtitle").textContent = "(" + q.id + ") " + q.title;
    var t = document.getElementById("doneToggle");
    var done = !!state.done[q.id];
    t.setAttribute("aria-pressed", done ? "true" : "false");
    t.textContent = done ? "✓ 覚えた" : "覚えたら押す";
    t.onclick = function () { state.done[q.id] = !state.done[q.id]; save(); render(); };

    var body = document.getElementById("promptBody");
    body.innerHTML = "";
    body.appendChild(el("p", null, q.prompt + "次の" + q.terms.length + "個の用語の中から4つ以上を用い、用いた用語は「 」で囲むこと。"));
    var ul = el("ul", "chips");
    q.terms.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    body.appendChild(ul);
    var ol = el("ol");
    ol.appendChild(el("li", null, q.q1));
    ol.appendChild(el("li", null, q.q2));
    body.appendChild(ol);

    document.querySelectorAll(".modes button").forEach(function (b) {
      b.setAttribute("aria-selected", b.dataset.mode === state.mode ? "true" : "false");
    });
    document.getElementById("hint").textContent = HINTS[state.mode];
  }

  // ---------- modes ----------
  function renderRead(q, view, asModel) {
    var nodes = [];
    lines(q).forEach(function (l) {
      var k = kind(l);
      var tag = k === "major" ? "h3" : k === "minor" ? "h4" : "p";
      var n = withTerms(el(tag, k), l);
      nodes.push({ node: n, text: l });
      view.appendChild(n);
    });
    if (asModel) return;
    addSpeech(nodes);
    tools().appendChild(el("span", "tool-note", "見本 " + countChars(q.answer) + "字"));
  }

  // ---------- 読み上げ（Web Speech API） ----------
  var synth = window.speechSynthesis;
  var speech = { idx: -1, nodes: null, playing: false };

  function jaVoice() {
    if (!synth) return null;
    var vs = synth.getVoices().filter(function (v) { return /^ja(-|_|$)/i.test(v.lang); });
    return vs[0] || null;
  }

  // 記号を読みやすい言葉に置き換える
  function speakable(text) {
    return text
      .replace(/^①/, "設問1。")
      .replace(/^②/, "設問2。")
      .replace(/^\((\d)\)/, "項目$1。")
      .replace(/^・/, "")
      .replace(/[「」]/g, "")
      .replace(/BIM\/CIM/g, "ビム・シム")
      .replace(/\//g, "・");
  }

  function stopSpeech() {
    speech.playing = false;
    if (synth) synth.cancel();
    if (speech.nodes && speech.nodes[speech.idx]) speech.nodes[speech.idx].node.classList.remove("speaking");
    speech.idx = -1;
    if (speech.btn) speech.btn.textContent = "▶ 読み上げ";
  }

  function speakFrom(i) {
    if (!speech.playing || !speech.nodes || i >= speech.nodes.length) { stopSpeech(); return; }
    if (speech.nodes[speech.idx]) speech.nodes[speech.idx].node.classList.remove("speaking");
    speech.idx = i;
    var item = speech.nodes[i];
    item.node.classList.add("speaking");
    item.node.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
    var u = new SpeechSynthesisUtterance(speakable(item.text));
    u.lang = "ja-JP";
    var v = jaVoice();
    if (v) u.voice = v;
    u.rate = state.rate || 1;
    u.onend = function () { if (speech.playing && speech.idx === i) speakFrom(i + 1); };
    u.onerror = function (e) { if (e.error !== "interrupted" && e.error !== "canceled") stopSpeech(); };
    synth.speak(u);
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function addSpeech(nodes) {
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      tools().appendChild(el("span", "tool-note", "このブラウザは読み上げに対応していません"));
      return;
    }
    speech.nodes = nodes;
    var btn = el("button", "tool", "▶ 読み上げ");
    btn.type = "button";
    speech.btn = btn;
    btn.addEventListener("click", function () {
      if (speech.playing) { stopSpeech(); return; }
      start(Math.max(0, speech.idx));
    });
    function start(i) {
      synth.cancel();
      speech.playing = true;
      btn.textContent = "■ 停止";
      speakFrom(i);
    }
    var rate = el("select", "tool");
    rate.setAttribute("aria-label", "読み上げの速さ");
    [["0.8", "ゆっくり"], ["1", "ふつう"], ["1.3", "速い"], ["1.6", "とても速い"]].forEach(function (r) {
      var o = el("option", null, r[1]);
      o.value = r[0];
      if (String(state.rate || 1) === r[0]) o.selected = true;
      rate.appendChild(o);
    });
    rate.addEventListener("change", function () {
      state.rate = parseFloat(rate.value);
      save();
      if (speech.playing) start(speech.idx);
    });
    // 行をタップすると、その行から読み上げる
    nodes.forEach(function (n, i) {
      n.node.classList.add("tappable");
      n.node.addEventListener("click", function () { if (speech.playing) start(i); });
    });
    tools().appendChild(btn);
    tools().appendChild(rate);
    if (!jaVoice() && synth.getVoices().length) {
      tools().appendChild(el("span", "tool-note", "日本語の音声が見つかりません。端末の設定で日本語の音声を追加してください"));
    }
  }

  function splitLead(l) {
    var body = l.charAt(0) === "・" ? l.slice(1) : l;
    // 書き出しが短すぎないよう、8〜26字目にある最初の読点で区切る
    var cut = -1, i = body.indexOf("、");
    while (i >= 0) { if (i >= 8) { cut = i; break; } i = body.indexOf("、", i + 1); }
    if (cut < 0 || cut > 26) cut = Math.min(16, body.length - 1);
    var head = (l.charAt(0) === "・" ? "・" : "") + body.slice(0, cut + 1);
    return [head, body.slice(cut + 1)];
  }

  function renderOutline(q, view) {
    var leads = [];
    lines(q).forEach(function (l) {
      var k = kind(l);
      if (k === "major" || k === "minor") {
        view.appendChild(withTerms(el(k === "major" ? "h3" : "h4", k), l));
        return;
      }
      var parts = splitLead(l);
      var b = el("button", "lead");
      b.type = "button";
      b.setAttribute("aria-expanded", "false");
      var rest = el("span", "rest", "……");
      b.appendChild(el("span", null, parts[0]));
      b.appendChild(rest);
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", open ? "false" : "true");
        rest.innerHTML = "";
        if (open) rest.textContent = "……"; else withTerms(rest, parts[1]);
      });
      leads.push(b);
      view.appendChild(b);
    });
    addToggleAll(leads, function (b, open) {
      if ((b.getAttribute("aria-expanded") === "true") !== open) b.click();
    });
  }

  var CLOZE_RE = /「[^」]+」|\d[\d.,]*(?:万人|兆円|億円|万km|か所|割|年度|年|か月|月|日|％|%|ha|倍)/g;

  function renderCloze(q, view) {
    var blanks = [];
    lines(q).forEach(function (l) {
      var k = kind(l);
      var tag = k === "major" ? "h3" : k === "minor" ? "h4" : "p";
      var node = el(tag, k);
      if (k === "major" || k === "minor") { view.appendChild(withTerms(node, l)); return; }
      var last = 0, m;
      CLOZE_RE.lastIndex = 0;
      while ((m = CLOZE_RE.exec(l))) {
        if (m.index > last) node.appendChild(document.createTextNode(l.slice(last, m.index)));
        var word = m[0];
        var b = el("button", "blank", word);
        b.type = "button";
        b.setAttribute("aria-label", "隠れた語句。タップで表示");
        b.style.minWidth = Math.max(2.5, word.length * 0.9) + "em";
        b.addEventListener("click", function () {
          this.classList.toggle("open");
          this.setAttribute("aria-label", this.classList.contains("open") ? this.textContent : "隠れた語句。タップで表示");
          updateCount();
        });
        blanks.push(b);
        node.appendChild(b);
        last = CLOZE_RE.lastIndex;
      }
      if (last < l.length) node.appendChild(document.createTextNode(l.slice(last)));
      view.appendChild(node);
    });
    var note = el("span", "tool-note");
    function updateCount() {
      var open = blanks.filter(function (b) { return b.classList.contains("open"); }).length;
      note.textContent = open + " / " + blanks.length + " めくった";
    }
    addToggleAll(blanks, function (b, open) {
      if (b.classList.contains("open") !== open) b.click();
    });
    tools().appendChild(note);
    updateCount();
  }

  function renderWrite(q, view) {
    var area = el("textarea", "write-area");
    area.setAttribute("aria-label", "答案を書く");
    area.placeholder = "①" + q.q1 + "\n(1)…\n・…";
    area.value = state.drafts[q.id] || "";

    var chips = el("div", "chips");
    var chipBtns = q.terms.map(function (t) {
      var b = el("button", null, t);
      b.type = "button";
      b.title = "「" + t + "」を挿入";
      b.addEventListener("click", function () { insert("「" + t + "」"); });
      chips.appendChild(b);
      return b;
    });

    var meter = el("div", "meter");
    var label = el("div", "meter-label");
    var countEl = el("strong");
    var termEl = el("span");
    label.appendChild(countEl);
    label.appendChild(termEl);
    var ruler = el("div", "ruler");
    var fill = el("div", "fill");
    ruler.appendChild(fill);
    var ticks = el("div", "ruler-ticks");
    [0, 400, 800, 1200, 1600].forEach(function (n) { ticks.appendChild(el("span", null, String(n))); });
    meter.appendChild(label);
    meter.appendChild(ruler);
    meter.appendChild(ticks);

    function update() {
      var text = area.value;
      var c = countChars(text);
      var inRange = c >= MIN && c <= MAX;
      countEl.textContent = c + "字" + (c < MIN ? "（あと" + (MIN - c) + "字で下限）" : c > MAX ? "（" + (c - MAX) + "字超過）" : "（範囲内）");
      fill.style.width = Math.min(100, c / MAX * 100) + "%";
      fill.classList.toggle("ok", inRange);
      var used = 0;
      q.terms.forEach(function (t, i) {
        var hit = text.indexOf("「" + t + "」") >= 0;
        chipBtns[i].classList.toggle("used", hit);
        if (hit) used++;
      });
      termEl.textContent = "指定用語 " + used + "個" + (used >= 4 ? "" : "（4個以上必要）");
      state.drafts[q.id] = text;
      save();
    }
    function insert(s) {
      var a = area.selectionStart, b = area.selectionEnd;
      area.value = area.value.slice(0, a) + s + area.value.slice(b);
      area.focus();
      area.selectionStart = area.selectionEnd = a + s.length;
      update();
    }
    area.addEventListener("input", update);

    view.appendChild(chips);
    view.appendChild(area);
    view.appendChild(meter);

    var model = el("div", "model");
    model.hidden = true;
    var showBtn = el("button", "tool", "見本と比べる");
    showBtn.type = "button";
    showBtn.addEventListener("click", function () {
      model.hidden = !model.hidden;
      showBtn.textContent = model.hidden ? "見本と比べる" : "見本を閉じる";
      if (!model.hidden && !model.childNodes.length) renderRead(q, model, true);
    });
    var clearBtn = el("button", "tool", "下書きを消す");
    clearBtn.type = "button";
    clearBtn.addEventListener("click", function () {
      if (!area.value || confirm("この設問の下書きを消します。よろしいですか？")) { area.value = ""; update(); }
    });
    tools().appendChild(showBtn);
    tools().appendChild(clearBtn);
    view.appendChild(model);
    update();
  }


  // ---------- 紙芝居 ----------
  var show = { timer: null, playing: false, go: null };
  function stopShow() {
    show.playing = false;
    clearTimeout(show.timer);
    if (synth) synth.cancel();
    if (show.btn) show.btn.textContent = "▶ 自動で上演";
  }

  function renderStory(q, view) {
    var scenes = (window.RCCM_STORIES || {})[q.id];
    if (!scenes) {
      var empty = el("div", "story-empty");
      empty.appendChild(el("p", null, "この設問の紙芝居はまだありません。"));
      var go = el("button", "tool", "(1)の紙芝居を見る");
      go.type = "button";
      go.addEventListener("click", function () { state.q = 1; save(); render(); });
      empty.appendChild(go);
      view.appendChild(empty);
      return;
    }
    state.page = state.page || {};
    var idx = Math.min(state.page[q.id] || 0, scenes.length - 1);

    var stage = el("div", "stage");
    var card = el("div", "card");
    stage.appendChild(card);
    var meta = el("p", "story-ref");
    var title = el("h3", "story-title");
    var text = el("p", "story-text");
    var terms = el("ul", "chips");
    var extra = el("div", "story-extra");
    var nav = el("div", "story-nav");
    var prev = el("button", "tool", "← 前へ");
    var next = el("button", "tool", "次へ →");
    var count = el("span", "tool-note");
    prev.type = next.type = "button";
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next);

    function draw(dir) {
      var s = scenes[idx];
      card.innerHTML = (window.RCCM_ART[s.art] || function () { return ""; })();
      if (dir && !reduceMotion()) {
        card.classList.remove("enter-next", "enter-prev");
        void card.offsetWidth;
        card.classList.add(dir > 0 ? "enter-next" : "enter-prev");
      }
      meta.textContent = s.ref ? "答案の " + s.ref + " にあたる場面" : "はじまり";
      title.textContent = s.title;
      text.textContent = s.text;
      terms.innerHTML = "";
      s.terms.forEach(function (t) { terms.appendChild(el("li", "used", "「" + t + "」")); });
      extra.innerHTML = "";
      if (idx === scenes.length - 1) {
        var toRead = el("button", "tool", "この流れで答案を読む");
        toRead.type = "button";
        toRead.addEventListener("click", function () { state.mode = "read"; save(); render(); });
        extra.appendChild(toRead);
      }
      count.textContent = (idx + 1) + " / " + scenes.length;
      prev.disabled = idx === 0;
      next.disabled = idx === scenes.length - 1;
      state.page[q.id] = idx;
      save();
    }
    function go(d) {
      var n = idx + d;
      if (n < 0 || n >= scenes.length) return false;
      idx = n; draw(d); return true;
    }
    show.go = go;
    prev.addEventListener("click", function () { stopShow(); go(-1); });
    next.addEventListener("click", function () { stopShow(); go(1); });

    // スワイプでめくる
    var sx = null;
    stage.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (sx == null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { stopShow(); go(dx < 0 ? 1 : -1); }
    });

    // 自動で上演（読み上げが使えれば語りを読む）
    var playBtn = el("button", "tool", "▶ 自動で上演");
    playBtn.type = "button";
    show.btn = playBtn;
    function perform() {
      if (!show.playing) return;
      var s = scenes[idx];
      var after = function () {
        if (!show.playing) return;
        show.timer = setTimeout(function () {
          if (!show.playing) return;
          if (!go(1)) { stopShow(); return; }
          perform();
        }, 700);
      };
      if (synth && typeof SpeechSynthesisUtterance !== "undefined" && jaVoice()) {
        var u = new SpeechSynthesisUtterance(s.title + "。" + s.text);
        u.lang = "ja-JP"; u.voice = jaVoice(); u.rate = state.rate || 1;
        u.onend = after;
        u.onerror = function (e) { if (e.error !== "interrupted" && e.error !== "canceled") after(); };
        synth.speak(u);
      } else {
        show.timer = setTimeout(after, Math.max(4000, s.text.length * 110 / (state.rate || 1)));
      }
    }
    playBtn.addEventListener("click", function () {
      if (show.playing) { stopShow(); return; }
      if (idx === scenes.length - 1) { idx = 0; draw(-1); }
      show.playing = true;
      playBtn.textContent = "■ 止める";
      if (synth) synth.cancel();
      perform();
    });
    tools().appendChild(playBtn);

    view.appendChild(stage);
    view.appendChild(meta);
    view.appendChild(title);
    view.appendChild(text);
    view.appendChild(terms);
    view.appendChild(extra);
    view.appendChild(nav);
    draw(0);
  }

  document.addEventListener("keydown", function (e) {
    if (state.mode !== "story" || !show.go) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { stopShow(); show.go(1); }
    if (e.key === "ArrowLeft") { stopShow(); show.go(-1); }
  });

  function tools() { return document.getElementById("tools"); }

  function addToggleAll(items, setter) {
    var openAll = el("button", "tool", "すべて表示");
    var closeAll = el("button", "tool", "すべて隠す");
    openAll.type = closeAll.type = "button";
    openAll.addEventListener("click", function () { items.forEach(function (i) { setter(i, true); }); });
    closeAll.addEventListener("click", function () { items.forEach(function (i) { setter(i, false); }); });
    tools().appendChild(openAll);
    tools().appendChild(closeAll);
  }

  // ---------- main render ----------
  function render() {
    stopSpeech();
    stopShow();
    speech.nodes = null;
    var q = current();
    renderPicker();
    renderHead(q);
    var view = document.getElementById("view");
    view.innerHTML = "";
    tools().innerHTML = "";
    ({ story: renderStory, read: renderRead, outline: renderOutline, cloze: renderCloze, write: renderWrite })[state.mode](q, view);
  }

  document.querySelectorAll(".modes button").forEach(function (b) {
    b.addEventListener("click", function () { state.mode = b.dataset.mode; save(); render(); });
  });

  // 音声の一覧は後から読み込まれることがある
  if (synth && synth.addEventListener) synth.addEventListener("voiceschanged", function () {});
  window.addEventListener("pagehide", function () { stopSpeech(); stopShow(); });

  render();
})();
