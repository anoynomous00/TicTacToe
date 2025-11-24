// Get references to HTML elements
const modeSelectionElement = document.getElementById('mode-selection');
const playerInputFormElement = document.getElementById('player-input-form'); 
const difficultySelectionElement = document.getElementById('difficulty-selection'); 
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const gameControlsElement = document.getElementById('game-controls'); 
const currentGameModeElement = document.getElementById('current-game-mode'); 

// Player Name Inputs
const p1NameInput = document.getElementById('p1-name');
const p2NameInput = document.getElementById('p2-name');

// Get button references
const resetButton = document.getElementById('reset-button');
const backButton = document.getElementById('back-button'); 
const backToModeButton = document.getElementById('back-to-mode-button'); 
const startGameButton = document.getElementById('start-game-button'); 
const mode2pButton = document.getElementById('mode-2p');
const modeAiButton = document.getElementById('mode-ai');
// const modeRoomButton = document.getElementById('mode-room'); // Removed

// Difficulty Buttons
const diffEasyButton = document.getElementById('diff-easy');
const diffMediumButton = document.getElementById('diff-medium');
const diffHardButton = document.getElementById('diff-hard');
const backFromDiffButton = document.getElementById('back-from-diff');

// Global variables to store current mode and player names/difficulty
let selectedGameMode = "";
let currentDifficulty = "Easy"; 
let playerNames = { 'X': 'Player 1', 'O': 'Player 2' }; 
let isAIGame = false; 


// --- NAVIGATION FLOW FUNCTIONS ---

document.addEventListener('DOMContentLoaded', initializeApp);

/** Initializes the application state and sets up event listeners. */
function initializeApp() {
    // Initial State: Show Mode Selection
    hideGameElements();
    hidePlayerInput(); 
    hideDifficultySelection();
    modeSelectionElement.style.display = 'block';

    // Mode Selection Listeners
    mode2pButton.addEventListener('click', () => showPlayerInput("2 Players Mode"));
    modeAiButton.addEventListener('click', showDifficultySelection);
    // modeRoomButton listener removed

    // Player Input Listeners
    startGameButton.addEventListener('click', startGame);
    backToModeButton.addEventListener('click', goBackToModeSelection); 

    // Difficulty Selection Listeners
    diffEasyButton.addEventListener('click', () => startAIGame('Easy'));
    diffMediumButton.addEventListener('click', () => startAIGame('Medium'));
    diffHardButton.addEventListener('click', () => startAIGame('Hard'));
    backFromDiffButton.addEventListener('click', goBackToModeSelection);

    // Game Control Listeners
    backButton.addEventListener('click', goBackFromGame);
    resetButton.addEventListener('click', () => { isAIGame ? startAIGame(currentDifficulty) : startGame(); }); 
}

function hideGameElements() {
    boardElement.style.display = 'none';
    gameControlsElement.style.display = 'none';
    statusElement.style.display = 'none';
    currentGameModeElement.style.display = 'none';
}

function hidePlayerInput() {
    playerInputFormElement.style.display = 'none';
}

function hideDifficultySelection() { 
    difficultySelectionElement.style.display = 'none';
}

function showGameElements() {
    boardElement.style.display = 'grid';
    gameControlsElement.style.display = 'flex';
    statusElement.style.display = 'block';
    currentGameModeElement.style.display = 'block';
}

/** Shows Player Input Form, correctly resetting names for 2P mode. */
function showPlayerInput(modeName) {
    isAIGame = false; // Ensure AI mode is off
    selectedGameMode = modeName;
    modeSelectionElement.style.display = 'none';
    hideDifficultySelection();
    playerInputFormElement.style.display = 'flex';
    
    // Set input field value to empty string to ensure blank fields, 
    if (playerNames['X'] === 'You' || playerNames['X'].startsWith('Player')) {
        p1NameInput.value = '';
    } else {
        p1NameInput.value = playerNames['X']; 
    }
    
    if (playerNames['O'].startsWith('AI') || playerNames['O'].startsWith('Player')) {
        p2NameInput.value = '';
    } else {
        p2NameInput.value = playerNames['O']; 
    }
}

function showDifficultySelection() {
    isAIGame = true;
    modeSelectionElement.style.display = 'none';
    hidePlayerInput();
    hideGameElements();
    difficultySelectionElement.style.display = 'flex';
}

async function startAIGame(difficulty) {
    isAIGame = true;
    currentDifficulty = difficulty;
    selectedGameMode = "VS AI Mode";
    
    await fetch(`/api/game/difficulty/${difficulty}`, { method: 'GET' });

    // Set AI default names internally
    playerNames['X'] = 'You';
    playerNames['O'] = `AI (${difficulty})`;

    hideDifficultySelection();
    showGameElements();
    currentGameModeElement.textContent = `VS AI Mode - ${difficulty}`;

    resetGame();
}

