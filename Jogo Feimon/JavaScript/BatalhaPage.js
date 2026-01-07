// --- Fundo estrelado para dar atmosfera ---
const starsContainer = document.getElementById('stars'); // Container das estrelas
for (let i = 0; i < 80; i++) { // Cria 80 estrelas
  const star = document.createElement('div'); // Nova div
  star.className = 'star'; // Classe para estilizar
  star.style.left = Math.random() * 100 + '%'; // Posição X aleatória
  star.style.top = Math.random() * 100 + '%'; // Posição Y aleatória
  star.style.animationDelay = Math.random() * 3 + 's'; // Atraso de animação
  starsContainer.appendChild(star); // Adiciona no DOM
}

// --- Partículas decorativas para dinamismo ---
const particlesContainer = document.getElementById('particles'); // Container das partículas
for (let i = 0; i < 20; i++) { // Cria 20 partículas
  const particle = document.createElement('div'); // Div da partícula
  particle.className = 'particle'; // Classe CSS
  particle.style.left = Math.random() * 100 + '%'; // Posição X aleatória
  particle.style.bottom = '0'; // Começa embaixo
  particle.style.animationDelay = Math.random() * 5 + 's'; // Atraso
  particlesContainer.appendChild(particle); // Adiciona no DOM
}

// --- Sistema de pontos (localStorage) ---
const POINTS_KEY = 'feimon_points'; // Chave para localStorage
const getPoints = () => Math.min(1000, parseInt(localStorage.getItem(POINTS_KEY) || '0', 10)); // Lê pontos do localStorage
const setPoints = (v) => { 
  const limited = Math.min(1000, Math.max(0, v)); // Limita entre 0 e 1000
  localStorage.setItem(POINTS_KEY, String(limited)); // Salva no localStorage
}; 
const addPoints = (delta) => setPoints(getPoints() + delta); // Soma pontos

// --- Utilidades de aleatoriedade ---
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; // Inteiro aleatório
const randDamage = () => randInt(15, 40); // Dano aleatório base

// --- Estado do jogador ---
const player = { hp: 100, maxHp: 100, name: 'Você' }; // Dados do jogador

// --- Lista de inimigos comuns ---
const enemies = [ // Array de inimigos com ataques
  { name: 'Slime Ácido', hp: 80, maxHp: 80,
    fixedAttack: { name:'Corte Ácido', type:'Fixo', fixed: 15, damageFn: () => 15 },
    attacks: [
      {name:'Jato de Lodo', type:'Sortudo', chance: 0.9, damageFn: randDamage},
      {name:'Ácido Corrosivo', type:'Sortudo', chance: 0.9, damageFn: randDamage}
    ]
  },
  { name: 'Lagartixa', hp: 120, maxHp: 120,
    fixedAttack: { name:'Mordida Rápida', type:'Fixo', fixed: 15, damageFn: () => 15 },
    attacks: [
      {name:'Garra Afiada', type:'Sortudo', chance: 0.9, damageFn: randDamage},
      {name:'Sopro de Fogo', type:'Sortudo', chance: 0.9, damageFn: randDamage}
    ]
  },
  { name: 'Espectro', hp: 90, maxHp: 90,
    fixedAttack: { name:'Toque Frio', type:'Fixo', fixed: 15, damageFn: () => 15 },
    attacks: [
      {name:'Sombra Maldita', type:'Sortudo', chance: 0.9, damageFn: randDamage},
      {name:'Grito Etéreo', type:'Sortudo', chance: 0.9, damageFn: randDamage}
    ]
  },
  { name: 'Cacto Feroz', hp: 110, maxHp: 110,
    fixedAttack: { name:'Golpe de Espinho', type:'Fixo', fixed: 15, damageFn: () => 15 },
    attacks: [
      {name:'Espinhos', type:'Sortudo', chance: 0.9, damageFn: randDamage},
      {name:'Chicote Verde', type:'Sortudo', chance: 0.9, damageFn: randDamage}
    ]
  },
  { name: 'Golem de Rocha', hp: 130, maxHp: 130,
    fixedAttack: { name:'Trombeta de Pedra', type:'Fixo', fixed: 15, damageFn: () => 15 },
    attacks: [
      {name:'Soco Pesado', type:'Sortudo', chance: 0.9, damageFn: randDamage},
      {name:'Queda de Pedra', type:'Sortudo', chance: 0.9, damageFn: randDamage}
    ]
  }
];

