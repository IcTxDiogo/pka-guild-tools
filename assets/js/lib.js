// Compartilhado entre as abas (funcoes puras). Nao acessa o DOM aqui.
  var $ = function (id) { return document.getElementById(id); };
  function num(el, fallback) {
    var v = parseFloat(String(el.value).replace(",", "."));
    return (isNaN(v) || v < 0) ? fallback : v;
  }
  function fmt(n) {
    return (Math.round(n * 10) / 10).toString().replace(".", ",");
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
export { $, num, fmt, esc };
