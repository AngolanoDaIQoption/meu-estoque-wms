// Aqui a gente vai no "baú" do navegador ver se já tem algum produto salvo.
// Se estiver vazio, a gente cria uma lista nova.
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// Variável FORA da função para o debounce funcionar corretamente.
// Se ficasse dentro, ela seria recriada a cada tecla e o cronômetro nunca seria cancelado.
let tempoDigitacao;

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
    minimo: estoqueMin || 0,
  });

  salvar(); // Guarda no navegador
  atualizar(); // Mostra na tabela
  limparInput(); // Limpa as caixas de texto
}

function entrada() {
  let nome = document.getElementById("produtoEntrada").value;
  let qtd = parseInt(document.getElementById("qtdEntrada").value);

  // CORREÇÃO E SEGURANÇA: Impede entrada de números negativos ou vazios
  if (!qtd || qtd <= 0)
    return alert("Digite uma quantidade válida maior que zero.");

  // Procura o produto na lista pelo nome
  let prod = produtos.find((p) => p.nome === nome);
  if (!prod) return alert("Não achei esse produto...");

  // Soma a quantidade que chegou no estoque atual
  prod.quantidade += qtd;

  salvar();
  atualizar(); // Volta a mostrar a lista completa e atualizada
  limparInput();
}

function saida() {
  let nome = document.getElementById("produtoSaida").value;
  let qtd = parseInt(document.getElementById("qtdSaida").value);

  // CORREÇÃO E SEGURANÇA: Impede saída de números negativos ou vazios
  if (!qtd || qtd <= 0)
    return alert("Digite uma quantidade válida maior que zero.");

  let prod = produtos.find((p) => p.nome === nome);
  if (!prod) return alert("Produto não encontrado.");

  // Regra de negócio: não dá para tirar o que você não tem
  if (prod.quantidade < qtd) {
    alert("Quantidade insuficiente em estoque!");
    return;
  }

  // Subtrai o que saiu do estoque
  prod.quantidade -= qtd;

  salvar();
  atualizar(); // Volta a mostrar a lista completa e atualizada
  limparInput();
}

// Essa função redesenha a tabela toda vez que algo muda
function atualizar(lista = produtos) {
  let tabela = document.getElementById("tabela");
  tabela.innerHTML = ""; // Limpa a tabela velha para colocar a nova

  // O laço de repetição (for) vai passar item por item da lista
  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];

    // Se a quantidade for menor ou igual ao mínimo, aparece o aviso em vermelho
    let status = p.quantidade <= p.minimo ? "ESTOQUE BAIXO!" : "OK";
    let classeCor = p.quantidade <= p.minimo ? "alerta" : "";

    // Monta a linha da tabela com as informações do produto
    // O botão passa o índice (i) para a função saber QUAL produto remover
    tabela.innerHTML += `
        <tr>
            <td>${p.nome}</td>
            <td>${p.quantidade}</td>
            <td>${p.minimo}</td>
            <td class="${classeCor}">${status}</td>
            <td><button class="btn-remover-item" onclick="removerItem(${i})">Remover</button></td>
        </tr>
        `;
  }
}

// Função de busca dinâmica com DEBOUNCE (evita processar cada letra ao mesmo tempo)
// É async porque usa "await" para simular um tempo de resposta, como em um servidor real
async function buscar() {
  // 1. Pega o texto que o usuário digitou e converte para minúsculo (para comparar sem distinção de maiúsculas)
  let texto = document.getElementById("busca").value.toLowerCase();

  // 2. Esconde o dropdown enquanto aguarda o usuário terminar de digitar
  fecharDropdown();

  // 3. Cancela o cronômetro anterior. Sem isso, cada letra dispararia uma busca separada.
  clearTimeout(tempoDigitacao);

  // 4. Se o campo estiver vazio, volta a mostrar a tabela completa e para por aqui
  if (texto === "") {
    atualizar();
    return;
  }

  // 5. Cria um novo cronômetro. A busca SÓ acontece depois de 350ms sem digitar.
  //    Isso se chama "Debounce" — é uma técnica usada em buscas profissionais.
  tempoDigitacao = setTimeout(async () => {

    // 6. "await" pausa a função aqui e espera 150ms antes de continuar.
    //    Simula o tempo de resposta de um servidor real (uma API, por exemplo).
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 7. Filtra os produtos cujo nome COMEÇA com o texto digitado
    let filtrados = produtos.filter((p) =>
      p.nome.toLowerCase().startsWith(texto)
    );

    // 8. Mostra os resultados no dropdown abaixo do campo de busca
    mostrarDropdown(filtrados);

  }, 350); // Milissegundos de espera antes de executar a busca
}

// Monta e exibe a lista de sugestões abaixo do campo de busca
function mostrarDropdown(lista) {
  let dropdown = document.getElementById("dropdown-busca");

  // Se não achou nenhum produto, esconde o dropdown e não mostra nada
  if (lista.length === 0) {
    fecharDropdown();
    return;
  }

  // Limpa o conteúdo anterior do dropdown
  dropdown.innerHTML = "";

  // Cria um item clicável para cada produto encontrado
  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];
    let item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = p.nome + " — Estoque: " + p.quantidade;

    // Ao clicar num item, preenche o campo de busca e filtra a tabela
    item.onclick = function () {
      document.getElementById("busca").value = p.nome;
      atualizar([p]);
      fecharDropdown();
    };

    dropdown.appendChild(item);
  }

  // Torna o dropdown visível
  dropdown.style.display = "block";
}

// Esconde e limpa o dropdown
function fecharDropdown() {
  let dropdown = document.getElementById("dropdown-busca");
  dropdown.style.display = "none";
  dropdown.innerHTML = "";
}

// Remove UM produto específico da lista pelo seu índice
function removerItem(indice) {
  // Pega o nome do produto para mostrar na confirmação
  let nomeProduto = produtos[indice].nome;

  if (!confirm("Remover \"" + nomeProduto + "\" do estoque?")) return;

  // splice(indice, 1) remove 1 elemento na posição indicada
  produtos.splice(indice, 1);

  salvar();    // Atualiza o LocalStorage sem o item removido
  atualizar(); // Redesenha a tabela
}

// Função para limpar todas as caixinhas de texto após as ações
function limparInput() {
  document.getElementById("nome").value = "";
  document.getElementById("estoqueMin").value = "";
  document.getElementById("produtoEntrada").value = "";
  document.getElementById("qtdEntrada").value = "";
  document.getElementById("produtoSaida").value = "";
  document.getElementById("qtdSaida").value = "";
  document.getElementById("busca").value = "";
  fecharDropdown();
}

// Função de perigo para deletar TUDO se o usuário quiser recomeçar do zero
function limparStorage() {
  if (
    !confirm(
      "Atenção! Você está prestes a apagar todo o estoque. Deseja continuar?",
    )
  )
    return;

  localStorage.removeItem("produtos");
  produtos = [];
  atualizar();
  alert("Prontinho, estoque zerado com sucesso.");
}
