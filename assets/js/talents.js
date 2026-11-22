import { $, esc } from "./lib.js";
/* ---------- talentos ---------- */
var TALENT_STORE_KEY = "pka-guild-tools:talents:v1";
var talentData = null, talentCatalog = null, talentsLoaded = false;
var talentTier = "t2", talentSelected = [], talentHave = {};

var talentTierBar = $("talentTiers"), talentList = $("talentList"),
    talentEmpty = $("talentEmpty"), talentTotalList = $("talentTotalList"),
    talentTotalEmpty = $("talentTotalEmpty"), talentTotalSummary = $("talentTotalSummary"),
    talentStoreNote = $("talentStoreNote");
var talentStoreOk = true;

function talentSprite(name) {
  var key = String(name).toLowerCase();
  var md = talentCatalog.medals.filter(function (m) { return m.name.toLowerCase() === key; })[0];
  return md || null;
}

function talentNeedQty(need) {
  return need.qty || 1;
}

function talentHaveCount(talentId, name) {
  var t = talentHave[talentId];
  return (t && t[name]) || 0;
}

function talentProgress(talent) {
  var need = 0, have = 0;
  talent.needs.forEach(function (n) {
    var q = talentNeedQty(n);
    need += q;
    have += Math.min(talentHaveCount(talent.id, n.name), q);
  });
  return { need: need, have: have };
}

function talentSave() {
  if (!talentStoreOk) return;
  try {
    localStorage.setItem(TALENT_STORE_KEY, JSON.stringify({
      version: 1, tier: talentTier, selectedIds: talentSelected, have: talentHave
    }));
  } catch (e) {
    talentStoreOk = false;
    talentStoreNote.textContent = "Armazenamento local indisponível: a sessão não será persistida.";
  }
}

function talentLoadStored() {
  var raw = null;
  try { raw = localStorage.getItem(TALENT_STORE_KEY); }
  catch (e) { talentStoreOk = false; }
  if (!raw) return;
  try {
    var s = JSON.parse(raw);
    var ids = {};
    talentData.tiers.forEach(function (t) {
      t.talents.forEach(function (tal) { ids[tal.id] = tal; });
    });
    if (s && Array.isArray(s.selectedIds)) {
      talentSelected = s.selectedIds.filter(function (id) { return !!ids[id]; });
    }
    if (s && s.have && typeof s.have === "object") {
      Object.keys(s.have).forEach(function (tid) {
        var tal = ids[tid];
        if (!tal || !s.have[tid] || typeof s.have[tid] !== "object") return;
        talentHave[tid] = {};
        tal.needs.forEach(function (n) {
          var q = talentNeedQty(n);
          var v = parseInt(s.have[tid][n.name], 10);
          if (!isNaN(v)) talentHave[tid][n.name] = Math.max(0, Math.min(q, v));
        });
      });
    }
    if (s && typeof s.tier === "string") {
      var ok = talentData.tiers.some(function (t) { return t.id === s.tier; });
      talentTier = ok ? s.tier : (s.tier === "all" ? "all" : "t2");
    }
  } catch (e) { /* dado corrompido: ignora e segue com padrão */ }
  if (!talentStoreOk) talentStoreNote.textContent = "Armazenamento local indisponível: a sessão não será persistida.";
}

function talentTierLabel(id) {
  if (id === "all") return "Todos";
  var t = talentData.tiers.filter(function (x) { return x.id === id; })[0];
  return t ? t.label : id;
}

function talentVisibleTalents() {
  if (talentTier === "all") {
    return talentData.tiers.reduce(function (a, t) { return a.concat(t.talents); }, []);
  }
  var t = talentData.tiers.filter(function (x) { return x.id === talentTier; })[0];
  return t ? t.talents : [];
}

function talentSetHave(talentId, name, qty, value) {
  value = Math.max(0, Math.min(qty, value));
  if (!talentHave[talentId]) talentHave[talentId] = {};
  talentHave[talentId][name] = value;
}

function talentRenderTiers() {
  var tiers = talentData.tiers.map(function (t) {
    return { id: t.id, label: t.label };
  });
  tiers.push({ id: "all", label: "Todos" });
  talentTierBar.innerHTML = tiers.map(function (t) {
    var on = talentTier === t.id;
    return "<button type=\"button\" class=\"" + "btn" + (on ? " primary" : "") + "\" data-tier=\"" + t.id + "\">" + esc(t.label) + "</button>";
  }).join("");
}

