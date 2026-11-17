(function () {
  'use strict';

  var TAMANHO_MAX_FOTO = 5 * 1024 * 1024; 
  var TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp'];
   if (campo.type === 'email') {
    var arroba = valor.indexOf('@');
    var ponto = valor.lastIndexOf('.');

  if (
    valor.indexOf(' ') !== -1 ||  
    arroba < 1 ||                  
    ponto < arroba + 2 ||          
    ponto === valor.length - 1     
  ) {
    return 'Digite um e-mail válido, como nome@exemplo.com.';
  }
}

  function iniciar(form) {
    var botao = form.querySelector('[type="submit"]');
    var areaSucesso = form.parentElement.querySelector('.mensagem-sucesso');
    var tocados = {}; 

    var campos = Array.prototype.slice
      .call(form.querySelectorAll('input, select, textarea'))
      .filter(function (c) {
        return ['hidden', 'submit', 'button', 'reset'].indexOf(c.type) === -1;
      });

    // Utilidades

    function nomeDoCampo(campo) {
      var label = campo.id ? form.querySelector('label[for="' + campo.id + '"]') : null;
      return label ? label.textContent.replace(/\*/g, '').trim() : 'Este campo';
    }

    function obterSpanErro(campo) {
      var wrapper = campo.closest('.campo') || campo.parentElement;
      var span = wrapper.querySelector('.mensagem-erro');
      if (!span) {
        span = document.createElement('span');
        span.className = 'mensagem-erro';
        span.id = 'erro-' + (campo.id || campo.name);
        wrapper.appendChild(span);
      }
      return span;
    }

    // Regras: devolvem o texto do erro ou '' se estiver ok 

    function mensagemDeErro(campo) {
      var nome = nomeDoCampo(campo);

      if (campo.type === 'file') {
        var arquivo = campo.files && campo.files[0];
        if (!arquivo) return campo.required ? 'Selecione um arquivo.' : '';
        if (TIPOS_IMAGEM.indexOf(arquivo.type) === -1) {
          return 'Envie uma imagem JPG, PNG ou WebP.';
        }
        if (arquivo.size > TAMANHO_MAX_FOTO) {
          return 'A imagem deve ter no máximo 5 MB.';
        }
        return '';
      }

      if (campo.type === 'checkbox') {
        return campo.required && !campo.checked ? 'Marque esta opção para continuar.' : '';
      }

      var valor = campo.value.trim();

      if (campo.required && !valor) {
        return campo.tagName === 'SELECT'
          ? 'Selecione uma opção em "' + nome + '".'
          : 'Preencha o campo "' + nome + '".';
      }

      if (!valor) return ''; 

      if (campo.type === 'email' && !PADRAO_EMAIL.test(valor)) {
        return 'Digite um e-mail válido, como nome@exemplo.com.';
      }

      var minimo = Number(campo.getAttribute('minlength'));
      if (minimo && valor.length < minimo) {
        return 'Use pelo menos ' + minimo + ' caracteres em "' + nome + '".';
      }

      return '';
    }

    // Estados visuais

    function mostrarEstado(campo, erro) {
      var wrapper = campo.closest('.campo') || campo.parentElement;
      var span = obterSpanErro(campo);

      wrapper.classList.remove('campo-erro', 'campo-sucesso');
      span.textContent = erro;

      if (erro) {
        wrapper.classList.add('campo-erro');
        campo.setAttribute('aria-invalid', 'true');
        if (span.id) campo.setAttribute('aria-describedby', span.id);
      } else {
        campo.removeAttribute('aria-invalid');
        var preenchido = campo.type === 'file'
          ? campo.files && campo.files.length > 0
          : campo.type === 'checkbox' ? campo.checked : campo.value.trim() !== '';
        if (preenchido) wrapper.classList.add('campo-sucesso');
      }
    }

    function validarCampo(campo) {
      var erro = mensagemDeErro(campo);
      mostrarEstado(campo, erro);
      return !erro;
    }

    function limparCampo(campo) {
      var wrapper = campo.closest('.campo') || campo.parentElement;
      wrapper.classList.remove('campo-erro', 'campo-sucesso');
      campo.removeAttribute('aria-invalid');
      obterSpanErro(campo).textContent = '';
    }

    // Bloqueio do botão 

    function formularioValido() {
      return campos.every(function (c) { return !mensagemDeErro(c); });
    }

    function atualizarBotao() {
      if (!botao) return;
      var valido = formularioValido();
      botao.disabled = !valido;
      botao.title = valido ? '' : 'Preencha todos os campos obrigatórios para enviar';
    }

    // Sucesso 

    function gerarProtocolo() {
      var ano = new Date().getFullYear();
      var numero = Math.floor(10000 + Math.random() * 90000);
      return 'BT-' + ano + '-' + numero;
    }

    function mostrarSucesso(protocolo) {
      if (!areaSucesso) return;
      areaSucesso.textContent = protocolo
        ? 'Ocorrência registrada com sucesso! Seu protocolo é ' + protocolo +
          '. Guarde-o para acompanhar o andamento.'
        : form.dataset.mensagemSucesso || 'Formulário enviado com sucesso!';
      areaSucesso.hidden = false;
      areaSucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function coletarDados() {
      var dados = {};
      campos.forEach(function (c) {
        var chave = c.name || c.id;
        if (!chave) return;
        if (c.type === 'file') dados[chave] = c.files[0] ? c.files[0].name : '';
        else if (c.type === 'checkbox') dados[chave] = c.checked;
        else dados[chave] = c.value.trim();
      });
      return dados;
    }

    // Eventos 

    campos.forEach(function (campo) {
      var evento = campo.tagName === 'SELECT' || campo.type === 'file' || campo.type === 'checkbox'
        ? 'change'
        : 'input';

      campo.addEventListener(evento, function () {
        tocados[campo.id || campo.name] = true;
        if (areaSucesso) areaSucesso.hidden = true; 
        validarCampo(campo);
        atualizarBotao();
      });

      campo.addEventListener('blur', function () {
        if (tocados[campo.id || campo.name]) validarCampo(campo);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var primeiroInvalido = null;
      campos.forEach(function (campo) {
        if (!validarCampo(campo) && !primeiroInvalido) primeiroInvalido = campo;
      });

      if (primeiroInvalido) {
        primeiroInvalido.focus();
        atualizarBotao();
        return;
      }

      var protocolo = form.id === 'form-ocorrencia' ? gerarProtocolo() : '';
      var dados = coletarDados();

      // Avisa outros scripts que o envio foi válido
      form.dispatchEvent(new CustomEvent('formulario:enviado', {
        bubbles: true,
        detail: { dados: dados, protocolo: protocolo }
      }));

      mostrarSucesso(protocolo);

      form.reset();
      campos.forEach(limparCampo);
      tocados = {};
      atualizarBotao();
    });
    form.addEventListener('reset', function () {
      setTimeout(atualizarBotao, 0);
    });
    atualizarBotao(); 
  }
  document.querySelectorAll('form.formulario').forEach(iniciar);
})();
