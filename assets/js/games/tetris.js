export default class TetrisEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.COLS = 10;
        this.ROWS = 20;
        this.SIZE = 24; // Pixel size of each block
        this.canvasSize = this.COLS * this.SIZE;
        this.pieceTemplates = [
            { shape: [[1,1,1,1]], color: '#00ffff' }, // I
            { shape: [[0,1,0],[1,1,1]], color: '#800080' }, // T
            { shape: [[1,1,0],[0,1,1]], color: '#ff0000' }, // Z
            { shape: [[0,1,1],[1,1,0]], color: '#00ff00' }, // S
            { shape: [[1,1],[1,1]], color: '#ffff00' }, // O
            { shape: [[1,0,0],[1,1,1]], color: '#ffa500' }, // L
            { shape: [[0,0,1],[1,1,1]], color: '#0000ff' }  // J
        ];
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.currentPiece = null;
        this.gameLoop = null;
        this.isGameOver = false;
        this.keyListener = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchListeners = [];
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                <canvas id="tetris-canvas" width="${this.canvasSize}" height="${this.ROWS * this.SIZE}" class="game-board-tetris border-4 border-gray-900"></canvas>
                <div class="bg-gray-100 p-4 rounded-lg shadow-inner w-full md:w-auto">
                    <div class="text-lg font-bold mb-2">Score: <span id="tetris-score">0</span></div>
                    <div class="text-lg font-bold mb-4">Level: <span id="tetris-level">1</span></div>
                    <div class="mt-4 text-sm text-gray-500">Controls:</div>
                    <ul class="text-xs text-gray-600 list-disc list-inside">
                        <li>← / →: Move (or Horizontal Swipe)</li>
                        <li>↑ / X: Rotate (or Tap)</li>
                        <li>↓ / S: Soft Drop (or Swipe Down)</li>
                        <li>Space: Hard Drop (or Double Tap)</li>
                    </ul>
                    <div id="tetris-message" class="mt-4 text-red-500 font-bold hidden"></div>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startGame();
        this.bindControls();
    }

    bindControls() {
        this.keyListener = this.handleKey.bind(this);
        document.addEventListener('keydown', this.keyListener);
        this.bindTouchControls();
    }
    
    bindTouchControls() {
        const swipeThreshold = 30; // Min pixels for a swipe
        let touchStartTime = 0;
        let lastTapTime = 0;
        const doubleTapDelay = 300;

        const handleTouchStart = (e) => {
            if (this.isGameOver) return;
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (this.isGameOver) return;
            e.preventDefault();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            const dt = Date.now() - touchStartTime;

            if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
                // Swipe detected
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal swipe
                    dx > 0 ? this.movePiece(1, 0) : this.movePiece(-1, 0);
                } else {
                    // Vertical swipe
                    dy > swipeThreshold ? this.softDrop() : (dy < -swipeThreshold ? this.rotatePiece() : null); // Swipe down for soft drop, up for rotate
                }
            } else if (dt < 250) {
                // Tap detected
                if (Date.now() - lastTapTime < doubleTapDelay) {
                    // Double tap: Hard Drop
                    this.hardDrop();
                    lastTapTime = 0; // Reset for next tap sequence
                } else {
                    // Single tap: Rotate
                    this.rotatePiece();
                    lastTapTime = Date.now();
                }
            }
            this.draw();
        };

        this.canvas.addEventListener('touchstart', handleTouchStart);
        this.canvas.addEventListener('touchend', handleTouchEnd);

        this.touchListeners = [
            { event: 'touchstart', handler: handleTouchStart },
            { event: 'touchend', handler: handleTouchEnd }
        ];
    }
    
    handleKey(e) {
        if (this.isGameOver || !this.currentPiece) return;
        switch(e.key) {
            case 'ArrowLeft': case 'a': this.movePiece(-1, 0); break;
            case 'ArrowRight': case 'd': this.movePiece(1, 0); break;
            case 'ArrowUp': case 'x': this.rotatePiece(); break;
            case 'ArrowDown': case 's': this.softDrop(); break;
            case ' ': e.preventDefault(); this.hardDrop(); break;
        }
    }

    newPiece() {
        const template = this.pieceTemplates[Math.floor(Math.random() * this.pieceTemplates.length)];
        this.currentPiece = {
            shape: template.shape,
            color: template.color,
            x: Math.floor(this.COLS / 2) - Math.floor(template.shape[0].length / 2),
            y: 0
        };
        if (this.checkCollision(0, 0, this.currentPiece.shape)) {
            this.gameOver();
        }
    }

    checkCollision(dx, dy, newShape) {
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x] === 1) {
                    const newX = this.currentPiece.x + x + dx;
                    const newY = this.currentPiece.y + y + dy;
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS || (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    movePiece(dx, dy) {
        if (!this.checkCollision(dx, dy, this.currentPiece.shape)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        }
        this.draw();
    }

    rotatePiece() {
        const originalShape = this.currentPiece.shape;
        const N = originalShape.length;
        const newShape = Array.from({ length: N }, () => Array(N).fill(0));
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                newShape[x][N - 1 - y] = originalShape[y][x];
            }
        }
        if (!this.checkCollision(0, 0, newShape)) {
            this.currentPiece.shape = newShape;
        }
        this.draw();
    }

    softDrop() {
        if (this.checkCollision(0, 1, this.currentPiece.shape)) {
            this.lockPiece();
        } else {
            this.currentPiece.y++;
        }
        this.draw();
    }

    hardDrop() {
        while (!this.checkCollision(0, 1, this.currentPiece.shape)) {
            this.currentPiece.y++;
        }
        this.lockPiece();
        this.draw();
    }

    lockPiece() {
        const { shape, color, x, y } = this.currentPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    if (y + row >= 0) {
                        this.board[y + row][x + col] = color;
                    }
                }
            }
        }
        this.clearLines();
        this.newPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1); // Remove full line
                this.board.unshift(Array(this.COLS).fill(0)); // Add new empty line at top
                linesCleared++;
                y++; // Recheck the same row index
            }
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 100 * this.level;
            document.getElementById('tetris-score').textContent = this.score;
            this.onStatusChange(`Lines Cleared: ${linesCleared}`);
        }
    }

    draw() {
        this.ctx.fillStyle = '#0d0d0d';
        this.ctx.fillRect(0, 0, this.canvasSize, this.ROWS * this.SIZE);

        // Draw settled blocks
        for (let y = 0; y < this.ROWS; y++) {
            for (let x = 0; x < this.COLS; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            const { shape, color, x, y } = this.currentPiece;
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) {
                        this.drawBlock(x + col, y + row, color);
                    }
                }
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.SIZE, y * this.SIZE, this.SIZE - 1, this.SIZE - 1);
    }

    startGame() {
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        document.getElementById('tetris-score').textContent = this.score;
        document.getElementById('tetris-level').textContent = this.level;
        document.getElementById('tetris-message').classList.add('hidden');
        this.onStatusChange('Playing...');
        this.newPiece();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => {
            this.softDrop();
            this.draw();
        }, 1000 / this.level); // Speed increases with level
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.onStatusChange('Game Over');
        document.getElementById('tetris-message').textContent = `Game Over! Score: ${this.score}`;
        document.getElementById('tetris-message').classList.remove('hidden');
    }

    cleanup() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.keyListener);
         // Clean up touch listeners
        this.touchListeners.forEach(({ event, handler }) => {
            this.canvas.removeEventListener(event, handler);
        });
    }
}

// 6. 2048 ENGINE