function talentNeedHtml(talent, n) {
  var q = talentNeedQty(n);
  var h = talentHaveCount(talent.id, n.name);
  var md = talentSprite(n.name);
  var img = md
    ? "<img src=\"" + esc(md.sprite) + "\" alt=\"" + esc(n.name) + "\" loading=\"lazy\" onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
      "<span class=\"img-fallback\" style=\"display:none\">" + esc(n.name.slice(0, 3)) + "</span>"
    : "<span class=\"img-fallback\">" + esc(n.name.slice(0, 3)) + "</span>";
  return "<li class=\"talent-need" + (h >= q ? " full" : "") + "\" data-need=\"" + esc(n.name) + "\" title=\"Clique para marcar +1\">" +
    img +
    "<span class=\"info\"><span class=\"name\">" + esc(n.name) + "</span><br>" +
    "<span class=\"meta\">precisa ×" + q + "</span></span>" +
    "<span class=\"talent-stepper\">" +
    "<button type=\"button\" data-dec=\"" + esc(n.name) + "\" aria-label=\"Menos uma\">−</button>" +
    "<span class=\"talent-have\">" + h + "/" + q + "</span>" +
    "<button type=\"button\" data-inc=\"" + esc(n.name) + "\" aria-label=\"Mais uma\">+</button>" +
    "</span></li>";
}

function talentRenderList() {
  var rows = talentVisibleTalents();
  if (!rows.length) {
    talentList.innerHTML = "";
    talentEmpty.hidden = false;
    talentEmpty.textContent = "Nenhum talento neste filtro.";
    return;
  }
  talentEmpty.hidden = true;
  talentList.innerHTML = rows.map(function (tal) {
    var on = talentSelected.indexOf(tal.id) >= 0;
    var p = talentProgress(tal);
    var done = p.have >= p.need && p.need > 0;
    var tier = talentTierLabel(tal.tierId);
    return "<article class=\"talent-card" + (done ? " done" : "") + "\" data-talent=\"" + tal.id + "\">" +
      "<div class=\"talent-card-head\">" +
      "<label class=\"talent-check\"><input type=\"checkbox\" data-select " + (on ? "checked" : "") + "> " +
      "<span class=\"talent-title\">" + esc(tal.title) + "</span></label>" +
      "<span class=\"talent-progress" + (done ? " complete" : "") + "\">" +
      (done ? "✅ " : "") + p.have + "/" + p.need +
      (talentTier === "all" ? " · " + esc(tier) : "") + "</span>" +
      "</div>" +
      "<ul class=\"talent-needs\">" + tal.needs.map(function (n) { return talentNeedHtml(tal, n); }).join("") + "</ul>" +
      "</article>";
  }).join("");
}

function talentRenderTotal() {
  var sel = {};
  talentSelected.forEach(function (id) { sel[id] = true; });
  var byTier = {};
  talentData.tiers.forEach(function (t) { byTier[t.id] = t; });
  var agg = {};
  talentData.tiers.forEach(function (tier) {
    tier.talents.forEach(function (tal) {
      if (!sel[tal.id]) return;
      tal.needs.forEach(function (n) {
        var q = talentNeedQty(n);
        var h = Math.min(talentHaveCount(tal.id, n.name), q);
        var e = agg[n.name] || (agg[n.name] = { need: 0, have: 0 });
        e.need += q;
        e.have += h;
      });
    });
  });
  var names = Object.keys(agg).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
  var missing = names.filter(function (n) { return agg[n].have < agg[n].need; });
  if (!talentSelected.length) {
    talentTotalList.innerHTML = "";
    talentTotalSummary.hidden = true;
    talentTotalEmpty.hidden = false;
    talentTotalEmpty.textContent = "Marque os talentos que você quer fazer para ver o total acumulado.";
    return;
  }
  if (!missing.length) {
    talentTotalList.innerHTML = "";
    talentTotalSummary.hidden = true;
    talentTotalEmpty.hidden = false;
    talentTotalEmpty.textContent = "Tudo completo! ✅ Nenhuma medalha faltando nos talentos selecionados.";
    return;
  }
  talentTotalEmpty.hidden = true;
  talentTotalList.innerHTML = missing.map(function (n) {
    var e = agg[n];
    var left = e.need - e.have;
    var md = talentSprite(n);
    var img = md
      ? "<img src=\"" + esc(md.sprite) + "\" alt=\"" + esc(n) + "\" loading=\"lazy\" onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex';\">" +
        "<span class=\"img-fallback\" style=\"display:none\">" + esc(n.slice(0, 3)) + "</span>"
      : "<span class=\"img-fallback\">" + esc(n.slice(0, 3)) + "</span>";
    return "<li class=\"medal-item\">" + img +
      "<span class=\"info\"><span class=\"name\">" + esc(n) + "</span> " +
      "<span class=\"meta\">tenho " + e.have + " de " + e.need + "</span></span>" +
      "<span class=\"qty\">×" + left + "</span></li>";
  }).join("");
  var units = missing.reduce(function (a, n) { return a + (agg[n].need - agg[n].have); }, 0);
  talentTotalSummary.hidden = false;
  talentTotalSummary.textContent = talentSelected.length + " talento(s) · " +
    missing.length + " espécie(s) faltando · " + units + " medalha(s) no total.";
}

