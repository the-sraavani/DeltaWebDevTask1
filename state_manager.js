const ROWS = 6;
const COLS = 12;

let players = [1, 2];

const playerColors = {
    1: "red",
    2: "blue",
    3: "green",
    4: "yellow",
    5: "purple",
    6: "orange",
    7: "pink",
    8: "cyan"
};

let currentPlayerIndex = 0;

let currentPlayer =
    players[currentPlayerIndex];

let moveCount = 0;

let totalTime = 300;

let turnTime = 15;

let isPaused = false;

let aiEnabled = false;

const moveHistory = [];

const board = [];

for (let r = 0; r < ROWS; r++) {

    const row = [];

    for (let c = 0; c < COLS; c++) {

        let capacity = 4;

        if (
            (r === 0 || r === ROWS - 1) &&
            (c === 0 || c === COLS - 1)
        ) {
            capacity = 2;
        }

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