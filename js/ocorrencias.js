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
