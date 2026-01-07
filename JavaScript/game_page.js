// Executa quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => { // Espera carregar a página
  console.log('🎮 Game.html carregado!'); // Log simples para debug

  const backBtn = document.getElementById('backBtn'); // Botão de voltar
  const menu = document.getElementById('menu'); // Container de menu (oculto)
  const pointsBarValue = document.getElementById('pointsBarValue'); // Valor dos pontos na barra
  const admBossBtn = document.getElementById('admBossBtn'); // Botão de ADM para boss

  const POINTS_KEY = 'feimon_points'; // Nome da chave dos pontos
  const getPoints = () => Math.min(1000, parseInt(localStorage.getItem(POINTS_KEY) || '0', 10)); // Lê pontos com limite 1000
  const pts = getPoints(); // Pega os pontos atuais
  if (pointsBarValue) pointsBarValue.textContent = String(pts); // Atualiza o texto na barra

  // Atualiza botão DESAFIAR BOSS baseado nos pontos
  const challengeBossBtn = document.getElementById('challengeBossBtn');
  if (challengeBossBtn) {
    if (pts >= 1000) {
      challengeBossBtn.disabled = false;
      challengeBossBtn.style.background = '#dc2626';
      challengeBossBtn.style.color = '#fff';
      challengeBossBtn.style.cursor = 'pointer';
      challengeBossBtn.textContent = 'DESAFIAR BOSS';
    } else {
      challengeBossBtn.disabled = true;
      challengeBossBtn.style.background = '#666';
      challengeBossBtn.style.color = '#999';
      challengeBossBtn.style.cursor = 'not-allowed';
      challengeBossBtn.textContent = `DESAFIAR BOSS (${1000 - pts} pts restantes)`;
    }
  }

  // Inicia jogo direto; se menu existir, mantém oculto
  const game = document.getElementById('game'); // Container do jogo
  if (game) game.style.display = 'block'; // Mostra o jogo
  if (menu) menu.style.display = 'none'; // Esconde o menu

  // Botão Voltar leva para o menu principal Trabalho.html
  if (backBtn) backBtn.addEventListener('click', () => { // Ao clicar em voltar
    window.location.href = './Trabalho.html';
  });

  // ADM Boss: solicita senha e força boss na batalha
  if (admBossBtn) admBossBtn.addEventListener('click', () => {
    const senha = prompt('Digite a senha ADM:');
    if (senha === '123456') {
      window.location.href = './Batalha.html?boss=1';
    } else if (senha !== null) {
      alert('Senha incorreta.');
    }
  });

  // DESAFIAR BOSS: vai para batalha contra boss quando tiver 1000+ pontos
  if (challengeBossBtn) {
    challengeBossBtn.addEventListener('click', () => {
      if (pts >= 1000) {
        window.location.href = './Batalha.html?boss=1';
      }
    });
  }

  // Exibe o inicial escolhido no card do Game
  const starterCard = document.getElementById('starterCard');
  const starterImg = document.getElementById('starterCardImg');
  const starterName = document.getElementById('starterCardName');
  try {
    const saved = JSON.parse(localStorage.getItem('feimon_starter') || 'null');
    if (saved && starterCard && starterImg && starterName) {
      const fallbackMap = {
        sapato: '../Imagens/sapato.png',
        sarue: '../Imagens/Sarue.png',
        gato_barcelona: '../Imagens/gato barcelona.png',
        gato_sombrio: '../Imagens/Gato sombrio.png'
      };
      const src = saved.image || fallbackMap[saved.id];
      if (src) {
        starterImg.src = src;
        starterName.textContent = saved.name || 'Seu Inicial';
        starterCard.style.display = 'flex';
      } else {
        starterCard.style.display = 'none';
      }
    }
  } catch (e) {
    console.warn('Falha ao ler inicial salvo:', e);
  }
});