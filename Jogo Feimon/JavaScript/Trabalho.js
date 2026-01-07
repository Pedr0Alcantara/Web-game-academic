document.addEventListener("DOMContentLoaded", () => {
  let animationId = null;
  let battleAnimationId = null;

  const BATTLE_STATE = {
    IDLE: 'idle',
    ENTERING: 'entering',
    IN_BATTLE: 'inBattle',
    EXITING: 'exiting'
  };

  const battle = { 
    state: BATTLE_STATE.IDLE,
    cooldownActive: false,
    lastZoneIndex: -1
  };
  
  const DEBUG = true;
  const inputKeys = { w: { pressed: false }, a: { pressed: false }, s: { pressed: false }, d: { pressed: false } };

  const menu = document.getElementById("menu");
  const game = document.getElementById("game");
  const btnJogar = document.getElementById("btnjogar");

  if (!menu || !game) {
    console.error("Elemento #menu ou #game não encontrado no DOM.");
  }
  if (btnJogar) {
    btnJogar.addEventListener("click", () => {
      menu && (menu.style.display = "none");
      game && (game.style.display = "block");
      setTimeout(iniciarJogo, 50);
    });
  } else {
    // Inicia automaticamente se não houver botão
    game && (game.style.display = "block");
    setTimeout(iniciarJogo, 50);
  }

  const savedContext = { c: null, canvas: null };

  function isInputBlocked() {
    return battle.state !== BATTLE_STATE.IDLE;
  }

  function clearAllKeys() {
    for (const k in inputKeys) {
      if (Object.prototype.hasOwnProperty.call(inputKeys, k)) {
        inputKeys[k].pressed = false;
      }
    }
  }

  function enterBattle(returnAnimate, zoneIndex) {
    if (battle.state !== BATTLE_STATE.IDLE || battle.cooldownActive) {
      console.log('⛔ Batalha bloqueada - state:', battle.state, 'cooldown:', battle.cooldownActive);
      return;
    }
    
    console.log('🎮 ENTRANDO EM BATALHA! Personagem será travado durante a transição.');
    
    // Limpa teclas pressionadas
    clearAllKeys();
    
    battle.state = BATTLE_STATE.ENTERING;
    battle.cooldownActive = true;
    battle.lastZoneIndex = zoneIndex;

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    const overlayDiv = document.getElementById('overlappingDiv');
    if (overlayDiv) {
      overlayDiv.style.pointerEvents = 'auto';
      overlayDiv.style.opacity = '1';
    }

    console.log("⚔️ ENTER BATTLE - state:", battle.state);
    
// Redireciona imediatamente para a página de batalha (Batalha.html)
console.log('🚀 Redirecionando para Batalha.html');
// Como este script roda a partir de páginas dentro de /HTML,
// usamos caminho relativo para o arquivo nessa mesma pasta.
window.location.href = './Batalha.html';
  }

  function exitBattle(returnAnimate) {
    if (battle.state !== BATTLE_STATE.IN_BATTLE) return;

    battle.state = BATTLE_STATE.EXITING;
    console.log("↩️ EXIT BATTLE - state:", battle.state);

    const overlayDiv = document.getElementById('overlappingDiv');
    if (overlayDiv) overlayDiv.style.opacity = '1';

    setTimeout(() => {
      if (battleAnimationId) {
        cancelAnimationFrame(battleAnimationId);
        battleAnimationId = null;
      }

      const ui = document.querySelector('#userInterface');
      if (ui) ui.style.display = 'none';

      if (overlayDiv) {
        overlayDiv.style.opacity = '0';
        overlayDiv.style.pointerEvents = 'none';
      }

      if (enemy) {
        enemy.health = 100;
        enemy.opacity = 1;
      }
      if (playerMonster) {
        playerMonster.health = 100;
        playerMonster.opacity = 1;
      }

      clearAllKeys();
      battle.state = BATTLE_STATE.IDLE;

      console.log('✅ EXIT BATTLE finalizado - state:', battle.state);

      setTimeout(() => {
        battle.cooldownActive = false;
        battle.lastZoneIndex = -1;
        console.log('✅ Cooldown removido'); 
      }, 3000);

      if (typeof returnAnimate === 'function') {
        returnAnimate();
      }
    }, 700);
  }

  function iniciarJogo() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return console.error("Canvas (#canvas) não encontrado.");
    const c = canvas.getContext("2d");

    savedContext.c = c;
    savedContext.canvas = canvas;

    const overlayDivInit = document.getElementById('overlappingDiv');
    if (overlayDivInit) {
      overlayDivInit.style.opacity = '0';
      overlayDivInit.style.pointerEvents = 'none';
      overlayDivInit.style.background = 'rgba(0,0,0,0)';
    }

    canvas.width = 1120;
    canvas.height = 640;

    // Explicação: Função auxiliar para validar uma senha simples dos recursos de desenvolvedor.
    function checkDevPassword() {
      const pwd = prompt('Digite a senha para usar este recurso:'); // Abre um prompt para digitar a senha
      return pwd !== null && pwd.trim() === '123456'; // Retorna true se a senha estiver correta
    }

    // Explicação: Botão de DEV para desbloquear o movimento imediatamente, útil para testes.
    const unblockBtn = document.getElementById('unblockMovement');
    if (unblockBtn) {
      unblockBtn.addEventListener('click', () => {
        if (!checkDevPassword()) { alert('Senha incorreta'); return; }
        battle.cooldownActive = false;
        battle.state = BATTLE_STATE.IDLE;
        console.log('🎮 MOVIMENTO DESBLOQUEADO PELO DESENVOLVEDOR!'); // Log para visualizar no console
        alert('Movimento desbloqueado! Você pode andar livremente agora.'); // Feedback na tela
      });
    }

    // Explicação: Botão de DEV para forçar redirecionamento à tela de batalha (para testes).
    const testBattleBtn = document.getElementById('testBattle');
    if (testBattleBtn) {
      testBattleBtn.addEventListener('click', () => {
        if (!checkDevPassword()) { alert('Senha incorreta'); return; }
        console.log('🧪 TESTE DE BATALHA FORÇADO!');
        // Como game.html está em HTML/, precisamos subir um diretório
// Garante que o caminho aponta para o arquivo dentro de /HTML
window.location.href = './Batalha.html'; // Redireciona para a página de batalha
      });
    }

    // Explicação: Link direto para acionar batalha, protegido por senha.
    const linkTest = document.getElementById('linkTest');
    if (linkTest) {
      linkTest.addEventListener('click', (e) => {
        e.preventDefault(); // Evita navegação direta sem senha
        if (!checkDevPassword()) { alert('Senha incorreta'); return; } // Exige senha
        const href = linkTest.getAttribute('href'); // Pega o destino do link
        if (href) window.location.href = href; // Navega ao destino se existir
      });
    }

    const playerScale = 2;

    const backgroundImage = new Image();
    const foregroundImage = new Image();
    const playerDownImage = new Image();
    const playerUpImage = new Image();
    const playerLeftImage = new Image();
    const playerRightImage = new Image();

    backgroundImage.src = "../Imagens/ilha.png";
    foregroundImage.src = "../Imagens/ilha obj de fundo.png";
    playerDownImage.src = "../Imagens/walk_down.png";
    playerUpImage.src = "../Imagens/walk_up.png";
    playerLeftImage.src = "../Imagens/walk_Left_Down.png";
    playerRightImage.src = "../Imagens/walk_Right_Down.png";

    const imagesToLoad = [
      backgroundImage,
      foregroundImage,
      playerDownImage,
      playerUpImage,
      playerLeftImage,
      playerRightImage
    ];

    let loadedCount = 0;
    let failed = false;
    const total = imagesToLoad.length;

    const trySetup = () => {
      loadedCount++;
      if (loadedCount >= total) {
        if (failed) {
          console.warn('Algumas imagens falharam. Usando fallbacks.');
        }
        setupGame(
          c,
          canvas,
          playerScale,
          backgroundImage,
          foregroundImage,
          playerDownImage,
          playerUpImage,
          playerLeftImage,
          playerRightImage
        );
      }
    };

    imagesToLoad.forEach(img => {
      img.addEventListener("load", trySetup);
      img.addEventListener("error", () => {
        console.warn("Falha ao carregar imagem:", img.src);
        failed = true;
        trySetup();
      });
      if (img.complete) {
        setTimeout(() => {
          if (!img.naturalWidth) {
            console.warn("Imagem sem dimensões:", img.src);
            failed = true;
          }
          trySetup();
        }, 0);
      }
    });
  }

  function collision(rect1, rect2, offsetX = 0, offsetY = 0) {
    return (
      rect1.position.x + rect1.width + offsetX >= rect2.position.x &&
      rect1.position.x + offsetX <= rect2.position.x + rect2.width &&
      rect1.position.y + rect1.height + offsetY >= rect2.position.y &&
      rect1.position.y + offsetY <= rect2.position.y + rect2.height
    );
  }

  class Limite {
    static width = 16;
    static height = 16;
    constructor({ position }) {
      this.position = position;
      this.width = Limite.width;
      this.height = Limite.height;
      this.scale = 1;
    }
    draw(c) {
      c.fillStyle = "rgba(255,0,0,0)";
      c.fillRect(this.position.x, this.position.y, this.width * this.scale, this.height * this.scale);
    }
  }

  class Sprite {
    constructor({ position, image, frames = { max: 1, hold: 10 }, sprites = {}, scale = 1, animate = false }) {
      this.position = position;
      this.image = image;
      this.frames = { ...frames, val: 0, elapsed: 0 };
      this.sprites = sprites;
      this.animate = animate;
      this.scale = scale;
      this.width = 0;
      this.height = 0;
      this.opacity = 1;

      if (this.image) {
        this.image.onload = () => {
          this.width = ((this.image.naturalWidth || this.image.width) / this.frames.max) * scale;
          this.height = (this.image.naturalHeight || this.image.height) * scale;
        };
        if (this.image.complete && this.image.naturalWidth) {
          this.width = ((this.image.naturalWidth || this.image.width) / this.frames.max) * scale;
          this.height = (this.image.naturalHeight || this.image.height) * scale;
        }
      }
    }

    draw(c) {
      if (!this.width || !this.height) {
        if (this.image && this.image.complete && (this.image.naturalWidth || this.image.width)) {
          this.width = ((this.image.naturalWidth || this.image.width) / this.frames.max) * this.scale;
          this.height = (this.image.naturalHeight || this.image.height) * this.scale;
        } else {
          return;
        }
      }

      c.save();
      c.globalAlpha = this.opacity;

      const frameWidth = (this.image.naturalWidth || this.image.width) / this.frames.max;
      const frameHeight = this.image.naturalHeight || this.image.height;

      c.drawImage(
        this.image,
        this.frames.val * frameWidth,
        0,
        frameWidth,
        frameHeight,
        this.position.x,
        this.position.y,
        frameWidth * this.scale,
        frameHeight * this.scale
      );

      c.restore();

      if (this.animate && this.frames.max > 1) {
        this.frames.elapsed++;
        if (this.frames.elapsed % (this.frames.hold || 10) === 0) {
          this.frames.val = (this.frames.val + 1) % this.frames.max;
        }
      }
    }

    setImage(img) {
      this.image = img;
      if (img.complete && (img.naturalWidth || img.width)) {
        this.width = ((img.naturalWidth || img.width) / this.frames.max) * this.scale;
        this.height = (img.naturalHeight || img.height) * this.scale;
      } else {
        img.onload = () => {
          this.width = ((img.naturalWidth || img.width) / this.frames.max) * this.scale;
          this.height = (img.naturalHeight || img.height) * this.scale;
        };
      }
    }
  }

  class Character extends Sprite {
    constructor({ position, image, frames = { max: 1, hold: 10 }, scale = 1, animate = false, dialogue = ['...'] }) {
      super({ position, image, frames, scale, animate });
      this.dialogue = dialogue;
      this.dialogueIndex = 0;
    }
  }

  class Monster {
    constructor({ position, name, color, type, attacks, isEnemy = false }) {
      this.position = position;
      this.name = name;
      this.color = color;
      this.type = type;
      this.health = 100;
      this.maxHealth = 100;
      this.isEnemy = isEnemy;
      this.attacks = attacks;
      this.opacity = 1;
      this.bounceOffset = 0;
      this.bounceSpeed = 0.1;
    }

    draw(c) {
      c.save();
      c.globalAlpha = this.opacity;
      
      const x = this.position.x;
      const y = this.position.y + Math.sin(this.bounceOffset) * 5;
      this.bounceOffset += this.bounceSpeed;

      if (this.type === 'slime') {
        c.fillStyle = this.color;
        c.beginPath();
        c.ellipse(x, y, 60, 50, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#000';
        c.beginPath();
        c.arc(x - 20, y - 10, 8, 0, Math.PI * 2);
        c.arc(x + 20, y - 10, 8, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#000';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x, y + 10, 15, 0, Math.PI);
        c.stroke();
      } 
      else if (this.type === 'dragon') {
        c.fillStyle = this.color;
        c.beginPath();
        c.moveTo(x, y - 50);
        c.lineTo(x - 40, y + 30);
        c.lineTo(x + 40, y + 30);
        c.closePath();
        c.fill();
        c.fillStyle = '#ff4444';
        c.beginPath();
        c.moveTo(x - 20, y - 50);
        c.lineTo(x - 30, y - 70);
        c.lineTo(x - 15, y - 55);
        c.fill();
        c.beginPath();
        c.moveTo(x + 20, y - 50);
        c.lineTo(x + 30, y - 70);
        c.lineTo(x + 15, y - 55);
        c.fill();
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(x - 10, y - 20, 6, 0, Math.PI * 2);
        c.arc(x + 10, y - 20, 6, 0, Math.PI * 2);
        c.fill();
      }
      else if (this.type === 'ghost') {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(x, y - 20, 40, Math.PI, 0);
        c.lineTo(x + 40, y + 30);
        c.lineTo(x + 30, y + 20);
        c.lineTo(x + 20, y + 30);
        c.lineTo(x + 10, y + 20);
        c.lineTo(x, y + 30);
        c.lineTo(x - 10, y + 20);
        c.lineTo(x - 20, y + 30);
        c.lineTo(x - 30, y + 20);
        c.lineTo(x - 40, y + 30);
        c.closePath();
        c.fill();
        c.fillStyle = '#000';
        c.beginPath();
        c.arc(x - 15, y - 10, 10, 0, Math.PI * 2);
        c.arc(x + 15, y - 10, 10, 0, Math.PI * 2);
        c.fill();
      }
      else if (this.type === 'plant') {
        c.fillStyle = this.color;
        c.fillRect(x - 25, y - 10, 50, 40);
        c.beginPath();
        c.ellipse(x - 30, y - 20, 20, 30, -0.5, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(x + 30, y - 20, 20, 30, 0.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fff';
        c.fillRect(x - 15, y, 10, 15);
        c.fillRect(x + 5, y, 10, 15);
        c.fillStyle = '#000';
        c.fillRect(x - 12, y + 3, 4, 9);
        c.fillRect(x + 8, y + 3, 4, 9);
      }

      c.restore();
    }

    faint(callback) {
      const dialogueBox = document.querySelector('#dialogueBox');
      if (dialogueBox) {
        dialogueBox.style.display = 'block';
        dialogueBox.innerHTML = this.name + ' desmaiou!';
      }
      
      let opacity = 1;
      const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        this.opacity = opacity;
        this.position.y += 1;
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          if (callback) callback();
        }
      }, 50);
    }

    attack({ attack, recipient, renderedSprites, onComplete }) {
      const dialogueBox = document.querySelector('#dialogueBox');
      if (dialogueBox) {
        dialogueBox.style.display = 'block';
        dialogueBox.innerHTML = this.name + ' usou ' + attack.name + '!';
      }

      let healthBar = this.isEnemy ? '#playerHealthBar' : '#enemyHealthBar';
      
      setTimeout(() => {
        recipient.health -= attack.damage;
        const healthBarEl = document.querySelector(healthBar);
        if (healthBarEl) {
          healthBarEl.style.width = Math.max(0, recipient.health) + '%';
        }

        const originalX = recipient.position.x;
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
          recipient.position.x = originalX + (shakeCount % 2 === 0 ? 10 : -10);
          shakeCount++;
          if (shakeCount > 6) {
            clearInterval(shakeInterval);
            recipient.position.x = originalX;
            if (onComplete) onComplete();
          }
        }, 80);
      }, 500);
    }
  }

  function checkForCharacterCollision({ characters, player, characterOffset = { x: 0, y: 0 } }) {
    player.interactionAsset = null;
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      if (
        collision(
          player,
          {
            ...character,
            position: {
              x: character.position.x + characterOffset.x,
              y: character.position.y + characterOffset.y
            }
          }
        )
      ) {
        player.interactionAsset = character;
        break;
      }
    }
  }

  function setupGame(c, canvas, playerScale, backgroundImage, foregroundImage, playerDownImage, playerUpImage, playerLeftImage, playerRightImage) {
    const COLS = 70;
    const DEFAULT_ROWS = 40;

    console.log('🔍 Verificando dados das zonas...');
    
    // VERIFICA SE AS VARIÁVEIS GLOBAIS EXISTEM
    const hasCollisions = typeof collisions !== "undefined" && Array.isArray(collisions);
    const hasBattleZones = typeof battleZonesData !== "undefined" && Array.isArray(battleZonesData);
    
    console.log('  collisions existe?', hasCollisions);
    console.log('  battleZonesData existe?', hasBattleZones);

    // USA FALLBACK SE NÃO EXISTIR
    const collisionsSource = hasCollisions ? collisions : new Array(COLS * DEFAULT_ROWS).fill(0);
    const battleZonesSource = hasBattleZones ? battleZonesData : new Array(COLS * DEFAULT_ROWS).fill(0);

    if (hasBattleZones) {
      console.log('  Quantos 2424?', battleZonesData.filter(x => x === 2424).length);
    } else {
      console.warn('⚠️ battleZonesData NÃO ENCONTRADO! Você precisa criar um arquivo com os dados das zonas de batalha.');
      console.warn('⚠️ Exemplo: const battleZonesData = [0, 0, 2424, 2424, ...];');
    }

    const collisionsMap = [];
    for (let i = 0; i < collisionsSource.length; i += COLS) {
      collisionsMap.push(collisionsSource.slice(i, i + COLS));
    }

    const battleZonesMap = [];
    for (let i = 0; i < battleZonesSource.length; i += COLS) {
      battleZonesMap.push(battleZonesSource.slice(i, i + COLS));
    }

    const limites = [];
    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 1615) {
          limites.push(new Limite({ position: { x: j * 64 + 24, y: i * 64 + 24 } }));
        }
      });
    });

    const battleZones = [];
    battleZonesMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 2424) {
          // Cria zona de batalha do tamanho do tile inteiro (64x64)
          const bz = new Limite({ position: { x: j * 64, y: i * 64 } });
          bz.scale = 4; // Tamanho do tile inteiro
          battleZones.push(bz);
        }
      });
    });

    console.log('✅ BattleZones criadas:', battleZones.length);
    console.log('✅ Limites criados:', limites.length);
    
    // DEBUG: Mostra as dimensões das zonas de batalha
    if (DEBUG && battleZones.length > 0) {
      battleZones.forEach((bz, index) => {
        console.log(`🟢 BattleZone ${index}: pos=(${bz.position.x}, ${bz.position.y}), size=${bz.width}x${bz.height}, scale=${bz.scale}`);
      });
    }
    
    // Removido teste forçado automático para não interromper o carregamento

    const bgW = backgroundImage.naturalWidth || backgroundImage.width || 1024;
    const bgH = backgroundImage.naturalHeight || backgroundImage.height || 576;
    const mapOffset = {
      x: Math.round(canvas.width / 2 - bgW / 2),
      y: Math.round(canvas.height / 2 - bgH / 2)
    };

    battleZones.forEach(b => { b.position.x += mapOffset.x; b.position.y += mapOffset.y; });
    limites.forEach(l => { l.position.x += mapOffset.x; l.position.y += mapOffset.y; });

    const background = new Sprite({ position: { x: mapOffset.x, y: mapOffset.y }, image: backgroundImage, frames: { max: 1 }, scale: 1 });
    const foreground = new Sprite({ position: { x: mapOffset.x, y: mapOffset.y }, image: foregroundImage, frames: { max: 1 }, scale: 1 });

    // Restaura posição do mundo se houver offset salvo
    try {
      const saved = localStorage.getItem('feimon_world_offset');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const deltaX = parsed.x - mapOffset.x;
          const deltaY = parsed.y - mapOffset.y;
          background.position.x = parsed.x;
          background.position.y = parsed.y;
          foreground.position.x += deltaX;
          foreground.position.y += deltaY;
          battleZones.forEach(b => { b.position.x += deltaX; b.position.y += deltaY; });
          limites.forEach(l => { l.position.x += deltaX; l.position.y += deltaY; });
          console.log(`Posição restaurada do mundo em (${parsed.x}, ${parsed.y})`);
        }
      }
    } catch (e) {
      console.warn('Falha ao restaurar feimon_world_offset:', e);
    }

    const playerDownFrameWidth = ((playerDownImage.naturalWidth || playerDownImage.width) || 256) / 8;
    const playerDownFrameHeight = (playerDownImage.naturalHeight || playerDownImage.height) || 32;

    const player = new Sprite({
      position: {
        x: Math.round(canvas.width / 2 - (playerDownFrameWidth * playerScale) / 2),
        y: Math.round(canvas.height / 2 - (playerDownFrameHeight * playerScale) / 2)
      },
      image: playerDownImage,
      frames: { max: 8, hold: 10 },
      sprites: { up: playerUpImage, down: playerDownImage, left: playerLeftImage, right: playerRightImage },
      scale: playerScale
    });

    player.interactionAsset = null;
    player.isInteracting = false;

    const characters = [];
    const movables = [background, ...limites, ...battleZones, foreground, ...characters];
    const renderables = [background, ...limites, ...battleZones, ...characters, player, foreground];

    setupMovement(player, movables, limites, battleZones, characters, renderables, c, canvas);
  }

  function setupMovement(player, movables, limites, battleZones, characters, renderables, c, canvas) {

    window.addEventListener("keydown", e => {
      if (isInputBlocked()) return;

      const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';

      if (player.isInteracting) {
        if (isSpace) {
          player.interactionAsset.dialogueIndex++;
          const { dialogueIndex, dialogue } = player.interactionAsset;
          const dialogueBox = document.querySelector('#characterDialogueBox');
          
          if (dialogueIndex <= dialogue.length - 1) {
            if (dialogueBox) dialogueBox.innerHTML = dialogue[dialogueIndex];
            return;
          }

          player.isInteracting = false;
          player.interactionAsset.dialogueIndex = 0;
          if (dialogueBox) dialogueBox.style.display = 'none';
        }
        return;
      }

      if (isSpace && player.interactionAsset) {
        const firstMessage = player.interactionAsset.dialogue[0];
        const dialogueBox = document.querySelector('#characterDialogueBox');
        if (dialogueBox) {
          dialogueBox.innerHTML = firstMessage;
          dialogueBox.style.display = 'flex';
        }
        player.isInteracting = true;
        return;
      }

      const key = e.key.toLowerCase();
      if (inputKeys[key]) inputKeys[key].pressed = true;
    });

    window.addEventListener("keyup", e => {
      if (isInputBlocked()) return;
      
      const key = e.key.toLowerCase();
      if (inputKeys[key]) inputKeys[key].pressed = false;
    });

    function animate() {
      animationId = requestAnimationFrame(animate);

      c.clearRect(0, 0, canvas.width, canvas.height);
      renderables.forEach(r => {
        if (r && typeof r.draw === "function") r.draw(c);
      });

      if (DEBUG) {
        c.save();
        // Invisível: opacidade 0 para blocos de colisão e zonas de batalha
        limites.forEach(l => {
          c.fillStyle = "rgba(255,0,0,0.0)";
          c.fillRect(l.position.x, l.position.y, l.width * l.scale, l.height * l.scale);
        });
        battleZones.forEach(b => {
          c.fillStyle = "rgba(0,255,0,0.0)";
          c.fillRect(b.position.x, b.position.y, b.width * b.scale, b.height * b.scale);
        });
        c.restore();
      }

      if (battle.state !== BATTLE_STATE.IDLE) {
        player.animate = false;
        // TRAVA COMPLETAMENTE o movimento quando em batalha
        return;
      }

      // DETECÇÃO DE BATALHA: só quando estiver se movendo, 10% de chance
      for (let i = 0; i < battleZones.length; i++) {
        // Pula a última zona onde teve batalha
        if (battle.lastZoneIndex === i) continue;
        
        const battleZone = battleZones[i];
        
        // Só considera batalha se estiver se MOVENDO dentro da zona
        const isMoving = inputKeys.w.pressed || inputKeys.s.pressed || inputKeys.a.pressed || inputKeys.d.pressed;
        if (isMoving && collision(player, battleZone)) {
          console.log('🎯 Personagem entrou na zona de batalha #' + i);
          console.log(`📍 Posição do player: (${player.position.x}, ${player.position.y})`);
          console.log(`📍 Posição da zona: (${battleZone.position.x}, ${battleZone.position.y})`);
          console.log(`📍 Tamanho da zona: ${battleZone.width}x${battleZone.height}`);
          
          // Salva posição atual do mundo para restaurar ao retornar
          try {
            localStorage.setItem('feimon_world_offset', JSON.stringify({ x: background.position.x, y: background.position.y }));
          } catch (e) {
            console.warn('Falha ao salvar feimon_world_offset:', e);
          }

          // CHANCE DE 15% por quadro enquanto se move na zona
          if (Math.random() < 0.15) {
            console.log('Batalha iniciada mds do ceu finalmente oh gloria');
            enterBattle(animate, i);
            return;
          } else {
            // Mantém movimento livre na área verde
            if (DEBUG) console.log('❌ Sem batalha neste quadro. Continue andando...');
          }
        }
      }

      player.animate = false;
      const speed = 3;

      // (REMOVIDO) Trava removida – personagem continua andando na grama mesmo dentro da battlezone

      if (inputKeys.w.pressed) {
        player.image = player.sprites.up;
        player.animate = true;
        checkForCharacterCollision({ characters, player, characterOffset: { x: 0, y: -speed } });
        if (!limites.some(l => collision(player, l, 0, -speed))) {
          movables.forEach(m => m.position.y += speed);
        }
      }
      if (inputKeys.s.pressed) {
        player.image = player.sprites.down;
        player.animate = true;
        checkForCharacterCollision({ characters, player, characterOffset: { x: 0, y: speed } });
        if (!limites.some(l => collision(player, l, 0, speed))) {
          movables.forEach(m => m.position.y -= speed);
        }
      }
      if (inputKeys.a.pressed) {
        player.image = player.sprites.left;
        player.animate = true;
        checkForCharacterCollision({ characters, player, characterOffset: { x: -speed, y: 0 } });
        if (!limites.some(l => collision(player, l, -speed, 0))) {
          movables.forEach(m => m.position.x += speed);
        }
      }
      if (inputKeys.d.pressed) {
        player.image = player.sprites.right;
        player.animate = true;
        checkForCharacterCollision({ characters, player, characterOffset: { x: speed, y: 0 } });
        if (!limites.some(l => collision(player, l, speed, 0))) {
          movables.forEach(m => m.position.x -= speed);
        }
      }
    }

    if (!animationId) animate();
  }

  const attacks = {
    'Tackle': { name: 'Tackle', damage: 10, type: 'Normal' },
    'Fireball': { name: 'Fireball', damage: 25, type: 'Fire' },
    'Bite': { name: 'Bite', damage: 15, type: 'Dark' },
    'Leaf Storm': { name: 'Leaf Storm', damage: 22, type: 'Grass' },
    'Shadow Ball': { name: 'Shadow Ball', damage: 20, type: 'Ghost' },
    'Poison': { name: 'Poison', damage: 12, type: 'Poison' }
  };

  const enemyMonsters = [
    {
      name: 'Slime',
      color: '#44ff88',
      type: 'slime',
      attacks: [attacks.Tackle, attacks.Poison]
    },
    {
      name: 'Lagartixa',
      color: '#ff4444',
      type: 'dragon',
      attacks: [attacks.Fireball, attacks.Bite]
    },
    {
      name: 'Espectro',
      color: '#aa88ff',
      type: 'ghost',
      attacks: [attacks['Shadow Ball'], attacks.Tackle]
    },
    {
      name: 'Cacto',
      color: '#44aa44',
      type: 'plant',
      attacks: [attacks['Leaf Storm'], attacks.Poison]
    }
  ];

  let enemy, playerMonster, renderedSprites, queue;

  // Explicação: Inicializa a UI e objetos da batalha ao ser chamada dentro do jogo.
  function initBattle(c, canvas, returnAnimate) {
    const ui = document.querySelector('#userInterface');
    const dialogueBox = document.querySelector('#dialogueBox');
    const enemyHealth = document.querySelector('#enemyHealthBar');
    const playerHealth = document.querySelector('#playerHealthBar');
    const attacksBox = document.querySelector('#attacksBox');

    if (!ui) { 
      console.error('❌ #userInterface não encontrado'); 
      return; 
    }

    ui.style.display = 'block'; // Mostra a interface de batalha
    if (dialogueBox) dialogueBox.style.display = 'none'; // Esconde caixa de diálogo
    if (enemyHealth) enemyHealth.style.width = '100%'; // Reseta barras de vida
    if (playerHealth) playerHealth.style.width = '100%';
    if (attacksBox) attacksBox.replaceChildren(); // Limpa botões de ataque antes de popular

    const randomEnemy = enemyMonsters[Math.floor(Math.random() * enemyMonsters.length)]; // Escolhe inimigo aleatório
    
    enemy = new Monster({ // Cria o monstro inimigo com atributos copiados
      position: { x: 800, y: 200 },
      name: randomEnemy.name,
      color: randomEnemy.color,
      type: randomEnemy.type,
      attacks: randomEnemy.attacks,
      isEnemy: true
    });

    playerMonster = new Monster({ // Cria o monstro do jogador com ataques básicos
      position: { x: 280, y: 400 },
      name: 'Emby',
      color: '#4488ff',
      type: 'slime',
      attacks: [attacks.Tackle, attacks.Fireball]
    });

    renderedSprites = [enemy, playerMonster]; // Define ordem de renderização
    queue = []; // Limpa fila de ações encadeadas

    console.log('🎲 Monstro inimigo:', randomEnemy.name, '(tipo:', randomEnemy.type + ')'); // Log informativo

    playerMonster.attacks.forEach((attack) => {
      const button = document.createElement('button');
      button.innerHTML = attack.name;
      if (attacksBox) attacksBox.append(button);
    });

    document.querySelectorAll('#attacksBox button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML];
        
        playerMonster.attack({
          attack: selectedAttack,
          recipient: enemy,
          renderedSprites,
          onComplete: () => {
            if (enemy.health <= 0) {
              queue.push(() => {
                enemy.faint(() => {
                  exitBattle(returnAnimate);
                });
              });
            } else {
              const randomAttack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
              queue.push(() => {
                enemy.attack({
                  attack: randomAttack,
                  recipient: playerMonster,
                  renderedSprites,
                  onComplete: () => {
                    if (playerMonster.health <= 0) {
                      queue.push(() => {
                        playerMonster.faint(() => {
                          exitBattle(returnAnimate);
                        });
                      });
                    }
                  }
                });
              });
            }
          }
        });
      });

      button.addEventListener('mouseenter', (e) => {
        const selectedAttack = attacks[e.currentTarget.innerHTML];
        const attackTypeEl = document.querySelector('#attackType');
        if (attackTypeEl) {
          attackTypeEl.innerHTML = selectedAttack.type;
          attackTypeEl.style.color = 
            selectedAttack.type === 'Fire' ? '#ff4444' : 
            selectedAttack.type === 'Grass' ? '#44ff44' : 
            selectedAttack.type === 'Ghost' ? '#aa88ff' :
            selectedAttack.type === 'Dark' ? '#8844ff' :
            selectedAttack.type === 'Poison' ? '#aa44ff' :
            '#ffffff';
        }
      });
    });

    animateBattle(c, canvas);
  }

  function animateBattle(c, canvas) {
    battleAnimationId = requestAnimationFrame(() => animateBattle(c, canvas));
    
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = c.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(1, '#2a2a5a');
    c.fillStyle = gradient;
    c.fillRect(0, 0, canvas.width, canvas.height);
    
    if (renderedSprites && Array.isArray(renderedSprites)) {
      renderedSprites.forEach((sprite) => {
        if (sprite && typeof sprite.draw === 'function') sprite.draw(c);
      });
    }
  }

  document.addEventListener('click', (e) => {
    const dialogueBox = document.querySelector('#dialogueBox');
    if (dialogueBox && dialogueBox.style.display === 'block') {
      if (queue && queue.length > 0) {
        queue[0]();
        queue.shift();
      } else {
        dialogueBox.style.display = 'none';
      }
    }
  });

  window.startGame = iniciarJogo;
});