/**
 * Vica Domino - Game Logic
 *
 * Rules:
 * - 15 cards, 5 values (A, B, C, D, E)
 * - Each player gets 3 cards, rest goes to bank
 * - Open game: all cards face up
 * - Highest double starts (E > D > C > B > A)
 * - Players take turns placing matching cards
 * - Doubles placed perpendicular, regular cards horizontal
 * - Can't match? Draw from bank, then play or skip
 * - First to empty hand wins!
 */

// Character icons for players (5 fun characters)
const CHARACTER_ICONS = {
    star: {
        name: 'Star',
        color: '#FFD700',
        svg: `<svg viewBox="0 0 100 100">
            <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
            <circle cx="38" cy="42" r="5" fill="#333"/>
            <circle cx="62" cy="42" r="5" fill="#333"/>
            <path d="M35 58 Q50 72 65 58" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`
    },
    cat: {
        name: 'Cat',
        color: '#FF8C00',
        svg: `<svg viewBox="0 0 100 100">
            <ellipse cx="50" cy="55" rx="35" ry="30" fill="#FF8C00"/>
            <polygon points="20,35 15,5 35,25" fill="#FF8C00" stroke="#E07000" stroke-width="2"/>
            <polygon points="80,35 85,5 65,25" fill="#FF8C00" stroke="#E07000" stroke-width="2"/>
            <ellipse cx="35" cy="50" rx="8" ry="10" fill="white"/>
            <ellipse cx="65" cy="50" rx="8" ry="10" fill="white"/>
            <circle cx="35" cy="52" r="5" fill="#333"/>
            <circle cx="65" cy="52" r="5" fill="#333"/>
            <ellipse cx="50" cy="65" rx="6" ry="4" fill="#FF69B4"/>
            <line x1="15" y1="55" x2="30" y2="58" stroke="#333" stroke-width="2"/>
            <line x1="15" y1="62" x2="30" y2="62" stroke="#333" stroke-width="2"/>
            <line x1="70" y1="58" x2="85" y2="55" stroke="#333" stroke-width="2"/>
            <line x1="70" y1="62" x2="85" y2="62" stroke="#333" stroke-width="2"/>
        </svg>`
    },
    robot: {
        name: 'Robot',
        color: '#4169E1',
        svg: `<svg viewBox="0 0 100 100">
            <rect x="25" y="30" width="50" height="55" rx="8" fill="#4169E1" stroke="#2849C1" stroke-width="2"/>
            <rect x="35" y="15" width="30" height="20" rx="5" fill="#4169E1" stroke="#2849C1" stroke-width="2"/>
            <line x1="50" y1="5" x2="50" y2="15" stroke="#2849C1" stroke-width="3"/>
            <circle cx="50" cy="5" r="5" fill="#FF4444"/>
            <rect x="32" y="40" width="15" height="12" rx="2" fill="#00FFFF"/>
            <rect x="53" y="40" width="15" height="12" rx="2" fill="#00FFFF"/>
            <rect x="38" y="65" width="24" height="8" rx="2" fill="#333"/>
            <rect x="40" y="67" width="4" height="4" fill="#00FF00"/>
            <rect x="48" y="67" width="4" height="4" fill="#00FF00"/>
            <rect x="56" y="67" width="4" height="4" fill="#00FF00"/>
            <rect x="15" y="45" width="10" height="25" rx="3" fill="#4169E1"/>
            <rect x="75" y="45" width="10" height="25" rx="3" fill="#4169E1"/>
        </svg>`
    },
    dino: {
        name: 'Dino',
        color: '#32CD32',
        svg: `<svg viewBox="0 0 100 100">
            <ellipse cx="50" cy="55" rx="35" ry="30" fill="#32CD32"/>
            <ellipse cx="50" cy="35" rx="25" ry="20" fill="#32CD32"/>
            <circle cx="38" cy="32" r="8" fill="white"/>
            <circle cx="58" cy="32" r="8" fill="white"/>
            <circle cx="40" cy="33" r="4" fill="#333"/>
            <circle cx="60" cy="33" r="4" fill="#333"/>
            <ellipse cx="50" cy="48" rx="15" ry="8" fill="#228B22"/>
            <circle cx="44" cy="46" r="2" fill="#333"/>
            <circle cx="56" cy="46" r="2" fill="#333"/>
            <path d="M30 15 L35 25 L40 15 L45 25 L50 15 L55 25 L60 15 L65 25 L70 15" stroke="#32CD32" stroke-width="6" fill="none" stroke-linecap="round"/>
        </svg>`
    },
    unicorn: {
        name: 'Unicorn',
        color: '#9370DB',
        svg: `<svg viewBox="0 0 100 100">
            <ellipse cx="50" cy="60" rx="30" ry="25" fill="#9370DB"/>
            <ellipse cx="50" cy="40" rx="22" ry="18" fill="#9370DB"/>
            <polygon points="50,5 45,35 55,35" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
            <circle cx="40" cy="38" r="6" fill="white"/>
            <circle cx="56" cy="38" r="6" fill="white"/>
            <circle cx="41" cy="39" r="3" fill="#333"/>
            <circle cx="57" cy="39" r="3" fill="#333"/>
            <ellipse cx="48" cy="52" rx="4" ry="2" fill="#FF69B4"/>
            <path d="M20 45 Q10 35 15 50 Q10 60 20 55" fill="#FF69B4"/>
            <path d="M80 45 Q90 35 85 50 Q90 60 80 55" fill="#FF69B4"/>
            <path d="M30 70 Q20 80 25 90" stroke="#FF69B4" stroke-width="4" fill="none"/>
            <path d="M40 75 Q35 85 38 95" stroke="#87CEEB" stroke-width="4" fill="none"/>
            <path d="M50 78 Q50 88 52 98" stroke="#98FB98" stroke-width="4" fill="none"/>
        </svg>`
    }
};

// Xeno icon SVG
const XENO_ICON_SVG = `<svg viewBox="0 0 100 100">
    <ellipse cx="50" cy="45" rx="20" ry="25" fill="#FF69B4"/>
    <ellipse cx="50" cy="18" rx="15" ry="12" fill="#FF69B4"/>
    <ellipse cx="44" cy="16" rx="5" ry="6" fill="white"/>
    <ellipse cx="56" cy="16" rx="5" ry="6" fill="white"/>
    <circle cx="44" cy="16" r="2.5" fill="black"/>
    <circle cx="56" cy="16" r="2.5" fill="black"/>
    <line x1="42" y1="8" x2="35" y2="0" stroke="#FF69B4" stroke-width="2"/>
    <circle cx="35" cy="0" r="3" fill="#FF1493"/>
    <line x1="58" y1="8" x2="65" y2="0" stroke="#FF69B4" stroke-width="2"/>
    <circle cx="65" cy="0" r="3" fill="#FF1493"/>
    <path d="M30 35 Q15 30 10 40" stroke="#FF69B4" stroke-width="5" fill="none"/>
    <path d="M70 35 Q85 30 90 40" stroke="#FF69B4" stroke-width="5" fill="none"/>
    <path d="M32 50 Q15 55 8 50" stroke="#FF69B4" stroke-width="5" fill="none"/>
    <path d="M68 50 Q85 55 92 50" stroke="#FF69B4" stroke-width="5" fill="none"/>
    <path d="M50 70 Q55 80 45 90 Q40 95 50 98" stroke="#FF69B4" stroke-width="6" fill="none"/>
    <path d="M43 22 Q50 28 57 22" stroke="#FF1493" stroke-width="2" fill="none"/>
</svg>`;

class VicaDominoGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.bank = [];
        this.board = []; // Array of {card, orientation, flipped}
        this.leftEnd = null; // Value at left end of board
        this.rightEnd = null; // Value at right end of board
        this.gamePhase = 'setup'; // setup, findDouble, playing, checkingWinners, ended
        this.selectedCard = null;
        this.hasDrawnThisTurn = false;
        this.winners = []; // Track multiple winners
        this.firstWinner = null; // The first player to finish
        this.playerIcons = {}; // Track selected icons for each player
        this.selectedLevel = localStorage.getItem('vicaSelectedLevel') || 'circle';

        this.initEventListeners();
        this.initGameLevelSelector();
    }

    initEventListeners() {
        // Player count selection
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPlayerCount(e));
        });

        // Start game button
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Draw from bank
        document.getElementById('draw-btn').addEventListener('click', () => this.drawFromBank());

        // Pass turn
        document.getElementById('pass-btn').addEventListener('click', () => this.passTurn());

        // New game
        document.getElementById('new-game-btn').addEventListener('click', () => this.resetToSetup());

        // Play again (from modal)
        document.getElementById('play-again-btn').addEventListener('click', () => this.resetToSetup());

        // Keyboard controls for Sun level game
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        // Only handle in Sun level game phase
        if (this.gamePhase !== 'sunLevel') return;

        const key = e.key;

        // Player 1 (left side) keys: 1, 2, 3, 4 for dominos left to right
        const player1Keys = { '1': 0, '2': 1, '3': 2, '4': 3 };
        // Player 2 key positions: 7=0, 8=1, 9=2, 0=3
        const player2KeyPositions = { '7': 0, '8': 1, '9': 2, '0': 3 };

        if (this.players.length === 1) {
            // Single player uses Player 1 keys (1, 2, 3, 4)
            if (player1Keys.hasOwnProperty(key)) {
                const cardIndex = player1Keys[key];
                const player = this.players[0];
                if (player.hand[cardIndex]) {
                    this.handleSunLevelCardClick(player.hand[cardIndex], 0, cardIndex);
                }
            }
        } else if (this.players.length === 2) {
            // Player 1 (left): keys 1, 2, 3, 4
            if (player1Keys.hasOwnProperty(key)) {
                const cardIndex = player1Keys[key];
                const player = this.players[0];
                if (player.hand[cardIndex]) {
                    this.handleSunLevelCardClick(player.hand[cardIndex], 0, cardIndex);
                }
            }
            // Player 2 (right): keys 7, 8, 9, 0 (dynamic based on card count)
            else if (player2KeyPositions.hasOwnProperty(key)) {
                const player = this.players[1];
                const numCards = player.hand.length;
                const keyPosition = player2KeyPositions[key];
                // Calculate card index: key position - offset
                // For 2 cards: keys 9,0 map to indices 0,1 (offset = 2)
                // For 3 cards: keys 8,9,0 map to indices 0,1,2 (offset = 1)
                // For 4 cards: keys 7,8,9,0 map to indices 0,1,2,3 (offset = 0)
                const offset = 4 - numCards;
                const cardIndex = keyPosition - offset;
                if (cardIndex >= 0 && player.hand[cardIndex]) {
                    this.handleSunLevelCardClick(player.hand[cardIndex], 1, cardIndex);
                }
            }
        }
    }

    initGameLevelSelector() {
        const levelBtns = document.querySelectorAll('.level-btn');

        // Set initial selection from localStorage
        levelBtns.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.level === this.selectedLevel) {
                btn.classList.add('selected');
            }
        });

        // Add click handlers
        levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected from all
                levelBtns.forEach(b => b.classList.remove('selected'));
                // Add selected to clicked
                btn.classList.add('selected');
                // Save selection
                this.selectedLevel = btn.dataset.level;
                localStorage.setItem('vicaSelectedLevel', this.selectedLevel);
            });
        });
    }

    createIconSelector(playerIndex) {
        let iconKeys = Object.keys(CHARACTER_ICONS);
        const container = document.createElement('div');
        container.className = 'icon-selector';
        container.dataset.playerIndex = playerIndex;

        // For Player 2 (index 1), swap Star and Cat positions
        if (playerIndex === 1) {
            iconKeys = [...iconKeys];
            const starIdx = iconKeys.indexOf('star');
            const catIdx = iconKeys.indexOf('cat');
            if (starIdx !== -1 && catIdx !== -1) {
                iconKeys[starIdx] = 'cat';
                iconKeys[catIdx] = 'star';
            }
        }

        iconKeys.forEach((key, idx) => {
            const icon = CHARACTER_ICONS[key];
            const iconBtn = document.createElement('button');
            iconBtn.type = 'button';
            iconBtn.className = 'icon-btn';
            iconBtn.dataset.icon = key;
            iconBtn.innerHTML = icon.svg;
            iconBtn.title = icon.name;

            // Select first icon by default for each player
            if (idx === 0) {
                iconBtn.classList.add('selected');
                this.playerIcons[playerIndex] = key;
            }

            iconBtn.addEventListener('click', () => {
                // Don't allow selecting disabled icons
                if (iconBtn.classList.contains('icon-taken')) {
                    return;
                }

                // Deselect all icons in this selector
                container.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('selected'));
                // Select this icon
                iconBtn.classList.add('selected');
                this.playerIcons[playerIndex] = key;

                // Swap clicked icon with the first icon
                const firstBtn = container.querySelector('.icon-btn');
                if (firstBtn && firstBtn !== iconBtn) {
                    container.insertBefore(iconBtn, firstBtn);
                }

                // Update icon availability across all selectors
                this.updateIconAvailability();
            });

            container.appendChild(iconBtn);
        });

        return container;
    }

    updateIconAvailability() {
        // Get all icon selectors
        const allSelectors = document.querySelectorAll('.icon-selector');

        allSelectors.forEach(selector => {
            const currentPlayerIndex = parseInt(selector.dataset.playerIndex);
            const buttons = selector.querySelectorAll('.icon-btn');

            buttons.forEach(btn => {
                const iconKey = btn.dataset.icon;

                // Check if this icon is taken by another player
                let takenByOther = false;
                for (const [playerIdx, selectedIcon] of Object.entries(this.playerIcons)) {
                    if (parseInt(playerIdx) !== currentPlayerIndex && selectedIcon === iconKey) {
                        takenByOther = true;
                        break;
                    }
                }

                if (takenByOther) {
                    btn.classList.add('icon-taken');
                } else {
                    btn.classList.remove('icon-taken');
                }
            });
        });
    }

    selectPlayerCount(e) {
        const count = parseInt(e.target.dataset.players);
        const includeXeno = e.target.dataset.xeno === 'true';
        this.includeXeno = includeXeno;
        this.playerIcons = {}; // Reset icon selections

        // Update button states
        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        // Show name inputs
        const nameInputs = document.getElementById('name-inputs');
        const playerNamesDiv = document.getElementById('player-names');
        playerNamesDiv.style.display = 'block';

        // Hide the old heading - we'll use inline labels instead
        const heading = playerNamesDiv.querySelector('h3');
        heading.style.display = 'none';

        // Hide "Choose your game:" and "How many players?" headings
        const setupPanel = document.querySelector('.setup-panel');
        const h3Elements = setupPanel.querySelectorAll('h3');
        h3Elements.forEach(h3 => h3.style.display = 'none');

        // Hide original containers
        document.querySelector('.game-level-select').style.display = 'none';
        document.querySelector('.player-select').style.display = 'none';

        // Create a row with selected level icon and player button
        let selectedRow = document.getElementById('selected-options-row');
        if (!selectedRow) {
            selectedRow = document.createElement('div');
            selectedRow.id = 'selected-options-row';
            selectedRow.className = 'selected-options-row';
            setupPanel.insertBefore(selectedRow, document.getElementById('player-names'));
        }
        selectedRow.innerHTML = '';
        selectedRow.style.display = 'flex';

        // Clone the selected level button wrapper
        const selectedLevelWrapper = document.querySelector(`.level-btn[data-level="${this.selectedLevel}"]`).parentElement.cloneNode(true);
        selectedLevelWrapper.style.display = 'flex';
        selectedRow.appendChild(selectedLevelWrapper);

        // Clone the selected player button
        const selectedPlayerBtn = e.target.cloneNode(true);
        selectedPlayerBtn.style.display = 'inline-block';
        selectedRow.appendChild(selectedPlayerBtn);

        nameInputs.innerHTML = '';
        for (let i = 0; i < count; i++) {
            // Create player row container
            const playerRow = document.createElement('div');
            playerRow.className = 'player-input-row';

            // Create icon section with label
            const iconSection = document.createElement('div');
            iconSection.className = 'input-section';
            const iconLabel = document.createElement('div');
            iconLabel.className = 'input-label';
            iconLabel.textContent = 'Choose the icon';
            iconSection.appendChild(iconLabel);
            const iconSelector = this.createIconSelector(i);
            iconSection.appendChild(iconSelector);
            playerRow.appendChild(iconSection);

            // Create name section with label
            const nameSection = document.createElement('div');
            nameSection.className = 'input-section name-section';
            const nameLabel = document.createElement('div');
            nameLabel.className = 'input-label';
            nameLabel.textContent = 'Type your name';
            nameSection.appendChild(nameLabel);

            // Create name input
            const input = document.createElement('input');
            input.type = 'text';
            // Use "Player's Name" for single player with Xeno, otherwise "Player X name"
            const placeholderName = (count === 1 && includeXeno) ? "Player's Name" : `Player ${i + 1} name`;
            input.placeholder = `${i + 1}. ${placeholderName}`;
            input.value = '';
            input.dataset.playerIndex = i;
            input.dataset.prefix = `${i + 1}.  `;

            // On focus, set the prefix and place cursor after it
            input.addEventListener('focus', (e) => {
                const prefix = e.target.dataset.prefix;
                if (e.target.value === '' || !e.target.value.startsWith(prefix)) {
                    e.target.value = prefix;
                }
                // Place cursor at the end (after prefix)
                setTimeout(() => {
                    e.target.setSelectionRange(prefix.length, prefix.length);
                }, 0);
            });

            input.addEventListener('input', (e) => {
                const prefix = e.target.dataset.prefix;
                let value = e.target.value;

                // If value doesn't start with prefix and has content
                if (value.length > 0 && !value.startsWith(prefix)) {
                    // Remove any existing prefix pattern at start
                    value = value.replace(/^\d+\.\s*/, '');
                    e.target.value = prefix + value;
                }
                // If value is just the prefix or less, clear it
                if (value === prefix || value.length < prefix.length) {
                    if (value.length === 0) {
                        e.target.value = '';
                    }
                }
            });

            nameSection.appendChild(input);
            playerRow.appendChild(nameSection);
            nameInputs.appendChild(playerRow);
        }

        // Update icon availability after all selectors are created
        this.updateIconAvailability();

        // Show Xeno indicator if selected
        if (includeXeno) {
            const xenoNumber = count + 1;
            const xenoRow = document.createElement('div');
            xenoRow.className = 'player-input-row xeno-row';

            // Xeno icon section with label
            const xenoIconSection = document.createElement('div');
            xenoIconSection.className = 'input-section';
            const xenoIconLabel = document.createElement('div');
            xenoIconLabel.className = 'input-label';
            xenoIconLabel.textContent = ' '; // Empty label for alignment
            xenoIconSection.appendChild(xenoIconLabel);
            const xenoIconContainer = document.createElement('div');
            xenoIconContainer.className = 'xeno-icon-container';
            xenoIconContainer.innerHTML = XENO_ICON_SVG;
            xenoIconSection.appendChild(xenoIconContainer);
            xenoRow.appendChild(xenoIconSection);

            // Xeno name section with label
            const xenoNameSection = document.createElement('div');
            xenoNameSection.className = 'input-section name-section';
            const xenoNameLabel = document.createElement('div');
            xenoNameLabel.className = 'input-label';
            xenoNameLabel.textContent = ' '; // Empty label for alignment
            xenoNameSection.appendChild(xenoNameLabel);

            // Xeno name input (disabled)
            const xenoInput = document.createElement('input');
            xenoInput.type = 'text';
            xenoInput.value = `${xenoNumber}.  Xeno`;
            xenoInput.disabled = true;
            xenoInput.className = 'xeno-input';
            xenoInput.style.cssText = `
                height: 36px;
                min-height: 36px;
                line-height: 36px;
                padding: 0 20px;
                font-size: 1rem;
                border: 2px solid #FF69B4;
                border-radius: 10px;
                background: rgba(255,255,255,0.9);
                color: #FF69B4;
                font-weight: bold;
                cursor: not-allowed;
                width: 100%;
                box-sizing: border-box;
                margin-left: 4px;
                margin-top: -3px;
            `;
            xenoNameSection.appendChild(xenoInput);
            xenoRow.appendChild(xenoNameSection);
            nameInputs.appendChild(xenoRow);
        }
    }

    startGame() {
        const inputs = document.querySelectorAll('#name-inputs input');
        if (inputs.length === 0) {
            alert('Please select the number of players first!');
            return;
        }

        // Create players (skip disabled Xeno input)
        this.players = [];
        this.winners = []; // Reset winners list
        let playerIndex = 0;
        inputs.forEach((input) => {
            // Skip the Xeno input (disabled)
            if (input.disabled) return;

            let name = input.value;
            const prefix = input.dataset.prefix;
            // Remove prefix if present to get just the name
            if (name.startsWith(prefix)) {
                name = name.substring(prefix.length);
            }
            // Use default name if empty
            name = name.trim() || `Player ${playerIndex + 1}`;

            // Get selected icon for this player
            const iconKey = this.playerIcons[playerIndex] || 'star';

            this.players.push({
                id: playerIndex,
                name: name,
                icon: iconKey,
                hand: [],
                isWinner: false,
                isComputer: false
            });
            playerIndex++;
        });

        // Add Xeno as computer player if selected (not in Find the Double levels - Xeno is timer owner)
        const findTheDoubleLevels = ['circle', 'triangle', 'star'];
        if (this.includeXeno && !findTheDoubleLevels.includes(this.selectedLevel)) {
            this.players.push({
                id: this.players.length,
                name: 'Xeno',
                icon: 'xeno',
                hand: [],
                isWinner: false,
                isComputer: true
            });
        }

        // Initialize deck and deal
        const deck = getShuffledDeck();
        const cardsPerPlayer = 3;

        // Deal cards to players
        for (let i = 0; i < cardsPerPlayer; i++) {
            for (let player of this.players) {
                player.hand.push(deck.pop());
            }
        }

        // Rest goes to bank
        this.bank = deck;

        // Reset board
        this.board = [];
        this.leftEnd = null;
        this.rightEnd = null;
        this.selectedCard = null;
        this.hasDrawnThisTurn = false;

        // Switch to game screen
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        // Check if Find the Double level is selected (all levels use this mode now)
        if (this.selectedLevel === 'circle' || this.selectedLevel === 'triangle' || this.selectedLevel === 'star') {
            this.startSunLevelGame();
        } else {
            // Phase 1: Show doubles - players decide who starts
            this.gamePhase = 'showDoubles';
            this.promptForDoubles();
        }
    }

    // ==================== SUN LEVEL GAME ====================
    startSunLevelGame() {
        this.gamePhase = 'sunLevel';
        this.sunLevelTimer = null;
        this.sunLevelTimeLeft = 30;
        this.sunLevelDuration = 30;
        this.sunLevelWinners = []; // Track winners in Find the Double

        // Deal cards based on level: circle=2, triangle=3, star=4 cards per player (1 double + non-doubles)
        this.dealSunLevelCards();

        // Hide bank area for Sun level
        document.querySelector('.bank-area').style.display = 'none';

        // Clear the game board (remove any leftover content from previous games)
        document.getElementById('game-board').innerHTML = '';

        // Hide controls except New Game
        document.getElementById('pass-btn').style.display = 'none';
        document.getElementById('draw-btn').style.display = 'none';

        // Update header to not show turn indicator for single player
        if (this.players.length === 1) {
            document.querySelector('.turn-indicator').innerHTML = 'Find the Double!';
        }

        // Update status
        this.updateStatus('🌞 Find the DOUBLE before time runs out! Click on it!', 'highlight');

        // Render player hands first
        this.renderSunLevel();

        // Show Xeno timer box with Xeno icon
        const xenoTimerBox = document.getElementById('xeno-timer-box');
        xenoTimerBox.style.display = 'block';

        // Add Xeno icon
        const xenoIconEl = document.getElementById('xeno-timer-icon');
        xenoIconEl.innerHTML = XENO_ICON_SVG;

        // Set up timer display
        this.setupTimerTicks();

        // Start the timer AFTER dominoes are visible
        this.startSunLevelTimer();
    }

    dealSunLevelCards() {
        // Determine number of cards based on selected level
        // circle (Sun) = 2 cards, triangle (Alien) = 3 cards, star (Sunflower) = 4 cards
        let numCards = 2;
        if (this.selectedLevel === 'triangle') {
            numCards = 3;
        } else if (this.selectedLevel === 'star') {
            numCards = 4;
        }

        // Get all doubles and non-doubles from deck
        const allCards = getShuffledDeck();
        const doubles = allCards.filter(card => isDouble(card));
        const nonDoubles = allCards.filter(card => !isDouble(card));

        // Shuffle them
        this.shuffleArray(doubles);
        this.shuffleArray(nonDoubles);

        // Deal to each player: 1 double + (numCards-1) non-doubles
        this.players.forEach(player => {
            player.hand = [];
            // Add 1 double
            if (doubles.length > 0) {
                player.hand.push(doubles.pop());
            }
            // Add (numCards-1) non-doubles
            for (let i = 0; i < numCards - 1; i++) {
                if (nonDoubles.length > 0) {
                    player.hand.push(nonDoubles.pop());
                }
            }
            // Shuffle the hand so double isn't always in same position
            this.shuffleArray(player.hand);
        });

        // No bank in Sun level
        this.bank = [];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    setupTimerTicks() {
        const ticksContainer = document.getElementById('timer-ticks');
        ticksContainer.innerHTML = '';

        const n = this.sunLevelDuration;
        for (let i = 0; i <= n; i++) {
            const angle = (i / n) * 360 - 90; // Start from top
            const radian = angle * (Math.PI / 180);
            const x = 60 + 42 * Math.cos(radian);
            const y = 60 + 42 * Math.sin(radian);

            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            tick.setAttribute('cx', x);
            tick.setAttribute('cy', y);
            tick.setAttribute('r', 3);
            tick.setAttribute('class', 'timer-tick');
            ticksContainer.appendChild(tick);

            // Label
            const labelX = 60 + 35 * Math.cos(radian);
            const labelY = 60 + 35 * Math.sin(radian) + 3;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('class', 'timer-tick-label');
            label.textContent = i === 0 ? n : n - i;
            ticksContainer.appendChild(label);
        }

        // Set initial display
        document.getElementById('timer-display').textContent = this.sunLevelDuration;
    }

    startSunLevelTimer() {
        const progressCircle = document.querySelector('.timer-progress');
        const circumference = 2 * Math.PI * 50; // 2πr where r=50
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = 0;

        const startTime = Date.now();
        const duration = this.sunLevelDuration * 1000;

        this.sunLevelTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const secondsLeft = Math.ceil(remaining / 1000);

            // Update display
            document.getElementById('timer-display').textContent = secondsLeft;

            // Update progress circle
            const progress = elapsed / duration;
            progressCircle.style.strokeDashoffset = circumference * progress;

            // Change color as time runs out
            if (secondsLeft <= 2) {
                progressCircle.style.stroke = '#F44336';
            } else if (secondsLeft <= 3) {
                progressCircle.style.stroke = '#FF9800';
            }

            // Time's up!
            if (remaining <= 0) {
                this.sunLevelTimeUp();
            }
        }, 100);
    }

    stopSunLevelTimer() {
        if (this.sunLevelTimer) {
            clearInterval(this.sunLevelTimer);
            this.sunLevelTimer = null;
        }
    }

    sunLevelTimeUp() {
        this.stopSunLevelTimer();
        this.gamePhase = 'sunLevelEnded';
        this.updateStatus('⏰ Game over! Time\'s up! Try again!', 'gameover');

        // Disable clicking on cards
        document.querySelectorAll('.domino').forEach(d => {
            d.style.pointerEvents = 'none';
            d.style.opacity = '0.5';
        });

        // Show which was the double
        this.highlightDoubleCard();
    }

    highlightDoubleCard() {
        // Find and highlight the double in each hand
        this.players.forEach(player => {
            player.hand.forEach((card, idx) => {
                if (isDouble(card)) {
                    const handEl = document.querySelector(`[data-player-id="${player.id}"] .hand-tiles`);
                    if (handEl) {
                        const dominoEls = handEl.querySelectorAll('.domino');
                        if (dominoEls[idx]) {
                            dominoEls[idx].style.border = '4px solid #FFD700';
                            dominoEls[idx].style.boxShadow = '0 0 20px #FFD700';
                            dominoEls[idx].style.opacity = '1';
                        }
                    }
                }
            });
        });
    }

    handleSunLevelCardClick(card, playerIndex, cardIndex) {
        if (this.gamePhase !== 'sunLevel') return;

        const player = this.players[playerIndex];

        // Check if this player already won
        if (this.sunLevelWinners && this.sunLevelWinners.includes(player.id)) {
            return;
        }

        if (isDouble(card)) {
            // WIN!
            this.sunLevelWin(card, player, cardIndex);
        } else {
            // Wrong card
            this.sunLevelWrongCard(card, player, cardIndex);
        }
    }

    sunLevelWin(card, player, cardIndex) {
        // Check if this player already won
        if (this.sunLevelWinners.includes(player.id)) {
            return;
        }

        // Add player to winners
        const winnerNumber = this.sunLevelWinners.length + 1;
        this.sunLevelWinners.push(player.id);
        player.isWinner = true;
        player.winningCard = card;

        // Remove card from hand
        player.hand.splice(cardIndex, 1);

        // Update status based on winner number
        if (winnerNumber === 1) {
            this.updateStatus(`🎉 ${player.name} Won! Found the double!`, 'win');
        } else {
            this.updateStatus(`🎉 ${player.name} is the second winner!`, 'win');
        }

        // Re-render to show winner box instead of cards
        this.renderSunLevel();

        // Check if all players have won
        if (this.sunLevelWinners.length >= this.players.length) {
            this.stopSunLevelTimer();
            this.gamePhase = 'sunLevelWon';
        }

        // Show the winning card on the board
        const boardEl = document.getElementById('game-board');
        boardEl.innerHTML = '';

        // Show all winning cards
        this.sunLevelWinners.forEach((winnerId, idx) => {
            const winner = this.players.find(p => p.id === winnerId);
            if (winner && winner.winningCard) {
                const dominoEl = createDominoElement(winner.winningCard, true);
                dominoEl.classList.add('winning-domino');
                if (idx > 0) {
                    dominoEl.style.marginLeft = '20px';
                }
                boardEl.appendChild(dominoEl);
            }
        });
    }

    sunLevelWrongCard(card, player, cardIndex) {
        // Remove card from hand
        player.hand.splice(cardIndex, 1);

        // Place wrong card on board (show it was wrong)
        this.board = [{ card: card, orientation: 'horizontal', flipped: false }];

        // Update status - timer continues
        this.updateStatus('❌ Try again! Two sides of this domino are not equal.', 'wrong');

        // Re-render
        this.renderSunLevel();

        // Show the card on board
        const boardEl = document.getElementById('game-board');
        boardEl.innerHTML = '';
        const dominoEl = createDominoElement(card, false);
        dominoEl.classList.add('wrong-domino');
        dominoEl.style.border = '4px solid #FF9800';
        boardEl.appendChild(dominoEl);
    }

    renderSunLevel() {
        const playersArea = document.getElementById('players-area');
        playersArea.innerHTML = '';

        this.players.forEach((player, playerIndex) => {
            const handEl = document.createElement('div');
            handEl.className = 'player-hand active';
            handEl.dataset.playerId = player.id;

            // Check if this player has already won
            const hasWon = this.sunLevelWinners && this.sunLevelWinners.includes(player.id);
            const winnerPosition = hasWon ? this.sunLevelWinners.indexOf(player.id) + 1 : 0;

            if (hasWon) {
                // Show "You Won!" box instead of cards
                const winnerBox = document.createElement('div');
                winnerBox.className = 'sun-level-winner-box';

                const icon = CHARACTER_ICONS[player.icon];
                const winnerText = winnerPosition === 1 ? 'You Won!' : 'Second Winner!';

                winnerBox.innerHTML = `
                    <span class="player-icon-display">${icon ? icon.svg : ''}</span>
                    <span class="player-name-inline">${player.name}</span>
                    <span class="winner-text">${winnerText}</span>
                `;

                handEl.appendChild(winnerBox);
            } else {
                // Player's dominos (vertical) with key hints - all on one line
                const tilesContainer = document.createElement('div');
                tilesContainer.className = 'sun-level-tiles-container';

                // Add player icon and name on the left
                const icon = CHARACTER_ICONS[player.icon];
                const playerInfo = document.createElement('div');
                playerInfo.className = 'player-info-inline';
                playerInfo.innerHTML = `
                    <span class="player-icon-display">${icon ? icon.svg : ''}</span>
                    <span class="player-name-inline">${player.name}</span>
                `;
                tilesContainer.appendChild(playerInfo);

                // Determine keys for this player
                const numCards = player.hand.length;
                let keys;
                if (this.players.length === 1) {
                    keys = ['1', '2', '3', '4'].slice(0, numCards);
                } else if (this.players.length === 2) {
                    if (playerIndex === 0) {
                        keys = ['1', '2', '3', '4'].slice(0, numCards);
                    } else {
                        // Player 2: use last N keys from 7, 8, 9, 0
                        keys = ['7', '8', '9', '0'].slice(4 - numCards);
                    }
                }

                // Add "Press" label
                if (this.gamePhase === 'sunLevel' && numCards > 0) {
                    const pressLabel = document.createElement('span');
                    pressLabel.className = 'hint-press-left';
                    pressLabel.textContent = 'Press';
                    tilesContainer.appendChild(pressLabel);
                }

                // Container for dominoes and their key labels
                const dominoesWithKeys = document.createElement('div');
                dominoesWithKeys.className = 'dominoes-with-keys';

                player.hand.forEach((card, cardIndex) => {
                    const dominoWrapper = document.createElement('div');
                    dominoWrapper.className = 'domino-key-wrapper';

                    const dominoEl = createDominoElement(card, true); // vertical dominoes

                    // Add click handler for Sun level
                    if (this.gamePhase === 'sunLevel') {
                        dominoEl.addEventListener('click', () => {
                            this.handleSunLevelCardClick(card, playerIndex, cardIndex);
                        });
                    }

                    dominoWrapper.appendChild(dominoEl);

                    // Add key label under this domino
                    if (this.gamePhase === 'sunLevel' && keys && keys[cardIndex]) {
                        const keyLabel = document.createElement('span');
                        keyLabel.className = 'key';
                        keyLabel.textContent = keys[cardIndex];
                        dominoWrapper.appendChild(keyLabel);
                    }

                    dominoesWithKeys.appendChild(dominoWrapper);
                });

                tilesContainer.appendChild(dominoesWithKeys);

                // Add "to select" label on the right
                if (this.gamePhase === 'sunLevel' && numCards > 0) {
                    const selectLabel = document.createElement('span');
                    selectLabel.className = 'hint-select-right';
                    selectLabel.textContent = 'to select';
                    tilesContainer.appendChild(selectLabel);
                }

                handEl.appendChild(tilesContainer);
            }

            playersArea.appendChild(handEl);
        });

        // Update bank count (hidden in Sun level but just in case)
        document.getElementById('bank-count').textContent = this.bank.length;
    }

    // Reset game for Sun level
    resetSunLevel() {
        this.stopSunLevelTimer();
        document.getElementById('xeno-timer-box').style.display = 'none';
        document.getElementById('celebration-area').style.display = 'none';
        document.querySelector('.bank-area').style.display = '';
        document.getElementById('pass-btn').style.display = '';
        document.getElementById('draw-btn').style.display = '';

        // Reset timer progress color
        const progressCircle = document.querySelector('.timer-progress');
        if (progressCircle) {
            progressCircle.style.stroke = '#4CAF50';
            progressCircle.style.strokeDashoffset = '0';
        }
    }
    // ==================== END SUN LEVEL GAME ====================

    promptForDoubles() {
        // Check if any player has doubles
        const hasAnyDouble = this.players.some(player =>
            player.hand.some(card => isDouble(card))
        );

        if (hasAnyDouble) {
            this.updateStatus('Players, push forward your DOUBLES! Then click the HIGHEST double (E > D > C > B > A) to start!', 'highlight');
            this.render();

            // Check if Xeno has the highest double and should auto-play
            this.checkXenoHighestDouble();
        } else {
            // No doubles - need to draw
            this.gamePhase = 'drawForDouble';
            this.updateStatus('No doubles! Click "Draw from Bank" - each player draws one card.', 'warning');
            this.render();
        }
    }

    checkXenoHighestDouble() {
        // Find all doubles and the highest one
        let allDoubles = [];
        this.players.forEach((player, pIndex) => {
            player.hand.forEach(c => {
                if (isDouble(c)) {
                    allDoubles.push({ card: c, playerIndex: pIndex, player: player });
                }
            });
        });

        if (allDoubles.length === 0) return;

        const highestDouble = findHighestDouble(allDoubles.map(d => d.card));
        const highestDoubleInfo = allDoubles.find(d => d.card.id === highestDouble.id);

        // If Xeno has the highest double, auto-play it after a delay
        if (highestDoubleInfo && highestDoubleInfo.player.isComputer) {
            setTimeout(() => {
                if (this.gamePhase === 'showDoubles') {
                    this.handleDoubleClick(highestDoubleInfo.card, highestDoubleInfo.playerIndex);
                }
            }, 3000);
        }
    }

    handleDoubleClick(card, playerIndex) {
        // Called when a player clicks a double during showDoubles phase
        if (this.gamePhase !== 'showDoubles') return;

        if (!isDouble(card)) {
            this.updateStatus('That is not a double! Click on a DOUBLE card (same value on both sides).', 'warning');
            return;
        }

        // Check if this is actually the highest double
        let allDoubles = [];
        this.players.forEach((player, pIndex) => {
            player.hand.forEach(c => {
                if (isDouble(c)) {
                    allDoubles.push({ card: c, playerIndex: pIndex });
                }
            });
        });

        const highestDouble = findHighestDouble(allDoubles.map(d => d.card));

        if (card.id !== highestDouble.id) {
            // Not the highest double - DO NOT allow to continue!
            this.updateStatus('No, no, no - it is not the highest double! Find and click the HIGHEST double (E > D > C > B > A).', 'warning');
            return;
        }

        // This is the highest double - start the game
        this.startWithDouble(card, playerIndex);
    }

    startWithDouble(card, playerIndex) {
        const player = this.players[playerIndex];

        // Remove card from player's hand
        const cardIndex = player.hand.findIndex(c => c.id === card.id);
        player.hand.splice(cardIndex, 1);

        // Place on board (doubles are vertical)
        this.board.push({
            card: card,
            isDouble: true
        });
        this.leftEnd = card.leftValue;
        this.rightEnd = card.rightValue;

        // Next player's turn (player after the one who started)
        this.currentPlayerIndex = (playerIndex + 1) % this.players.length;
        this.gamePhase = 'playing';
        this.pendingStartCard = null;
        this.pendingStartPlayer = null;

        const nextPlayer = this.getCurrentPlayer();
        this.updateStatus(`${player.name} started with ${card.leftValue}:${card.rightValue}. ${nextPlayer.name}'s turn!`, 'success');
        this.render();

        // If next player is computer (Xeno), auto-play after a delay
        if (nextPlayer.isComputer) {
            setTimeout(() => this.xenoPlay(), 3000);
        }
    }

    drawForDoublePhase() {
        // Each player draws one card when no doubles exist
        if (this.gamePhase !== 'drawForDouble') return;

        let drewDouble = false;
        for (let player of this.players) {
            if (this.bank.length > 0) {
                const drawnCard = this.bank.pop();
                player.hand.push(drawnCard);
                if (isDouble(drawnCard)) {
                    drewDouble = true;
                }
            }
        }

        if (drewDouble) {
            this.gamePhase = 'showDoubles';
            this.updateStatus('Doubles found! Players, click the HIGHEST double to start!', 'highlight');
        } else if (this.bank.length > 0) {
            this.updateStatus('Still no doubles! Click "Draw from Bank" again.', 'warning');
        } else {
            // Bank is empty and no doubles - start with any card
            this.gamePhase = 'noDoubles';
            this.updateStatus('No doubles and bank is empty! Click any card to start.', 'warning');
        }
        this.render();
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    canCurrentPlayerPlay() {
        const player = this.getCurrentPlayer();
        return player.hand.some(card =>
            canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
        );
    }

    getPlayableCards(player) {
        return player.hand.filter(card =>
            canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
        );
    }

    selectCard(card, playerIndex) {
        // Handle showDoubles phase - player clicks on a double to start
        if (this.gamePhase === 'showDoubles') {
            this.handleDoubleClick(card, playerIndex);
            return;
        }

        // Handle noDoubles phase - any card can start
        if (this.gamePhase === 'noDoubles') {
            this.startWithDouble(card, playerIndex); // Works for any card
            return;
        }

        // Normal playing phase
        if (this.gamePhase !== 'playing') return;
        if (playerIndex !== this.currentPlayerIndex) {
            this.updateStatus(`It's ${this.getCurrentPlayer().name}'s turn!`, 'warning');
            return;
        }

        const canPlay = canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd);
        if (!canPlay) {
            this.updateStatus('This card cannot be played! Draw from bank or select another card.', 'warning');
            return;
        }

        this.selectedCard = card;
        this.render();

        // Always show both placement options - player must choose
        this.updateStatus('Click LEFT or RIGHT on the board to place your card!', 'highlight');
        this.showPlacementZones(true, true);
    }

    showPlacementZones(showLeft, showRight) {
        this.renderBoard(showLeft, showRight);
    }

    playCard(card, side) {
        const player = this.getCurrentPlayer();
        const cardIndex = player.hand.findIndex(c => c.id === card.id);

        if (cardIndex === -1) return;

        // Validate the chosen side
        const canPlayLeft = canPlayOn(card, this.leftEnd);
        const canPlayRight = canPlayOn(card, this.rightEnd);

        if (side === 'left' && !canPlayLeft) {
            this.updateStatus(`Cannot play on left side! The left end needs ${this.leftEnd}.`, 'warning');
            return;
        }
        if (side === 'right' && !canPlayRight) {
            this.updateStatus(`Cannot play on right side! The right end needs ${this.rightEnd}.`, 'warning');
            return;
        }

        // Remove card from hand
        player.hand.splice(cardIndex, 1);

        // Determine orientation and add to board
        const isDoubleCard = isDouble(card);
        let flipped = false;

        if (side === 'left') {
            // Playing on left side - the card's matching value should face right (toward board)
            if (card.rightValue === this.leftEnd) {
                flipped = false; // right side of card matches, so left side becomes new end
            } else {
                flipped = true; // left side of card matches, flip so right becomes new end
            }

            const newCard = flipped ?
                { card: { ...card, left: card.right, right: card.left, leftValue: card.rightValue, rightValue: card.leftValue }, isDouble: isDoubleCard } :
                { card, isDouble: isDoubleCard };

            this.board.unshift(newCard);
            this.leftEnd = flipped ? card.rightValue : card.leftValue;
        } else {
            // Playing on right side - the card's matching value should face left (toward board)
            if (card.leftValue === this.rightEnd) {
                flipped = false; // left side of card matches, so right side becomes new end
            } else {
                flipped = true; // right side of card matches, flip so left becomes new end
            }

            const newCard = flipped ?
                { card: { ...card, left: card.right, right: card.left, leftValue: card.rightValue, rightValue: card.leftValue }, isDouble: isDoubleCard } :
                { card, isDouble: isDoubleCard };

            this.board.push(newCard);
            this.rightEnd = flipped ? card.leftValue : card.rightValue;
        }

        this.selectedCard = null;
        this.hasDrawnThisTurn = false;

        // Render board to show the new card
        this.render();

        // Show matching highlight for 1 second
        this.showMatchingHighlight(side);

        // Check for winner after highlight delay
        setTimeout(() => {
            if (player.hand.length === 0) {
                this.endGame(player);
                return;
            }

            // Next player's turn
            this.nextTurn();
        }, 1000);
    }

    showMatchingHighlight(side) {
        // Find the matching domino halves on the board
        const boardEl = document.getElementById('game-board');
        const dominoes = boardEl.querySelectorAll('.domino.on-board');

        console.log('showMatchingHighlight called, side:', side, 'dominoes found:', dominoes.length);

        if (side === 'left' && dominoes.length >= 2) {
            // New card is first (index 0), highlight its right half and the next card's left half
            const newCard = dominoes[0];
            const adjacentCard = dominoes[1];

            const newCardHalves = newCard.querySelectorAll('.domino-half');
            const adjacentCardHalves = adjacentCard.querySelectorAll('.domino-half');

            // For horizontal cards: first half is left, second is right
            // New card's right half matches adjacent card's left half
            if (newCardHalves[1]) {
                newCardHalves[1].classList.add('matching');
                console.log('Added matching to new card right half');
            }
            if (adjacentCardHalves[0]) {
                adjacentCardHalves[0].classList.add('matching');
                console.log('Added matching to adjacent card left half');
            }

        } else if (side === 'right' && dominoes.length >= 2) {
            // New card is last, highlight its left half and the previous card's right half
            const newCard = dominoes[dominoes.length - 1];
            const adjacentCard = dominoes[dominoes.length - 2];

            const newCardHalves = newCard.querySelectorAll('.domino-half');
            const adjacentCardHalves = adjacentCard.querySelectorAll('.domino-half');

            // New card's left half matches adjacent card's right half
            if (newCardHalves[0]) {
                newCardHalves[0].classList.add('matching');
                console.log('Added matching to new card left half');
            }
            if (adjacentCardHalves[1]) {
                adjacentCardHalves[1].classList.add('matching');
                console.log('Added matching to adjacent card right half');
            }
        }

        // Remove matching class after animation completes
        setTimeout(() => {
            boardEl.querySelectorAll('.matching').forEach(el => el.classList.remove('matching'));
        }, 1000);
    }

    closeBank() {
        const bank = document.getElementById('bank');
        bank.classList.add('closed');
        setTimeout(() => {
            bank.classList.remove('closed');
        }, 2000);
    }

    drawFromBank() {
        // Handle drawForDouble phase - everyone draws one card
        if (this.gamePhase === 'drawForDouble') {
            this.drawForDoublePhase();
            return;
        }

        if (this.gamePhase !== 'playing') return;
        if (this.bank.length === 0) {
            this.updateStatus('Bank is empty!', 'warning');
            return;
        }

        // Check if player has a playable card - block bank access!
        if (this.canCurrentPlayerPlay()) {
            this.closeBank();
            this.updateStatus('Look around! Find your card!', 'warning');
            return;
        }

        // Last player cannot draw from bank - game ends
        const activePlayers = this.players.filter(p => !p.isWinner);
        if (activePlayers.length === 1) {
            this.updateStatus('Last player cannot draw from bank!', 'warning');
            // Let player see the field for 2 seconds, then show "No more winners"
            setTimeout(() => this.showNoMoreWinners(), 2000);
            return;
        }

        if (this.hasDrawnThisTurn) {
            this.updateStatus('You already drew this turn! Play a card or skip.', 'warning');
            return;
        }

        const player = this.getCurrentPlayer();
        const drawnCard = this.bank.pop();
        player.hand.push(drawnCard);
        this.hasDrawnThisTurn = true;

        this.updateStatus(`${player.name} drew a card from the bank.`);

        // Check if they can now play
        if (this.canCurrentPlayerPlay()) {
            this.updateStatus(`${player.name} drew a card. Select a card to play!`);
            document.getElementById('draw-btn').disabled = true;
            document.getElementById('pass-btn').disabled = false;
        } else {
            this.updateStatus(`${player.name} drew but cannot play. Click "Skip Turn".`, 'warning');
            document.getElementById('draw-btn').disabled = true;
            document.getElementById('pass-btn').disabled = false;
        }

        this.render();
    }

    passTurn() {
        if (this.gamePhase !== 'playing') return;

        const player = this.getCurrentPlayer();

        // Can only pass if they've drawn and still can't play, OR if bank is empty and can't play
        if (!this.hasDrawnThisTurn && this.bank.length > 0 && !this.canCurrentPlayerPlay()) {
            this.updateStatus('You must draw from the bank first!', 'warning');
            return;
        }

        if (this.canCurrentPlayerPlay()) {
            this.updateStatus('You have a playable card! You must play it.', 'warning');
            return;
        }

        this.updateStatus(`${player.name} passed.`);
        this.hasDrawnThisTurn = false;
        this.nextTurn();
    }

    nextTurn() {
        this.hasDrawnThisTurn = false;
        this.selectedCard = null;

        // Find the next active (non-winner) player
        let attempts = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            attempts++;
            // Safety check to prevent infinite loop
            if (attempts > this.players.length) break;
        } while (this.getCurrentPlayer().isWinner);

        // Check if ALL players have finished (empty hands) - Circle of Winners
        const activePlayers = this.players.filter(p => !p.isWinner);
        if (activePlayers.length === 0) {
            this.showCircleOfWinners();
            return;
        }

        // Check for game blocked (no active player can play and bank is empty)
        if (this.isGameBlocked()) {
            this.endGameBlocked();
            return;
        }

        const player = this.getCurrentPlayer();
        const canPlay = this.canCurrentPlayerPlay();

        // If only one player left and they can't play, show field for 2 seconds then end
        if (activePlayers.length === 1 && !canPlay) {
            this.updateStatus(`${player.name} cannot make a move...`, 'warning');
            this.render();
            // Let player see the field for 2 seconds, then show "No more winners"
            setTimeout(() => this.showNoMoreWinners(), 2000);
            return;
        }

        if (canPlay) {
            this.updateStatus(`${player.name}'s turn. Select a card to play!`, 'highlight');
        } else if (activePlayers.length > 1 && this.bank.length > 0) {
            this.updateStatus(`${player.name}'s turn. No matching cards - draw from bank!`);
        } else {
            this.updateStatus(`${player.name}'s turn. No matching cards and bank is empty - skip turn!`, 'warning');
        }

        this.render();

        // If current player is computer (Xeno), auto-play after a delay
        if (player.isComputer && !player.isWinner) {
            console.log('Triggering Xeno play for:', player.name, 'isComputer:', player.isComputer);
            setTimeout(() => this.xenoPlay(), 3000);
        } else {
            console.log('Not triggering Xeno. Player:', player.name, 'isComputer:', player.isComputer, 'isWinner:', player.isWinner);
        }
    }

    // Xeno AI - computer player logic
    xenoPlay() {
        // Ensure game is still in playing phase
        if (this.gamePhase !== 'playing') return;

        const player = this.getCurrentPlayer();
        if (!player || !player.isComputer || player.isWinner) return;

        console.log('Xeno is playing...', player.name, player.hand);

        // Check if we can play any card
        const playableCards = player.hand.filter(card =>
            canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
        );

        console.log('Playable cards:', playableCards.length);

        if (playableCards.length > 0) {
            // Pick the best card to play (prefer doubles, then highest value)
            let bestCard = playableCards[0];
            for (const card of playableCards) {
                if (card.leftValue === card.rightValue) {
                    bestCard = card; // Prefer doubles
                    break;
                }
            }

            // Determine which side to play on
            const canLeft = canPlayOn(bestCard, this.leftEnd);
            const canRight = canPlayOn(bestCard, this.rightEnd);
            const side = canLeft ? 'left' : 'right';

            console.log('Xeno playing card:', bestCard, 'on side:', side);

            // Play the card
            this.playCard(bestCard, side);
        } else if (this.bank.length > 0 && !this.hasDrawnThisTurn) {
            console.log('Xeno drawing from bank');
            // Draw from bank
            this.drawFromBank();
            // After drawing, try to play again
            setTimeout(() => {
                if (this.gamePhase !== 'playing') return;
                const currentPlayer = this.getCurrentPlayer();
                if (!currentPlayer || !currentPlayer.isComputer) return;

                const canPlayNow = this.canCurrentPlayerPlay();
                if (canPlayNow) {
                    this.xenoPlay();
                } else {
                    this.passTurn();
                }
            }, 2000);
        } else {
            console.log('Xeno passing turn');
            // Can't play, pass turn
            this.passTurn();
        }
    }

    isGameBlocked() {
        if (this.bank.length > 0) return false;

        // Check if any ACTIVE (non-winner) player can play
        const activePlayers = this.players.filter(p => !p.isWinner);
        return !activePlayers.some(player =>
            player.hand.some(card =>
                canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
            )
        );
    }

    getOrdinal(n) {
        const ordinals = ['first', 'second', 'third', 'fourth'];
        return ordinals[n - 1] || `${n}th`;
    }

    showWinnerCelebration(winner, ordinal) {
        // Show winner banner
        const banner = document.getElementById('winner-banner');
        document.getElementById('winner-ordinal').textContent = ordinal;
        document.getElementById('banner-winner-name').textContent = winner.name;
        banner.style.display = 'block';

        // Create sparkles
        this.createSparkles();

        // Hide banner after 2.5 seconds
        setTimeout(() => {
            banner.style.display = 'none';
        }, 3000);
    }

    createSparkles() {
        const container = document.getElementById('winner-celebration');
        container.innerHTML = '';

        // Create 30 sparkles around the screen
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            // Random position around the edges and center
            const angle = (i / 30) * Math.PI * 2;
            const radius = 150 + Math.random() * 200;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            sparkle.style.left = (centerX + Math.cos(angle) * radius) + 'px';
            sparkle.style.top = (centerY + Math.sin(angle) * radius) + 'px';
            sparkle.style.animationDelay = (Math.random() * 0.5) + 's';

            // Random colors for sparkles
            const colors = ['#ffd700', '#ffaa00', '#ff6b6b', '#4ecdc4', '#45b7d1'];
            sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(sparkle);
        }

        // Clear sparkles after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }

    endGame(winner) {
        // Player completed their hand - mark as winner but CONTINUE the game!
        winner.isWinner = true;
        this.winners.push(winner);

        const ordinal = this.getOrdinal(this.winners.length);
        this.updateStatus(`Here is the ${ordinal} winner: ${winner.name}!`, 'success');
        this.render();

        // Show celebration with sparkles
        this.showWinnerCelebration(winner, ordinal);

        // Check if ALL players have finished (empty hands)
        const activePlayers = this.players.filter(p => !p.isWinner);
        if (activePlayers.length === 0) {
            // Everyone completed - Circle of Winners!
            setTimeout(() => this.showCircleOfWinners(), 3000);
            return;
        }

        // Continue with next player (skip winners)
        setTimeout(() => this.nextTurn(), 3000);
    }

    showCircleOfWinners() {
        this.gamePhase = 'ended';

        const singleWinnerContent = document.getElementById('single-winner-content');
        const circleWinnersContent = document.getElementById('circle-winners-content');

        if (this.winners.length === 1) {
            singleWinnerContent.style.display = 'block';
            circleWinnersContent.style.display = 'none';
            document.getElementById('winner-heading').style.display = 'block';
            document.getElementById('winner-name').textContent = `${this.winners[0].name} wins!`;
            document.getElementById('winner-says').textContent = '"I Won!"';
        } else {
            // ALL players completed - Circle of Winners!
            singleWinnerContent.style.display = 'none';
            circleWinnersContent.style.display = 'block';
            const winnerNames = this.winners.map(w => w.name).join(' & ');
            document.getElementById('winners-names').textContent =
                `${winnerNames} form the Circle of Winners!`;
            this.animateWeWon();
        }

        document.getElementById('winner-modal').classList.add('show');
        this.render();
    }

    showNoMoreWinners() {
        this.gamePhase = 'ended';

        const singleWinnerContent = document.getElementById('single-winner-content');
        const circleWinnersContent = document.getElementById('circle-winners-content');

        singleWinnerContent.style.display = 'block';
        circleWinnersContent.style.display = 'none';

        // Hide "Winner!" heading and show "No more winners! Play again!"
        document.getElementById('winner-heading').style.display = 'none';
        document.getElementById('winner-name').textContent = 'No more winners!';
        document.getElementById('winner-says').textContent = 'Play again!';

        document.getElementById('winner-modal').classList.add('show');
        this.render();
    }

    checkGameOver() {
        // Check if game should end
        const activePlayers = this.players.filter(p => !p.isWinner);

        // All players finished
        if (activePlayers.length === 0) {
            return true;
        }

        // Check if remaining players can play
        const canAnyonePlay = activePlayers.some(player =>
            player.hand.some(card =>
                canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
            )
        );

        // If no one can play and bank is empty, game is over
        if (!canAnyonePlay && this.bank.length === 0) {
            return true;
        }

        return false;
    }

    showFinalResult() {
        this.gamePhase = 'ended';

        const singleWinnerContent = document.getElementById('single-winner-content');
        const circleWinnersContent = document.getElementById('circle-winners-content');

        if (this.winners.length === 1) {
            // Single winner - "I Won!"
            singleWinnerContent.style.display = 'block';
            circleWinnersContent.style.display = 'none';
            document.getElementById('winner-name').textContent = `${this.winners[0].name} wins!`;
        } else {
            // Multiple winners - Circle of Winners with "We Won!" x3
            singleWinnerContent.style.display = 'none';
            circleWinnersContent.style.display = 'block';

            const winnerNames = this.winners.map(w => w.name).join(' & ');
            document.getElementById('winners-names').textContent = `${winnerNames} form the Circle of Winners!`;

            // Animate "We Won!" three times
            this.animateWeWon();
        }

        document.getElementById('winner-modal').classList.add('show');
        this.render();
    }

    animateWeWon() {
        const weWonText = document.querySelector('.we-won-text');
        let count = 0;
        const maxCount = 3;

        const animate = () => {
            if (count >= maxCount) return;

            weWonText.classList.remove('animate');
            // Force reflow
            void weWonText.offsetWidth;
            weWonText.classList.add('animate');
            count++;

            if (count < maxCount) {
                setTimeout(animate, 1300); // Wait for animation to complete
            }
        };

        // Start animation
        setTimeout(animate, 500);
    }

    endGameBlocked() {
        // Game is blocked - no one can play and bank is empty
        // Show "No more winners" since not everyone completed with empty hands
        this.showNoMoreWinners();
    }

    resetToSetup() {
        // Clean up Sun level if it was active
        this.resetSunLevel();

        document.getElementById('winner-modal').classList.remove('show');
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('player-names').style.display = 'none';
        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));

        // Restore all level buttons visibility
        document.querySelectorAll('.level-btn-wrapper').forEach(wrapper => {
            wrapper.style.display = 'flex';
        });

        // Restore all player buttons visibility
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.style.display = 'inline-block';
        });

        // Restore all h3 headings in setup panel
        const setupPanel = document.querySelector('.setup-panel');
        setupPanel.querySelectorAll('h3').forEach(h3 => {
            h3.style.display = 'block';
        });

        // Restore original containers and hide selected row
        document.querySelector('.game-level-select').style.display = 'flex';
        document.querySelector('.player-select').style.display = 'flex';
        const selectedRow = document.getElementById('selected-options-row');
        if (selectedRow) {
            selectedRow.style.display = 'none';
        }

        // Reset modal content display
        document.getElementById('single-winner-content').style.display = 'block';
        document.getElementById('circle-winners-content').style.display = 'none';
        document.getElementById('winner-heading').style.display = 'block';

        this.players = [];
        this.bank = [];
        this.board = [];
        this.winners = [];
        this.firstWinner = null;
        this.gamePhase = 'setup';
    }

    updateStatus(message, type = '') {
        const status = document.getElementById('status-message');
        status.textContent = message;
        status.className = 'status';
        if (type) status.classList.add(type);
    }

    render() {
        this.renderPlayers();
        this.renderBoard(false, false);
        this.renderBank();
        this.updateControls();
        this.updateTurnIndicator();
    }

    renderPlayers() {
        const playersArea = document.getElementById('players-area');
        playersArea.innerHTML = '';

        this.players.forEach((player, index) => {
            const isActive = index === this.currentPlayerIndex && this.gamePhase === 'playing';
            const isWinner = player.isWinner;
            const isShowingDoubles = this.gamePhase === 'showDoubles' || this.gamePhase === 'drawForDouble';
            const isNoDoubles = this.gamePhase === 'noDoubles';

            const playerDiv = document.createElement('div');
            // During showDoubles phase, all players are "active" (can click)
            const activeClass = isShowingDoubles || isNoDoubles ? 'active' : (isActive ? 'active' : 'inactive');
            const xenoClass = player.isComputer ? 'xeno-player' : '';
            playerDiv.className = `player-hand ${activeClass} ${isWinner ? 'winner' : ''} ${xenoClass}`;
            playerDiv.dataset.playerId = index;
            playerDiv.style.position = 'relative';

            const header = document.createElement('h3');
            // Get player icon HTML
            let playerIconHtml = '';
            if (player.isComputer) {
                // Xeno icon with light gray background
                playerIconHtml = `<div class="player-icon-display xeno-bg">
                    <svg viewBox="0 0 100 100">
                        <ellipse cx="50" cy="45" rx="20" ry="25" fill="#FF69B4"/>
                        <ellipse cx="50" cy="18" rx="15" ry="12" fill="#FF69B4"/>
                        <ellipse cx="44" cy="16" rx="5" ry="6" fill="white"/>
                        <ellipse cx="56" cy="16" rx="5" ry="6" fill="white"/>
                        <circle cx="44" cy="16" r="2.5" fill="black"/>
                        <circle cx="56" cy="16" r="2.5" fill="black"/>
                        <line x1="42" y1="8" x2="35" y2="0" stroke="#FF69B4" stroke-width="2"/>
                        <circle cx="35" cy="0" r="3" fill="#FF1493"/>
                        <line x1="58" y1="8" x2="65" y2="0" stroke="#FF69B4" stroke-width="2"/>
                        <circle cx="65" cy="0" r="3" fill="#FF1493"/>
                        <path d="M30 35 Q15 30 10 40" stroke="#FF69B4" stroke-width="5" fill="none"/>
                        <path d="M70 35 Q85 30 90 40" stroke="#FF69B4" stroke-width="5" fill="none"/>
                        <path d="M32 50 Q15 55 8 50" stroke="#FF69B4" stroke-width="5" fill="none"/>
                        <path d="M68 50 Q85 55 92 50" stroke="#FF69B4" stroke-width="5" fill="none"/>
                        <path d="M50 70 Q55 80 45 90 Q40 95 50 98" stroke="#FF69B4" stroke-width="6" fill="none"/>
                        <path d="M43 22 Q50 28 57 22" stroke="#FF1493" stroke-width="2" fill="none"/>
                    </svg>
                </div>`;
            } else if (player.icon && CHARACTER_ICONS[player.icon]) {
                // Human player icon
                playerIconHtml = `<div class="player-icon-display">${CHARACTER_ICONS[player.icon].svg}</div>`;
            }
            header.innerHTML = `
                <span class="player-name-with-icon">${playerIconHtml}${player.name}</span>
                <span class="card-count">${player.hand.length} cards</span>
            `;
            playerDiv.appendChild(header);

            const tilesDiv = document.createElement('div');
            tilesDiv.className = 'hand-tiles';

            player.hand.forEach(card => {
                const dominoEl = createDominoElement(card, false, false);

                // NO automatic highlighting - players choose themselves!
                // Only mark selected card when player clicks it
                if (this.selectedCard && this.selectedCard.id === card.id) {
                    dominoEl.classList.add('selected');
                }

                // Click handler
                dominoEl.addEventListener('click', () => this.selectCard(card, index));

                tilesDiv.appendChild(dominoEl);
            });

            playerDiv.appendChild(tilesDiv);
            playersArea.appendChild(playerDiv);
        });
    }

    renderBoard(showLeftZone = false, showRightZone = false) {
        const boardEl = document.getElementById('game-board');
        boardEl.innerHTML = '';

        if (this.board.length === 0) {
            boardEl.innerHTML = '<div class="board-placeholder">Waiting for highest double...</div>';
            return;
        }

        // Left placement zone
        if (showLeftZone) {
            const leftZone = document.createElement('div');
            leftZone.className = 'placement-zone left';
            leftZone.innerHTML = `<span>Play here (${this.leftEnd})</span>`;
            leftZone.addEventListener('click', () => {
                if (this.selectedCard) {
                    this.playCard(this.selectedCard, 'left');
                }
            });
            boardEl.appendChild(leftZone);
        }

        // Board cards - highlight the ends with arrows
        this.board.forEach((item, index) => {
            const isVertical = item.isDouble;
            const dominoEl = createDominoElement(item.card, isVertical, true);

            // Highlight left end (first card) and right end (last card)
            if (this.gamePhase === 'playing') {
                // Left end arrow
                if (index === 0) {
                    dominoEl.classList.add('end-card');
                    const leftArrow = document.createElement('span');
                    leftArrow.className = 'end-arrow left-arrow';
                    leftArrow.textContent = `← ${this.leftEnd}`;
                    dominoEl.appendChild(leftArrow);
                }
                // Right end arrow
                if (index === this.board.length - 1) {
                    dominoEl.classList.add('end-card');
                    const rightArrow = document.createElement('span');
                    rightArrow.className = 'end-arrow right-arrow';
                    rightArrow.textContent = `${this.rightEnd} →`;
                    dominoEl.appendChild(rightArrow);
                }
            }

            boardEl.appendChild(dominoEl);
        });

        // Right placement zone
        if (showRightZone) {
            const rightZone = document.createElement('div');
            rightZone.className = 'placement-zone right';
            rightZone.innerHTML = `<span>Play here (${this.rightEnd})</span>`;
            rightZone.addEventListener('click', () => {
                if (this.selectedCard) {
                    this.playCard(this.selectedCard, 'right');
                }
            });
            boardEl.appendChild(rightZone);
        }
    }

    renderBank() {
        const bankCount = document.getElementById('bank-count');
        bankCount.textContent = this.bank.length;
    }

    updateControls() {
        const drawBtn = document.getElementById('draw-btn');
        const passBtn = document.getElementById('pass-btn');

        // During drawForDouble phase - enable draw button
        if (this.gamePhase === 'drawForDouble') {
            drawBtn.disabled = this.bank.length === 0;
            passBtn.disabled = true;
            return;
        }

        // During showDoubles or noDoubles phase
        if (this.gamePhase === 'showDoubles' || this.gamePhase === 'noDoubles') {
            drawBtn.disabled = true;
            passBtn.disabled = true;
            return;
        }

        if (this.gamePhase !== 'playing') {
            drawBtn.disabled = true;
            passBtn.disabled = true;
            return;
        }

        const canPlay = this.canCurrentPlayerPlay();
        const activePlayers = this.players.filter(p => !p.isWinner);
        const isLastPlayer = activePlayers.length === 1;

        // Draw button: always enabled (green) unless last player, already drew, or bank empty
        // If player has a card, clicking will show "Look around! Find your card"
        drawBtn.disabled = isLastPlayer || this.hasDrawnThisTurn || this.bank.length === 0;

        // Pass button: enabled if player has drawn and still can't play, OR bank is empty and can't play
        passBtn.disabled = canPlay || (!this.hasDrawnThisTurn && this.bank.length > 0 && !isLastPlayer);
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('current-player-name');
        if (this.gamePhase === 'showDoubles' || this.gamePhase === 'drawForDouble' || this.gamePhase === 'noDoubles') {
            indicator.textContent = 'All Players';
        } else if (this.gamePhase === 'playing') {
            indicator.textContent = this.getCurrentPlayer().name;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new VicaDominoGame();
});
