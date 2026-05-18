/* ── PORTAL PAIR COLOURS ──
   Each pair gets its own tint so players can match from → to */

const PORTAL_COLOURS = [
    "#b044ff",
    "#00e5ff",
    "#ffee44",
];

function renderBoard() {

    const boardDiv =
        document.getElementById("board");

    boardDiv.innerHTML = "";

    boardDiv.style.gridTemplateColumns =
        `repeat(${COLS}, 48px)`;

    /* pre-build lookup maps so we don't loop portals/bombs per cell */

    const portalMap = new Map();

    for (let p = 0; p < portals.length; p++) {

        const portal = portals[p];

        portalMap.set(
            `${portal.from.r}-${portal.from.c}`,
            { pairIndex: p, role: "from" }
        );

        portalMap.set(
            `${portal.to.r}-${portal.to.c}`,
            { pairIndex: p, role: "to" }
        );
    }

    const bombSet = new Set();

    for (const bomb of bombs) {

        bombSet.add(`${bomb.r}-${bomb.c}`);
    }

    /* ── RENDER CELLS ── */

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const cell    = board[r][c];
            const cellKey = `${r}-${c}`;

            const cellElement =
                document.createElement("div");

            cellElement.classList.add("cell");
            cellElement.dataset.row = r;
            cellElement.dataset.col = c;

            /* PLAYER COLOUR */

            if (cell.owner !== null) {

                const colourClasses = [
                    "", "redCell", "blueCell", "greenCell",
                    "yellowCell", "purpleCell", "orangeCell",
                    "pinkCell", "cyanCell"
                ];

                if (colourClasses[cell.owner]) {

                    cellElement.classList.add(
                        colourClasses[cell.owner]
                    );
                }
            }

            /* ── PORTAL MARKER ── */

            if (portalMap.has(cellKey)) {

                const info   = portalMap.get(cellKey);
                const colour =
                    PORTAL_COLOURS[
                        info.pairIndex % PORTAL_COLOURS.length
                    ];

                cellElement.classList.add("portalCell");
                cellElement.style.setProperty(
                    "--portal-colour", colour
                );

                const badge =
                    document.createElement("div");

                badge.classList.add(
                    "special-badge", "portal-badge"
                );

                /* ⬡ = entrance, ★ = exit */
                badge.textContent =
                    info.role === "from" ? "\u2B21" : "\u2605";

                badge.style.color = colour;
                badge.style.textShadow =
                    `0 0 8px ${colour}, 0 0 16px ${colour}`;
                badge.title =
                    info.role === "from"
                        ? `Portal ${info.pairIndex + 1} entrance`
                        : `Portal ${info.pairIndex + 1} exit`;

                /* small pair number in top-right corner */
                const pairNum =
                    document.createElement("span");

                pairNum.classList.add("badge-pair-num");
                pairNum.textContent = info.pairIndex + 1;
                pairNum.style.color = colour;

                cellElement.appendChild(badge);
                cellElement.appendChild(pairNum);
            }

            /* ── BOMB MARKER ── */

            if (bombSet.has(cellKey)) {

                cellElement.classList.add("bombCell");

                const bombBadge =
                    document.createElement("div");

                bombBadge.classList.add(
                    "special-badge", "bomb-badge"
                );

                bombBadge.textContent = "\uD83D\uDCA3";
                bombBadge.title =
                    "BOMB — clears a 3x3 area on contact!";

                cellElement.appendChild(bombBadge);
            }

            /* ── ORB CONTAINER ── */

            const orbContainer =
                document.createElement("div");

            orbContainer.classList.add("orb-container");

            const orbColourClasses = [
                "", "redOrb", "blueOrb", "greenOrb",
                "yellowOrb", "purpleOrb", "orangeOrb",
                "pinkOrb", "cyanOrb"
            ];

            const orbPositionMap = {
                1: ["orb1"],
                2: ["orb2a", "orb2b"],
                3: ["orb3a", "orb3b", "orb3c"],
                4: ["orb4a", "orb4b", "orb4c", "orb4d"],
            };

            const positions =
                orbPositionMap[Math.min(cell.count, 4)] || [];

            for (let i = 0; i < cell.count; i++) {

                const orb =
                    document.createElement("div");

                orb.classList.add("orb");

                if (orbColourClasses[cell.owner]) {

                    orb.classList.add(
                        orbColourClasses[cell.owner]
                    );
                }

                if (positions[i]) {

                    orb.classList.add(positions[i]);
                }

                orbContainer.appendChild(orb);
            }

            cellElement.appendChild(orbContainer);
            boardDiv.appendChild(cellElement);
        }
    }

    /* ── LEGEND ── */

    let legendDiv =
        document.getElementById("specialLegend");

    if (!legendDiv) {

        legendDiv = document.createElement("div");
        legendDiv.id = "specialLegend";

        boardDiv.insertAdjacentElement(
            "afterend", legendDiv
        );
    }

    legendDiv.innerHTML = "";

    for (let p = 0; p < portals.length; p++) {

        const colour =
            PORTAL_COLOURS[p % PORTAL_COLOURS.length];

        const entry =
            document.createElement("span");

        entry.classList.add("legend-entry");

        entry.innerHTML =
            `<span class="legend-icon" style="color:${colour};` +
            `text-shadow:0 0 6px ${colour}">\u2B21</span>` +
            `<span class="legend-arrow" style="color:${colour}">\u2192</span>` +
            `<span class="legend-icon" style="color:${colour};` +
            `text-shadow:0 0 6px ${colour}">\u2605</span>` +
            `<span class="legend-label" style="color:${colour}">` +
            `PORTAL ${p + 1}</span>`;

        legendDiv.appendChild(entry);
    }

    if (bombs.length > 0) {

        const bombEntry =
            document.createElement("span");

        bombEntry.classList.add("legend-entry");

        bombEntry.innerHTML =
            `<span class="legend-icon">\uD83D\uDCA3</span>` +
            `<span class="legend-label" style="color:#ff8844">` +
            `BOMB \u00D7${bombs.length} (3\u00D73 blast)</span>`;

        legendDiv.appendChild(bombEntry);
    }

    /* ── TURN DISPLAY ── */

    const turnDisplay =
        document.getElementById("turnDisplay");

    if (turnDisplay) {

        turnDisplay.textContent =
            `${playerNames[currentPlayer]}'s Turn`;
    }

    /* ── TIMER DISPLAY ── */

    const timerDisplay =
        document.getElementById("timerDisplay");

    if (timerDisplay) {

        timerDisplay.textContent =
            `Game: ${totalTime}s | Turn: ${turnTime}s`;
    }

    /* ── LEADERBOARD ── */

    const scoreDisplay =
        document.getElementById("scoreDisplay");

    if (scoreDisplay) {

        const sortedPlayers =
            Object.entries(scores)
            .sort((a, b) => b[1] - a[1]);

        let scoreText = "";

        for (let i = 0; i < sortedPlayers.length; i++) {

            const player = sortedPlayers[i][0];
            const score  = sortedPlayers[i][1];

            scoreText +=
                `#${i + 1} ${playerNames[player]}: ${score}`;

            if (i !== sortedPlayers.length - 1) {

                scoreText += " | ";
            }
        }

        scoreDisplay.textContent = scoreText;
    }

    /* ── MOVE HISTORY ── */

    const historyDiv =
        document.getElementById("history");

    if (historyDiv) {

        historyDiv.innerHTML = "";

        for (
            let i = moveHistory.length - 1;
            i >= 0;
            i--
        ) {

            const move =
                document.createElement("div");

            move.textContent = moveHistory[i];
            historyDiv.appendChild(move);
        }
    }
}
