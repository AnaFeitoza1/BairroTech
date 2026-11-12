(function () {
  // Tira acentos e maiúsculas, para "agua" achar "Água"
  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function iniciarFiltroAvisos() {
    const filtroTipo = document.getElementById("filtro-tipo");
    const filtroBairro = document.getElementById("filtro-bairro");
    const lista = document.getElementById("lista-avisos");
    const avisoVazio = document.getElementById("aviso-vazio");
    if (!filtroTipo || !filtroBairro || !lista || !avisoVazio) return;

    const avisos = lista.querySelectorAll(".aviso");

    // Contador criado pelo JS, lido por leitores de tela
    const contador = document.createElement("p");
    contador.id = "contador-avisos";
    contador.className = "contador-avisos";
    contador.setAttribute("role", "status");
    contador.setAttribute("aria-live", "polite");
    avisoVazio.before(contador);

    function aplicarFiltros() {
      const tipo = filtroTipo.value;
      const busca = normalizar(filtroBairro.value);
      let visiveis = 0;

      avisos.forEach(aviso => {
        const combinaTipo = tipo === "todos" || aviso.dataset.tipo === tipo;
        const combinaBairro = normalizar(aviso.dataset.bairro).includes(busca);
        const mostrar = combinaTipo && combinaBairro;

        aviso.hidden = !mostrar;
        if (mostrar) visiveis += 1;
      });

      avisoVazio.hidden = visiveis > 0;
      contador.textContent = visiveis === 1
        ? "1 aviso encontrado."
        : `${visiveis} avisos encontrados.`;
    }

    filtroTipo.addEventListener("change", aplicarFiltros);
    filtroBairro.addEventListener("input", aplicarFiltros);
    aplicarFiltros();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarFiltroAvisos);
  } else {
    iniciarFiltroAvisos();
  }
})();