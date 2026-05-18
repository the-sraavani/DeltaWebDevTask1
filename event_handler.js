const startupPopup =
    document.getElementById(
        "startupPopup"
    );

/* DEFAULT BOARD */

document
.getElementById(
    "defaultBoardBtn"
)
.addEventListener(
    "click",
    function() {

        startupPopup.style.display =
            "none";

        renderBoard();
    }
);

/* CUSTOM BOARD */

document
.getElementById(
    "customBoardBtn"
)
.addEventListener(
    "click",
    function() {

        const newRows =
            parseInt(
                document.getElementById(
                    "rowsInput"
                ).value
            );

        const newCols =
            parseInt(
                document.getElementById(
                    "colsInput"
                ).value
            );

        if (
            isNaN(newRows) ||
            isNaN(newCols) ||
            newRows < 4 ||
            newCols < 4 ||
            newRows > 20 ||
            newCols > 20
        ) {

            alert(
                "Enter valid board dimensions (4–20 for each)"
            );

            return;
        }

        ROWS = newRows;

        COLS = newCols;

        /* FIX #4: call createBoard() so the board array is fully
           rebuilt to match the new dimensions before rendering */

        createBoard();

        startupPopup.style.display =
            "none";

        renderBoard();
    }
);

/* RESET GAME */

function resetGame() {

    gameStarted = true;

    startTimer();

    replaySnapshots.length = 0;

    replayIndex = -1;

    moveCount = 0;

    totalTime = 300;

    turnTime = 15;

    scores = {};

    currentPlayerIndex = 0;

    currentPlayer = players[0];

    moveHistory.length = 0;

    /* FIX #4: always rebuild the board fully on reset so the grid
       structure matches current ROWS/COLS and fresh portals/bombs
       are placed on the correct geometry */

    createBoard();

    renderBoard();
}

/* BOARD CLICK */

document
.getElementById("board")
.addEventListener(
    "click",
    function(event) {

        const cell =
            event.target.closest(
                ".cell"
            );

        if (!cell) return;

        const row =
            parseInt(
                cell.dataset.row
            );

        const col =
            parseInt(
                cell.dataset.col
            );

        makeMove(row, col);
    }
);

/* PAUSE */

document
.getElementById(
    "pauseBtn"
)
.addEventListener(
    "click",
    function() {

        isPaused = true;
    }
);

/* RESUME */

document
.getElementById(
    "resumeBtn"
)
.addEventListener(
    "click",
    function() {

        isPaused = false;
    }
);

/* NORMAL PVP */

document
.getElementById(
    "pvpBtn"
)
.addEventListener(
    "click",
    function() {

        players = [1, 2];

        playerNames = {

            1: "Player 1",

            2: "Player 2"
        };

        aiEnabled = false;

        currentPlayerIndex = 0;

        currentPlayer = players[0];

        resetGame();

        alert(
            "2 Player Mode"
        );
    }
);

/* AI MODE */

document
.getElementById(
    "aiBtn"
)
.addEventListener(
    "click",
    function() {

        players = [1, 2];

        playerNames = {

            1: "You",

            2: "AI"
        };

        aiEnabled = true;

        currentPlayerIndex = 0;

        currentPlayer = players[0];

        resetGame();

        alert(
            "Player vs AI Mode"
        );
    }
);

/* CUSTOM MULTIPLAYER */

document
.getElementById(
    "customMultiBtn"
)
.addEventListener(
    "click",
    function() {

        const count =
            parseInt(
                document.getElementById(
                    "playerCountInput"
                ).value
            );

        if (
            isNaN(count) ||
            count < 2 ||
            count > 8
        ) {

            alert(
                "Choose between 2 and 8 players"
            );

            return;
        }

        const namesInput =
            document.getElementById(
                "playerNamesInput"
            ).value;

        const splitNames =
            namesInput
                .split(",")
                .map(
                    name => name.trim()
                );

        players = [];

        playerNames = {};

        for (
            let i = 1;
            i <= count;
            i++
        ) {

            players.push(i);

            playerNames[i] =
                splitNames[i - 1] ||
                `Player ${i}`;
        }

        currentPlayerIndex = 0;

        currentPlayer = players[0];

        /* FIX #9: AI is disabled in manual multiplayer mode */

        aiEnabled = false;

        resetGame();

        alert(
            `${count} Player Mode`
        );
    }
);

/* REPLAY CONTROLS */

document
.getElementById(
    "undoBtn"
)
.addEventListener(
    "click",
    undoMove
);

document
.getElementById(
    "redoBtn"
)
.addEventListener(
    "click",
    redoMove
);

document
.getElementById(
    "playReplayBtn"
)
.addEventListener(
    "click",
    playReplay
);

document
.getElementById(
    "pauseReplayBtn"
)
.addEventListener(
    "click",
    pauseReplay
);
