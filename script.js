import presets from "./presets.js";
const canvas = document.getElementById("gameCanvas");
const canvasParent = document.querySelector(".canvas");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const clearButton = document.getElementById("clearButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");
const presetButton = document.getElementById("presetButton");
const presetMenu = document.getElementById("presets");
const speedControl = document.getElementById("speedControl");
const ctx = canvas.getContext("2d");

let grid = [];
let gridHistory = [];
let running = false;
let fps = parseFloat(speedControl.value);
const cellSize = 20;
let rows, cols;

resizeCanvas();
window.addEventListener("resize", resizeCanvas, false);
window.addEventListener("load", resizeCanvas, false);

playButton.addEventListener("click", () => {
    running = true;
    playButton.disabled = true;
    pauseButton.disabled = false;
});

pauseButton.addEventListener("click", () => {
    running = false;
    playButton.disabled = false;
    pauseButton.disabled = true;
});

presetButton.addEventListener("click", () => {
    grid = createGrid(cols, rows);
    let presetValue = presetMenu.value;
    if (presetValue === "random") {
        grid = generateRandomGrid(cols, rows);
    } else {
        for (const i in presets[presetValue]) {
            grid[presets[presetValue][i][0] + 4][
                presets[presetValue][i][1] + 4
            ] = 1;
        }
    }
    running = false;
    playButton.disabled = false;
    pauseButton.disabled = false;
    drawGrid();
});

clearButton.addEventListener("click", () => {
    running = false;
    playButton.disabled = false;
    pauseButton.disabled = false;
    if (
        gridHistory.length === 0 ||
        JSON.stringify(grid) !==
            JSON.stringify(gridHistory[gridHistory.length - 1])
    ) {
        gridHistory.push(JSON.parse(JSON.stringify(grid)));
    }
    grid = createGrid(cols, rows);
    drawGrid();
});

nextButton.addEventListener("click", () => {
    if (
        gridHistory.length === 0 ||
        JSON.stringify(grid) !==
            JSON.stringify(gridHistory[gridHistory.length - 1])
    ) {
        gridHistory.push(JSON.parse(JSON.stringify(grid)));
    }
    grid = updateGrid();
    drawGrid();
});

previousButton.addEventListener("click", () => {
    if (gridHistory.length > 0) {
        grid = gridHistory.pop();
        drawGrid();
    }
});

speedControl.addEventListener("input", function () {
    fps = parseFloat(this.value);
});

canvas.addEventListener("click", (event) => {
    toggleCell(event);
});

function resizeCanvas() {
    canvas.width = Math.floor(canvasParent.offsetWidth / 100) * 100;
    canvas.height = Math.floor(canvasParent.offsetHeight / 100) * 100;
    playButton.disabled = false;
    pauseButton.disabled = false;
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);

    grid = createGrid(cols, rows);
    gridHistory = [];
    drawGrid();
    running = false;
}

function generateRandomGrid(cols, rows) {
    const grid = createGrid(cols, rows);
    const aliveProbability = Math.random() * 0.5 + 0.2;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() < aliveProbability ? 1 : 0;
        }
    }
    return grid;
}

function toggleCell(event) {
    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);
    grid[x][y] = grid[x][y] ? 0 : 1;
    drawGrid();
}

function createGrid(cols, rows) {
    const newGrid = [];
    for (let i = 0; i < cols; i++) {
        newGrid[i] = [];
        for (let j = 0; j < rows; j++) {
            newGrid[i][j] = 0;
        }
    }
    return newGrid;
}

function drawGrid() {
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.fillStyle = grid[x][y] ? "black" : "white";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function updateGrid() {
    const newGrid = createGrid(cols, rows);
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const ni = (x + i + cols) % cols;
                    const nj = (y + j + rows) % rows;
                    neighbors += grid[ni][nj];
                }
            }
            if (grid[x][y] === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[x][y] = 0;
            } else if (grid[x][y] === 0 && neighbors === 3) {
                newGrid[x][y] = 1;
            } else {
                newGrid[x][y] = grid[x][y];
            }
        }
    }
    return newGrid;
}

function gameLoop() {
    if (running) {
        if (
            gridHistory.length === 0 ||
            JSON.stringify(grid) !==
                JSON.stringify(gridHistory[gridHistory.length - 1])
        ) {
            gridHistory.push(JSON.parse(JSON.stringify(grid)));
        }
        grid = updateGrid();
        drawGrid();
    }
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 1000 / fps);
}

requestAnimationFrame(gameLoop);
