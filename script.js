// Aqui a gente vai no "baú" do navegador ver se já tem algum produto salvo.
// Se estiver vazio, a gente cria uma lista nova.
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// Essa função serve para anotar tudo no "baú" (LocalStorage) e não perder nada.
function salvar() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

function cadastrar() {
    // Pega o que o usuário escreveu nas caixinhas
    let nome = document.getElementById("nome").value;
    let estoqueMin = parseInt(document.getElementById("estoqueMin").value);

    // Se o nome estiver em branco, a gente avisa e para por aqui
    if (!nome) {
        alert("Ei, esqueceu de colocar o nome do produto!");
        return;
    }

    // Cria uma "ficha" do produto e coloca na nossa lista principal
    produtos.push({
        nome: nome,
        quantidade: 0, // Todo produto novo começa com zero no estoque
        minimo: estoqueMin || 0
    });

    salvar();      // Guarda no navegador
    atualizar();   // Mostra na tabela
    limparInput(); // Limpa as caixas de texto
}

function entrada() {
    let nome = document.getElementById("produtoMov").value;
    let qtd = parseInt(document.getElementById("quantidade").value) || 0;

    // Procura o produto na lista pelo nome que a pessoa digitou
    let prod = produtos.find(p => p.nome === nome);

    if (!prod) return alert("Não achei esse produto...");

    // Soma a quantidade que chegou no estoque atual
    prod.quantidade += qtd;
    
    salvar();
    atualizar();
    limparInput();
}

function saida() {
    let nome = document.getElementById("produtoMov").value;
    let qtd = parseInt(document.getElementById("quantidade").value) || 0;

    let prod = produtos.find(p => p.nome === nome);

    if (!prod) return alert("Produto não encontrado.");

    // Regra: não dá para tirar o que você não tem
    if (prod.quantidade < qtd) {
        alert("Vish! Você não tem tudo isso no estoque.");
        return;
    }

    // Subtrai o que saiu do estoque
    prod.quantidade -= qtd;
    
    salvar();
    atualizar();
    limparInput();
}

// Essa função redesenha a tabela toda vez que algo muda
function atualizar(lista = produtos) {
    let tabela = document.getElementById("tabela");
    tabela.innerHTML = ""; // Limpa a tabela velha para colocar a nova

    // O laço de repetição (for) vai passar item por item da lista
    for (let i = 0; i < lista.length; i++) {
        let p = lista[i]; 
        
        // Se a quantidade for menor ou igual ao mínimo, aparece o aviso
        let status = p.quantidade <= p.minimo ? "ESTOQUE BAIXO!" : "OK";
        let classeCor = p.quantidade <= p.minimo ? "alerta" : "";

        // Monta a linha da tabela com as informações do produto
        tabela.innerHTML += `
        <tr>
            <td>${p.nome}</td>
            <td>${p.quantidade}</td>
            <td>${p.minimo}</td>
            <td class="${classeCor}">${status}</td>
        </tr>
        `;
    }
}

function buscar() {
    // Pega o que a pessoa quer buscar e ignora se é maiúsculo ou minúsculo
    let texto = document.getElementById("busca").value.toLowerCase();

    // Cria uma lista filtrada só com os nomes que batem com a busca
    let filtrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(texto)
    );

    // Mostra só os produtos que a gente filtrou
    atualizar(filtrados);
}

// Função para limpar as caixinhas de texto e não ter que apagar na mão
function limparInput() {
    document.getElementById("nome").value = "";
    document.getElementById("estoqueMin").value = "";
    document.getElementById("produtoMov").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("busca").value = "";
}

// Função para deletar TUDO se o usuário quiser recomeçar do zero
function limparStorage() {
    if (!confirm("Tem certeza? Vai apagar tudo mesmo!")) return;

    localStorage.removeItem("produtos");
    produtos = []; 
    atualizar(); 
    alert("Prontinho, estoque limpo.");
}