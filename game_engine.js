let gameStarted = false;

let gameInterval = null;

const boomSound = new Audio("boom.mp3");

const placeSound = new Audio("place.mp3");

const winSound = new Audio("win.mp3");

/* TIMER SYSTEM */

function startTimer() {

    if (gameInterval) {

        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {

        if (!gameStarted) {
            return;
        }

        if (isPaused) {
            return;
        }

        totalTime--;

        turnTime--;

        if (turnTime <= 0) {

            /* FIX #10: skip eliminated players when timer advances the turn */

            advanceToNextAlivePlayer();

            turnTime = 15;
        }

        /* FIX #12: only update display text in the timer tick, not full re-render */

        updateTimerDisplay();

        if (totalTime <= 0) {

            clearInterval(gameInterval);

            updateScores();

            let highestScore = -1;

            let winner = null;

            for (const player in scores) {

                if (
                    scores[player] >
                    highestScore
                ) {

                    highestScore =
                        scores[player];

                    winner = player;
                }
            }

            winSound.currentTime = 0;

            winSound.play().catch(() => {});

            setTimeout(() => {

                alert(
                    `Time Up!\n${playerNames[winner]} Wins with ${highestScore} orbs!`
                );

                location.reload();

            }, 500);
        }

    }, 1000);
}

/* FIX #2 & #10: shared helper — advance index past any eliminated player */

function advanceToNextAlivePlayer() {

    const total = players.length;

    for (let i = 0; i < total; i++) {

        currentPlayerIndex =
            (currentPlayerIndex + 1) %
            total;

        currentPlayer =
            players[currentPlayerIndex];

        /* A player is alive if moveCount is still in the opening
           phase (everyone gets at least one turn) or they have
           at least one orb on the board */

        if (
            moveCount < total ||
            playerHasOrbs(currentPlayer)
        ) {

            return;
        }
    }
}

function playerHasOrbs(player) {

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            if (board[r][c].owner === player) {

                return true;
            }
        }
    }

    return false;
}

/* FIX #12: lightweight display-only update used by the timer tick */

function updateTimerDisplay() {

    const timerDisplay =
        document.getElementById("timerDisplay");

    if (timerDisplay) {

        timerDisplay.textContent =
            `Game: ${totalTime}s | Turn: ${turnTime}s`;
    }

    const turnDisplay =
        document.getElementById("turnDisplay");

    if (turnDisplay) {

        turnDisplay.textContent =
            `${playerNames[currentPlayer]}'s Turn`;
    }
}

/* SCORE SYSTEM */

function updateScores() {

    scores = {};

    for (const player of players) {

        scores[player] = 0;
    }

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const cell = board[r][c];

            if (cell.owner !== null) {

                scores[cell.owner] +=
                    cell.count;
            }
        }
    }
}

/* REPLAY SYSTEM */

function saveSnapshot() {

    /* FIX #11: also snapshot currentPlayerIndex so undo restores it */

    const snapshot = {

        board: JSON.parse(
            JSON.stringify(board)
        ),

        currentPlayer,

        currentPlayerIndex,

        scores: JSON.parse(
            JSON.stringify(scores)
        ),

        moveHistory: [...moveHistory]
    };

    /* FIX: when a new move is made after an undo, discard the
       "future" snapshots so redo doesn't jump to a stale state */

    if (replayIndex < replaySnapshots.length - 1) {

        replaySnapshots.splice(
            replayIndex + 1
        );
    }

    replaySnapshots.push(snapshot);

    replayIndex =
        replaySnapshots.length - 1;
}

function loadSnapshot(index) {

    if (
        index < 0 ||
        index >= replaySnapshots.length
    ) {

        return;
    }

    const snapshot =
        replaySnapshots[index];

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            board[r][c] =
                JSON.parse(
                    JSON.stringify(
                        snapshot.board[r][c]
                    )
                );
        }
    }

    currentPlayer =
        snapshot.currentPlayer;

    /* FIX #11: restore the index too */

    currentPlayerIndex =
        snapshot.currentPlayerIndex;

    scores =
        JSON.parse(
            JSON.stringify(
                snapshot.scores
            )
        );

    moveHistory.length = 0;

    for (
        const move of
        snapshot.moveHistory
    ) {

        moveHistory.push(move);
    }

    renderBoard();
}

function undoMove() {

    if (replayIndex <= 0) {
        return;
    }

    replayIndex--;

    loadSnapshot(replayIndex);
}

function redoMove() {

    if (
        replayIndex >=
        replaySnapshots.length - 1
    ) {

        return;
    }

    replayIndex++;

    loadSnapshot(replayIndex);
}

function playReplay() {

    if (replayInterval) {

        clearInterval(
            replayInterval
        );
    }

    replayIndex = 0;

    replayInterval = setInterval(() => {

        if (
            replayIndex >=
            replaySnapshots.length
        ) {

            clearInterval(
                replayInterval
            );

            return;
        }

        loadSnapshot(
            replayIndex
        );

        replayIndex++;

    }, 1000);
}

function pauseReplay() {

    clearInterval(
        replayInterval
    );
}

/* MOVE LOGIC */

