import { $, fmt, esc } from "./lib.js";
  /* ---------- histórico ---------- */
  var weeks = null, rowsCache = {};
  var weekSel = $("weekSel"), weekNote = $("weekNote"),
      histBody = $("histBody"),
      kickCard = $("kickCard"), kickList = $("kickList"),
      noKickCard = $("noKickCard"), noKickText = $("noKickText");

  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ""; });
    if (lines.length < 2) return [];
    var head = lines[0].split(",").map(function (h) { return h.trim(); });
    var idx = {};
    head.forEach(function (h, i) { idx[h] = i; });
    return lines.slice(1).map(function (l) {
      var c = l.split(",");
      while (c.length < head.length) c.push("");
      return {
        lvl: parseInt((c[idx.lvl] || "0").trim(), 10) || 0,
        nome: (c[idx.nome] || "").trim(),
        daily: parseFloat((c[idx.daily] || "0").trim()) || 0,
        contrib: parseFloat((c[idx.contrib] || "0").trim()) || 0,
        entrou: (c[idx.entrou] || "").trim()
      };
    }).filter(function (r) { return r.nome !== ""; });
  }

  function ptsClass(pts, meta) {
    if (pts >= meta) return "ok";
    if (pts >= meta - 50) return "mid";
    return "low";
  }

  function renderWeek(w) {
    var rows = rowsCache[w.id] || [];
    var scored = rows.map(function (r) {
      var pts = r.daily * w.dailyMult + r.contrib / w.contribDiv;
      return { r: r, pts: pts, ok: pts >= w.meta };
    }).sort(function (a, b) { return b.pts - a.pts; });

    weekNote.textContent = "Meta " + w.meta + " pts · " + w.ruleNote;

    histBody.innerHTML = scored.map(function (s) {
      var kicked = !s.ok && s.r.entrou === "";
      return "<tr" + (kicked ? " class=\"kicked\"" : "") + "><td class=\"num\">" + s.r.lvl + "</td><td class=\"name\">" + esc(s.r.nome) + "</td>" +
        "<td class=\"num\">" + fmt(s.r.daily) + "</td>" +
        "<td class=\"num\">" + fmt(s.r.contrib) + "</td>" +
        "<td class=\"num pts " + ptsClass(s.pts, w.meta) + "\">" + fmt(s.pts) + "</td>" +
        "<td class=\"just\">" + esc(s.r.entrou) + "</td></tr>";
    }).join("");

    // kick: abaixo da meta E sem nada na coluna entrou
    var kick = scored.filter(function (s) { return !s.ok && s.r.entrou === ""; });
    if (kick.length) {
      kickCard.hidden = false;
      noKickCard.hidden = true;
      kickList.innerHTML = kick.map(function (s) {
        return "<li><b>" + esc(s.r.nome) + "</b> — " + fmt(s.pts) + " pts (faltam " + fmt(w.meta - s.pts) + ")</li>";
      }).join("");
    } else {
      kickCard.hidden = true;
      noKickCard.hidden = false;
      noKickText.textContent = "Ninguém entra na lista de kick nesta semana. ✅";
    }
  }

  function loadHistory() {
    if (weeks) { renderWeek(weeks[weekSel.selectedIndex] || weeks[0]); return; }
    fetch("data/weeks.json").then(function (res) {
      if (!res.ok) throw new Error("sem weeks.json");
      return res.json();
    }).then(function (list) {
      weeks = list;
      weekSel.innerHTML = list.map(function (w) {
        return "<option value=\"" + esc(w.id) + "\">" + esc(w.label) + "</option>";
      }).join("");
      var chain = Promise.resolve();
      list.forEach(function (w) {
        chain = chain.then(function () {
          return fetch(w.file).then(function (res) {
            if (!res.ok) throw new Error("sem " + w.file);
            return res.text();
          }).then(function (txt) { rowsCache[w.id] = parseCSV(txt); });
        });
      });
      return chain.then(function () { renderWeek(weeks[0]); });
    }).catch(function (err) {
      histBody.innerHTML = "<tr><td colspan=\"6\">Não deu pra carregar o histórico (" +
        esc(err.message) + ").</td></tr>";
      weekNote.textContent = "";
      kickCard.hidden = true;
      noKickCard.hidden = true;
    });
  }
  weekSel.addEventListener("change", function () {
    if (weeks) renderWeek(weeks[weekSel.selectedIndex] || weeks[0]);
  });

export { loadHistory };
