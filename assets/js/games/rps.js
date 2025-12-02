export default class RockPaperScissorsEngine {
    constructor(container, onStatusChange) {
        this.container = container;
        this.onStatusChange = onStatusChange;
        this.choices = {
            'rock': { icon: '✊', beats: 'scissors' },
            'paper': { icon: '🖐️', beats: 'rock' },
            'scissors': { icon: '✌️', beats: 'paper' }
        };
        this.playerScore = 0;
        this.computerScore = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center p-4 w-full max-w-sm">
                <div class="flex justify-between w-full mb-6 text-xl font-bold">
                    <span>You: <span id="rps-player-score">${this.playerScore}</span></span>
                    <span>Computer: <span id="rps-comp-score">${this.computerScore}</span></span>
                </div>
                <div id="rps-result-display" class="text-center mb-8">
                    <div class="flex justify-around w-full space-x-4">
                        <div class="p-4 bg-white rounded-lg shadow-md w-24 h-24 flex flex-col items-center justify-center">
                            <span id="rps-player-move" class="text-5xl">?</span>
                            <span class="text-xs text-gray-500 mt-1">Your Move</span>
                        </div>
                        <div class="p-4 bg-white rounded-lg shadow-md w-24 h-24 flex flex-col items-center justify-center">
                            <span id="rps-comp-move" class="text-5xl">?</span>
                            <span class="text-xs text-gray-500 mt-1">Comp Move</span>
                        </div>
                    </div>
                    <p id="rps-message" class="text-2xl font-black mt-6 h-8 text-gray-700">Choose your weapon!</p>
                </div>
                <div class="flex justify-between w-full space-x-4 mt-4" id="rps-controls">
                    <button data-choice="rock" class="rps-btn bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-xl text-4xl shadow-lg w-1/3 transition">✊</button>
                    <button data-choice="paper" class="rps-btn bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-xl text-4xl shadow-lg w-1/3 transition">🖐️</button>
                    <button data-choice="scissors" class="rps-btn bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-xl text-4xl shadow-lg w-1/3 transition">✌️</button>
                </div>
            </div>
        `;
        this.bindControls();
        this.onStatusChange('Select a choice to play the next round.');
    }

    bindControls() {
        const controls = document.getElementById('rps-controls');
        controls.addEventListener('click', (e) => {
            if (e.target.closest('.rps-btn')) {
                this.playRound(e.target.closest('.rps-btn').dataset.choice);
            }
        });
    }

    playRound(playerChoice) {
        const choicesArray = Object.keys(this.choices);
        const computerChoice = choicesArray[Math.floor(Math.random() * choicesArray.length)];
        
        let result = '';
        let message = '';
        
        if (playerChoice === computerChoice) {
            result = 'draw';
            message = 'It\'s a Tie!';
        } else if (this.choices[playerChoice].beats === computerChoice) {
            result = 'win';
            message = 'You Win This Round! 🎉';
            this.playerScore++;
        } else {
            result = 'lose';
            message = 'Computer Wins! 🤖';
            this.computerScore++;
        }

        document.getElementById('rps-player-move').textContent = this.choices[playerChoice].icon;
        document.getElementById('rps-comp-move').textContent = this.choices[computerChoice].icon;
        document.getElementById('rps-message').textContent = message;
        
        document.getElementById('rps-player-score').textContent = this.playerScore;
        document.getElementById('rps-comp-score').textContent = this.computerScore;

        this.onStatusChange(`Round played. Result: ${result.toUpperCase()}`);
    }

    cleanup() {
        // No external listeners to clean up
    }
}

// 1. TIC-TAC-TOE ENGINE
