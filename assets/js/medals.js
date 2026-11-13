import { $, esc } from "./lib.js";
  /* ---------- medalhas ---------- */
  var MEDAL_STORE_KEY = "pka-guild-tools:medals:v1";
  var medalCatalog = null, medalStoreOk = true, medalsLoaded = false;
  var medalSelected = [];
  var medalChips = $("medalChips"), medalLog = $("medalLog"),
      medalFile = $("medalFile"), medalFilterBtn = $("medalFilter"),
      medalWipe = $("medalWipe"), medalList = $("medalList"),
      medalEmpty = $("medalEmpty"), medalSummary = $("medalSummary"),
      medalStoreNote = $("medalStoreNote"), medalGroup = $("medalGroup");
  var medalGrouped = true;

  function medalBuffLabel(id) {
    var b = medalCatalog.buffs.filter(function (x) { return x.id === id; })[0];
    return b ? b.label : id;
  }

  function medalSave() {
    if (!medalStoreOk) return;
    try {
      localStorage.setItem(MEDAL_STORE_KEY, JSON.stringify({
        version: 1, selectedBonusIds: medalSelected, logText: medalLog.value,
        grouped: medalGrouped
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
      if (s && typeof s.grouped === "boolean") medalGrouped = s.grouped;
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
    function medalItemHtml(md) {
      var q = parsed.counts[md.dex];
      return "<li class=\"medal-item\">" +
        "<img src=\"" + esc(md.sprite) + "\" alt=\"" + esc(md.name) + "\" loading=\"lazy\" onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
        "<span class=\"img-fallback\" style=\"display:none\">#" + md.dex + "</span>" +
        "<span class=\"info\"><span class=\"name\">" + esc(md.name) + "</span> " +
        "<span class=\"meta\">#" + md.dex + " · " + esc(medalBuffLabel(md.bonus)) + "</span></span>" +
        "<span class=\"qty\">×" + q + "</span></li>";
    }
    if (medalGrouped) {
      var catOf = {}, catOrder = [];
      medalCatalog.buffs.forEach(function (b) {
        catOf[b.id] = b.category;
        if (catOrder.indexOf(b.category) < 0) catOrder.push(b.category);
      });
      var groups = {};
      rows.forEach(function (md) {
        var c = catOf[md.bonus];
        (groups[c] = groups[c] || []).push(md);
      });
      medalList.innerHTML = catOrder.filter(function (c) { return groups[c]; }).map(function (c) {
        return "<li class=\"medal-group-title\">" + esc(c) + "</li>" +
          groups[c].map(medalItemHtml).join("");
      }).join("");
    } else {
      medalList.innerHTML = rows.map(medalItemHtml).join("");
    }
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
      medalGroup.checked = medalGrouped;
      medalRenderChips();
      medalApply();
    }).catch(function (err) {
      medalsLoaded = false;
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
  $("medalSelectAll").addEventListener("click", function () {
    medalSelected = medalCatalog ? medalCatalog.buffs.map(function (b) { return b.id; }) : [];
    medalRenderChips();
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
  medalGroup.addEventListener("change", function () {
    medalGrouped = medalGroup.checked;
    medalSave();
    medalApply();
  });

  var medalCopyPrompt = $("medalCopyPrompt"), medalPromptCache = null;
  medalCopyPrompt.addEventListener("click", function () {
    function done(ok) {
      medalCopyPrompt.textContent = ok ? "Copiado!" : "Não deu pra copiar";
      setTimeout(function () { medalCopyPrompt.textContent = "Copiar prompt do ChatGPT"; }, 1500);
    }
    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(true); } catch (e) { done(false); }
        document.body.removeChild(ta);
      }
    }
    if (medalPromptCache !== null) { copyText(medalPromptCache); return; }
    medalCopyPrompt.textContent = "Carregando...";
    fetch("data/skill-leitor-medalhas.md").then(function (res) {
      if (!res.ok) throw new Error("sem prompt");
      return res.text();
    }).then(function (t) { medalPromptCache = t; copyText(t); })
    .catch(function () { done(false); });
  });

export { loadMedals };
