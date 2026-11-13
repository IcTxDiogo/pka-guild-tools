import { $, num, fmt } from "./lib.js";

  var CALC_META = 150;
  var DAILY_MULT = 2;
  var CONTRIB_DIV = 100;
  /* ---------- calculadora ---------- */
  var daily = $("daily"), contrib = $("contrib"),
      totalEl = $("total"), bar = $("bar"), barfill = $("barfill"),
      statusEl = $("status"), tipEl = $("tip"),
      breakdown = $("breakdown"),
      phrase = $("phrase"), copyBtn = $("copy");

  function calc() {
    var dRaw = num(daily, 0);
    var cRaw = num(contrib, 0);
    var ptsD = dRaw * DAILY_MULT;
    var ptsC = cRaw / CONTRIB_DIV;
    var total = ptsD + ptsC;
    var pct = (total / CALC_META) * 100;
    var ok = total >= CALC_META;

    totalEl.textContent = fmt(total);
    barfill.style.width = Math.min(pct, 100).toFixed(1) + "%";
    bar.className = "bar" + (ok ? " done" : "");

    statusEl.className = "status " + (ok ? "ok" : "missing");
    statusEl.textContent = ok
      ? "Meta batida (" + fmt(pct) + "%)"
      : "Faltam " + fmt(CALC_META - total) + " pts (" + fmt(pct) + "%)";

    if (!ok) {
      var missing = CALC_META - total;
      var needDaily = Math.ceil(missing / DAILY_MULT);
      var needContrib = Math.ceil(missing * CONTRIB_DIV);
      tipEl.hidden = false;
      tipEl.innerHTML = "Faltam <b>" + fmt(missing) + " pts</b>: +" +
        needDaily + " de daily ou +" + needContrib + " de contribuição para bater.";
    } else {
      tipEl.hidden = true;
      tipEl.innerHTML = "";
    }

    var rows = [];
    if (dRaw > 0) rows.push(["Dailys " + fmt(dRaw) + " × " + DAILY_MULT, fmt(ptsD) + " pts"]);
    if (cRaw > 0) rows.push(["Contribuição " + fmt(cRaw) + " ÷ " + CONTRIB_DIV, fmt(ptsC) + " pts"]);
    breakdown.innerHTML = rows.length
      ? rows.map(function (r) { return "<li><span>" + r[0] + "</span><b>" + r[1] + "</b></li>"; }).join("")
      : "<li><span>Nada ainda</span><b>0</b></li>";

    var parts = [];
    if (dRaw > 0) parts.push(fmt(ptsD));
    if (cRaw > 0) parts.push(fmt(ptsC));
    var base = parts.length >= 2
      ? parts.join(" + ") + " = " + fmt(total)
      : fmt(total);
    phrase.textContent = base + " total " + (ok ? "✅" : "❌") + " (" + fmt(pct) + "% da meta)";
  }

  ["daily", "contrib"].forEach(function (id) {
    $(id).addEventListener("input", calc);
  });

  copyBtn.addEventListener("click", function () {
    var text = phrase.textContent;
    function done() {
      copyBtn.textContent = "Copiado!";
      setTimeout(function () { copyBtn.textContent = "Copiar"; }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  });

  calc();
