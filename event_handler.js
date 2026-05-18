function resetGame() {

    moveCount = 0;

    totalTime = 300;

    turnTime = 15;

    currentPlayerIndex = 0;

    currentPlayer = players[0];

    moveHistory.length = 0;

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            board[r][c].owner = null;

            board[r][c].count = 0;
        }
    }

    renderBoard();
}

document
.getElementById("board")
.addEventListener("click", function(event) {

    const cell =
        event.target.closest(".cell");

    if (!cell) return;

    const row =
        parseInt(cell.dataset.row);

    const col =
        parseInt(cell.dataset.col);

    makeMove(row, col);
});

document
.getElementById("pauseBtn")
.addEventListener("click", function() {

    isPaused = true;
});

document
.getElementById("resumeBtn")
.addEventListener("click", function() {

    isPaused = false;
});

document
.getElementById("pvpBtn")
.addEventListener("click", function() {

    players = [1, 2];

    aiEnabled = false;

    currentPlayerIndex = 0;

    currentPlayer = players[0];

    gameStarted = true;

    resetGame();

    alert("2 Player Mode");
});

document
.getElementById("aiBtn")
.addEventListener("click", function() {

    players = [1, 2];

    aiEnabled = true;

    currentPlayerIndex = 0;

    currentPlayer = players[0];

    gameStarted = true;

    resetGame();

    alert("Player vs AI Mode");
});

document
.getElementById("customMultiBtn")
.addEventListener("click", function() {

    const count = parseInt(
        document.getElementById(
            "playerCountInput"
        ).value
    );

    if (count < 2 || count > 8) {

        alert(
            "Choose between 2 and 8 players"
        );

        return;
    }

    players = [];

    for (let i = 1; i <= count; i++) {

        players.push(i);
    }

    currentPlayerIndex = 0;

    currentPlayer = players[0];

    aiEnabled = false;

    gameStarted = true;

    resetGame();

    alert(
        `${count} Player Mode`
    );
});