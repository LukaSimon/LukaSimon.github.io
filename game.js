const gameBoard = document.getElementById('game-board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const pieceButtons = document.querySelectorAll('.piece-button');

let currentPlayer = 'white';
let selectedPiece = '';
let board = Array(9).fill(null);

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (board[index] || !selectedPiece) return;

    const piece = `${currentPlayer[0]}${selectedPiece}`;
    board[index] = piece;
    e.target.textContent = getPieceSymbol(piece);
    
    if (checkWin()) {
        status.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins!`;
        disableBoard();
    } else if (board.every(cell => cell !== null)) {
        status.textContent = "It's a draw!";
    } else {
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        status.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }
}

function checkWin() {
    return winningCombos.some(combo => {
        const [a, b, c] = combo;
        return board[a] && board[a][0] === board[b][0] && board[a][0] === board[c][0];
    });
}

function disableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.removeEventListener('click', handleCellClick));
}

function getPieceSymbol(piece) {
    const symbols = {
        wR: '♖', wN: '♘', wB: '♗', wQ: '♕', wK: '♔',
        bR: '♜', bN: '♞', bB: '♝', bQ: '♛', bK: '♚'
    };
    return symbols[piece];
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'white';
    selectedPiece = '';
    status.textContent = "White's turn";
    createBoard();
}

pieceButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedPiece = button.dataset.piece;
        pieceButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

resetButton.addEventListener('click', resetGame);

// Initialize the game
createBoard();
status.textContent = "White's turn";
