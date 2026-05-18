let gameStarted = false;

const boomSound = new Audio("boom.mp3");

const placeSound = new Audio("place.mp3");

const winSound = new Audio("win.mp3");

let gameInterval = setInterval(() => {

    if (!gameStarted) return;

    if (isPaused) return;

    totalTime--;

    turnTime--;

    if (turnTime <= 0) {

        currentPlayerIndex =
            (currentPlayerIndex + 1) %
            players.length;

        currentPlayer =
            players[currentPlayerIndex];

        turnTime = 15;
    }

    renderBoard();

    if (totalTime <= 0) {

        clearInterval(gameInterval);

        alert("Game Over!");

        location.reload();
    }

}, 1000);

function resetBoard() {

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

function playerHasCells(player) {

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            if (
                board[r][c].owner === player
            ) {
                return true;
            }
        }
    }

    return false;
}

function makeMove(row, col) {

    if (isPaused) return;

    const cell = board[row][col];

    const firstMove =
        !playerHasCells(currentPlayer);

    if (firstMove) {

        if (cell.owner !== null) {
            return;
        }
    }

    else {

        if (
            cell.owner !== currentPlayer
        ) {
            return;
        }
    }

    cell.owner = currentPlayer;

    cell.count++;

    placeSound.currentTime = 0;

    placeSound.play().catch(() => {});

    moveCount++;

    moveHistory.push(
        `Player ${currentPlayer} -> (${row}, ${col})`
    );

    explode(
        row,
        col,
        currentPlayer
    );

    checkWinner();

    currentPlayerIndex =
        (currentPlayerIndex + 1) %
        players.length;

    currentPlayer =
        players[currentPlayerIndex];

    turnTime = 15;

    renderBoard();

    if (
        aiEnabled &&
        currentPlayer === 2
    ) {

        aiMove();
    }
}

function explode(
    row,
    col,
    player
) {

    const cell = board[row][col];

    if (cell.count < cell.capacity) {
        return;
    }

    boomSound.currentTime = 0;

    boomSound.play().catch(() => {});

    cell.count = 0;

    cell.owner = null;

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    for (const [dr, dc] of directions) {

        const nr = row + dr;
        const nc = col + dc;

        if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS
        ) {

            const neighbor =
                board[nr][nc];

            neighbor.owner = player;

            neighbor.count++;

            explode(
                nr,
                nc,
                player
            );
        }
    }
}

function checkWinner() {

    const alivePlayers = new Set();

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            if (
                board[r][c].owner !== null
            ) {

                alivePlayers.add(
                    board[r][c].owner
                );
            }
        }
    }

    if (
        alivePlayers.size === 1 &&
        moveCount >= players.length * 2
    ) {

        clearInterval(gameInterval);

        const winner =
            [...alivePlayers][0];

        winSound.currentTime = 0;

        winSound.play().catch(() => {});

        setTimeout(() => {

            alert(
                `Player ${winner} Wins!`
            );

            location.reload();

        }, 500);

        return;
    }
}

function aiMove() {

    let possibleMoves = [];

    const firstMove =
        !playerHasCells(2);

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const cell = board[r][c];

            if (firstMove) {

                if (cell.owner === null) {

                    possibleMoves.push({
                        r,
                        c
                    });
                }
            }

            else {

                if (cell.owner === 2) {

                    possibleMoves.push({
                        r,
                        c
                    });
                }
            }
        }
    }

    if (possibleMoves.length === 0) {
        return;
    }

    const move =
        possibleMoves[
            Math.floor(
                Math.random() *
                possibleMoves.length
            )
        ];

    setTimeout(() => {

        makeMove(
            move.r,
            move.c
        );

    }, 500);
}