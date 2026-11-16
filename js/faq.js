(function () {
  'use strict';

  var lista = document.getElementById('faq-lista');
  if (!lista) return;

  var itens = Array.prototype.slice.call(lista.querySelectorAll('.acordeao-item'));
  var busca = document.getElementById('faq-busca');
  var vazio = document.getElementById('faq-vazio');

  // 1. Só um item aberto por vez
  itens.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      itens.forEach(function (outro) {
        if (outro !== item) outro.open = false;
      });
    });
  });

  // 2. Busca
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  function filtrar() {
    var palavras = normalizar(busca.value.trim()).split(/\s+/).filter(Boolean);
    var visiveis = [];

    itens.forEach(function (item) {
      var texto = normalizar(item.textContent);
      var combina = palavras.every(function (p) { return texto.indexOf(p) !== -1; });

      item.hidden = !combina;
      if (combina) visiveis.push(item);
      else item.open = false;
    });

    // 3. Mensagem de "nada encontrado"
    if (vazio) vazio.hidden = visiveis.length > 0;
    
    if (palavras.length && visiveis.length === 1) visiveis[0].open = true;
  }
  if (busca) busca.addEventListener('input', filtrar);
})();
