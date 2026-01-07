// Criar estrelas no fundo
function createStars() {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = Math.random() * 3 + 'px';
    star.style.height = star.style.width;
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    starsContainer.appendChild(star);
  }
}

// Inicializar estrelas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', createStars);

// Chave usada no localStorage para salvar o inicial escolhido
const STARTER_KEY = 'feimon_starter'; // Nome da chave
// Tenta carregar o último inicial salvo (se houver)
const lastStarter = (() => { // Função autoexecutável para ler storage
  try { return JSON.parse(localStorage.getItem(STARTER_KEY) || 'null'); } catch { return null; } // Usa try/catch
})();
let selected = null; // Guarda o inicial selecionado atualmente

// Salva o inicial escolhido no localStorage
function saveStarter(sel) { // Função que salva o objeto
  try {
    localStorage.setItem(STARTER_KEY, JSON.stringify(sel)); // Serializa e salva
  } catch (e) {
    console.warn('Falha ao salvar starter:', e); // Loga erro se não conseguir
  }
}

// Marca visualmente e guarda o inicial selecionado
function selectCard(el) { // Recebe o elemento clicado
  document.querySelectorAll('.starter').forEach(s => s.classList.remove('selected')); // Remove seleção de todos
  el.classList.add('selected'); // Adiciona seleção ao clicado
  selected = { // Atualiza o objeto selecionado
    id: el.getAttribute('data-id'), // Lê id
    name: el.getAttribute('data-name'), // Lê nome
    image: el.getAttribute('data-img') // Lê imagem
  };
  document.getElementById('btnConfirmar').disabled = false; // Habilita botão de iniciar
}

// Ativa seleção por clique e por tecla Enter
document.querySelectorAll('.starter').forEach(el => { // Percorre as opções
  el.addEventListener('click', () => selectCard(el)); // Seleciona ao clicar
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') selectCard(el); }); // Seleciona com Enter
});

// Se já havia um inicial salvo, pré-seleciona na interface
if (lastStarter) { // Se existe
  const el = Array.from(document.querySelectorAll('.starter')).find(s => s.getAttribute('data-id') === lastStarter.id); // Procura correspondente
  if (el) selectCard(el); // Marca se encontrar
}

// Confirma a escolha e vai para o jogo
document.getElementById('btnConfirmar').addEventListener('click', () => { // Ao clicar em Iniciar
  if (!selected) return; // Garante que há seleção
  saveStarter(selected); // Salva no storage
  if (navigator.vibrate) { // Se suporte vibrar
    navigator.vibrate([100, 50, 100]); // Vibra rapidamente
  }
  window.location.href = 'game.html'; // Redireciona para o jogo
});

// Volta para o menu principal
document.getElementById('btnVoltar').addEventListener('click', () => { // Botão Voltar
  window.location.href = 'Trabalho.html'; // Vai para o menu
});