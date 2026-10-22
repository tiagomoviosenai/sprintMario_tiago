/**
 * Super Mario Jump - Lógica do Jogo e Integração com Ranking MySQL (Laragon)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Jogo
    const fazendeiro = document.querySelector('.fazendeiro');
    const personagem = fazendeiro; // alias usado nas funções
    const mario = fazendeiro;      // alias usado nas funções
    const toco = document.querySelector('.toco'); // Alterado de pipe para toco
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');

    // Modais e Telas
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');

    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('save-status-msg');
    const rankingBody = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    // Escolha de personagem
    const btnChooseCharacter = document.getElementById('btn-choose-character');
    const characterSelected = document.getElementById('character-selected');
    const characterModal = document.getElementById('character-modal');
    const characterGrid = document.getElementById('character-grid');
    const btnStartCharacter = document.getElementById('btn-start-character');

    // ⬇️ Edite/adicione seus personagens aqui
    const CHARACTERS = [
        { id: 'fazendeiro', nome: 'Fazendeiro', img: 'assets/fazendeiro.gif', gameOver: 'assets/game-over.png' },
        { id: 'mario',      nome: 'Mario',      img: 'assets/mario.gif',      gameOver: 'assets/game-over.png' },
        { id: 'sonic',      nome: 'Sonic',      img: 'assets/sonic.gif',      gameOver: 'assets/game-over-sonic.gif' },
        { id: 'galinha',    nome: 'Galinha',    img: 'assets/galinha.gif',    gameOver: 'assets/game-over.png' }
    ];

    let selectedCharacter =
        CHARACTERS.find(c => c.id === localStorage.getItem('mario_jump_character')) || CHARACTERS[0];

    // Variáveis de Estado
    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;

    // Recupera último nome utilizado caso exista
    const savedName = localStorage.getItem('mario_jump_player');
    if (savedName && playerInput) {
        playerInput.value = savedName;
    }

    // ---------- ESCOLHA DE PERSONAGEM ----------

    // Botão só habilita quando há nome digitado
    function updateCharacterButton() {
        btnChooseCharacter.disabled = playerInput.value.trim() === '';
    }
    playerInput.addEventListener('input', updateCharacterButton);
    updateCharacterButton();

    function updateSelectedLabel() {
        characterSelected.textContent = `Personagem: ${selectedCharacter.nome}`;
    }

    function applyCharacter() {
        personagem.src = selectedCharacter.img;
    }

    updateSelectedLabel();
    applyCharacter();

    function renderCharacters() {
        characterGrid.innerHTML = '';
        CHARACTERS.forEach(c => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'character-card' + (c.id === selectedCharacter.id ? ' selected' : '');
            card.innerHTML = `<img src="${c.img}" alt="${escapeHtml(c.nome)}"><span>${escapeHtml(c.nome)}</span>`;
            card.addEventListener('click', () => {
                // Apenas seleciona (o jogo começa no botão INICIAR JOGO)
                selectedCharacter = c;
                localStorage.setItem('mario_jump_character', c.id);
                updateSelectedLabel();
                applyCharacter();

                characterGrid.querySelectorAll('.character-card').forEach(el => el.classList.remove('selected'));
                card.classList.add('selected');
            });
            characterGrid.appendChild(card);
        });
    }

    btnChooseCharacter.addEventListener('click', () => {
        if (playerInput.value.trim() === '') return;
        renderCharacters();
        startModal.classList.remove('active');
        characterModal.classList.add('active');
    });

    // INICIAR JOGO dentro da tela de personagem
    btnStartCharacter.addEventListener('click', () => {
        const nameValue = playerInput.value.trim();
        if (!nameValue) {
            characterModal.classList.remove('active');
            startModal.classList.add('active');
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('mario_jump_player', currentPlayer);

        characterModal.classList.remove('active');
        startGame();
    });

    // ---------- JOGO ----------

    function startGame() {
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        hudPlayerName.textContent = currentPlayer || 'Jogador';

        gameBoard.classList.add('running');

        scoreLoop = setInterval(() => {
            if (isPlaying) {
                score += 1;
                scoreDisplay.textContent = score;
            }
        }, 100);

        gameLoop = setInterval(checkCollision, 10);
    }

    function resetElements() {
        toco.style.animation = ''; // Alterado de pipe para toco
        toco.style.left = '';      // Alterado de pipe para toco

        personagem.src = selectedCharacter.img; // usa o personagem escolhido
        personagem.style.animation = '';
        personagem.style.bottom = '0px';
        personagem.style.width = '';
        personagem.style.marginLeft = '';
        personagem.classList.remove('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '1';
        }
    }

    function jump() {
        if (!isPlaying) return;
        if (mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if (jumpTip) {
            jumpTip.style.opacity = '0';
        }

        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
    }

    function checkCollision() {
        if (!isPlaying) return;

        const tocoPosition = toco.offsetLeft; // Alterado de pipe para toco
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        // Alterado de pipe para toco
        if (tocoPosition <= 120 && tocoPosition > 0 && marioPosition < 80) {
            triggerGameOver(tocoPosition, marioPosition);
        }
    }

    function triggerGameOver(tocoPosition, marioPosition) { // Alterado de pipe para toco
        isPlaying = false;
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        gameBoard.classList.remove('running');

        toco.style.animation = 'none';            // Alterado de pipe para toco
        toco.style.left = `${tocoPosition}px`;    // Alterado de pipe para toco

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = selectedCharacter.gameOver; // imagem de game over do personagem
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('active');

        saveScore(currentPlayer, score);
    }

    function saveScore(playerName, finalScore) {
        fetch('salvar_ranking.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                saveStatusMsg.textContent = 'Pontuação registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if (data.ranking) {
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else {
                saveStatusMsg.textContent = '⚠️ ' + (data.message || 'Erro ao registrar.');
                saveStatusMsg.style.color = '#ef4444';
            }
        })
        .catch(err => {
            console.error('Erro na requisição:', err);
            saveStatusMsg.textContent = '⚠️ Erro ao conectar ao servidor Laragon.';
            saveStatusMsg.style.color = '#ef4444';
        });
    }

    function fetchRanking() {
        fetch('obter_ranking.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.ranking) {
                    renderRanking(data.ranking);
                }
            })
            .catch(err => console.error('Erro ao buscar ranking:', err));
    }

    function renderRanking(list, highlightName = null, highlightScore = null) {
        if (!rankingBody) return;
        rankingBody.innerHTML = '';

        if (!list || list.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td></tr>';
            return;
        }

        let highlighted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if (!highlighted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore) {
                tr.classList.add('highlight-current');
                highlighted = true;
            }

            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2º';
            else if (index === 2) medal = '🥉 3º';

            tr.innerHTML = `
                <td class="ranking-pos">${medal}</td>
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td>${parseInt(item.pontos, 10)} pts</td>
            `;

            rankingBody.appendChild(tr);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ---------- EVENTOS ----------

    startForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameValue = playerInput.value.trim();
        if (!nameValue) {
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('mario_jump_player', currentPlayer);

        startModal.classList.remove('active');
        startGame();
    });

    btnViewRanking.addEventListener('click', () => {
        fetchRanking();
        finalScoreValue.textContent = '---';
        saveStatusMsg.textContent = '';
        startModal.classList.remove('active');
        gameoverModal.classList.add('active');
    });

    btnRestart.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        if (!currentPlayer) {
            startModal.classList.add('active');
            playerInput.focus();
        } else {
            startGame();
        }
    });

    btnChangePlayer.addEventListener('click', () => {
        gameoverModal.classList.remove('active');
        resetElements();
        startModal.classList.add('active');

        // Mantém o nome anterior preenchido (selecionado, para digitar por cima)
        // assim o botão ESCOLHER PERSONAGEM continua habilitado.
        playerInput.value = currentPlayer || localStorage.getItem('mario_jump_player') || '';
        updateCharacterButton();
        updateSelectedLabel();
        playerInput.focus();
        playerInput.select();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
            if (isPlaying) {
                e.preventDefault();
                jump();
            }
        }
    });
});