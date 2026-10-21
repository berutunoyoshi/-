// 紙芝居モードのイラスト（SVG）。語りの文章は story-data.js にあります。
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

  // ---------- 追加の描画部品 ----------
  function cloud(x, y, dark) {
    var f = dark ? "#7E8A96" : "#FFFFFF";
    return '<path d="M' + (x - 30) + ' ' + y + ' a14 14 0 0 1 10 -20 a18 18 0 0 1 32 -4 a13 13 0 0 1 18 14 a10 10 0 0 1 0 10Z" fill="' + f + '" ' + S + ' stroke-width="1.5"/>';
  }
  function rain(x, y, w) {
    var out = "";
    for (var i = 0; i < w; i += 9) out += '<line x1="' + (x + i) + '" y1="' + y + '" x2="' + (x + i - 4) + '" y2="' + (y + 12) + '" stroke="' + C.blue + '" stroke-width="2" stroke-linecap="round"/>';
    return out;
  }
  function factory(x, y, broken) {
    var out = '<rect x="' + x + '" y="' + (y - 34) + '" width="60" height="34" fill="' + C.wall + '" ' + S + '/>' +
      '<path d="M' + x + ' ' + (y - 34) + ' l15 -12 v12 l15 -12 v12 l15 -12 v12" fill="' + C.roof + '" ' + S + ' stroke-width="1.5"/>' +
      '<rect x="' + (x + 48) + '" y="' + (y - 64) + '" width="8" height="30" fill="' + C.concreteDark + '" ' + S + ' stroke-width="1.5"/>';
    if (broken) out += '<path d="M' + (x + 14) + ' ' + (y - 26) + ' l32 22 M' + (x + 46) + ' ' + (y - 26) + ' l-32 22" stroke="' + C.stake + '" stroke-width="4" stroke-linecap="round"/>';
    return out;
  }
  function truck(x, y) {
    return '<rect x="' + x + '" y="' + (y - 22) + '" width="36" height="20" fill="' + C.paper + '" ' + S + ' stroke-width="1.5"/>' +
      '<path d="M' + (x + 36) + ' ' + (y - 16) + ' h10 l6 8 v6 h-16Z" fill="' + C.blue + '" ' + S + ' stroke-width="1.5"/>' +
      '<circle cx="' + (x + 10) + '" cy="' + y + '" r="5" fill="' + C.ink + '"/><circle cx="' + (x + 42) + '" cy="' + y + '" r="5" fill="' + C.ink + '"/>';
  }
  function doc(x, y, w, h, title) {
    var out = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + C.paper + '" ' + S + ' stroke-width="1.5"/>';
    for (var i = 1; i < 4; i++) out += '<line x1="' + (x + 8) + '" y1="' + (y + 14 + i * 10) + '" x2="' + (x + w - 8) + '" y2="' + (y + 14 + i * 10) + '" ' + S + ' stroke-width="1"/>';
    if (title) out += txt(x + w / 2, y + 14, title, 10);
    return out;
  }
  function screen(x, y, w, h, inner) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + C.ink + '"/>' +
      '<rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (w - 10) + '" height="' + (h - 10) + '" fill="' + C.paper + '"/>' + (inner || "") +
      '<rect x="' + (x + w / 2 - 12) + '" y="' + (y + h) + '" width="24" height="6" fill="' + C.ink + '"/>';
  }
  function globe(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + C.water + '" ' + S + '/>' +
      '<path d="M' + (x - r * .6) + ' ' + (y - r * .5) + ' q' + (r * .3) + ' ' + (-r * .2) + ' ' + (r * .5) + ' ' + (r * .1) + ' t' + (r * .2) + ' ' + (r * .5) + ' q' + (-r * .4) + ' ' + (r * .3) + ' ' + (-r * .6) + ' ' + (-r * .1) + 'Z" fill="' + C.hill2 + '" ' + S + ' stroke-width="1.2"/>' +
      '<path d="M' + (x + r * .2) + ' ' + (y + r * .1) + ' q' + (r * .4) + ' ' + (-r * .1) + ' ' + (r * .5) + ' ' + (r * .4) + ' q' + (-r * .2) + ' ' + (r * .3) + ' ' + (-r * .5) + ' ' + (r * .1) + 'Z" fill="' + C.hill2 + '" ' + S + ' stroke-width="1.2"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * .45) + '" ry="' + r + '" fill="none" ' + S + ' stroke-width="1"/>';
  }
  function plane(x, y) {
    return '<path d="M' + x + ' ' + y + ' l40 -4 l8 -2 q6 0 0 4 l-8 4 l-40 -2Z M' + (x + 20) + ' ' + (y - 3) + ' l-6 -12 h6 l10 11 M' + (x + 20) + ' ' + (y + 1) + ' l-6 10 h6 l10 -9" fill="' + C.paper + '" ' + S + ' stroke-width="1.5"/>';
  }
  function turbine(x, y, h) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y - h) + '" ' + S + ' stroke-width="3"/>' +
      '<path d="M' + x + ' ' + (y - h) + ' l-3 -26 l3 -2 l3 2Z M' + x + ' ' + (y - h) + ' l22 14 l1 3 l-3 2Z M' + x + ' ' + (y - h) + ' l-22 13 l-2 -3 l2 -2Z" fill="' + C.paper + '" ' + S + ' stroke-width="1.2"/>' +
      '<circle cx="' + x + '" cy="' + (y - h) + '" r="3" fill="' + C.ink + '"/>';
  }
  function solar(x, y) {
    return '<path d="M' + x + ' ' + y + ' l12 -18 h40 l-12 18Z" fill="' + C.blue + '" ' + S + ' stroke-width="1.5"/>' +
      '<path d="M' + (x + 16) + ' ' + y + ' l12 -18 M' + (x + 30) + ' ' + y + ' l12 -18 M' + (x + 6) + ' ' + (y - 9) + ' h40" stroke="' + C.paper + '" stroke-width="1"/>';
  }
  function magnifier(x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="' + C.sky + '" fill-opacity=".5" ' + S + ' stroke-width="3"/>' +
      '<line x1="' + (x + 10) + '" y1="' + (y + 10) + '" x2="' + (x + 24) + '" y2="' + (y + 24) + '" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"/>';
  }
  function lock(x, y) {
    return '<path d="M' + (x - 9) + ' ' + (y - 8) + ' v-8 a9 9 0 0 1 18 0 v8" fill="none" ' + S + ' stroke-width="3"/>' +
      '<rect x="' + (x - 14) + '" y="' + (y - 8) + '" width="28" height="24" rx="3" fill="' + C.sun + '" ' + S + '/>' +
      '<circle cx="' + x + '" cy="' + (y + 3) + '" r="3" fill="' + C.ink + '"/>';
  }
  function check(x, y, color) {
    return '<path d="M' + (x - 7) + ' ' + y + ' l5 6 l10 -12" fill="none" stroke="' + (color || C.ok) + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function cross(x, y, color) {
    return '<path d="M' + (x - 6) + ' ' + (y - 6) + ' l12 12 M' + (x + 6) + ' ' + (y - 6) + ' l-12 12" stroke="' + (color || C.stake) + '" stroke-width="3.5" stroke-linecap="round"/>';
  }
  function bubble(x, y, s, color) {
    var w = s.length * 12 + 16;
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 16) + '" width="' + w + '" height="22" rx="11" fill="' + C.paper + '" stroke="' + (color || C.ink) + '" stroke-width="1.5"/>' +
      '<path d="M' + (x - 4) + ' ' + (y + 6) + ' l2 8 l6 -8" fill="' + C.paper + '" stroke="' + (color || C.ink) + '" stroke-width="1.5"/>' + txt(x, y, s, 11, color || C.ink);
  }
  function cube(x, y, s, color) {
    var d = s * .4;
    return '<path d="M' + x + ' ' + y + ' h' + s + ' v' + s + ' h' + (-s) + 'Z" fill="' + (color || C.blue) + '" ' + S + ' stroke-width="1.5"/>' +
      '<path d="M' + x + ' ' + y + ' l' + d + ' ' + (-d) + ' h' + s + ' l' + (-d) + ' ' + d + 'Z" fill="' + C.water + '" ' + S + ' stroke-width="1.5"/>' +
      '<path d="M' + (x + s) + ' ' + y + ' l' + d + ' ' + (-d) + ' v' + s + ' l' + (-d) + ' ' + d + 'Z" fill="' + C.roof + '" ' + S + ' stroke-width="1.5"/>';
  }
  function endScene(title, extra) {
    return svg(sun(292, 74, 13) + hills() + tree(30, 152) + tree(292, 150) + (extra || "") + txt(160, 40, title, 16, C.ok), title);
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

  // ----- (2) 安全・安心な国土づくり -----
  ART.q2cover = function () {
    return svg(cloud(250, 50, true) + rain(220, 54, 60) + hills() + house(40, 138) + house(72, 136, .8) + tree(110, 140) + house(200, 134) + river() +
      txt(90, 40, "災害の多い国", 14), "雨雲のかかる山と川沿いの町");
  };
  ART.overflow = function () {
    return svg(cloud(90, 40, true) + cloud(210, 34, true) + rain(60, 44, 200) +
      '<path d="M0 200 V120 L60 120 L100 80 L140 80 L180 120 L320 120 V200Z" fill="' + C.hill + '" ' + S + '/>' +
      '<path d="M0 120 L60 120 L100 80 L95 72 Q70 70 40 72 L0 72Z" fill="' + C.water + '" opacity=".9"/>' +
      '<path d="M100 76 Q120 70 150 90 Q170 110 190 118" fill="none" stroke="' + C.blue + '" stroke-width="4"/>' +
      arrow(150, 90, 186, 116, C.blue) + house(230, 120) + house(262, 122, .8) +
      tag(70, 104, "堤防", C.ink) + tag(240, 66, "施設能力を超える", C.stake),
      "想定を超える大雨で川の水が堤防を越える断面図");
  };
  ART.drought = function () {
    var cracks = '<path d="M60 170 l20 -8 l14 10 l20 -6 M150 180 l18 -10 l20 6 M220 168 l22 4 l12 -10" fill="none" ' + S + ' stroke-width="1.5"/>';
    return svg(sun(260, 40, 24) + '<rect y="120" width="320" height="80" fill="#D9C6A2"/>' + cracks +
      '<path d="M40 120 h240 l-30 40 h-180Z" fill="#CDB68C" ' + S + '/>' +
      '<path d="M120 150 h80 l-8 8 h-64Z" fill="' + C.water + '"/>' +
      '<rect x="20" y="90" width="20" height="70" fill="' + C.concreteDark + '" ' + S + '/>' + tag(120, 100, "水が足りない", C.stake),
      "干上がったダム湖とひび割れた地面");
  };
  ART.fragile = function () {
    var dense = "";
    for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) dense += house(190 + i * 26, 120 + j * 30, .8);
    return svg(hills() + '<rect x="10" y="90" width="150" height="80" fill="' + C.stake + '" opacity=".18"/>' +
      '<path d="M10 170 Q80 150 160 175" fill="none" stroke="' + C.blue + '" stroke-width="6"/>' +
      house(40, 150) + house(90, 148, .9) + tag(85, 86, "浸水のおそれ", C.stake) + dense +
      '<path d="M250 112 q-8 -16 4 -26 q-2 12 8 14 q4 -8 0 -16 q14 10 6 28Z" fill="' + C.stake + '" ' + S + ' stroke-width="1.2"/>' +
      tag(240, 50, "木造密集・火災", C.stake),
      "浸水のおそれがある区域に建つ家と、木造住宅が密集し火災が起きる市街地");
  };
  ART.supply = function () {
    return svg(hills() + '<rect y="140" width="320" height="18" fill="' + C.road + '" ' + S + '/>' +
      '<path d="M150 140 l10 18 l12 -18Z" fill="#6E5A44" ' + S + '/>' + truck(80, 138) + cross(168, 120) +
      factory(220, 140, true) + tag(60, 60, "物流がとまる", C.stake) + tag(250, 60, "生産もとまる", C.stake),
      "道路が寸断されて止まったトラックと、操業が止まった工場");
  };
  ART.hardsoft = function () {
    return svg(hills() + river() +
      '<path d="M20 162 L50 120 L110 120 L130 162Z" fill="' + C.concreteDark + '" ' + S + '/>' + tag(75, 112, "粘り強い堤防", C.ink) +
      '<rect x="200" y="70" width="36" height="58" rx="5" fill="' + C.ink + '"/><rect x="204" y="76" width="28" height="44" fill="' + C.paper + '"/>' +
      '<rect x="207" y="82" width="22" height="12" fill="' + C.stake + '" opacity=".4"/>' + txt(218, 112, "地図", 9) +
      person(270, 150, C.ok, {}) + arrow(282, 130, 306, 110, C.ok) + tag(270, 56, "早めに避難", C.ok) + tag(75, 40, "ハード", C.blue) + tag(240, 34, "ソフト", C.blue),
      "粘り強い堤防と、ハザードマップを見て早めに避難する住民");
  };
  ART.water = function () {
    return svg(hills() +
      '<rect x="20" y="96" width="14" height="50" fill="' + C.concreteDark + '" ' + S + '/><path d="M34 106 h50 v40 h-50Z" fill="' + C.water + '"/>' +
      '<rect x="120" y="96" width="14" height="50" fill="' + C.concreteDark + '" ' + S + '/><path d="M134 106 h50 v40 h-50Z" fill="' + C.water + '"/>' +
      arrow(70, 84, 136, 84, C.blue) + tag(102, 70, "連携運用", C.blue) +
      '<rect x="220" y="96" width="34" height="44" rx="4" fill="' + C.water + '" ' + S + '/>' + txt(237, 124, "雨水", 10) +
      '<path d="M0 176 h320" stroke="' + C.ink + '" stroke-width="5"/>' + '<path d="M0 176 h320" stroke="' + C.water + '" stroke-width="2"/>' +
      tag(250, 168, "パイプライン", C.ink) + tag(237, 80, "再利用", C.blue),
      "ダムの連携運用、雨水の再利用、農業用水のパイプライン化");
  };
  ART.safecity = function () {
    var dense = house(196, 160, .7) + house(232, 160, .7) + house(268, 160, .7);
    return svg('<rect width="320" height="200" fill="' + C.hill + '"/>' +
      '<rect x="10" y="20" width="110" height="160" fill="' + C.stake + '" opacity=".16"/>' + tag(65, 40, "危険な区域", C.stake) +
      house(40, 110, .8) + arrow(90, 104, 150, 104, C.ok) + house(160, 110, .8) + house(190, 112, .7) + tag(180, 70, "安全な区域へ", C.ok) +
      '<rect x="190" y="132" width="110" height="14" fill="' + C.road + '" ' + S + ' stroke-width="1.5"/>' + tree(304, 146) + dense +
      tag(245, 190, "広い道路で延焼を止める", C.blue) + doc(20, 128, 70, 50, "事前に復興計画"),
      "危険な区域から安全な区域への誘導、広い道路による延焼遮断、事前の復興計画");
  };
  ART.network = function () {
    return svg(hills() +
      '<path d="M20 150 H300" stroke="' + C.road + '" stroke-width="12"/>' + '<path d="M140 150 l10 12 l10 -12Z" fill="#6E5A44"/>' + cross(150, 132) +
      '<path d="M60 150 Q150 70 250 150" fill="none" stroke="' + C.ok + '" stroke-width="10"/>' + truck(175, 90) +
      tag(150, 52, "う回路で物資を届ける", C.ok) + doc(250, 30, 58, 44, "BCP"),
      "通れなくなった道路を迂回して物資を運ぶトラックと事業継続計画");
  };
  ART.q2end = function () {
    return endScene("しなやかな国土へ", river() + bridge(70, 140, 180, { glow: true, pierH: 30 }) + house(30, 128) + house(268, 126));
  };

  // ----- (3) SDGs -----
  ART.q3cover = function () {
    return svg(sun(40, 36, 14) + hills() + house(40, 136, .8) + tree(80, 138) +
      '<rect x="200" y="70" width="20" height="70" fill="' + C.roof + '" ' + S + '/><rect x="224" y="50" width="24" height="90" fill="' + C.wall + '" ' + S + '/><rect x="252" y="80" width="22" height="60" fill="' + C.roof + '" ' + S + '/>' +
      globe(150, 70, 26), "山あいの村と都市と地球");
  };
  ART.satoyama1 = function () {
    return svg(hills() + house(40, 140) + cross(51, 118) + house(90, 138, .9) + cross(100, 118) +
      '<path d="M150 150 q10 -24 20 0 q10 -24 20 0 q10 -24 20 0 q10 -24 20 0" fill="none" stroke="' + C.ok + '" stroke-width="3"/>' +
      tag(190, 112, "荒れた田畑", C.stake) + person(270, 160, C.roof, {}) + tag(90, 70, "空き家が増える", C.stake),
      "空き家と荒れた田畑が増えた中山間地域");
  };
  ART.satoyama2 = function () {
    return svg(cloud(240, 40, true) + rain(210, 44, 60) +
      '<path d="M0 200 V100 Q80 70 160 96 L320 140 V200Z" fill="#5E7A55" ' + S + '/>' +
      tree(40, 104) + tree(70, 98) + tree(100, 100) + arrow(150, 110, 230, 150, C.blue) + arrow(170, 102, 260, 140, C.blue) +
      '<path d="M100 56 q8 -8 16 0 q8 -8 16 0" fill="none" ' + S + '/>' + cross(116, 66) +
      tag(80, 30, "生き物がすめない", C.stake) + tag(250, 176, "雨水が一気に流れる", C.blue),
      "手入れされない森から雨水が一気に流れ、生き物がいなくなる様子");
  };
  ART.food = function () {
    return svg(hills() + globe(250, 80, 34) +
      '<path d="M60 120 h80 q0 40 -40 40 q-40 0 -40 -40Z" fill="' + C.paper + '" ' + S + '/>' + tag(100, 100, "食料の確保", C.ink) +
      '<path d="M80 128 h40" stroke="' + C.rust + '" stroke-width="2" stroke-dasharray="3 4"/>' + tag(250, 140, "世界の飢餓", C.stake),
      "空に近いお茶わんと世界の飢餓");
  };
  ART.sponge = function () {
    var g = "";
    for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) {
      var x = 30 + i * 46, y = 60 + j * 44, empty = (i + j * 2) % 3 === 0;
      g += empty ? '<rect x="' + x + '" y="' + y + '" width="34" height="30" fill="none" stroke="' + C.stake + '" stroke-width="1.5" stroke-dasharray="4 3"/>' : house(x + 6, y + 30, .8);
    }
    return svg('<rect width="320" height="200" fill="' + C.hill + '"/>' + g + tag(160, 34, "空き地・空き家が点在", C.stake), "空き地と空き家が虫食い状に点在する市街地");
  };
  ART.fossil = function () {
    return svg('<rect y="130" width="320" height="70" fill="' + C.water + '"/>' +
      '<path d="M20 130 h120 l-10 20 h-100Z" fill="' + C.roof + '" ' + S + '/>' + txt(80, 144, "原油", 11, C.paper) +
      factory(200, 130) + '<path d="M252 62 q-8 -14 4 -22 q14 -8 6 -22" fill="none" stroke="' + C.concreteDark + '" stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="296" y="40" width="10" height="70" rx="5" fill="' + C.paper + '" ' + S + '/><rect x="298" y="62" width="6" height="46" fill="' + C.stake + '"/>' +
      tag(90, 60, "輸入に頼る", C.stake),
      "原油を運ぶ船と煙を出す工場、上がる温度計");
  };
  ART.satoyamaRevive = function () {
    var terraces = "";
    for (var i = 0; i < 4; i++) terraces += '<path d="M' + (10 + i * 10) + ' ' + (190 - i * 18) + ' h' + (150 - i * 20) + '" stroke="' + C.ok + '" stroke-width="6"/>';
    return svg(sun(270, 34, 14) + hills() + terraces + person(150, 120, C.ok, { smile: true }) + tree(220, 120) + tree(250, 116) + tree(280, 120) +
      '<path d="M120 50 q8 -8 16 0 q8 -8 16 0" fill="none" ' + S + '/>' +
      '<path d="M230 170 q10 -16 20 0 q-10 10 -20 0Z" fill="' + C.water + '" ' + S + ' stroke-width="1.5"/>' +
      tag(90, 30, "里地里山を守る", C.ok),
      "棚田で働く人、よみがえった森と生き物、地下にしみこむ水");
  };
  ART.compact = function () {
    return svg('<rect width="320" height="200" fill="' + C.hill + '"/>' +
      '<circle cx="160" cy="100" r="44" fill="' + C.paper + '" ' + S + '/>' + house(136, 108, .8) + house(162, 106, .8) +
      '<circle cx="50" cy="50" r="22" fill="' + C.paper + '" ' + S + '/>' + house(40, 58, .6) +
      '<circle cx="270" cy="150" r="22" fill="' + C.paper + '" ' + S + '/>' + house(260, 158, .6) +
      '<path d="M70 62 L122 84 M198 120 L250 140" stroke="' + C.blue + '" stroke-width="4" stroke-dasharray="8 5"/>' +
      tag(160, 40, "集めて公共交通でつなぐ", C.blue),
      "中心の拠点と周辺の拠点を公共交通で結ぶ都市構造");
  };
  ART.renew = function () {
    return svg(sun(40, 34, 14) + hills() + turbine(220, 150, 80) + turbine(270, 156, 64) + solar(50, 160) + solar(110, 162) +
      screen(130, 40, 70, 46, txt(165, 70, "スマート", 10, C.blue)) + tag(160, 186, "自立・分散型のエネルギー", C.ok),
      "風車と太陽光パネル、エネルギーを制御するスマートシティの画面");
  };
  ART.q3end = function () {
    return endScene("誰一人取り残さない", person(120, 160, C.stake, { smile: true }) + person(150, 160, C.blue, { smile: true }) + person(180, 160, C.ok, { smile: true }) + person(210, 160, C.roof, { smile: true }));
  };

  // ----- (4) AI と品質 -----
  ART.q4cover = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + doc(30, 50, 80, 100, "設計図") + doc(120, 40, 80, 110, "計算書") +
      screen(214, 60, 84, 60, txt(256, 96, "AI", 18, C.blue)), "設計図と計算書とAIの画面");
  };
  ART.retire = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      person(80, 170, C.roof, { smile: true }) + '<rect x="90" y="140" width="22" height="18" fill="' + C.rust + '" ' + S + ' stroke-width="1.5"/>' + arrow(60, 120, 20, 120, C.ink) + bubble(80, 96, "あとは頼んだ", C.ink) +
      person(220, 170, C.blue, { sweat: true }) + bubble(220, 96, "？？？", C.stake) + doc(250, 120, 50, 50),
      "退職する熟練技術者と、戸惑う若手技術者");
  };
  ART.overload = function () {
    var pile = "";
    for (var i = 0; i < 6; i++) pile += '<rect x="' + (40 + i * 2) + '" y="' + (160 - i * 14) + '" width="90" height="12" fill="' + C.paper + '" ' + S + ' stroke-width="1.2"/>';
    return svg('<rect width="320" height="200" fill="' + C.sky + '"/>' + pile + person(200, 170, C.blue, { sweat: true }) + magnifier(240, 120) +
      cross(110, 80) + cross(70, 110) + tag(220, 50, "見落としが出る", C.stake),
      "山積みの図面と、虫めがねで確認に追われる技術者");
  };
  ART.rushcheck = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      '<rect x="30" y="40" width="70" height="70" fill="' + C.paper + '" ' + S + '/><rect x="30" y="40" width="70" height="18" fill="' + C.stake + '"/>' + txt(65, 90, "納期", 18, C.stake) +
      person(170, 170, C.roof, { sweat: true }) + doc(200, 110, 60, 60) + '<circle cx="250" cy="160" r="10" fill="none" stroke="' + C.stake + '" stroke-width="2"/>' +
      txt(230, 100, "照査済", 12, C.stake) + tag(160, 30, "形だけの照査", C.stake),
      "納期に追われて形だけの照査をする照査技術者");
  };
  ART.aiassist = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      screen(40, 50, 110, 76, txt(95, 78, "過去の判断", 11, C.blue) + txt(95, 100, "工法A 推奨", 12, C.ok)) +
      person(220, 170, C.blue, { smile: true }) + bubble(220, 96, "なるほど", C.ok) +
      '<rect x="40" y="150" width="20" height="28" fill="' + C.rust + '" ' + S + ' stroke-width="1.5"/><rect x="62" y="150" width="20" height="28" fill="' + C.blue + '" ' + S + ' stroke-width="1.5"/><rect x="84" y="150" width="20" height="28" fill="' + C.ok + '" ' + S + ' stroke-width="1.5"/>' +
      tag(80, 30, "熟練者の知見をAIに", C.blue),
      "熟練者の知見を学んだAIが若手に工法を提案する画面");
  };
  ART.autocheck = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + doc(30, 50, 80, 100, "図面") + doc(210, 50, 80, 100, "数量計算書") +
      '<path d="M112 80 H208 M112 110 H208" stroke="' + C.blue + '" stroke-width="2" stroke-dasharray="5 4"/>' + check(160, 80) + cross(160, 110) +
      screen(126, 130, 68, 44, txt(160, 158, "AI照合", 10, C.blue)) + tag(160, 30, "食い違いを自動で発見", C.blue),
      "図面と数量計算書をAIが照合し、食い違いを見つける図");
  };
  ART.screening = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + doc(40, 40, 120, 130, "成果品") +
      '<rect x="48" y="76" width="104" height="10" fill="' + C.sun + '" opacity=".7"/><rect x="48" y="116" width="104" height="10" fill="' + C.sun + '" opacity=".7"/>' +
      magnifier(110, 120) + person(240, 170, C.roof, { smile: true }) + tag(240, 70, "重点だけ照査", C.ok),
      "AIが印を付けた箇所を重点的に照査する技術者");
  };
  ART.risk = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      screen(30, 50, 110, 76, txt(85, 84, "AIの回答", 11) + txt(85, 104, "本当？", 12, C.stake)) + magnifier(140, 140) +
      lock(240, 110) + tag(240, 60, "情報を守る", C.ink) + tag(85, 186, "根拠を確かめる", C.ok),
      "AIの回答を根拠資料で確かめ、情報を鍵で守る図");
  };
  ART.q4end = function () {
    return endScene("品質と信頼を守る", '<circle cx="160" cy="110" r="34" fill="' + C.paper + '" stroke="' + C.ok + '" stroke-width="4"/>' + check(160, 112));
  };

  // ----- (5) 国際競争力 -----
  ART.q5cover = function () {
    return svg(globe(160, 110, 60) + plane(40, 50) + '<circle cx="196" cy="88" r="5" fill="' + C.stake + '" ' + S + ' stroke-width="1"/>', "地球と飛行機");
  };
  ART.share = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      '<rect x="40" y="60" width="40" height="110" fill="' + C.roof + '" ' + S + '/><rect x="100" y="80" width="40" height="90" fill="' + C.roof + '" ' + S + '/>' +
      '<rect x="160" y="150" width="40" height="20" fill="' + C.stake + '" ' + S + '/>' + txt(180, 186, "日本", 11, C.stake) +
      '<path d="M30 170 H220" ' + S + '/>' + doc(240, 60, 60, 70, "ODA") + tag(120, 40, "海外市場でのシェア", C.ink),
      "海外市場で日本のシェアが小さく、ODAに頼っている棒グラフ");
  };
  ART.contractIntl = function () {
    var books = "";
    [["#C0392B", "Red"], ["#D4A017", "Yellow"], ["#9AA3AB", "Silver"]].forEach(function (b, i) {
      books += '<rect x="' + (30 + i * 34) + '" y="70" width="30" height="90" fill="' + b[0] + '" ' + S + ' stroke-width="1.5"/>';
    });
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + books + txt(80, 60, "FIDIC約款", 13) +
      person(220, 170, C.blue, { sweat: true }) + bubble(220, 96, "支払いは？", C.stake),
      "国際的な契約約款の本と、契約に戸惑う技術者");
  };
  ART.megacity = function () {
    var cars = "";
    for (var i = 0; i < 6; i++) cars += '<rect x="' + (20 + i * 50) + '" y="150" width="34" height="14" rx="4" fill="' + [C.stake, C.blue, C.ok][i % 3] + '" ' + S + ' stroke-width="1.2"/>';
    return svg('<rect x="20" y="60" width="30" height="80" fill="' + C.roof + '" ' + S + '/><rect x="60" y="40" width="30" height="100" fill="' + C.wall + '" ' + S + '/><rect x="100" y="70" width="30" height="70" fill="' + C.roof + '" ' + S + '/><rect x="200" y="50" width="34" height="90" fill="' + C.wall + '" ' + S + '/><rect x="244" y="74" width="30" height="66" fill="' + C.roof + '" ' + S + '/>' +
      '<rect y="140" width="320" height="60" fill="' + C.water + '" opacity=".6"/>' + cars + tag(160, 30, "渋滞・浸水", C.stake),
      "急成長する都市の渋滞と浸水");
  };
  ART.talent = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + bubble(70, 60, "Hello", C.blue) + bubble(160, 46, "Xin chào", C.blue) + bubble(250, 60, "Halo", C.blue) +
      person(120, 170, C.blue, { sweat: true }) + '<rect x="190" y="130" width="40" height="40" fill="none" stroke="' + C.ink + '" stroke-width="2" stroke-dasharray="5 4"/>' + txt(210, 156, "？", 16, C.stake) +
      tag(160, 190, "国際的に働ける人が足りない", C.stake),
      "多言語が飛び交う現場で、担い手の席が空いている様子");
  };
  ART.partner = function () {
    return svg(hills() + person(110, 168, C.blue, { smile: true }) + person(170, 168, C.rust, { smile: true }) +
      '<path d="M118 152 Q140 142 162 152" fill="none" ' + S + ' stroke-width="4"/>' + txt(110, 190, "日本", 10) + txt(170, 190, "現地企業", 10) +
      '<path d="M220 100 h70 l-35 -22Z" fill="' + C.roof + '" ' + S + '/><rect x="226" y="100" width="58" height="40" fill="' + C.wall + '" ' + S + '/>' + txt(255, 126, "銀行", 11) +
      tag(110, 50, "官民で海外へ", C.blue),
      "日本の技術者と現地企業の握手、資金を出す国際的な銀行");
  };
  ART.training = function () {
    var books = "";
    ["#C0392B", "#D4A017", "#9AA3AB", "#C9A227"].forEach(function (c, i) {
      books += '<rect x="' + (200 + i * 22) + '" y="80" width="18" height="60" fill="' + c + '" ' + S + ' stroke-width="1.5"/>';
    });
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + '<rect x="30" y="30" width="140" height="80" fill="' + C.ok + '" ' + S + '/>' + txt(100, 76, "契約管理の研修", 13, C.paper) +
      person(60, 170, C.blue, { smile: true }) + person(100, 170, C.rust, { smile: true }) + person(140, 170, C.roof, { smile: true }) + books,
      "国際契約の研修を受ける技術者と約款の本");
  };
  ART.package = function () {
    return svg(hills() + '<rect x="110" y="80" width="100" height="70" fill="' + C.stake + '" ' + S + '/>' + '<path d="M110 100 h100 M160 80 v70" stroke="' + C.sun + '" stroke-width="6"/>' +
      tag(160, 60, "防災・スマートシティ", C.ink) + doc(20, 100, 60, 50, "商社") + doc(240, 100, 60, 50, "建設会社") +
      tag(160, 176, "まとめて提案", C.ok),
      "商社・建設会社と組み、日本の強みを一つの包みにして提案する図");
  };
  ART.grow = function () {
    return svg(globe(230, 100, 46) + plane(30, 70) + person(90, 170, C.blue, { smile: true }) +
      '<path d="M78 136 h24 l-12 -6Z" fill="' + C.ink + '"/>' + tag(90, 40, "海外で経験を積む", C.ok),
      "海外に学びに出る若手技術者");
  };
  ART.q5end = function () {
    return endScene("世界で選ばれる日本の技術", globe(160, 120, 34));
  };

  // ----- (6) BIM/CIM -----
  function wireBridge(x, y, s) {
    return '<path d="M' + x + ' ' + y + ' h' + (120 * s) + ' l' + (20 * s) + ' ' + (-14 * s) + ' h' + (-120 * s) + 'Z" fill="' + C.water + '" fill-opacity=".4" stroke="' + C.blue + '" stroke-width="1.5"/>' +
      '<path d="M' + (x + 20 * s) + ' ' + y + ' v' + (30 * s) + ' M' + (x + 100 * s) + ' ' + y + ' v' + (30 * s) + ' M' + (x + 40 * s) + ' ' + (y - 14 * s) + ' v' + (30 * s) + ' M' + (x + 120 * s) + ' ' + (y - 14 * s) + ' v' + (30 * s) + '" stroke="' + C.blue + '" stroke-width="1.5"/>';
  }
  ART.q6cover = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + screen(70, 30, 180, 120, wireBridge(100, 100, 1)), "画面に映る橋の3次元モデル");
  };
  ART.consensus = function () {
    return svg(hills() + screen(100, 30, 120, 80, wireBridge(116, 80, .7)) + person(70, 170, C.rust, { smile: true }) + person(250, 170, C.ok, { smile: true }) +
      bubble(70, 120, "よくわかる", C.ok) + bubble(250, 120, "賛成！", C.ok),
      "3次元モデルを見て計画に納得する住民");
  };
  ART.dataflow = function () {
    var steps = ["測量", "設計", "施工", "維持管理"], out = "";
    steps.forEach(function (s, i) {
      var x = 20 + i * 76;
      out += '<rect x="' + x + '" y="120" width="60" height="40" rx="4" fill="' + C.paper + '" ' + S + '/>' + txt(x + 30, 145, s, 11);
      if (i < 3) out += arrow(x + 62, 140, x + 74, 140, C.blue);
    });
    return svg(hills() + out + cube(140, 64, 30) + tag(160, 30, "同じデータを引き継ぐ", C.blue), "測量から維持管理まで同じデータを引き継ぐ流れ");
  };
  ART.frontload = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      '<path d="M30 170 H300 M30 170 V30" ' + S + '/>' + txt(165, 190, "計画 → 設計 → 施工", 11) +
      '<path d="M30 160 C90 160 120 160 160 140 S240 60 290 50" fill="none" stroke="' + C.stake + '" stroke-width="3" stroke-dasharray="6 4"/>' +
      '<path d="M30 160 C60 60 110 60 150 120 S240 160 290 160" fill="none" stroke="' + C.ok + '" stroke-width="3"/>' +
      tag(240, 40, "後で手戻り", C.stake) + tag(90, 46, "最初に検討", C.ok),
      "初期に検討を集中すると後工程の手戻りが減ることを示すグラフ");
  };
  ART.twin = function () {
    return svg(hills() + river() + bridge(20, 150, 120, { pierH: 20 }) + '<circle cx="60" cy="134" r="4" fill="' + C.stake + '"/><circle cx="110" cy="134" r="4" fill="' + C.stake + '"/>' +
      arrow(150, 120, 180, 120, C.blue) + screen(186, 60, 120, 80, wireBridge(198, 112, .7)) + tag(160, 34, "現実と仮想をつなぐ", C.blue),
      "センサーを付けた実際の橋と、画面上のデジタルの橋");
  };
  ART.bimskill = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' + screen(30, 40, 100, 70, cube(62, 82, 24)) + person(80, 176, C.blue, { sweat: true }) +
      '<rect x="180" y="40" width="110" height="70" fill="' + C.ok + '" ' + S + '/>' + txt(235, 80, "BIM/CIM研修", 12, C.paper) +
      person(210, 176, C.rust, { smile: true }) + person(250, 176, C.roof, { smile: true }),
      "3次元モデルづくりに苦戦する技術者と、研修で育つ技術者");
  };
  ART.format = function () {
    return svg('<rect width="320" height="200" fill="' + C.paper + '"/>' +
      '<rect x="20" y="60" width="80" height="60" fill="' + C.blue + '" ' + S + '/>' + txt(60, 95, "設計ソフト", 11, C.paper) +
      '<rect x="220" y="60" width="80" height="60" fill="' + C.rust + '" ' + S + '/>' + txt(260, 95, "施工ソフト", 11, C.paper) +
      '<path d="M100 80 h30 v-8 a8 8 0 0 1 0 16 v-8" fill="none" ' + S + '/>' + cross(160, 90) +
      '<rect x="110" y="140" width="100" height="30" rx="4" fill="' + C.ok + '" ' + S + '/>' + txt(160, 160, "共通形式", 12, C.paper) +
      arrow(60, 124, 110, 150, C.ok) + arrow(210, 150, 258, 124, C.ok) + tag(160, 40, "そのままでは渡せない", C.stake),
      "異なるソフトの間で、共通形式を介してデータを渡す図");
  };
  ART.association = function () {
    return svg(hills() + '<path d="M100 70 h120 l-60 -30Z" fill="' + C.roof + '" ' + S + '/><rect x="106" y="70" width="108" height="70" fill="' + C.wall + '" ' + S + '/>' +
      txt(160, 100, "業界で共有", 12) + person(60, 168, C.blue, { smile: true }) + person(260, 168, C.rust, { smile: true }) + person(160, 172, C.ok, { smile: true }) +
      doc(240, 40, 60, 46, "電子納品"),
      "業界団体に集まってノウハウを共有する技術者たち");
  };
  ART.q6end = function () {
    return endScene("建設生産の変革へ", cube(140, 120, 40));
  };

  window.RCCM_ART = ART;

})();
