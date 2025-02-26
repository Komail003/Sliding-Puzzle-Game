document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const menuContainer = document.getElementById('menuContainer');
    const gameContainer = document.getElementById('gameContainer');
    const puzzleContainer = document.getElementById('puzzle');
    const difficultySelect = document.getElementById('difficulty');
    const shuffleButton = document.getElementById('shuffle');
    const timerElement = document.getElementById('timer');
    const bestScoreElement = document.getElementById('bestScore');
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    const popupClose = document.getElementById('popup-close');

    const tileSize = 80;
    const gap = 5;
    let grid = [];
    let gridSize = parseInt(difficultySelect.value);
    let tileElements = {};

    let timerInterval;
    let timeElapsed = 0;

    function initGrid() {
        grid = [];
        for (let i = 1; i < gridSize * gridSize; i++) {
            grid.push(i);
        }
        grid.push(null);
    }

    function shuffleGrid() {
        for (let i = grid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [grid[i], grid[j]] = [grid[j], grid[i]];
        }
        if (!isSolvable()) {
            if (grid[0] && grid[1]) {
                [grid[0], grid[1]] = [grid[1], grid[0]];
            } else {
                [grid[grid.length - 2], grid[grid.length - 3]] =
                    [grid[grid.length - 3], grid[grid.length - 2]];
            }
        }
    }

    function isSolvable() {
        let invCount = 0;
        const arr = grid.filter(n => n !== null);
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) invCount++;
            }
        }
        const blankIndex = grid.indexOf(null);
        const blankRowFromBottom = gridSize - Math.floor(blankIndex / gridSize);
        if (gridSize % 2 === 1) {
            return invCount % 2 === 0;
        } else {
            if (blankRowFromBottom % 2 === 0) {
                return invCount % 2 === 1;
            } else {
                return invCount % 2 === 0;
            }
        }
    }

    function createTiles() {
        puzzleContainer.innerHTML = "";
        tileElements = {};
        grid.forEach(num => {
            if (num !== null) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.textContent = num;
                tile.addEventListener('click', () => {
                    const index = grid.indexOf(num);
                    moveTile(index);
                });
                puzzleContainer.appendChild(tile);
                tileElements[num] = tile;
            }
        });
    }

    function updatePositions() {
        grid.forEach((num, index) => {
            if (num !== null) {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const left = col * (tileSize + gap);
                const top = row * (tileSize + gap);
                tileElements[num].style.left = left + 'px';
                tileElements[num].style.top = top + 'px';
            }
        });
    }

    function moveTile(index) {
        const emptyIndex = grid.indexOf(null);
        if (isAdjacent(index, emptyIndex)) {
            [grid[index], grid[emptyIndex]] = [grid[emptyIndex], grid[index]];
            updatePositions();
            if (checkWin()) {
                clearInterval(timerInterval);
                const bestKey = "bestScore_" + gridSize;
                let best = localStorage.getItem(bestKey);
                if (!best || timeElapsed < best) {
                    localStorage.setItem(bestKey, timeElapsed);
                    best = timeElapsed;
                }
                bestScoreElement.textContent = "Best: " + best + "s";
                showPopup("You solved the puzzle in " + timeElapsed + " seconds!");
            }
        }
    }

    function isAdjacent(i, j) {
        const row1 = Math.floor(i / gridSize), col1 = i % gridSize;
        const row2 = Math.floor(j / gridSize), col2 = j % gridSize;
        return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
    }

    function checkWin() {
        for (let i = 0; i < grid.length - 1; i++) {
            if (grid[i] !== i + 1) return false;
        }
        return true;
    }

    function updateContainerSize() {
        const containerSize = gridSize * tileSize + (gridSize - 1) * gap;
        puzzleContainer.style.width = containerSize + "px";
        puzzleContainer.style.height = containerSize + "px";
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeElapsed = 0;
        timerElement.textContent = "Time: 0s";
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerElement.textContent = "Time: " + timeElapsed + "s";
        }, 1000);
    }

    function updateBestScoreDisplay() {
        const bestKey = "bestScore_" + gridSize;
        let best = localStorage.getItem(bestKey);
        bestScoreElement.textContent = best ? "Best: " + best + "s" : "Best: N/A";
    }

    function showPopup(message) {
        popupMessage.textContent = message;
        popup.style.display = 'flex';
    }

    popupClose.addEventListener('click', () => {
        popup.style.display = 'none';
        gameContainer.style.display = 'none';
        shuffleButton.style.display = 'block';
        menuContainer.style.display = 'block';
    });

    function startGame() {
        gridSize = parseInt(difficultySelect.value);
        updateContainerSize();
        updateBestScoreDisplay();
        initGrid();
        shuffleGrid();
        createTiles();
        updatePositions();
        startTimer();
        menuContainer.style.display = 'none';
        shuffleButton.style.display = 'none';
        gameContainer.style.display = 'block';
    }

    shuffleButton.addEventListener('click', startGame);
});
