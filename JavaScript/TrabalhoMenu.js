// Pega o container das estrelas para criar o fundo animado
const starsContainer = document.getElementById('stars'); // Elemento que vai receber as estrelas
for (let i = 0; i < 50; i++) { // Cria 50 estrelas para o efeito
  const star = document.createElement('div'); // Cria uma nova div
  star.className = 'star'; // Dá a classe 'star' para aplicar o CSS
  star.style.left = Math.random() * 100 + '%'; // Define posição horizontal aleatória
  star.style.top = Math.random() * 100 + '%'; // Define posição vertical aleatória
  star.style.animationDelay = Math.random() * 3 + 's'; // Define atraso de animação aleatório
  starsContainer.appendChild(star); // Adiciona a estrela no container
}

// Pega o container das partículas para criar o efeito visual extra
const particlesContainer = document.getElementById('particles'); // Elemento que recebe partículas
for (let i = 0; i < 15; i++) { // Cria 15 partículas
  const particle = document.createElement('div'); // Cria uma div
  particle.className = 'particle'; // Define classe para aplicar o CSS
  particle.style.left = Math.random() * 100 + '%'; // Posição horizontal aleatória
  particle.style.bottom = '0'; // Começa do fundo
  particle.style.animationDelay = Math.random() * 5 + 's'; // Atraso de animação aleatório
  particlesContainer.appendChild(particle); // Adiciona partícula ao container
}

// Seleciona todas as opções do menu
const menuItems = document.querySelectorAll('.menu-item'); // NodeList com os itens do menu
let selectedIndex = 0; // Índice do item atualmente selecionado

// Atualiza a aparência de seleção do item ativo
function updateSelection() { // Função que atualiza destaque
  menuItems.forEach((item, index) => { // Percorre todos os itens
    if (index === selectedIndex) { // Se for o índice selecionado
      item.classList.add('selected'); // Marca como selecionado
    } else { // Caso contrário
      item.classList.remove('selected'); // Remove seleção
    }
  });
}

// Escuta o teclado para navegar no menu
document.addEventListener('keydown', (e) => { // Captura eventos de tecla
  if (e.key === 'ArrowUp') { // Seta para cima
    e.preventDefault(); // Evita scroll da página
    selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length; // Move seleção acima com ciclo
    updateSelection(); // Atualiza visual
    playSound(); // Efeito sonoro (placeholder)
  } else if (e.key === 'ArrowDown') { // Seta para baixo
    e.preventDefault(); // Evita scroll
    selectedIndex = (selectedIndex + 1) % menuItems.length; // Move seleção abaixo com ciclo
    updateSelection(); // Atualiza visual
    playSound(); // Efeito sonoro
  } else if (e.key === 'Enter') { // Tecla Enter
    e.preventDefault(); // Evita comportamento padrão
    selectMenuItem(); // Executa ação do item selecionado
  }
});

// Permite selecionar com mouse também
menuItems.forEach((item, index) => { // Para cada item do menu
  item.addEventListener('mouseenter', () => { // Quando mouse entra
    selectedIndex = index; // Atualiza o índice selecionado
    updateSelection(); // Atualiza visual
    playSound(); // Efeito sonoro
  });

  item.addEventListener('click', () => { // Ao clicar no item
    selectMenuItem(); // Executa a ação
  });
});

// Placeholder simples para som de navegação
function playSound() { // Função que simula um beep
  console.log('Beep!'); // Loga no console por enquanto
}

// Executa a ação com base no item selecionado
function selectMenuItem() { // Dispara navegação
  const action = menuItems[selectedIndex].dataset.action; // Lê o atributo data-action
  const loading = document.getElementById('loading'); // Pega overlay de loading

  switch (action) { // Decide o que fazer conforme ação
    case 'jogar': // Novo jogo
      try { localStorage.setItem('feimon_points', '0'); } catch (e) {} // Zera pontos salvos
      loading.classList.add('active'); // Mostra carregamento
      setTimeout(() => { // Aguarda um pouco
        window.location.href = './escolha_inicial.html'; // Vai para a escolha de inicial
      }, 2000); // 2 segundos
      break; // Sai do switch
    case 'continuar': // Estudantes
      loading.classList.add('active'); // Mostra carregamento
      setTimeout(() => { // Aguarda
        window.location.href = './estudante.html'; // Abre página de estudantes
      }, 2000); // 2 segundos
      break; // Sai
    case 'sobre': // Como jogar
      loading.classList.add('active'); // Mostra carregamento
      setTimeout(() => { // Aguarda
        window.location.href = './sobre.html'; // Vai para instruções
      }, 1000); // 1 segundo
      break; // Sai
    case 'info': // Informações
      loading.classList.add('active'); // Mostra carregamento
      setTimeout(() => { // Aguarda
        window.location.href = './informações.html'; // Abre infos
      }, 1000); // 1 segundo
      break; // Sai
    default: // Qualquer outra ação inesperada
      console.warn('Ação desconhecida:', action); // Loga aviso
      break; // Sai
  }
}

// Inicializa seleção ao carregar
updateSelection(); // Deixa o primeiro item marcado