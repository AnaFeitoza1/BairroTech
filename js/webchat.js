(function () {
  'use strict';

  // Endereço do fluxo do Node-RED (nó "http in", método POST).
  const URL_BOT = 'http://localhost:1880/chat';

  // Identifica a conversa. Fica só na memória da página.
  const sessao = 'site-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

  // Cria um elemento com classe e texto
  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto) el.textContent = texto;
    return el;
  }

  // Botão flutuante
  const botao = criar('button', 'webchat-botao', 'Assistente BT');
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Abrir assistente virtual');
  botao.setAttribute('aria-expanded', 'false');

  // Janela do chat
  const janela = criar('section', 'webchat-janela');
  janela.hidden = true;
  janela.setAttribute('aria-label', 'Assistente virtual BairroTech');

  const topo = criar('div', 'webchat-topo');
  const titulo = criar('strong', '', 'Assistente BairroTech');
  const fechar = criar('button', 'webchat-fechar', '×');
  fechar.type = 'button';
  fechar.setAttribute('aria-label', 'Fechar assistente');
  topo.append(titulo, fechar);

  const mensagens = criar('div', 'webchat-mensagens');
  mensagens.setAttribute('role', 'log');
  mensagens.setAttribute('aria-live', 'polite');

  const form = criar('form', 'webchat-form');
  const campo = criar('input', 'webchat-input');
  campo.type = 'text';
  campo.placeholder = 'Digite sua mensagem';
  campo.setAttribute('aria-label', 'Mensagem para o assistente');
  campo.autocomplete = 'off';
  const enviar = criar('button', 'btn webchat-enviar', 'Enviar');
  enviar.type = 'submit';
  form.append(campo, enviar);

  janela.append(topo, mensagens, form);
  document.body.append(botao, janela);

  // Adiciona uma mensagem na conversa (textContent evita injeção de HTML)
  function adicionar(texto, quem) {
    const msg = criar('div', 'webchat-msg webchat-msg-' + quem, texto);
    mensagens.append(msg);
    mensagens.scrollTop = mensagens.scrollHeight;
    return msg;
  }

  // Abre e fecha a janela
  function alternar(abrir) {
    janela.hidden = !abrir;
    botao.setAttribute('aria-expanded', String(abrir));
    if (abrir) {
      if (!mensagens.children.length) {
        adicionar('Olá! Sou o assistente BT do BairroTech! Posso te ajudar com avisos e ocorrências.', 'bot');
      }
      campo.focus();
    }
  }

  botao.addEventListener('click', function () {
    alternar(janela.hidden);
  });
  fechar.addEventListener('click', function () {
    alternar(false);
    botao.focus();
  });

  // Envia a mensagem ao Node-RED e mostra a resposta
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;

    adicionar(texto, 'usuario');
    campo.value = '';
    enviar.disabled = true;
    const aguarde = adicionar('Digitando...', 'bot');

    try {
      const resposta = await fetch(URL_BOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: texto, sessao: sessao })
      });
      if (!resposta.ok) throw new Error('Erro ' + resposta.status);
      const dados = await resposta.json();
      aguarde.textContent = dados.resposta || 'Não consegui entender. Pode repetir?';
    } catch (erro) {
      aguarde.textContent = 'Desculpe! Nosso assistente está indisponível no momento. Tente novamente mais tarde. Caso queira registrar uma ocorrência, clique no botão "Registrar ocorrência" na tela inicial do site, você pode também ver os avisos do seu bairro clicando no botão "Avisos" na tela inicial!';
    } finally {
      enviar.disabled = false;
      campo.focus();
    }
  });
})();