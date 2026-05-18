function renderBoard() {

    const boardDiv =
        document.getElementById("board");

    boardDiv.innerHTML = "";

    document.getElementById("turnText")
    .textContent =
    `Player ${currentPlayer}'s Turn`;

    const scores = {};

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const cellElement =
                document.createElement("div");

            cellElement.classList.add("cell");

            const data = board[r][c];

            cellElement.dataset.row = r;

            cellElement.dataset.col = c;

            if (data.owner !== null) {

                const color =
                    playerColors[data.owner];

                cellElement.classList.add(
                    color + "Cell"
                );

                if (!scores[data.owner]) {

                    scores[data.owner] = 0;
                }

                scores[data.owner] += data.count;

                const orbContainer =
                    document.createElement("div");

                orbContainer.classList.add(
                    "orb-container"
                );

                const orbClass =
                    color + "Orb";

                if (data.count === 1) {

                    const orb =
                        document.createElement("div");

                    orb.classList.add(
                        "orb",
                        orbClass,
                        "orb1"
                    );

                    orbContainer.appendChild(orb);
                }

                if (data.count === 2) {

                    const orb1 =
                        document.createElement("div");

                    orb1.classList.add(
                        "orb",
                        orbClass,
                        "orb2a"
                    );

                    const orb2 =
                        document.createElement("div");

                    orb2.classList.add(
                        "orb",
                        orbClass,
                        "orb2b"
                    );

                    orbContainer.appendChild(orb1);

                    orbContainer.appendChild(orb2);
                }

                if (data.count === 3) {

                    const positions = [
                        "orb3a",
                        "orb3b",
                        "orb3c"
                    ];

                    for (const pos of positions) {

                        const orb =
                            document.createElement("div");

                        orb.classList.add(
                            "orb",
                            orbClass,
                            pos
                        );

                        orbContainer.appendChild(orb);
                    }
                }

                if (data.count >= 4) {

                    const positions = [
                        "orb4a",
                        "orb4b",
                        "orb4c",
                        "orb4d"
                    ];

                    for (const pos of positions) {

                        const orb =
                            document.createElement("div");

                        orb.classList.add(
                            "orb",
                            orbClass,
                            pos
                        );

                        orbContainer.appendChild(orb);
                    }
                }

                cellElement.appendChild(
                    orbContainer
                );
            }

            boardDiv.appendChild(
                cellElement
            );
        }
    }

    let scoreParts = [];

    for (const player in scores) {

        scoreParts.push(
            `P${player}: ${scores[player]}`
        );
    }

    document.getElementById("scoreText")
    .textContent =
    scoreParts.join(" | ");

    document.getElementById("timerText")
    .textContent =
    `Total Time: ${totalTime}s | Turn Time: ${turnTime}s`;

    document.getElementById("history")
    .innerHTML =
    moveHistory.join("<br>");
}

renderBoard();