function makeMove(row, col) {

    /* FIX #16: block moves before game is started */

    if (!gameStarted) return;

    if (isPaused) return;

    const cell = board[row][col];

    if (
        cell.owner !== null &&
        cell.owner !== currentPlayer
    ) {

        return;
    }

    cell.owner = currentPlayer;

    cell.count++;

    placeSound.currentTime = 0;

    placeSound.play().catch(() => {});

    moveCount++;

    moveHistory.push(
        `${playerNames[currentPlayer]} placed at (${row}, ${col})`
    );

    /* FIX #5: check portal BEFORE explode so teleport happens on the
       freshly placed orb, not after it may have already exploded away */

    checkPortal(row, col, currentPlayer);

    /* FIX #8: check bomb BEFORE explode so the bomb fires on a
       populated cell, not on one that may already be empty */

    checkBomb(row, col);

    explode(row, col, currentPlayer, new Set());

    updateScores();

    /* FIX #3: checkWinner before advancing the player index */

    if (checkWinner()) return;

    /* FIX #2: use the shared helper so eliminated players are skipped */

    advanceToNextAlivePlayer();

    turnTime = 15;

    renderBoard();

    saveSnapshot();

    /* FIX #9: compare against the actual AI player variable,
       not the hardcoded literal 2 */

    if (
        aiEnabled &&
        currentPlayer === players[players.length - 1]
    ) {

        aiMove();
    }
}

/* PORTALS */

function checkPortal(
    row,
    col,
    player
) {

    for (const portal of portals) {

        if (
            portal.from.r === row &&
            portal.from.c === col
        ) {

            const target =
                board[
                    portal.to.r
                ][
                    portal.to.c
                ];

            target.owner = player;

            target.count++;

            const fromCell =
                document.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                );

            const toCell =
                document.querySelector(
                    `[data-row="${portal.to.r}"][data-col="${portal.to.c}"]`
                );

            if (fromCell) {

                fromCell.classList.add(
                    "portalFlash"
                );

                fromCell.classList.add(
                    "portalCell"
                );
            }

            if (toCell) {

                toCell.classList.add(
                    "portalFlash"
                );

                toCell.classList.add(
                    "portalCell"
                );
            }

            setTimeout(() => {

                fromCell?.classList.remove(
                    "portalFlash"
                );

                toCell?.classList.remove(
                    "portalFlash"
                );

            }, 700);

            /* Portal destination may also need to explode */

            explode(
                portal.to.r,
                portal.to.c,
                player,
                new Set()
            );
        }
    }
}

/* BOMBS */

function checkBomb(row, col) {

    for (let i = bombs.length - 1; i >= 0; i--) {

        const bomb = bombs[i];

        if (
            bomb.r === row &&
            bomb.c === col
        ) {

            /* FIX #7: remove bomb from array so it only triggers once */

            bombs.splice(i, 1);

            activateBomb(row, col);
        }
    }
}

function activateBomb(row, col) {

    const bombSound =
        new Audio("bomb.mp3");

    bombSound.currentTime = 0;

    bombSound.play().catch(() => {});

    const radius = 1;

    for (
        let r = row - radius;
        r <= row + radius;
        r++
    ) {

        for (
            let c = col - radius;
            c <= col + radius;
            c++
        ) {

            if (
                r >= 0 &&
                r < ROWS &&
                c >= 0 &&
                c < COLS
            ) {

                board[r][c].owner = null;

                board[r][c].count = 0;

                const cell =
                    document.querySelector(
                        `[data-row="${r}"][data-col="${c}"]`
                    );

                if (cell) {

                    cell.classList.add(
                        "bombFlash"
                    );

                    /* FIX #6: build sparkle and bomb label as
                       separate elements instead of innerHTML +=
                       so the sparkle reference stays valid */

                    const sparkle =
                        document.createElement("div");

                    sparkle.classList.add(
                        "sparkleExplosion"
                    );

                    cell.appendChild(sparkle);

                    const label =
                        document.createElement("div");

                    label.classList.add(
                        "bombReveal"
                    );

                    label.textContent = "💣";

                    cell.appendChild(label);

                    setTimeout(() => {

                        sparkle.remove();

                        label.remove();

                        cell.classList.remove(
                            "bombFlash"
                        );

                    }, 700);
                }
            }
        }
    }

    boomSound.currentTime = 0;

    boomSound.play().catch(() => {});
}

/* EXPLOSIONS */

/* FIX #1: accept a `visited` Set to break infinite recursion
   in chain reactions involving cycles */

function explode(row, col, player, visited) {

    const key = `${row}-${col}`;

    if (visited.has(key)) {
        return;
    }

    const cell = board[row][col];

    if (cell.count < cell.capacity) {
        return;
    }

    visited.add(key);

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

            explode(nr, nc, player, visited);
        }
    }
}

/* WIN CHECK */

/* FIX #3: return true when a winner is found so makeMove can bail out */

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

    /* Need at least one full round before anyone can be eliminated */

    if (
        alivePlayers.size === 1 &&
        moveCount >= players.length
    ) {

        clearInterval(gameInterval);

        const winner =
            [...alivePlayers][0];

        winSound.currentTime = 0;

        winSound.play().catch(() => {});

        setTimeout(() => {

            alert(
                `${playerNames[winner]} Wins!`
            );

            location.reload();

        }, 500);

        return true;
    }

    return false;
}

/* AI */

/* FIX #9: use the actual AI player id (last in the players array)
   rather than the hardcoded literal 2 */

function aiMove() {

    const aiPlayer =
        players[players.length - 1];

    let possibleMoves = [];

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const cell = board[r][c];

            if (
                cell.owner === null ||
                cell.owner === aiPlayer
            ) {

                possibleMoves.push({
                    r,
                    c
                });
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
