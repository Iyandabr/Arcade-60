export default class SnakeEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.canvasSize = 300;
        this.gridSize = 15; // Bigger cells
        this.cellSize = this.canvasSize / this.gridSize;
        this.snake = [{x: 5, y: 5}];
        this.food = {x: 10, y: 10};
        this.direction = {x: 1, y: 0};
        this.score = 0;
        this.gameLoop = null;
        this.isGameOver = false;
        this.keyListener = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="text-xl font-bold mb-2">Score: <span id="snake-score">0</span></div>
                <canvas id="snake-canvas" width="${this.canvasSize}" height="${this.canvasSize}" class="game-board-snake"></canvas>
                <div class="mt-4 text-sm text-gray-500">Use Arrow Keys or W/A/S/D to move</div>
                <div class="mt-4 grid grid-cols-3 gap-2 md:hidden">
                    <div></div><button id="btn-up" class="p-4 bg-gray-200 rounded">⬆️</button><div></div>
                    <button id="btn-left" class="p-4 bg-gray-200 rounded">⬅️</button><div></div><button id="btn-right" class="p-4 bg-gray-200 rounded">➡️</button>
                    <div></div><button id="btn-down" class="p-4 bg-gray-200 rounded">⬇️</button><div></div>
                </div>
            </div>
        `;
        this.ctx = document.getElementById('snake-canvas').getContext('2d');
        this.bindControls();
        this.startGame();
    }

    bindControls() {
        this.keyListener = this.handleKey.bind(this);
        document.addEventListener('keydown', this.keyListener);
        // Touch controls
        document.getElementById('btn-up')?.addEventListener('click', () => this.setDir(0, -1));
        document.getElementById('btn-down')?.addEventListener('click', () => this.setDir(0, 1));
        document.getElementById('btn-left')?.addEventListener('click', () => this.setDir(-1, 0));
        document.getElementById('btn-right')?.addEventListener('click', () => this.setDir(1, 0));
    }

    handleKey(e) {
        switch(e.key) {
            case 'ArrowUp': case 'w': this.setDir(0, -1); break;
            case 'ArrowDown': case 's': this.setDir(0, 1); break;
            case 'ArrowLeft': case 'a': this.setDir(-1, 0); break;
            case 'ArrowRight': case 'd': this.setDir(1, 0); break;
        }
    }

    setDir(x, y) {
        if (this.direction.x === -x && this.direction.y === -y) return; // Prevent 180 turn
        this.direction = {x, y};
    }

    startGame() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 150);
        this.onStatusChange('Playing...');
    }

    update() {
        if (this.isGameOver) return;
        
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};

        // Collision Check
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize || this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Eat Food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('snake-score').textContent = this.score;
            this.placeFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    placeFood() {
        let newFood;
        do {
            newFood = {x: Math.floor(Math.random() * this.gridSize), y: Math.floor(Math.random() * this.gridSize)};
        } while (this.snake.some(s => s.x === newFood.x && s.y === newFood.y));
        this.food = newFood;
    }

    draw() {
        this.ctx.fillStyle = '#111827';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        // Food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(this.food.x * this.cellSize, this.food.y * this.cellSize, this.cellSize-2, this.cellSize-2);

        // Snake
        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
            this.ctx.fillRect(seg.x * this.cellSize, seg.y * this.cellSize, this.cellSize-2, this.cellSize-2);
        });
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Game Over", this.canvasSize/2, this.canvasSize/2);
        this.onStatusChange('Game Over');
    }

    cleanup() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.keyListener);
    }
}

// 5. TETRIS ENGINE
