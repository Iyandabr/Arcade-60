export default class TwentyFortyEightEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.SIZE = 4;
        this.board = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
        this.score = 0;
        this.keyListener = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="text-xl font-bold mb-4">Score: <span id="2048-score">0</span></div>
                <div id="2048-grid" class="grid grid-cols-4 gap-2 tile-container-2048" style="width: 272px; height: 272px;"></div>
                <div class="mt-4 text-sm text-gray-500 text-center">Use Arrow Keys or Swipe on mobile.</div>
                <div id="2048-message" class="mt-4 text-red-500 font-bold hidden"></div>
            </div>
        `;
        this.startGame();
        this.bindControls();
    }

    bindControls() {
        this.keyListener = this.handleKey.bind(this);
        document.addEventListener('keydown', this.keyListener);
    }

    startGame() {
        this.board = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
        this.score = 0;
        document.getElementById('2048-score').textContent = this.score;
        document.getElementById('2048-message').classList.add('hidden');
        this.onStatusChange('Playing...');
        this.addRandomTile();
        this.addRandomTile();
        this.drawBoard();
    }

    addRandomTile() {
        let empty = [];
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (this.board[r][c] === 0) empty.push({r, c});
            }
        }
        if (empty.length > 0) {
            const {r, c} = empty[Math.floor(Math.random() * empty.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    drawBoard() {
        const grid = document.getElementById('2048-grid');
        grid.innerHTML = '';
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const val = this.board[r][c];
                const tile = document.createElement('div');
                tile.className = `tile-2048 tile-${val}`;
                tile.textContent = val > 0 ? val : '';
                grid.appendChild(tile);
            }
        }
    }
    
    handleKey(e) {
        if (this.isGameOver) return;
        let moved = false;
        switch(e.key) {
            case 'ArrowLeft': case 'a': moved = this.moveLeft(); break;
            case 'ArrowRight': case 'd': moved = this.moveRight(); break;
            case 'ArrowUp': case 'w': moved = this.moveUp(); break;
            case 'ArrowDown': case 's': moved = this.moveDown(); break;
        }
        if (moved) {
            this.addRandomTile();
            this.drawBoard();
            this.checkGameOver();
        }
    }

    // Core move/merge logic (abstracted for clarity)
    move(isVertical, isReverse) {
        let moved = false;
        for (let i = 0; i < this.SIZE; i++) {
            let line = [];
            for (let j = 0; j < this.SIZE; j++) {
                const val = isVertical ? this.board[j][i] : this.board[i][j];
                if (val !== 0) line.push(val);
            }
            
            if (isReverse) line.reverse();
            
            let new_line = [];
            for (let k = 0; k < line.length; k++) {
                if (k + 1 < line.length && line[k] === line[k+1]) {
                    new_line.push(line[k] * 2);
                    this.score += line[k] * 2;
                    k++;
                } else {
                    new_line.push(line[k]);
                }
            }
            
            while (new_line.length < this.SIZE) new_line.push(0);
            if (isReverse) new_line.reverse();
            
            // Check if board changed
            let original_line = [];
            for (let j = 0; j < this.SIZE; j++) {
                original_line.push(isVertical ? this.board[j][i] : this.board[i][j]);
            }

            if (original_line.join('') !== (isReverse ? new_line.slice().reverse() : new_line).join('')) moved = true;
            
            for (let j = 0; j < this.SIZE; j++) {
                if (isVertical) this.board[j][i] = new_line[j];
                else this.board[i][j] = new_line[j];
            }
        }
        document.getElementById('2048-score').textContent = this.score;
        return moved;
    }

    moveLeft() { return this.move(false, false); }
    moveRight() { return this.move(false, true); }
    moveUp() { return this.move(true, false); }
    moveDown() { return this.move(true, true); }

    checkGameOver() {
        let canMove = false;
        // Check for empty cells
        if (this.board.some(row => row.includes(0))) return;

        // Check for adjacent matches (horizontal)
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE - 1; c++) {
                if (this.board[r][c] === this.board[r][c+1]) canMove = true;
            }
        }
        // Check for adjacent matches (vertical)
        for (let r = 0; r < this.SIZE - 1; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (this.board[r][c] === this.board[r+1][c]) canMove = true;
            }
        }

        if (!canMove) {
            this.isGameOver = true;
            this.onStatusChange('Game Over');
            document.getElementById('2048-message').textContent = `Game Over! Score: ${this.score}`;
            document.getElementById('2048-message').classList.remove('hidden');
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }
}

// 3. WORDLE ENGINE
