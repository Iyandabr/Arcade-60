export default class MemoryEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.icons = ['🍎', '🍌', '🍇', '🍓', '🥝', '🍉', '🍍', '🥭'];
        this.cards = [];
        this.flipped = [];
        this.matched = [];
        this.lockBoard = false;
        this.turns = 0;
        this.init();
    }

    init() {
        // Duplicate and shuffle
        const deck = [...this.icons, ...this.icons].sort(() => 0.5 - Math.random());
        this.cards = deck.map((icon, id) => ({ id, icon }));
        
        this.container.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="mb-4 text-lg font-semibold text-indigo-900">Turns: <span id="mem-turns">0</span></div>
                <div class="grid grid-cols-4 gap-3" id="mem-grid"></div>
            </div>
        `;
        
        const grid = document.getElementById('mem-grid');
        this.cards.forEach((card, index) => {
            const el = document.createElement('div');
            el.className = "relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer perspective-1000";
            el.innerHTML = `
                <div class="w-full h-full transition-transform duration-500 transform-style-3d shadow-lg rounded-lg" id="card-${index}">
                    <div class="absolute w-full h-full bg-indigo-500 backface-hidden rounded-lg flex items-center justify-center text-white text-2xl">❓</div>
                    <div class="absolute w-full h-full bg-indigo-200 backface-hidden rotate-y-180 rounded-lg flex items-center justify-center text-4xl border-2 border-indigo-500">${card.icon}</div>
                </div>
            `;
            el.addEventListener('click', () => this.flipCard(index));
            grid.appendChild(el);
        });
    }

    flipCard(index) {
        if (this.lockBoard || this.flipped.includes(index) || this.matched.includes(index)) return;
        
        const cardEl = document.getElementById(`card-${index}`);
        cardEl.classList.add('rotate-y-180');
        this.flipped.push(index);

        if (this.flipped.length === 2) {
            this.turns++;
            document.getElementById('mem-turns').textContent = this.turns;
            this.checkForMatch();
        }
    }

    checkForMatch() {
        this.lockBoard = true;
        const [id1, id2] = this.flipped;
        const isMatch = this.cards[id1].icon === this.cards[id2].icon;

        if (isMatch) {
            this.matched.push(id1, id2);
            this.flipped = [];
            this.lockBoard = false;
            if (this.matched.length === this.cards.length) this.onStatusChange(`Won in ${this.turns} turns!`);
        } else {
            setTimeout(() => {
                document.getElementById(`card-${id1}`).classList.remove('rotate-y-180');
                document.getElementById(`card-${id2}`).classList.remove('rotate-y-180');
                this.flipped = [];
                this.lockBoard = false;
            }, 1000);
        }
    }
}

// --- APP LOGIC ---

const App = {
    activeEngine: null,

    init() {
        this.renderCharts();
        this.renderGameGrid('all');
        this.setupFilters();
        this.setupModal();
    },

    // Visualization: Charts using Chart.js
    renderCharts() {
        // 1. Category Chart
        const categories = [...new Set(GAME_DATA.map(g => g.category))];
        const catCounts = categories.map(c => GAME_DATA.filter(g => g.category === c).length);
        
        new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: categories.map(c => c.split(' ')[0]), // Shorten labels
                datasets: [{
                    data: catCounts,
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });

        // 2. Status Chart
        const playable = GAME_DATA.filter(g => g.status === 'playable').length;
        const placeholders = GAME_DATA.length - playable;
        
        new Chart(document.getElementById('statusChart'), {
            type: 'bar',
            data: {
                labels: ['Playable Demos', 'Placeholders'],
                datasets: [{
                    label: 'Count',
                    data: [playable, placeholders],
                    backgroundColor: ['#10b981', '#e5e7eb'],
                    borderRadius: 5
                }]
            },
            options: { 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } }
            }
        });
    },

    // Navigation: Render Categories
    setupFilters() {
        const categories = ["all", ...new Set(GAME_DATA.map(g => g.category))];
        const container = document.getElementById('filter-container');
        container.innerHTML = categories.map(c => 
            `<button class="filter-btn px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-all ${c === 'all' ? 'bg-gray-900 text-white border-transparent' : ''}" data-category="${c}">
                ${c === 'all' ? 'All Games' : c}
            </button>`
        ).join('');

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Update UI
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('bg-gray-900', 'text-white');
                    b.classList.add('bg-white', 'text-gray-700');
                });
                e.target.classList.remove('bg-white', 'text-gray-700');
                e.target.classList.add('bg-gray-900', 'text-white');
                
                // Filter Grid
                this.renderGameGrid(e.target.dataset.category);
            }
        });
    },

    // Core: Render Grid
    renderGameGrid(filter) {
        const grid = document.getElementById('game-grid');
        const filtered = filter === 'all' ? GAME_DATA : GAME_DATA.filter(g => g.category === filter);
        
        grid.innerHTML = filtered.map((game, index) => `
            <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${game.status === 'playable' ? 'border-green-200' : 'border-gray-100'} flex flex-col items-center text-center group" onclick="App.openGame('${game.name}')">
                <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">${game.icon}</div>
                <h3 class="font-bold text-gray-800 text-sm mb-1">${game.name}</h3>
                <span class="text-xs px-2 py-1 rounded-full ${game.status === 'playable' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}">
                    ${game.status === 'playable' ? 'PLAY NOW' : 'Coming Soon'}
                </span>
            </div>
        `).join('');
    },

    // Interaction: Open Game
    openGame(gameName) {
        const game = GAME_DATA.find(g => g.name === gameName);
        if (!game) return;

        const modal = document.getElementById('game-modal');
        const title = document.getElementById('modal-title');
        const cat = document.getElementById('modal-category');
        const container = document.getElementById('game-stage');
        const restartBtn = document.getElementById('restart-btn');
        const statusText = document.getElementById('game-status-text');

        // Cleanup previous engine before starting a new one
        if (this.activeEngine && this.activeEngine.cleanup) this.activeEngine.cleanup();
        if (this.activeEngine && this.activeEngine.gameLoop) clearInterval(this.activeEngine.gameLoop);
        this.activeEngine = null;

        // UI Setup
        modal.classList.remove('hidden');
        title.textContent = game.name;
        cat.textContent = game.category;
        container.innerHTML = ''; // Clear previous
        restartBtn.classList.add('hidden');
        statusText.textContent = "Status: Ready";

        // Engine Router
        if (game.status === 'playable') {
            restartBtn.classList.remove('hidden');
            restartBtn.onclick = () => this.openGame(gameName); // Simple reload

            if (game.name === 'Snake') this.activeEngine = new SnakeEngine(container, (s) => statusText.textContent = s);
            else if (game.name === 'Tetris') this.activeEngine = new TetrisEngine(container, (s) => statusText.textContent = s);
            else if (game.name === '2048') this.activeEngine = new TwentyFortyEightEngine(container, (s) => statusText.textContent = s);
            else if (game.name === 'Tic-Tac-Toe') this.activeEngine = new TicTacToeEngine(container, (s) => statusText.textContent = s);
            else if (game.name === 'Wordle Clone') this.activeEngine = new WordleEngine(container, (s) => statusText.textContent = s);
            else if (game.name === 'Memory Match') this.activeEngine = new MemoryEngine(container, (s) => statusText.textContent = s);
            else if (game.name === 'Rock Paper Scissors') this.activeEngine = new RockPaperScissorsEngine(container, (s) => statusText.textContent = s);

        } else {
            // Placeholder View
            container.innerHTML = `
                <div class="text-center p-10 border-4 border-dashed border-gray-200 rounded-xl">
                    <div class="text-6xl mb-4 grayscale opacity-50">${game.icon}</div>
                    <h3 class="text-xl font-bold text-gray-400">Implementation Pending</h3>
                    <p class="text-gray-400 mt-2 max-w-xs mx-auto">This game slot is reserved. Logic to be injected in future updates.</p>
                </div>
            `;
        }
    },

    setupModal() {
        const modal = document.getElementById('game-modal');
        document.getElementById('close-modal').onclick = () => {
            modal.classList.add('hidden');
            if (this.activeEngine && this.activeEngine.cleanup) this.activeEngine.cleanup();
            if (this.activeEngine && this.activeEngine.gameLoop) clearInterval(this.activeEngine.gameLoop);
            this.activeEngine = null;
        };
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => App.init());

