let ROWS = 6;

let COLS = 12;

let currentPlayer = 1;

let currentPlayerIndex = 0;

let players = [1, 2];

let playerNames = {

    1: "Player 1",

    2: "Player 2"
};

let aiEnabled = false;

let isPaused = false;

let totalTime = 300;

let turnTime = 15;

let moveCount = 0;

let scores = {};

const moveHistory = [];

/* REPLAY SYSTEM */

const replaySnapshots = [];

let replayIndex = -1;

let replayInterval = null;

/* BOARD */

const board = [];

/* SPECIAL TILES */

const portals = [];

const bombs = [];

/* CREATE BOARD */

function createBoard() {

    /* FIX #15: clamp dimensions to valid range */

    ROWS = Math.max(4, Math.min(20, ROWS));

    COLS = Math.max(4, Math.min(20, COLS));

    board.length = 0;

    for (let r = 0; r < ROWS; r++) {

        const row = [];

        for (let c = 0; c < COLS; c++) {

            let capacity = 4;

            /* CORNERS */

            if (
                (r === 0 || r === ROWS - 1) &&
                (c === 0 || c === COLS - 1)
            ) {

                capacity = 2;
            }

            /* EDGES */

            else if (
                r === 0 ||
                r === ROWS - 1 ||
                c === 0 ||
                c === COLS - 1
            ) {

                capacity = 3;
            }

            row.push({

                owner: null,

                count: 0,

                capacity: capacity
            });
        }

        board.push(row);
    }

    generatePortals();

    generateBombs();
}

/* PORTALS */

function generatePortals() {

    portals.length = 0;

    const used = new Set();

    while (portals.length < 3) {

        const r1 = Math.floor(
            Math.random() * ROWS
        );

        const c1 = Math.floor(
            Math.random() * COLS
        );

        const r2 = Math.floor(
            Math.random() * ROWS
        );

        const c2 = Math.floor(
            Math.random() * COLS
        );

        const key1 = `${r1}-${c1}`;

        const key2 = `${r2}-${c2}`;

        if (
            key1 === key2 ||
            used.has(key1) ||
            used.has(key2)
        ) {

            continue;
        }

        used.add(key1);

        used.add(key2);

        portals.push({

            from: {
                r: r1,
                c: c1
            },

            to: {
                r: r2,
                c: c2
            }
        });
    }
}

/* BOMBS */

function generateBombs() {

    bombs.length = 0;

    /* FIX #13: collect all portal positions so bombs never share a cell */

    const portalPositions = new Set();

    for (const portal of portals) {

        portalPositions.add(
            `${portal.from.r}-${portal.from.c}`
        );

        portalPositions.add(
            `${portal.to.r}-${portal.to.c}`
        );
    }

    const used = new Set();

    while (bombs.length < 4) {

        const r = Math.floor(
            Math.random() * ROWS
        );

        const c = Math.floor(
            Math.random() * COLS
        );

        const key = `${r}-${c}`;

        /* FIX #13: skip cells already used by portals */

        if (
            used.has(key) ||
            portalPositions.has(key)
        ) {

            continue;
        }

        used.add(key);

        bombs.push({

            r,
            c
        });
    }
}

/* INITIALIZE */

createBoard();

