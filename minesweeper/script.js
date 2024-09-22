const numRows = 10; // Number of rows
const numCols = 10; // Number of columns
const numMines = 15; // Number of mines

const gameContainer = document.getElementById('game');
const resetButton = document.getElementById('resetButton');
let grid = [];
let gameOver = false;

// Initialize the game
function initGame() {
    grid = [];
    gameOver = false;
    gameContainer.innerHTML = '';

    // Create grid array
    for (let row = 0; row < numRows; row++) {
        grid[row] = [];
        for (let col = 0; col < numCols; col++) {
            grid[row][col] = {
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0,
                element: null
            };
        }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < numMines) {
        const row = Math.floor(Math.random() * numRows);
        const col = Math.floor(Math.random() * numCols);
        if (!grid[row][col].mine) {
            grid[row][col].mine = true;
            minesPlaced++;
        }
    }

    // Calculate adjacent mines
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let count = 0;
            if (!grid[row][col].mine) {
                for (let i = -1; i <=1; i++) {
                    for (let j = -1; j <=1; j++) {
                        if (i === 0 && j === 0) continue;
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
                            if (grid[newRow][newCol].mine) {
                                count++;
                            }
                        }
                    }
                }
                grid[row][col].adjacentMines = count;
            }
        }
    }

    // Render the grid
    for (let row = 0; row < numRows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        for (let col = 0; col < numCols; col++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.setAttribute('data-row', row);
            cellDiv.setAttribute('data-col', col);

            cellDiv.addEventListener('click', cellClick);
            cellDiv.addEventListener('contextmenu', cellRightClick);

            grid[row][col].element = cellDiv;
            rowDiv.appendChild(cellDiv);
        }
        gameContainer.appendChild(rowDiv);
    }
}

// Handle left-click
function cellClick(e) {
    if (gameOver) return;

    const row = parseInt(this.getAttribute('data-row'));
    const col = parseInt(this.getAttribute('data-col'));
    const cell = grid[row][col];

    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
        revealAllMines();
        cell.element.classList.add('mine');
        
        // Create a game over message
        const gameOverMessage = document.createElement('div');
        gameOverMessage.textContent = 'Game Over!';
        gameOverMessage.style.position = 'absolute';
        gameOverMessage.style.top = '50%';
        gameOverMessage.style.left = '50%';
        gameOverMessage.style.transform = 'translate(-50%, -50%)';
        gameOverMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverMessage.style.color = 'white';
        gameOverMessage.style.padding = '20px';
        gameOverMessage.style.borderRadius = '10px';
        gameOverMessage.style.fontSize = '24px';
        gameOverMessage.style.zIndex = '1000';
        document.body.appendChild(gameOverMessage);

        gameOver = true;
    } else {
        revealCell(row, col);
        checkWin();
    }
}

// Handle right-click (flagging)
function cellRightClick(e) {
    e.preventDefault();
    if (gameOver) return;

    const row = parseInt(this.getAttribute('data-row'));
    const col = parseInt(this.getAttribute('data-col'));
    const cell = grid[row][col];

    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    if (cell.flagged) {
        cell.element.classList.add('flagged');
        cell.element.textContent = '🚩';
    } else {
        cell.element.classList.remove('flagged');
        cell.element.textContent = '';
    }
}

// Reveal cell
function revealCell(row, col) {
    const cell = grid[row][col];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');
    cell.element.classList.remove('flagged');
    cell.element.textContent = cell.adjacentMines > 0 ? cell.adjacentMines : '';

    if (cell.adjacentMines === 0) {
        // Reveal neighboring cells
        for (let i = -1; i <=1; i++) {
            for (let j = -1; j <=1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
                    if (!grid[newRow][newCol].mine) {
                        revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
}

// Reveal all mines
function revealAllMines() {
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const cell = grid[row][col];
            if (cell.mine) {
                cell.element.classList.add('mine');
                cell.element.textContent = '💣';
            }
        }
    }
}

// Check for win condition
function checkWin() {
    let cellsToReveal = numRows * numCols - numMines;
    let revealedCount = 0;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (grid[row][col].revealed) {
                revealedCount++;
            }
        }
    }

    if (revealedCount === cellsToReveal) {
        alert('Congratulations! You Win!');
        gameOver = true;
        revealAllMines();
    }
}

// Reset game on button click
resetButton.addEventListener('click', initGame);

// Start the game
initGame();