// --- Definição do chefe final ---
const boss = { name: 'Chefe Final', hp: 200, maxHp: 200, attacks: [{name:'Golpe Implacável', type:'Fixo', fixed: 15, damageFn: () => 15, chance: 1}] }; // Boss
let isBoss = false; // Indicador se a luta é contra o boss
let enemy = null; // Inimigo atual

// --- Ataques do jogador ---
const playerAttacks = [ // Lista de golpes do jogador
  { name: 'Investida', type: 'Fixo', kind: 'damage', damageFn: () => 20 },
  { name: 'Chama Azul', type: 'Sortudo', kind: 'damage', damageFn: randDamage },
  { name: 'Cura Especial', type: 'Especial', kind: 'heal', healFixed: 20 },
  { name: 'Cura Milagrosa', type: 'Milagre', kind: 'heal_full', chance: 0.3 }
];

// --- Elementos do DOM ---
const pointsEl = document.getElementById('points'); // Elemento que mostra pontos
const enemyNameEl = document.getElementById('enemyName'); // Nome do inimigo
const playerNameEl = document.getElementById('playerName'); // Nome do jogador (inicial escolhido)
const playerHpEl = document.getElementById('playerHp'); // Barra de HP do jogador
const enemyHpEl = document.getElementById('enemyHp'); // Barra de HP do inimigo
const playerSpriteEl = document.getElementById('playerSprite'); // Emoji do jogador
const enemySpriteEl = document.getElementById('enemySprite'); // Emoji do inimigo
const playerImageEl = document.getElementById('playerImage'); // Imagem do jogador
const enemyImageEl = document.getElementById('enemyImage'); // Imagem do inimigo
const logEl = document.getElementById('log'); // Log de ações
const resultEl = document.getElementById('result'); // Mensagem final
const atk1Btn = document.getElementById('atk1'); // Botão ataque 1
const atk2Btn = document.getElementById('atk2'); // Botão ataque 2
const atk3Btn = document.getElementById('atk3'); // Botão ataque 3
const atk4Btn = document.getElementById('atk4'); // Botão ataque 4
const fleeBtn = document.getElementById('flee'); // Botão fugir
const backBtn = document.getElementById('back'); // Botão voltar

// --- Renderiza barras e textos ---
function render() { // Atualiza UI básica
  pointsEl.textContent = getPoints(); // Mostra pontos
  if (enemy) { // Se há inimigo
    enemyNameEl.textContent = enemy.name; // Atualiza nome
    const pPct = Math.max(0, Math.min(100, Math.round((player.hp / player.maxHp) * 100))); // Porcentagem HP jogador
    const ePct = Math.max(0, Math.min(100, Math.round((enemy.hp / enemy.maxHp) * 100))); // Porcentagem HP inimigo
    playerHpEl.style.width = pPct + '%'; // Largura da barra do jogador
    enemyHpEl.style.width = ePct + '%'; // Largura da barra do inimigo
  }
  if (playerNameEl) playerNameEl.textContent = player.name || 'Você'; // Atualiza nome do jogador
}

// --- Define sprite/emoji do inimigo ---
function setEnemySprite() { // Ajusta aparência do inimigo
  if (!enemy) return; // Sem inimigo, não faz nada
  // Mapeia nome para as imagens fornecidas na pasta Imagens
  const imageMap = {
    'Slime Ácido': '../Imagens/Slime.png', // descontinuado, não foi tirado por medo de quebrar o código
    'Lagartixa': '../Imagens/lagartixa.png', // descontinuado, não foi tirado por medo de quebrar o código
    'Espectro': '../Imagens/espectro.png', // descontinuado, não foi tirado por medo de quebrar o código
    'Cacto Feroz': '../Imagens/cacto.png', // descontinuado, não foi tirado por medo de quebrar o código
    'Golem de Rocha': '../Imagens/pedra.png', // descontinuado, não foi tirado por medo de quebrar o código
    'Chefe Final': '../Imagens/boss final.png' // descontinuado, não foi tirado por medo de quebrar o código
  };
  const src = imageMap[enemy.name];
  if (src) {
    enemyImageEl.src = src;
    enemyImageEl.style.display = 'block';
    enemySpriteEl.style.display = 'none';
  } else {
    // Fallback para emoji caso não haja imagem mapeada
    const spriteMap = {
      'Slime Ácido': '💧',  // descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
      'Lagartixa': '🦎', // descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
      'Espectro': '👻', // descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
      'Cacto Feroz': '🌵', // descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
      'Golem de Rocha': '🗿', // descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
      'Chefe Final': '💀'// descontinuado, não foi tirado por medo de quebrar o código, por mais que funcione ainda caso de algo errado
    };
    enemySpriteEl.textContent = spriteMap[enemy.name] || '👾';
    enemySpriteEl.style.display = 'block';
    enemyImageEl.style.display = 'none';
  }
}