/** Navigates back from the Game Screen dynamically. */
function goBackFromGame() {
    resetGame(); 
    hideGameElements();

    if (isAIGame) {
        showDifficultySelection();
    } else {
        showPlayerInput(selectedGameMode);
    }
}

function goBackToModeSelection() {
    resetGame(); 
    hideGameElements();
    hidePlayerInput();
    hideDifficultySelection();
    modeSelectionElement.style.display = 'block';
    
    statusElement.textContent = "Choose Game Mode:";
    statusElement.style.color = '#fff';
    statusElement.style.fontSize = '24px';
    
    // Reset internal names and mode flags
    playerNames = { 'X': 'Player 1', 'O': 'Player 2' }; 
    selectedGameMode = "";
    isAIGame = false;
}

/** Starts the game, applying default names only if input is empty. */
function startGame() {
    // Save player names (defaulting if input is empty)
    playerNames['X'] = p1NameInput.value.trim() || 'Player 1';
    playerNames['O'] = p2NameInput.value.trim() || 'Player 2';
    
    // Hide input form and show game elements
    hidePlayerInput();
    showGameElements();

    // Display the selected game mode
    currentGameModeElement.textContent = selectedGameMode;

    // Reset and fetch the initial game state
    resetGame();
}


// --- GAME RENDERING AND API INTERACTION ---

function renderBoard(boardData, gameOver) {
    boardElement.innerHTML = ''; 
    
    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        
        if (boardData[i] !== ' ') {
            square.textContent = boardData[i];
            square.classList.add(boardData[i].toLowerCase() + '-color');
        }

        if (!gameOver && boardData[i] === ' ') {
            square.addEventListener('click', () => handleMove(i));
        }
        
        boardElement.appendChild(square);
    }
}

async function fetchGameState() {
    try {
        const response = await fetch('/api/game/state');
        const state = await response.json();
        
        renderBoard(state.board, state.gameOver); 
        
        // Check for AI move if it's 'O's turn
        if (!state.gameOver && state.currentPlayer === 'O' && isAIGame) {
            handleAITurn();
            return;
        }

        if (state.gameOver) {
            let winnerMessage = statusElement.textContent;
            
            statusElement.innerHTML = `<h2>${winnerMessage}</h2>`;
            statusElement.style.color = 'yellow'; 
            
        } else {
            // Use stored player names
            let playerAlias;
            if (state.currentPlayer === 'X' && isAIGame) {
                playerAlias = "Your turn (X)"; 
            } else {
                playerAlias = state.currentPlayer === 'X' ? `${playerNames['X']} (X)` : `${playerNames['O']} (O)`;
            }
            statusElement.textContent = `It's ${playerAlias}!`;
            statusElement.style.color = '#fff';
            statusElement.style.fontSize = '28px';
        }
    } catch (error) {
        statusElement.textContent = "Error connecting to the game server.";
        console.error("Error fetching state:", error);
        hideGameElements();
        modeSelectionElement.style.display = 'block';
    }
}

async function handleAITurn() {
    statusElement.textContent = "AI is thinking...";
    
    await new Promise(r => setTimeout(r, 800)); 

    try {
        const response = await fetch('/api/game/aimove', {
            method: 'POST'
        });
        const moveResult = await response.json();

        const finalMessage = moveResult.status
            .replace('X wins!', `${playerNames['X']} (X) wins!`)
            .replace('O wins!', `${playerNames['O']} (O) wins!`);
        
        statusElement.textContent = finalMessage;

        fetchGameState();

    } catch (error) {
        statusElement.textContent = "AI move failed.";
        console.error("AI move error:", error);
    }
}


async function handleMove(index) {
    try {
        const response = await fetch(`/api/game/move/${index}`, {
            method: 'POST',
        });
        const resultMessage = await response.text();
        
        // Use custom names in the announcement
        const finalMessage = resultMessage
            .replace('X wins!', `${playerNames['X']} (X) wins!`)
            .replace('O wins!', `${playerNames['O']} (O) wins!`);
        
        statusElement.textContent = finalMessage; 
        
        fetchGameState();
        
    } catch (error) {
        statusElement.textContent = "Could not process move.";
        console.error("Error making move:", error);
    }
}

async function resetGame() {
    try {
        await fetch('/api/game/reset', {
            method: 'POST',
        });
        fetchGameState();
    } catch (error) {
        statusElement.textContent = "Could not reset game.";
        console.error("Error resetting game:", error);
    }
}