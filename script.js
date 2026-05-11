// Tenta carregar os dados salvos no navegador. Se for a primeira vez, inicia um array vazio.
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// Variável global para o debounce. Se ficasse dentro da função de busca, 
// ela seria recriada a cada tecla e o cronômetro não funcionaria.
let tempoDigitacao;

// Atualiza o "banco de dados" do navegador para as informações não sumirem no refresh
function salvar() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

function cadastrar() {
  // Captura os dados digitados no formulário
  let nome = document.getElementById("nome").value;
  let estoqueMin = parseInt(document.getElementById("estoqueMin").value);

  // Validação simples para evitar o cadastro de "produtos fantasmas"
  if (!nome) {
    alert("Ei, esqueceu de colocar o nome do produto!");
    return;
  }

  // Monta o objeto do novo produto e joga no array principal
  produtos.push({
    nome: nome,
    quantidade: 0, // Todo cadastro novo entra zerado por padrão
    minimo: estoqueMin || 0,
  });

  salvar(); 
  atualizar(); 
  limparInput(); 
}

function entrada() {
  let nome = document.getElementById("produtoEntrada").value;
  let qtd = parseInt(document.getElementById("qtdEntrada").value);

  // Trava de segurança: impede que alguém digite números negativos ou deixe vazio
  if (!qtd || qtd <= 0)
    return alert("Digite uma quantidade válida maior que zero.");

  let prod = produtos.find((p) => p.nome === nome);
  if (!prod) return alert("Não achei esse produto...");

  // Atualiza o saldo do produto no estoque
  prod.quantidade += qtd;

  salvar();
  atualizar(); 
  limparInput();
}

function saida() {
  let nome = document.getElementById("produtoSaida").value;
  let qtd = parseInt(document.getElementById("qtdSaida").value);

  if (!qtd || qtd <= 0)
    return alert("Digite uma quantidade válida maior que zero.");

  let prod = produtos.find((p) => p.nome === nome);
  if (!prod) return alert("Produto não encontrado.");

  // Regra de negócio: impede que o estoque fique negativo
  if (prod.quantidade < qtd) {
    alert("Quantidade insuficiente em estoque!");
    return;
  }

  prod.quantidade -= qtd;

  salvar();
  atualizar(); 
  limparInput();
}

// Redesenha a tabela inteira sempre que houver alguma alteração nos dados
function atualizar(lista = produtos) {
  let tabela = document.getElementById("tabela");
  tabela.innerHTML = ""; // Zera a tabela antes de popular novamente

  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];

    // Checa se o item atingiu o estoque mínimo para disparar o alerta visual
    let status = p.quantidade <= p.minimo ? "ESTOQUE BAIXO!" : "OK";
    let classeCor = p.quantidade <= p.minimo ? "alerta" : "";

    // O botão de remover já recebe o índice (i) para saber exatamente quem deletar
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

// Busca dinâmica com técnica de Debounce (para evitar sobrecarga a cada tecla digitada)
async function buscar() {
  let texto = document.getElementById("busca").value.toLowerCase();

  // Fecha o dropdown temporariamente enquanto o usuário ainda está digitando
  fecharDropdown();
  clearTimeout(tempoDigitacao);

  // Se o usuário apagar tudo, restaura a tabela original e encerra a função
  if (texto === "") {
    atualizar();
    return;
  }

  // Só executa a busca de fato após 350ms de inatividade no teclado
  tempoDigitacao = setTimeout(async () => {
    
    // Pequeno delay intencional para simular o tempo de resposta de uma API real
    await new Promise((resolve) => setTimeout(resolve, 150));

    let filtrados = produtos.filter((p) =>
      p.nome.toLowerCase().startsWith(texto)
    );

    mostrarDropdown(filtrados);
  }, 350); 
}

// Cria e exibe a caixinha flutuante com os resultados da pesquisa
function mostrarDropdown(lista) {
  let dropdown = document.getElementById("dropdown-busca");

  // Se o filtro não encontrar nada, o dropdown nem aparece
  if (lista.length === 0) {
    fecharDropdown();
    return;
  }

  dropdown.innerHTML = "";

  // Cria as opções clicáveis dinamicamente
  for (let i = 0; i < lista.length; i++) {
    let p = lista[i];
    let item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = p.nome + " — Estoque: " + p.quantidade;

    // Ação ao clicar em uma sugestão: joga o nome pro input e filtra a tabela
    item.onclick = function () {
      document.getElementById("busca").value = p.nome;
      atualizar([p]);
      fecharDropdown();
    };

    dropdown.appendChild(item);
  }

  dropdown.style.display = "block";
}

function fecharDropdown() {
  let dropdown = document.getElementById("dropdown-busca");
  dropdown.style.display = "none";
  dropdown.innerHTML = "";
}

// Exclui um produto específico usando a posição dele no array
function removerItem(indice) {
  let nomeProduto = produtos[indice].nome;

  // Pede confirmação antes de fazer a exclusão definitiva
  if (!confirm("Remover \"" + nomeProduto + "\" do estoque?")) return;

  produtos.splice(indice, 1);

  salvar();    
  atualizar(); 
}

// Limpa todos os inputs da tela para o usuário não precisar apagar na mão
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

// Hard reset: apaga o LocalStorage e zera o array (Ação destrutiva)
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