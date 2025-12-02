import { GAME_DATA } from './data.js';
import RockPaperScissorsEngine from './games/rps.js';
import TicTacToeEngine from './games/ticTacToe.js';
import SnakeEngine from './games/snake.js';
import TetrisEngine from './games/tetris.js';
import TwentyFortyEightEngine from './games/twentyFortyEight.js';
import WordleEngine from './games/wordle.js';
import MemoryEngine from './games/memory.js';

const App = {
    activeEngine: null,
    grid: null,

    init() {
        this.grid = document.getElementById('game-grid');
        this.bindGridClicks();
        this.renderCharts();
        this.renderGameGrid('all');
        this.setupFilters();
        this.setupModal();
    },

    bindGridClicks() {
        this.grid.addEventListener('click', (event) => {
            const card = event.target.closest('[data-game]');
            if (card) {
                this.openGame(card.dataset.game);
            }
        });
    },

    renderCharts() {
        const categories = [...new Set(GAME_DATA.map((g) => g.category))];
        const catCounts = categories.map((c) => GAME_DATA.filter((g) => g.category === c).length);

        new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: categories.map((c) => c.split(' ')[0]),
                datasets: [
                    {
                        data: catCounts,
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'],
                    },
                ],
            },
            options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
        });

        const playable = GAME_DATA.filter((g) => g.status === 'playable').length;
        const placeholders = GAME_DATA.length - playable;

        new Chart(document.getElementById('statusChart'), {
            type: 'bar',
            data: {
                labels: ['Playable Demos', 'Placeholders'],
                datasets: [
                    {
                        label: 'Count',
                        data: [playable, placeholders],
                        backgroundColor: ['#10b981', '#e5e7eb'],
                        borderRadius: 5,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } },
            },
        });
    },

    setupFilters() {
        const categories = ['all', ...new Set(GAME_DATA.map((g) => g.category))];
        const container = document.getElementById('filter-container');
        container.innerHTML = categories
            .map(
                (category) => `
                    <button class="filter-btn px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-all ${
                        category === 'all' ? 'bg-gray-900 text-white border-transparent' : ''
                    }" data-category="${category}">
                        ${category === 'all' ? 'All Games' : category}
                    </button>
                `,
            )
            .join('');

        container.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach((button) => {
                    button.classList.remove('bg-gray-900', 'text-white');
                    button.classList.add('bg-white', 'text-gray-700');
                });
                event.target.classList.remove('bg-white', 'text-gray-700');
                event.target.classList.add('bg-gray-900', 'text-white');

                this.renderGameGrid(event.target.dataset.category);
            }
        });
    },

    renderGameGrid(filter) {
        const filtered = filter === 'all' ? GAME_DATA : GAME_DATA.filter((game) => game.category === filter);

        this.grid.innerHTML = filtered
            .map(
                (game) => `
                    <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${
                        game.status === 'playable' ? 'border-green-200' : 'border-gray-100'
                    } flex flex-col items-center text-center group" data-game="${game.name}">
                        <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">${game.icon}</div>
                        <h3 class="font-bold text-gray-800 text-sm mb-1">${game.name}</h3>
                        <span class="text-xs px-2 py-1 rounded-full ${
                            game.status === 'playable' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }">
                            ${game.status === 'playable' ? 'PLAY NOW' : 'Coming Soon'}
                        </span>
                    </div>
                `,
            )
            .join('');
    },

    openGame(gameName) {
        const game = GAME_DATA.find((entry) => entry.name === gameName);
        if (!game) return;

        const modal = document.getElementById('game-modal');
        const title = document.getElementById('modal-title');
        const cat = document.getElementById('modal-category');
        const container = document.getElementById('game-stage');
        const restartBtn = document.getElementById('restart-btn');
        const statusText = document.getElementById('game-status-text');

        if (this.activeEngine?.cleanup) this.activeEngine.cleanup();
        if (this.activeEngine?.gameLoop) clearInterval(this.activeEngine.gameLoop);
        this.activeEngine = null;

        modal.classList.remove('hidden');
        title.textContent = game.name;
        cat.textContent = game.category;
        container.innerHTML = '';
        restartBtn.classList.add('hidden');
        statusText.textContent = 'Status: Ready';

        if (game.status === 'playable') {
            restartBtn.classList.remove('hidden');
            restartBtn.onclick = () => this.openGame(gameName);

            if (game.name === 'Snake') this.activeEngine = new SnakeEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === 'Tetris') this.activeEngine = new TetrisEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === '2048')
                this.activeEngine = new TwentyFortyEightEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === 'Tic-Tac-Toe')
                this.activeEngine = new TicTacToeEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === 'Wordle Clone')
                this.activeEngine = new WordleEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === 'Memory Match')
                this.activeEngine = new MemoryEngine(container, (s) => (statusText.textContent = s));
            else if (game.name === 'Rock Paper Scissors')
                this.activeEngine = new RockPaperScissorsEngine(container, (s) => (statusText.textContent = s));
        } else {
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
            if (this.activeEngine?.cleanup) this.activeEngine.cleanup();
            if (this.activeEngine?.gameLoop) clearInterval(this.activeEngine.gameLoop);
            this.activeEngine = null;
        };
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    window.App = App;
});
