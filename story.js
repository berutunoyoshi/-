// 紙芝居モードのデータとイラスト。
// 場面を増やすときは RCCM_STORIES[設問番号] に { art, title, text, terms, ref } を追加します。
(function () {
  "use strict";

  // ---------- 描画部品（SVG文字列を返す） ----------
  var C = {
    sky: "#DCE9EF", hill: "#C3D6BC", hill2: "#AFC8A6", water: "#9CC0D4",
    concrete: "#C9C3B8", concreteDark: "#9C9589", ink: "#1D2733",
    rust: "#B5652E", stake: "#D9541A", ok: "#2E7D4F", paper: "#FBFCFB",
    roof: "#7C8FA3", wall: "#EEE8DD", sun: "#F2C14E", blue: "#1C5A86", road: "#8A8F96"
  };
  var S = 'stroke="' + C.ink + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';

  function svg(inner, label) {
    return '<svg viewBox="0 0 320 200" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="320" height="200" fill="' + C.sky + '"/>' + inner + '</svg>';
  }
  function txt(x, y, s, size, color, anchor) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" fill="' + (color || C.ink) +
      '" text-anchor="' + (anchor || "middle") + '" font-weight="700" font-family="BIZ UDPGothic, Hiragino Sans, sans-serif">' + s + '</text>';
  }
  function sun(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 14) + '" fill="' + C.sun + '"/>';
  }
  function hills() {
    return '<path d="M0 120 Q60 80 130 112 T260 104 T320 110 V200 H0Z" fill="' + C.hill2 + '"/>' +
      '<path d="M0 140 Q80 112 170 134 T320 128 V200 H0Z" fill="' + C.hill + '"/>';
  }
  function river() {
    return '<path d="M0 162 Q160 150 320 166 V200 H0Z" fill="' + C.water + '" ' + S + ' stroke-width="1.5"/>';
  }
  function tree(x, y) {
    return '<rect x="' + (x - 2) + '" y="' + (y - 8) + '" width="4" height="10" fill="' + C.rust + '"/>' +
      '<circle cx="' + x + '" cy="' + (y - 14) + '" r="9" fill="' + C.ok + '" ' + S + ' stroke-width="1.5"/>';
  }
  function house(x, y, s) {
    s = s || 1;
    var w = 22 * s, h = 16 * s;
    return '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="' + C.wall + '" ' + S + ' stroke-width="1.5"/>' +
      '<path d="M' + (x - 3) + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + (y - h - 11 * s) + ' L' + (x + w + 3) + ' ' + (y - h) + 'Z" fill="' + C.roof + '" ' + S + ' stroke-width="1.5"/>';
  }
  // 桁橋。old: ひび割れとさび、glow: 新しく明るい
  function bridge(x, y, w, opt) {
    opt = opt || {};
    var deck = opt.glow ? "#E6E1D6" : C.concrete;
    var out = '<rect x="' + x + '" y="' + (y - 10) + '" width="' + w + '" height="10" fill="' + deck + '" ' + S + '/>';
    var piers = Math.max(2, Math.round(w / 70));
    for (var i = 0; i <= piers; i++) {
      var px = x + 6 + i * (w - 18) / piers;
      out += '<rect x="' + px + '" y="' + y + '" width="8" height="' + (opt.pierH || 34) + '" fill="' + C.concreteDark + '" ' + S + ' stroke-width="1.5"/>';
    }
    out += '<line x1="' + x + '" y1="' + (y - 18) + '" x2="' + (x + w) + '" y2="' + (y - 18) + '" ' + S + ' stroke-width="1.5"/>';
    for (var j = 0; j <= w; j += 16) out += '<line x1="' + (x + j) + '" y1="' + (y - 18) + '" x2="' + (x + j) + '" y2="' + (y - 10) + '" ' + S + ' stroke-width="1"/>';
    if (opt.old) {
      out += '<path d="M' + (x + w * .3) + ' ' + (y - 10) + ' l4 5 -3 3 4 4" fill="none" ' + S + ' stroke-width="1.5"/>' +
        '<path d="M' + (x + w * .68) + ' ' + (y - 10) + ' l-3 4 4 3 -2 5" fill="none" ' + S + ' stroke-width="1.5"/>' +
        '<circle cx="' + (x + w * .5) + '" cy="' + (y - 4) + '" r="3" fill="' + C.rust + '"/>' +
        '<circle cx="' + (x + w * .15) + '" cy="' + (y - 5) + '" r="2.5" fill="' + C.rust + '"/>';
    }
    return out;
  }
  function person(x, y, color, opt) {
    opt = opt || {};
    var out = '<rect x="' + (x - 7) + '" y="' + (y - 22) + '" width="14" height="20" rx="6" fill="' + (color || C.blue) + '" ' + S + ' stroke-width="1.5"/>' +
      '<circle cx="' + x + '" cy="' + (y - 29) + '" r="7" fill="#F3D9C4" ' + S + ' stroke-width="1.5"/>';
    if (opt.helmet) out += '<path d="M' + (x - 8) + ' ' + (y - 30) + ' Q' + x + ' ' + (y - 42) + ' ' + (x + 8) + ' ' + (y - 30) + 'Z" fill="' + C.sun + '" ' + S + ' stroke-width="1.5"/>';
    if (opt.sweat) out += '<path d="M' + (x + 10) + ' ' + (y - 34) + ' q3 5 0 7 q-3 -2 0 -7Z" fill="' + C.water + '"/>';
    if (opt.smile) out += '<path d="M' + (x - 3) + ' ' + (y - 27) + ' q3 3 6 0" fill="none" ' + S + ' stroke-width="1.2"/>';
    return out;
  }
  function tag(x, y, s, color) {
    var w = s.length * 12 + 14;
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 13) + '" width="' + w + '" height="19" rx="3" fill="' + C.paper + '" stroke="' + (color || C.ink) + '" stroke-width="1.5"/>' +
      txt(x, y + 1, s, 11, color || C.ink);
  }
  function coins(x, y, n) {
    var out = "";
    for (var i = 0; i < n; i++) out += '<ellipse cx="' + x + '" cy="' + (y - i * 5) + '" rx="11" ry="4" fill="' + C.sun + '" ' + S + ' stroke-width="1.2"/>';
    return out;
  }
  function arrow(x1, y1, x2, y2, color) {
    var a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || C.ink) + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a - .5)) + ' ' + (y2 - h * Math.sin(a - .5)) + ' L' + (x2 - h * Math.cos(a + .5)) + ' ' + (y2 - h * Math.sin(a + .5)) + 'Z" fill="' + (color || C.ink) + '"/>';
  }

  // ---------- 場面ごとの絵 ----------
  var ART = {
    cover: function () {
      return svg(sun(270, 38, 16) + hills() + house(40, 138) + house(70, 136, .8) + tree(105, 140) +
        house(230, 132) + tree(270, 134) + river() + bridge(110, 150, 120, { old: true, pierH: 20 }),
        "川にかかる古い橋と小さな町");
    },
    aging: function () {
      return svg(hills() + river() + bridge(40, 140, 240, { old: true, pierH: 40 }) +
        '<rect x="226" y="58" width="72" height="44" rx="4" fill="' + C.paper + '" ' + S + '/>' +
        txt(262, 77, "建設から", 11) + txt(262, 95, "50年超", 15, C.stake) +
        '<line x1="262" y1="102" x2="262" y2="130" ' + S + '/>',
        "ひび割れとさびのある古い橋と、建設から50年超の看板");
    },
    cavein: function () {
      return svg('<rect y="88" width="320" height="112" fill="#B9A58C"/>' +
        '<rect y="78" width="320" height="12" fill="' + C.road + '" ' + S + '/>' +
        '<path d="M120 78 Q160 150 200 78Z" fill="#6E5A44" ' + S + '/>' +
        '<rect x="20" y="140" width="110" height="18" fill="' + C.concreteDark + '" ' + S + '/>' +
        '<rect x="190" y="140" width="110" height="18" fill="' + C.concreteDark + '" ' + S + '/>' +
        '<path d="M130 140 l12 6 -6 6 8 6" fill="none" ' + S + '/>' +
        '<path d="M100 78 l-8 -22 h16Z" fill="' + C.stake + '" ' + S + ' stroke-width="1.5"/>' +
        '<path d="M224 78 l-8 -22 h16Z" fill="' + C.stake + '" ' + S + ' stroke-width="1.5"/>' +
        tag(160, 36, "下水道管の破損で道路が陥没", C.stake),
        "道路の下の下水道管が壊れ、道路に穴が開いた断面図");
    },
    cycle: function () {
      var cx = 225, cy = 105, r = 46;
      var labels = [["点検", cx, cy - r], ["診断", cx + r, cy], ["措置", cx, cy + r], ["記録", cx - r, cy]];
      var ring = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.ok + '" stroke-width="3" stroke-dasharray="10 6"/>';
      labels.forEach(function (l) { ring += tag(l[1], l[2] + 4, l[0], C.ok); });
      return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
        txt(70, 30, "壊れてから直す", 12) + bridge(25, 92, 90, { old: true, pierH: 22 }) +
        '<path d="M60 82 l6 10 -8 6 6 8" fill="none" stroke="' + C.stake + '" stroke-width="3"/>' + coins(70, 168, 7) +
        txt(70, 188, "費用が大きい", 11, C.stake) +
        '<line x1="140" y1="20" x2="140" y2="185" stroke="' + C.ink + '" stroke-width="1" stroke-dasharray="3 4"/>' +
        txt(225, 30, "早めに手当てする", 12) + ring + coins(225, 120, 3) + txt(225, 188, "費用 約3割減", 11, C.ok),
        "壊れてから直すと費用が大きく、点検・診断・措置・記録のサイクルなら費用が減る比較");
    },
    townhall: function () {
      return svg(hills() +
        '<rect x="40" y="70" width="110" height="80" fill="' + C.wall + '" ' + S + '/>' +
        '<rect x="40" y="58" width="110" height="14" fill="' + C.roof + '" ' + S + '/>' + txt(95, 69, "町役場", 11, C.paper) +
        '<rect x="56" y="88" width="18" height="16" fill="' + C.sky + '" ' + S + ' stroke-width="1.2"/>' +
        '<rect x="116" y="88" width="18" height="16" fill="' + C.sky + '" ' + S + ' stroke-width="1.2"/>' +
        '<rect x="84" y="118" width="22" height="32" fill="' + C.roof + '" ' + S + ' stroke-width="1.2"/>' +
        person(190, 160, C.blue, { sweat: true }) +
        '<rect x="205" y="112" width="26" height="48" fill="' + C.paper + '" ' + S + ' stroke-width="1.5"/>' +
        '<path d="M205 122 h26 M205 132 h26 M205 142 h26 M205 152 h26" ' + S + ' stroke-width="1"/>' +
        coins(258, 158, 1) + txt(258, 178, "予算", 10) +
        '<path d="M258 60 L278 76 L294 70 L306 96" fill="none" stroke="' + C.stake + '" stroke-width="3"/>' +
        arrow(298, 84, 306, 98, C.stake) + txt(280, 52, "人口", 11, C.stake),
        "町役場で書類に追われる一人の職員、少ない予算、減っていく人口のグラフ");
    },
    group: function () {
      function town(x, y) { return house(x, y, .8) + house(x + 22, y + 2, .7) + tree(x + 46, y + 2); }
      return svg('<rect width="320" height="200" fill="' + C.hill + '"/>' +
        '<ellipse cx="160" cy="105" rx="148" ry="82" fill="' + C.paper + '" stroke="' + C.blue + '" stroke-width="3" stroke-dasharray="12 7"/>' +
        txt(160, 40, "群", 22, C.blue) +
        town(40, 92) + town(222, 92) + town(130, 170) +
        '<path d="M98 96 Q160 60 220 96" fill="none" stroke="' + C.blue + '" stroke-width="2.5"/>' +
        '<path d="M80 110 Q100 150 128 162" fill="none" stroke="' + C.blue + '" stroke-width="2.5"/>' +
        '<path d="M244 110 Q230 150 196 162" fill="none" stroke="' + C.blue + '" stroke-width="2.5"/>' +
        tag(160, 112, "橋・道路・下水道・公園", C.blue),
        "三つの町が点線の輪で一つの群にまとまり、施設をまとめて管理する図");
    },
    rebuild: function () {
      return svg(hills() + river() +
        bridge(30, 150, 110, { old: true, pierH: 20 }) +
        '<path d="M55 110 L115 160 M115 110 L55 160" stroke="' + C.stake + '" stroke-width="6" stroke-linecap="round"/>' +
        tag(85, 96, "撤去", C.stake) +
        bridge(180, 150, 110, { glow: true, pierH: 20 }) + tag(235, 96, "役割を集約", C.ok) +
        arrow(130, 70, 190, 70, C.ok) + coins(160, 58, 3),
        "利用の少ない橋を撤去し、近くの橋に役割と予算を集める図");
    },
    contract: function () {
      var cal = "";
      ["R8", "R9", "R10"].forEach(function (y, i) {
        cal += '<rect x="' + (200 + i * 8) + '" y="' + (28 + i * 8) + '" width="72" height="56" fill="' + C.paper + '" ' + S + ' stroke-width="1.5"/>';
        if (i === 2) cal += txt(252, 70, "R8〜R10", 13);
      });
      return svg(hills() +
        '<rect x="40" y="30" width="96" height="70" fill="' + C.paper + '" ' + S + '/>' +
        txt(88, 52, "まとめて発注", 11) + '<path d="M54 64 h68 M54 76 h68 M54 88 h44" ' + S + ' stroke-width="1"/>' +
        '<path d="M100 88 l8 8 16 -18" fill="none" stroke="' + C.ok + '" stroke-width="3"/>' + cal +
        person(130, 168, C.blue, { smile: true }) + person(190, 168, C.stake, { helmet: true, smile: true }) +
        '<path d="M138 152 Q160 142 182 152" fill="none" ' + S + ' stroke-width="4"/>' +
        txt(110, 190, "役場", 10) + txt(214, 190, "民間", 10),
        "複数年・複数施設をまとめた契約書と、握手する役場職員と民間の技術者");
    },
    drone: function () {
      return svg(sun(40, 34, 12) + hills() + river() + bridge(40, 150, 200, { old: true, pierH: 22 }) +
        '<path d="M150 64 L110 140 L200 140Z" fill="' + C.sun + '" opacity=".35"/>' +
        '<rect x="135" y="52" width="30" height="12" rx="4" fill="' + C.ink + '"/>' +
        '<path d="M126 50 h14 M160 50 h14" stroke="' + C.ink + '" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="133" y1="50" x2="138" y2="56" ' + S + '/><line x1="167" y1="50" x2="162" y2="56" ' + S + '/>' +
        '<rect x="232" y="40" width="74" height="56" rx="6" fill="' + C.ink + '"/>' +
        '<rect x="238" y="46" width="62" height="38" fill="' + C.paper + '"/>' +
        txt(269, 62, "AI判定", 11, C.blue) + txt(269, 78, "ひび 2か所", 10, C.stake) +
        person(275, 160, C.blue, { smile: true }),
        "ドローンが橋を撮影し、AIがひび割れを判定するタブレット画面");
    },
    future: function () {
      return svg(sun(260, 40, 18) + hills() + tree(30, 150) + tree(296, 148) + river() +
        bridge(60, 140, 200, { glow: true, pierH: 30 }) +
        person(120, 130, C.stake, { smile: true }) + person(150, 130, C.blue, { smile: true }) + person(175, 131, C.ok, { smile: true }) +
        txt(160, 34, "次の世代へ", 16, C.ok),
        "手入れされた橋を人々が渡る明るい町");
    }
  };

  window.RCCM_ART = ART;

  // ---------- 物語 ----------
  window.RCCM_STORIES = {
    1: [
      { art: "cover", ref: "", title: "橋の町の物語",
        text: "これは、川沿いにある小さな町の物語です。町の暮らしは、何本もの橋や道路、下水道に支えられています。",
        terms: [] },
      { art: "aging", ref: "①(1)", title: "50歳を超えたインフラ",
        text: "町の橋の多くは、高度経済成長期にまとめて造られました。いま、建設から50年を超える施設が一気に増え、ひび割れやさびが目立ち始めています。",
        terms: ["老朽化"] },
      { art: "cavein", ref: "①(1)", title: "ある日の事故",
        text: "令和7年1月、埼玉県八潮市で下水道管が壊れ、道路に大きな穴が開きました。老朽化を放っておくと、暮らしそのものが止まってしまいます。",
        terms: ["老朽化"] },
      { art: "cycle", ref: "①(1)", title: "壊れる前に手当てする",
        text: "壊れてから直すと、費用が高くつき、直す時期も選べません。点検・診断・措置・記録のサイクルを回して早めに手当てすれば、費用は約3割減らせます。",
        terms: ["マネジメントサイクル"] },
      { art: "townhall", ref: "①(1)", title: "でも、町役場には人がいない",
        text: "ところが町役場には、橋を診られる技術者がほとんどいません。人口が減り、予算も足りず、たった一人の職員が書類に追われています。修繕はどんどん先送りに。",
        terms: ["地方公共団体", "人口減少"] },
      { art: "group", ref: "②(1)", title: "町どうしで手を組む",
        text: "そこで、近くの町が手を組みました。橋も道路も下水道も公園も、まとめて一つの「群」として面倒を見ます。技術者やデータを分け合えば、一つの町ではできないことができます。",
        terms: ["群マネ", "広域連携"] },
      { art: "rebuild", ref: "②(1)", title: "残す橋を選ぶ",
        text: "使う人の少ない橋は思い切って撤去し、近くの橋に役割をまとめました。守るべき施設に予算を集中できるので、早めの手当てが可能になります。",
        terms: ["インフラの再構築"] },
      { art: "contract", ref: "②(1)", title: "まとめて任せる",
        text: "点検や修繕は、何年分・何か所分もまとめて民間に任せます。役場の発注の手間が減り、受ける会社も計画的に人を確保できます。",
        terms: ["多様な契約方式"] },
      { art: "drone", ref: "②(1)", title: "空から点検",
        text: "民間の力を借りて、ドローンで橋を撮影し、AIがひび割れを見つけます。人が近づけない場所も、少ない人数で確実に点検できます。",
        terms: ["官民連携", "新技術"] },
      { art: "future", ref: "②(1)", title: "次の世代へ",
        text: "限られた人と予算でも、点検・修繕のサイクルはまた回り始めました。町のインフラは、次の世代へと引き継がれていきます。",
        terms: [] }
    ]
  };
})();
