import { $, esc } from "./lib.js";
  /* ---------- medalhas ---------- */
  var MEDAL_STORE_KEY = "pka-guild-tools:medals:v1";
  var medalCatalog = null, medalStoreOk = true, medalsLoaded = false;
  var medalSelected = [];
  var medalChips = $("medalChips"), medalLog = $("medalLog"),
      medalFile = $("medalFile"), medalFilterBtn = $("medalFilter"),
      medalWipe = $("medalWipe"), medalList = $("medalList"),
      medalEmpty = $("medalEmpty"), medalSummary = $("medalSummary"),
      medalStoreNote = $("medalStoreNote");

  function medalBuffLabel(id) {
    var b = medalCatalog.buffs.filter(function (x) { return x.id === id; })[0];
    return b ? b.label : id;
  }

  function medalSave() {
    if (!medalStoreOk) return;
    try {
      localStorage.setItem(MEDAL_STORE_KEY, JSON.stringify({
        version: 1, selectedBonusIds: medalSelected, logText: medalLog.value
      }));
    } catch (e) {
      medalStoreOk = false;
      medalStoreNote.textContent = "Armazenamento local indisponível: a sessão não será persistida.";
    }
  }

  function medalLoadStored() {
    var raw = null;
    try { raw = localStorage.getItem(MEDAL_STORE_KEY); }
    catch (e) { medalStoreOk = false; }
    if (!raw) return;
    try {
      var s = JSON.parse(raw);
      if (s && Array.isArray(s.selectedBonusIds)) {
        medalSelected = s.selectedBonusIds.filter(function (id) {
          return medalCatalog.buffs.some(function (b) { return b.id === id; });
        });
      }
      if (s && typeof s.logText === "string") medalLog.value = s.logText.slice(0, 200000);
    } catch (e) { /* dado corrompido: ignora e segue com padrão */ }
    if (!medalStoreOk) medalStoreNote.textContent = "Armazenamento local indisponível: a sessão não será persistida.";
  }

  function medalRenderChips() {
    var cats = [];
    medalCatalog.buffs.forEach(function (b) { if (cats.indexOf(b.category) < 0) cats.push(b.category); });
    medalChips.innerHTML = cats.map(function (c) {
      var btns = medalCatalog.buffs.filter(function (b) { return b.category === c; }).map(function (b) {
        var on = medalSelected.indexOf(b.id) >= 0;
        return "<button type=\"button\" class=\"" + "chip" + (on ? " on" : "") + "\" data-bonus=\"" + b.id + "\">" + esc(b.label) + "</button>";
      }).join("");
      return "<div class=\"chips-group\"><h3>" + esc(c) + "</h3><div class=\"chips\">" + btns + "</div></div>";
    }).join("");
  }

  function medalParse(text) {
    var counts = {}, valid = 0, invalid = 0;
    var re = /Dex\s*#\s*(\d+)/gi, m;
    while ((m = re.exec(text)) !== null) {
      var n = parseInt(m[1], 10);
      if (n >= 1 && n <= 151) { counts[n] = (counts[n] || 0) + 1; valid++; }
      else invalid++;
    }
    return { counts: counts, valid: valid, invalid: invalid };
  }

  function medalApply() {
    if (!medalCatalog) return;
    if (!medalSelected.length) {
      medalList.innerHTML = "";
      medalSummary.hidden = true;
      medalEmpty.hidden = false;
      medalEmpty.textContent = "Selecione ao menos um bônus acima para ver o resultado.";
      return;
    }
    var parsed = medalParse(medalLog.value);
    if (!parsed.valid) {
      medalList.innerHTML = "";
      medalSummary.hidden = true;
      medalEmpty.hidden = false;
      medalEmpty.textContent = medalLog.value.trim()
        ? "Nenhuma linha válida no log. O formato esperado é: Você recebeu uma medalha (Dex #N)!"
        : "Cole o log acima e clique em Filtrar.";
      return;
    }
    var sel = {};
    medalSelected.forEach(function (id) { sel[id] = true; });
    var rows = medalCatalog.medals
      .filter(function (md) { return sel[md.bonus] && parsed.counts[md.dex]; })
      .sort(function (a, b) { return a.dex - b.dex; });
    if (!rows.length) {
      medalList.innerHTML = "";
      medalSummary.hidden = true;
      medalEmpty.hidden = false;
      medalEmpty.textContent = "Nenhuma medalha combina com os bônus selecionados.";
      return;
    }
    medalEmpty.hidden = true;
    medalList.innerHTML = rows.map(function (md) {
      var q = parsed.counts[md.dex];
      return "<li class=\"medal-item\">" +
        "<img src=\"" + esc(md.sprite) + "\" alt=\"" + esc(md.name) + "\" loading=\"lazy\" onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
        "<span class=\"img-fallback\" style=\"display:none\">#" + md.dex + "</span>" +
        "<span class=\"info\"><span class=\"name\">" + esc(md.name) + "</span> " +
        "<span class=\"meta\">#" + md.dex + " · " + esc(medalBuffLabel(md.bonus)) + "</span></span>" +
        "<span class=\"qty\">×" + q + "</span></li>";
    }).join("");
    var units = rows.reduce(function (a, md) { return a + parsed.counts[md.dex]; }, 0);
    medalSummary.hidden = false;
    medalSummary.textContent = rows.length + " espécie(s) · " + units + " medalha(s) combinam." +
      (parsed.invalid ? " " + parsed.invalid + " número(s) fora de 1–151 ignorado(s)." : "");
  }

  function loadMedals() {
    if (medalsLoaded) { medalApply(); return; }
    medalsLoaded = true;
    fetch("data/pka_medals_catalog.json").then(function (res) {
      if (!res.ok) throw new Error("sem catálogo");
      return res.json();
    }).then(function (c) {
      medalCatalog = c;
      medalLoadStored();
      medalRenderChips();
      medalApply();
    }).catch(function (err) {
      medalEmpty.hidden = false;
      medalEmpty.textContent = "Não deu pra carregar o catálogo de medalhas (" + err.message + ").";
    });
  }

  medalChips.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-bonus]") : null;
    if (!t) return;
    var id = t.getAttribute("data-bonus");
    var i = medalSelected.indexOf(id);
    if (i >= 0) { medalSelected.splice(i, 1); t.className = "chip"; }
    else { medalSelected.push(id); t.className = "chip on"; }
    medalSave();
    medalApply();
  });
  $("medalClearFilter").addEventListener("click", function () {
    medalSelected = [];
    medalRenderChips();
    medalSave();
    medalApply();
  });
  medalFilterBtn.addEventListener("click", function () { medalSave(); medalApply(); });
  medalLog.addEventListener("input", function () { medalSave(); });
  medalFile.addEventListener("change", function () {
    var f = medalFile.files && medalFile.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      medalLog.value = String(rd.result || "").slice(0, 200000);
      medalSave();
      medalApply();
    };
    rd.readAsText(f);
    medalFile.value = "";
  });
  medalWipe.addEventListener("click", function () {
    if (!confirm("Apagar filtro e log salvos neste navegador?")) return;
    try { localStorage.removeItem(MEDAL_STORE_KEY); } catch (e) {}
    medalSelected = [];
    medalLog.value = "";
    medalRenderChips();
    medalApply();
  });

export { loadMedals };
