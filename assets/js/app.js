import { $ } from "./lib.js";
import "./calc.js";
import { loadHistory } from "./history.js";
import { loadMedals } from "./medals.js";

// Tabela de rotas: nova aba = 1 entrada aqui + <nav>/<view> no HTML
// + par assets/css/<aba>.css e assets/js/<aba>.js.
var wrap = $("wrap"), subtitle = $("subtitle");

var TABS = {
  calc: {
    tab: $("tabCalc"), view: $("viewCalc"), wide: false, load: null,
    subtitle: "Coloque o que você fez na semana e veja quanto falta."
  },
  hist: {
    tab: $("tabHist"), view: $("viewHist"), wide: true, load: loadHistory,
    subtitle: "Ranking das semanas passadas e lista de kick."
  },
  medals: {
    tab: $("tabMedals"), view: $("viewMedals"), wide: true, load: loadMedals,
    subtitle: "Filtre o log e veja quais medalhas guardar."
  }
};

function show(which) {
  Object.keys(TABS).forEach(function (key) {
    var t = TABS[key];
    t.view.hidden = key !== which;
    t.tab.className = key === which ? "active" : "";
  });
  var cur = TABS[which];
  wrap.className = "wrap" + (cur.wide ? " wide" : "");
  subtitle.textContent = cur.subtitle;
  if (cur.load) cur.load();
}

Object.keys(TABS).forEach(function (key) {
  TABS[key].tab.addEventListener("click", function () { show(key); });
});