// --- Define a imagem do jogador baseada no inicial escolhido ---
function setPlayerSpriteFromStarter() { // Troca sprite do jogador
  let saved = null; // Guarda o que está salvo
  try { saved = JSON.parse(localStorage.getItem('feimon_starter') || 'null'); } catch (e) { saved = null; } // Lê storage
  // Se a página de escolha salvou {id, name, image}, usamos diretamente
  const map = { // Mapeia id para caminho caso imagem não esteja no objeto
    sapato: '../Imagens/sapato.png',
    sarue: '../Imagens/Sarue.png',
    gato_barcelona: '../Imagens/gato barcelona.png',
    gato_sombrio: '../Imagens/Gato sombrio.png'
  };
  const src = saved && (saved.image || map[saved.id]);
  player.name = (saved && saved.name) ? saved.name : 'Você'; // Atualiza nome do jogador
  if (src) { // Se tem imagem
    playerImageEl.src = src; // Define source
    playerImageEl.style.display = 'block'; // Mostra imagem
    playerSpriteEl.style.display = 'none'; // Esconde emoji
  } else { // Sem inicial salvo
    playerSpriteEl.textContent = '⚔️'; // Usa emoji padrão
    playerSpriteEl.style.display = 'block'; // Mostra emoji
    playerImageEl.style.display = 'none'; // Esconde imagem
  }
}

// --- Controle de usos dos ataques ---
let attackUses = { 0: 0, 1: 0, 2: 0, 3: 1 }; // Quantas vezes cada ataque pode ser usado

function initAttackUses() { // Define usos iniciais
  attackUses = { // Dá 4-6 usos para ataques 0-2 e 1 para especial
    0: randInt(4, 6),
    1: randInt(4, 6),
    2: randInt(4, 6),
    3: 1
  };
  updateAttackButtonsText(); // Atualiza textos
}

function updateAttackButtonsText() { // Atualiza rótulos dos botões
  if (atk1Btn) atk1Btn.textContent = `${playerAttacks[0].name} [${playerAttacks[0].type}] (-20) • ${attackUses[0]}x`; // Ataque 1
  if (atk2Btn) atk2Btn.textContent = `${playerAttacks[1].name} [${playerAttacks[1].type}] (-15/-40) • ${attackUses[1]}x`; // Ataque 2
  if (atk3Btn) atk3Btn.textContent = `${playerAttacks[2].name} [${playerAttacks[2].type}] (+20 HP) • ${attackUses[2]}x`; // Cura especial
  if (atk4Btn) atk4Btn.textContent = `${playerAttacks[3].name} [${playerAttacks[3].type}] (30% total) • ${attackUses[3]}x`; // Cura milagrosa
}

function setActionsEnabled(enabled) { // Habilita/desabilita ataques do jogador
  [atk1Btn, atk2Btn, atk3Btn, atk4Btn].forEach(b => { if (b) b.disabled = !enabled; }); // Troca estado
  if (fleeBtn) fleeBtn.disabled = false; // Fuga sempre disponível
}

function scheduleEnemyTurn() { // Agenda turno do inimigo
  setTimeout(() => { // Aguarda um pequeno tempo
    try {
      enemyTurn(); // Executa turno inimigo
    } catch (err) {
      console.error('Erro no turno inimigo:', err); // Loga erros
      setActionsEnabled(true); // Reabilita ações
    }
  }, 600); // Delay de 0.6s
}