function talentRenderAll() {
  talentRenderTiers();
  talentRenderList();
  talentRenderTotal();
}

function talentSelectTierIds(ids, on) {
  ids.forEach(function (id) {
    var i = talentSelected.indexOf(id);
    if (on && i < 0) talentSelected.push(id);
    if (!on && i >= 0) talentSelected.splice(i, 1);
  });
}

function loadTalents() {
  if (talentsLoaded) { talentRenderAll(); return; }
  talentsLoaded = true;
  Promise.all([
    fetch("data/pka_talents.json").then(function (res) {
      if (!res.ok) throw new Error("sem talentos");
      return res.json();
    }),
    fetch("data/pka_medals_catalog.json").then(function (res) {
      if (!res.ok) throw new Error("sem catálogo");
      return res.json();
    })
  ]).then(function (pair) {
    talentData = pair[0];
    talentCatalog = pair[1];
    talentData.tiers.forEach(function (tier) {
      tier.talents.forEach(function (tal) { tal.tierId = tier.id; });
    });
    talentLoadStored();
    talentRenderAll();
  }).catch(function (err) {
    talentsLoaded = false;
    talentEmpty.hidden = false;
    talentEmpty.textContent = "Não deu pra carregar os talentos (" + err.message + ").";
    talentTotalEmpty.hidden = false;
    talentTotalEmpty.textContent = "Não deu pra carregar os talentos (" + err.message + ").";
  });
}

talentTierBar.addEventListener("click", function (e) {
  var t = e.target && e.target.closest ? e.target.closest("[data-tier]") : null;
  if (!t || !talentData) return;
  talentTier = t.getAttribute("data-tier");
  talentSave();
  talentRenderAll();
});

$("talentSelectTier").addEventListener("click", function () {
  if (!talentData) return;
  talentSelectTierIds(talentVisibleTalents().map(function (t) { return t.id; }), true);
  talentSave();
  talentRenderAll();
});
$("talentClearTier").addEventListener("click", function () {
  if (!talentData) return;
  talentSelectTierIds(talentVisibleTalents().map(function (t) { return t.id; }), false);
  talentSave();
  talentRenderAll();
});
$("talentSelectAll").addEventListener("click", function () {
  if (!talentData) return;
  talentSelectTierIds(talentData.tiers.reduce(function (a, t) {
    return a.concat(t.talents.map(function (x) { return x.id; }));
  }, []), true);
  talentSave();
  talentRenderAll();
});
$("talentClearAll").addEventListener("click", function () {
  talentSelected = [];
  talentSave();
  talentRenderAll();
});
$("talentWipe").addEventListener("click", function () {
  if (!confirm("Apagar talentos selecionados e medalhas marcadas neste navegador?")) return;
  try { localStorage.removeItem(TALENT_STORE_KEY); } catch (e) {}
  talentSelected = [];
  talentHave = {};
  talentSave();
  talentRenderAll();
});

talentList.addEventListener("change", function (e) {
  var card = e.target && e.target.closest ? e.target.closest("[data-talent]") : null;
  if (!card || !e.target.hasAttribute("data-select")) return;
  var id = card.getAttribute("data-talent");
  talentSelectTierIds([id], e.target.checked);
  talentSave();
  talentRenderAll();
});

talentList.addEventListener("click", function (e) {
  var card = e.target && e.target.closest ? e.target.closest("[data-talent]") : null;
  if (!card || !talentData) return;
  var id = card.getAttribute("data-talent");
  var tal = null;
  talentData.tiers.forEach(function (tier) {
    tier.talents.forEach(function (x) { if (x.id === id) tal = x; });
  });
  if (!tal) return;
  function bump(name, delta) {
    var need = null;
    tal.needs.forEach(function (n) { if (n.name === name) need = n; });
    if (!need) return;
    var q = talentNeedQty(need);
    talentSetHave(id, name, q, talentHaveCount(id, name) + delta);
    talentSave();
    talentRenderAll();
  }
  var inc = e.target.closest ? e.target.closest("[data-inc]") : null;
  if (inc) { bump(inc.getAttribute("data-inc"), 1); return; }
  var dec = e.target.closest ? e.target.closest("[data-dec]") : null;
  if (dec) { bump(dec.getAttribute("data-dec"), -1); return; }
  var need = e.target.closest ? e.target.closest("[data-need]") : null;
  if (need && !e.target.closest(".talent-stepper")) {
    var name = need.getAttribute("data-need");
    var q = 1;
    tal.needs.forEach(function (n) { if (n.name === name) q = talentNeedQty(n); });
    var cur = talentHaveCount(id, name);
    talentSetHave(id, name, q, cur >= q ? 0 : cur + 1);
    talentSave();
    talentRenderAll();
  }
});

export { loadTalents };
