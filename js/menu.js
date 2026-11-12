(function () {
  function iniciarMenu() {
    const botao = document.getElementById("btn-mobile");
    const menu = document.querySelector(".header .menu");
    if (!botao || !menu) return;

    // Liga o botão ao menu para leitores de tela
    if (!menu.id) menu.id = "menu-principal";
    botao.setAttribute("aria-controls", menu.id);
    botao.setAttribute("aria-expanded", "false");

    function estaAberto() {
      return menu.classList.contains("menu-aberto");
    }

    function abrir() {
      menu.classList.add("menu-aberto");
      botao.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
      botao.setAttribute("aria-label", "Fechar menu");
    }

    function fechar() {
      menu.classList.remove("menu-aberto");
      botao.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir menu");
    }

    botao.addEventListener("click", () => (estaAberto() ? fechar() : abrir()));

    // Fecha ao escolher uma página
    menu.addEventListener("click", evento => {
      if (evento.target.closest("a")) fechar();
    });

    // Fecha com a tecla Esc
    document.addEventListener("keydown", evento => {
      if (evento.key === "Escape" && estaAberto()) {
        fechar();
        botao.focus();
      }
    });

    // Fecha ao clicar fora do cabeçalho
    document.addEventListener("click", evento => {
      if (!evento.target.closest(".header")) fechar();
    });

    // Fecha ao voltar para a tela de computador
    window.matchMedia("(min-width: 769px)").addEventListener("change", evento => {
      if (evento.matches) fechar();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarMenu);
  } else {
    iniciarMenu();
  }
})();