function enemyTurn() { // Lógica do turno do inimigo
  if (enemy.hp <= 0) return; // Se inimigo morreu, sai
  let dmg = 0; // Dano causado
  let logText = ''; // Texto de log
  const roll = Math.floor(Math.random() * 2) + 1; // Escolhe tipo de ataque
  
  if (roll === 1) { // Ataque fixo do inimigo
    const atk = isBoss ? enemy.attacks[0] : enemy.fixedAttack; // Escolhe ataque
    dmg = atk.damageFn(); // Calcula dano
    player.hp = Math.max(0, player.hp - dmg); // Aplica dano
    logText = `${enemy.name} usou ${atk.name} [${atk.type}] e causou ${dmg} de dano!`; // Mensagem
  } else { // Ataque sortudo
    const atk = isBoss ? enemy.attacks[0] : enemy.attacks[Math.floor(Math.random()*enemy.attacks.length)]; // Ataque aleatório
    const hit = Math.random() < (atk.chance || 0.5); // Chance de acertar
    if (hit) { // Acertou
      dmg = atk.damageFn(); // Dano
      player.hp = Math.max(0, player.hp - dmg); // Aplica
      logText = `${enemy.name} usou ${atk.name} [${atk.type}] e causou ${dmg} de dano!`; // Mensagem
    } else { // Errou
      logText = `${enemy.name} tentou ${atk.name} [${atk.type}], mas errou!`; // Mensagem de erro
    }
  }
  
  render(); // Atualiza UI
  logEl.textContent = logText; // Mostra log
  
  if (player.hp <= 0) { // Verifica derrota
    setActionsEnabled(false); // Desabilita ações
    resultEl.textContent = '💀 VOCÊ FOI DERROTADO! -200 PONTOS'; // Mensagem
    addPoints(-200); // Remove pontos
    render(); // Atualiza
    setTimeout(() => { window.location.href = './game.html'; }, 1200); // Volta para o game
    return; // Termina turno
  }
  
  setActionsEnabled(true); // Habilita ações do jogador novamente
  logEl.textContent += ' 🎯 Seu turno.'; // Indica turno do jogador
}

function startBoss() { // Inicia batalha contra o chefe
  isBoss = true; // Marca como boss
  enemy = { // Define inimigo como chefe
    name: boss.name,
    hp: boss.hp,
    maxHp: boss.maxHp,
    attacks: boss.attacks.map(a => ({ ...a })) // Copia ataques
  };
  player.hp = 100; // Restaura vida do jogador
  initAttackUses(); // Reseta usos dos ataques
  logEl.textContent = '⚠️ VOCÊ ATINGIU 1000 PONTOS! O CHEFE FINAL APARECEU!'; // Mensagem
  setEnemySprite(); // Ajusta sprite do chefe
  setPlayerSpriteFromStarter(); // Ajusta sprite do jogador
  render(); // Atualiza UI
  setActionsEnabled(true); // Habilita ações
}

function checkWin() { // Verifica se o inimigo foi derrotado
  if (enemy.hp <= 0) { // HP zerado
    setActionsEnabled(false); // Desabilita ações
    if (isBoss) { // Se era o chefe
      resultEl.textContent = '🏆 VOCÊ DERROTOU O BOSS FINAL!'; // Mensagem de vitória final
      setTimeout(() => { window.location.href = './game.html'; }, 1000); // Volta para o game
      return true; // Finaliza
    }
    resultEl.textContent = '✨ VOCÊ VENCEU! +100 PONTOS'; // Vitória comum
    addPoints(100); // Dá pontos
    render(); // Atualiza
    setTimeout(() => { 
      window.location.href = './game.html'; // Volta para o game
    }, 1200);
    return true; // Indica que venceu
  }
  return false; // Ainda não venceu
}

// --- Inicializa usos dos ataques ---
initAttackUses(); // Define valores iniciais

