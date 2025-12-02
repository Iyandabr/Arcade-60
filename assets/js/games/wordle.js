export default class WordleEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.target = "REACT"; // Static for demo
        this.guesses = [];
        this.currentGuess = "";
        this.maxGuesses = 6;
        this.gameOver = false;
        this.keyListener = null;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center">
                <div id="wordle-grid" class="grid grid-rows-6 gap-2 mb-6"></div>
                <div id="wordle-kb" class="grid gap-1"></div>
                <div id="wordle-msg" class="h-6 text-sm font-bold text-red-500 mt-2"></div>
            </div>
        `;
        this.renderGrid();
        this.renderKeyboard();
        this.keyListener = this.handleKey.bind(this);
        document.addEventListener('keydown', this.keyListener);
    }

    handleKey(e) {
        if (this.gameOver) return;
        const key = e.key.toUpperCase();
        if (key === 'ENTER') this.submitGuess();
        else if (key === 'BACKSPACE') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.renderGrid();
        }
        else if (/^[A-Z]$/.test(key) && this.currentGuess.length < 5) {
            this.currentGuess += key;
            this.renderGrid();
        }
    }

    submitGuess() {
        if (this.currentGuess.length !== 5) {
            this.showMessage("Too short!");
            return;
        }
        this.guesses.push(this.currentGuess);
        
        if (this.currentGuess === this.target) {
            this.gameOver = true;
            this.showMessage("You Won! 🎉", "text-green-600");
            this.onStatusChange("Victory!");
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.showMessage(`Game Over! Word: ${this.target}`, "text-red-600");
            this.onStatusChange("Defeat");
        }
        
        this.currentGuess = "";
        this.renderGrid();
        this.renderKeyboard();
    }

    renderGrid() {
        const grid = document.getElementById('wordle-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = "grid grid-cols-5 gap-2";
            const guess = this.guesses[i] || (i === this.guesses.length ? this.currentGuess : "");
            
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                const letter = guess[j] || "";
                let colorClass = "bg-white border-2 border-gray-300 text-black";
                
                if (i < this.guesses.length) {
                    // Logic for coloring submitted guesses
                    if (this.target[j] === letter) colorClass = "bg-green-500 text-white border-green-500";
                    else if (this.target.includes(letter)) colorClass = "bg-yellow-500 text-white border-yellow-500";
                    else colorClass = "bg-gray-500 text-white border-gray-500";
                }
                
                cell.className = `${colorClass} w-12 h-12 flex items-center justify-center font-bold text-xl uppercase rounded`;
                cell.textContent = letter;
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }
    }

    renderKeyboard() {
        // Simplified virtual keyboard render for visual context
        const kb = document.getElementById('wordle-kb');
        if(kb.children.length === 0) {
             kb.innerHTML = `<div class="text-xs text-gray-400 text-center">Type using your physical keyboard</div>`;
        }
    }

    showMessage(msg, color = "text-red-500") {
        const el = document.getElementById('wordle-msg');
        el.textContent = msg;
        el.className = `h-6 text-sm font-bold mt-2 ${color}`;
        setTimeout(() => el.textContent = "", 2000);
    }

    cleanup() {
        document.removeEventListener('keydown', this.keyListener);
    }
}

// 4. MEMORY MATCH ENGINE
