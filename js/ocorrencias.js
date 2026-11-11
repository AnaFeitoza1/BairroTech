// Categorias com os níveis de risco
const CATEGORIAS = [
  { id: "buraco", nome: "Buraco na rua", risco: 4 },
  { id: "bueiro", nome: "Bueiro entupido", risco: 5 },
  { id: "lixo",   nome: "Lixo acumulado", risco: 2 },
  { id: "poste",  nome: "Poste apagado",  risco: 3 },
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
    `Prioridade: ${prioridade} | Relatos: ${ocorrencia.relatos}`;

  const descricao = document.createElement("p");
  descricao.textContent = ocorrencia.descricao;

  item.append(titulo, detalhes, descricao);
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