// --- Eventos de ataque do jogador ---
atk1Btn.addEventListener('click', () => { // Ataque 1
  if (attackUses[0] <= 0) return; // Sem usos, sai
  setActionsEnabled(false); // Desabilita após clicar
  attackUses[0]--; // Consome uso
  const atk = playerAttacks[0]; // Dados do ataque
  const dmg = atk.damageFn(); // Dano fixo
  enemy.hp = Math.max(0, enemy.hp - dmg); // Aplica dano
  render(); // Atualiza
  updateAttackButtonsText(); // Atualiza botões
  logEl.textContent = `⚔️ Você usou ${atk.name} [${atk.type}] e causou ${dmg} de dano!`; // Log
  if (!checkWin()) scheduleEnemyTurn(); // Agenda inimigo se não venceu
});

atk2Btn.addEventListener('click', () => { // Ataque 2
  if (attackUses[1] <= 0) return; // Sem usos
  setActionsEnabled(false); // Desabilita
  attackUses[1]--; // Consome
  const atk = playerAttacks[1]; // Dados do ataque
  const dmg = atk.damageFn(); // Dano aleatório
  enemy.hp = Math.max(0, enemy.hp - dmg); // Aplica
  render(); // Atualiza
  updateAttackButtonsText(); // Atualiza
  logEl.textContent = `🔥 Você usou ${atk.name} [${atk.type}] e causou ${dmg} de dano!`; // Log
  if (!checkWin()) scheduleEnemyTurn(); // Agenda
});

atk3Btn.addEventListener('click', () => { // Cura especial
  if (attackUses[2] <= 0) return; // Sem usos
  setActionsEnabled(false); // Desabilita
  attackUses[2]--; // Consome
  const atk = playerAttacks[2]; // Dados da cura
  const heal = atk.healFixed; // Valor da cura
  const before = player.hp; // HP antes
  player.hp = Math.min(player.maxHp, player.hp + heal); // Aplica cura
  render(); // Atualiza
  updateAttackButtonsText(); // Atualiza
  logEl.textContent = `💚 Você usou ${atk.name} [${atk.type}] e recuperou ${player.hp - before} de vida!`; // Log
  scheduleEnemyTurn(); // Agenda inimigo
});

atk4Btn.addEventListener('click', () => { // Cura milagrosa
  if (attackUses[3] <= 0) return; // Sem usos
  setActionsEnabled(false); // Desabilita
  attackUses[3]--; // Consome
  const atk = playerAttacks[3]; // Dados da cura
  const success = Math.random() < atk.chance; // Testa chance
  if (success) { // Se deu certo
    const healed = player.maxHp - player.hp; // Quanto vai curar
    player.hp = player.maxHp; // Cura total
    render(); // Atualiza
    logEl.textContent = `✨ Você usou ${atk.name} [${atk.type}] e curou completamente (${healed} de vida)!`; // Log
  } else { // Se falhou
    render(); // Atualiza
    logEl.textContent = `💫 Você usou ${atk.name} [${atk.type}] mas a cura milagrosa falhou!`; // Log
  }
  updateAttackButtonsText(); // Atualiza
  scheduleEnemyTurn(); // Agenda inimigo
});

// --- Botões de fugir/voltar ---
fleeBtn.addEventListener('click', () => { // Fuga
  // Volta para o game
  window.location.href = './game.html';
});

backBtn.addEventListener('click', () => { // Voltar
  // Volta para o menu principal
  window.location.href = './Trabalho.html';
});

// --- Inicializa a batalha ---
(function initBattle() { // IIFE de inicialização
  const params = new URLSearchParams(window.location.search);
  const forceBoss = params.get('boss') === '1';
  if (forceBoss) { // Força chefe apenas por parâmetro
    startBoss(); // Vai direto para o chefe
  } else { // Senão escolhe inimigo aleatório
    const base = enemies[Math.floor(Math.random()*enemies.length)]; // Sorteia inimigo
    enemy = { // Copia dados
      name: base.name,
      hp: base.hp,
      maxHp: base.maxHp,
      fixedAttack: base.fixedAttack,
      attacks: base.attacks.map(a => ({ ...a })) // Copia ataques
    };
    setEnemySprite(); // Define sprite do inimigo
    setPlayerSpriteFromStarter(); // Define sprite do jogador pela escolha
    render(); // Atualiza UI inicial
    initAttackUses(); // Reseta usos de ataque
  }
})();