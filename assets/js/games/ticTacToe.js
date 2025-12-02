export default class TicTacToeEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.board = Array(9).fill(null);
        this.xIsNext = true;
        this.winner = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center">
                <div id="ttt-status" class="text-xl font-bold mb-6 text-gray-700">Player X's Turn</div>
                <div class="grid grid-cols-3 gap-2 bg-gray-300 p-2 rounded-lg">
                    ${this.board.map((_, i) => `<button data-index="${i}" class="game-cell-ttt w-20 h-20 bg-white rounded text-4xl font-black flex items-center justify-center text-gray-800 shadow-sm"></button>`).join('')}
                </div>
            </div>
        `;
        this.container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleClick(parseInt(e.target.dataset.index)));
        });
        this.updateStatus();
    }

    handleClick(i) {
        if (this.board[i] || this.winner) return;
        this.board[i] = this.xIsNext ? 'X' : 'O';
        this.xIsNext = !this.xIsNext;
        this.checkWinner();
        this.renderBoard();
        this.updateStatus();
    }

    checkWinner() {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let [a,b,c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                return;
            }
        }
        if (!this.board.includes(null)) this.winner = 'Draw';
    }

    renderBoard() {
        const buttons = this.container.querySelectorAll('button');
        this.board.forEach((cell, i) => {
            buttons[i].textContent = cell || '';
            if (cell === 'X') buttons[i].classList.add('text-indigo-600');
            if (cell === 'O') buttons[i].classList.add('text-rose-500');
        });
    }

    updateStatus() {
        const statusEl = document.getElementById('ttt-status');
        if (this.winner === 'Draw') {
            statusEl.textContent = "It's a Draw!";
            statusEl.className = "text-xl font-bold mb-6 text-gray-500";
            this.onStatusChange('Game Over - Draw');
        } else if (this.winner) {
            statusEl.textContent = `Winner: ${this.winner} 🎉`;
            statusEl.className = "text-xl font-bold mb-6 text-green-600 animate-bounce";
            this.onStatusChange('Game Over - Win');
        } else {
            statusEl.textContent = `Next Player: ${this.xIsNext ? 'X' : 'O'}`;
            statusEl.className = "text-xl font-bold mb-6 text-gray-700";
            this.onStatusChange('Playing...');
        }
    }
}

// 2. SNAKE ENGINE
