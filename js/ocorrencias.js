// Categorias com os níveis de risco
const CATEGORIAS = [
  { id: "buraco", nome: "Buraco na rua", risco: 3 },
  { id: "bueiro", nome: "Bueiro entupido", risco: 5 },
  { id: "lixo",   nome: "Lixo acumulado", risco: 2 },
  { id: "poste",  nome: "Poste apagado",  risco: 4 },
  { id: "outro",  nome: "Outro",          risco: 1 }
];

// Data de hoje no formato AAAA-MM-DD (horário local)
function dataHoje() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${agora.getFullYear()}-${mes}-${dia}`;
}

// Dias desde o registro (por data, sem considerar horário)
function diasEmAberto(ocorrencia) {
    const MS_DIA = 24 * 60 * 60 * 1000;
    const [ano, mes, dia] = ocorrencia.dataRegistro.split("-").map(Number);
    const registro = Date.UTC(ano, mes - 1, dia);
    const agora = new Date();
    const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
    return Math.floor((hoje - registro) / MS_DIA);
}

// pontos = risco*3 + relatos (máx 5) + dias/2 (máx 5)
function calcularPontos(ocorrencia) {
    const categoria = CATEGORIAS.find(c => c.id === ocorrencia.categoriaId);
    const pontosRisco = categoria.risco * 3;
    const pontosRelatos = Math.min(ocorrencia.relatos, 5);
    const pontosTempo = Math.min(Math.floor(diasEmAberto(ocorrencia) / 2), 5);
    return pontosRisco + pontosRelatos + pontosTempo;
}

function classificarPrioridade(ocorrencia) {
    const pontos = calcularPontos(ocorrencia);
    if (pontos >= 18) return "CRITICA";
    if (pontos >= 12) return "ALTA";
    if (pontos >= 7) return "MEDIA";
    return "BAIXA";
}

// Protocolo no mesmo formato do Java: AB-2026-0001
function gerarProtocolo(lista) {
    const ano = new Date().getFullYear();
    const numero = String(lista.length + 1).padStart(4, "0");
    return `AB-${ano}-${numero}`;
}

// ---------- Armazenamento (localStorage) ----------
const CHAVE_STORAGE = "bairrotech_ocorrencias";

function carregarOcorrencias() {
    try {
        const salvo = localStorage.getItem(CHAVE_STORAGE);
        return salvo ? JSON.parse(salvo) : [];
    } catch (e) {
        return [];
    }
}

function salvarOcorrencias(lista) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

// ---------- Lista na tela ----------
const ORDEM_PRIORIDADE = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAIXA: 1 };

function nomeDaCategoria(id) {
  const categoria = CATEGORIAS.find(c => c.id === id);
  return categoria ? categoria.nome : "Outro";
}

function criarItem(ocorrencia) {
  const prioridade = classificarPrioridade(ocorrencia);

  const item = document.createElement("li");
  item.className = "item-ocorrencia";
  item.classList.add(`prioridade-${prioridade.toLowerCase()}`);

  const titulo = document.createElement("strong");
  titulo.textContent = `${ocorrencia.protocolo} - ${nomeDaCategoria(ocorrencia.categoriaId)}`;

  const detalhes = document.createElement("p");
  detalhes.textContent = `${ocorrencia.endereco} | Status: ${ocorrencia.status} | ` +
    `Prioridade: ${prioridade} (${calcularPontos(ocorrencia)} pts) | Relatos: ${ocorrencia.relatos}`;

  const descricao = document.createElement("p");
  descricao.textContent = ocorrencia.descricao;

  const botaoApoiar = document.createElement("button");
  botaoApoiar.type = "button";
  botaoApoiar.className = "btn btn-apoiar";
  botaoApoiar.dataset.protocolo = ocorrencia.protocolo;
  botaoApoiar.textContent = "Apoiar (+1 relato)";

  item.append(titulo, detalhes, descricao, botaoApoiar);
  return item;
}

function renderizarLista() {
    const lista = document.getElementById("lista-ocorrencias");
    const aviso = document.getElementById("lista-vazia");
    const filtro = document.getElementById("filtro-categoria");
    if (!lista || !aviso || !filtro) return; // outras páginas não têm a lista

    let ocorrencias = carregarOcorrencias();
    if (filtro.value !== "todas") {
        ocorrencias = ocorrencias.filter(o => o.categoriaId === filtro.value);
    }

    ocorrencias.sort((a, b) =>
        ORDEM_PRIORIDADE[classificarPrioridade(b)] - ORDEM_PRIORIDADE[classificarPrioridade(a)]
    );

    lista.replaceChildren(...ocorrencias.map(criarItem));
    aviso.hidden = ocorrencias.length > 0;
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarLista();
    const filtro = document.getElementById("filtro-categoria");
    if (filtro) filtro.addEventListener("change", renderizarLista);
});

(function () {
  // ---------- Formulário de registro ----------
  const CAMPOS_OBRIGATORIOS = [
    { id: "categoria", mensagem: "Selecione uma categoria." },
    { id: "bairro",    mensagem: "Informe o bairro." },
    { id: "endereco",  mensagem: "Informe o endereço ou ponto de referência." },
    { id: "descricao", mensagem: "Descreva o problema." }
  ];

  function mostrarErro(id, mensagem) {
    const campo = document.getElementById(id);
    const erro = document.getElementById(`erro-${id}`);
    if (campo) {
      campo.classList.add("campo-invalido");
      campo.setAttribute("aria-invalid", "true");
    }
    if (erro) erro.textContent = mensagem;
  }

  function limparErro(id) {
    const campo = document.getElementById(id);
    const erro = document.getElementById(`erro-${id}`);
    if (campo) {
      campo.classList.remove("campo-invalido");
      campo.removeAttribute("aria-invalid");
    }
    if (erro) erro.textContent = "";
  }

  function validarFormulario() {
    let valido = true;

    CAMPOS_OBRIGATORIOS.forEach(({ id, mensagem }) => {
      const campo = document.getElementById(id);
      if (campo.value.trim() === "") {
        mostrarErro(id, mensagem);
        valido = false;
      } else {
        limparErro(id);
      }
    });

    const descricao = document.getElementById("descricao").value.trim();
    if (descricao !== "" && descricao.length < 10) {
      mostrarErro("descricao", "Descreva com pelo menos 10 caracteres.");
      valido = false;
    }

    return valido;
  }

  function mostrarSucesso(protocolo) {
    const aviso = document.getElementById("mensagem-sucesso");
    if (!aviso) return;

    aviso.textContent = `Ocorrência registrada! Seu protocolo é ${protocolo}.`;
    aviso.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function mesmoBairro(a, b) {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  // Mesma lógica do Java: relatos semelhantes = mesma categoria e bairro, não resolvidos
  function registrarOcorrencia(dados) {
    const lista = carregarOcorrencias();
    let semelhantes = 0;

    lista.forEach(o => {
      if (o.categoriaId === dados.categoriaId
          && mesmoBairro(o.bairro, dados.bairro)
          && o.status !== "RESOLVIDA") {
        o.relatos += 1;
        semelhantes += 1;
      }
    });

    const nova = {
      protocolo: gerarProtocolo(lista),
      categoriaId: dados.categoriaId,
      bairro: dados.bairro,
      endereco: dados.endereco,
      descricao: dados.descricao,
      status: "ABERTA",
      relatos: semelhantes,
      dataRegistro: dataHoje()
    };

    lista.push(nova);
    salvarOcorrencias(lista);
    return nova;
  }

  function tratarEnvio(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    const nova = registrarOcorrencia({
      categoriaId: document.getElementById("categoria").value,
      bairro: document.getElementById("bairro").value.trim(),
      endereco: document.getElementById("endereco").value.trim(),
      descricao: document.getElementById("descricao").value.trim()
    });

    evento.target.reset();
    mostrarSucesso(nova.protocolo);
    renderizarLista();
  }

  function iniciarFormulario() {
    const formulario = document.getElementById("form-ocorrencia");
    if (!formulario) return;

    formulario.addEventListener("submit", tratarEnvio);
    formulario.addEventListener("input", evento => limparErro(evento.target.id));
    console.log("formulario ligado");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarFormulario);
  } else {
    iniciarFormulario();
  }
})();
(function () {
  // ---------- Apoiar ocorrência ----------
  function apoiarOcorrencia(protocolo) {
    const lista = carregarOcorrencias();
    const ocorrencia = lista.find(o => o.protocolo === protocolo);
    if (!ocorrencia) return;

    ocorrencia.relatos += 1;
    salvarOcorrencias(lista);
    renderizarLista();
  }

  function iniciarApoio() {
    const lista = document.getElementById("lista-ocorrencias");
    if (!lista) return;

    // Um único listener cuida de todos os botões, inclusive os criados depois
    lista.addEventListener("click", evento => {
      const botao = evento.target.closest("button[data-protocolo]");
      if (botao) apoiarOcorrencia(botao.dataset.protocolo);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarApoio);
  } else {
    iniciarApoio();
  }
})();