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

        this.initEventListeners();
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
    }

    selectPlayerCount(e) {
        const count = parseInt(e.target.dataset.players);

        // Update button states
        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        // Show name inputs
        const nameInputs = document.getElementById('name-inputs');
        const playerNamesDiv = document.getElementById('player-names');
        playerNamesDiv.style.display = 'block';

        nameInputs.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1} name`;
            input.value = `Player ${i + 1}`;
            input.dataset.playerIndex = i;
            nameInputs.appendChild(input);
        }
    }

    startGame() {
        const inputs = document.querySelectorAll('#name-inputs input');
        if (inputs.length === 0) {
            alert('Please select the number of players first!');
            return;
        }

        // Create players
        this.players = [];
        this.winners = []; // Reset winners list
        inputs.forEach((input, index) => {
            this.players.push({
                id: index,
                name: input.value || `Player ${index + 1}`,
                hand: [],
                isWinner: false // Initialize winner status
            });
        });

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

        // Phase 1: Show doubles - players decide who starts
        this.gamePhase = 'showDoubles';
        this.promptForDoubles();
    }

    promptForDoubles() {
        // Check if any player has doubles
        const hasAnyDouble = this.players.some(player =>
            player.hand.some(card => isDouble(card))
        );

        if (hasAnyDouble) {
            this.updateStatus('Players, push forward your DOUBLES! Then click the HIGHEST double (E > D > C > B > A) to start!', 'highlight');
        } else {
            // No doubles - need to draw
            this.gamePhase = 'drawForDouble';
            this.updateStatus('No doubles! Click "Draw from Bank" - each player draws one card.', 'warning');
        }
        this.render();
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

        this.updateStatus(`${player.name} started with ${card.leftValue}:${card.rightValue}. ${this.getCurrentPlayer().name}'s turn!`, 'success');
        this.render();
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

        // Check for winner
        if (player.hand.length === 0) {
            this.endGame(player);
            return;
        }

        // Next player's turn
        this.nextTurn();
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
        }, 2500);
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
        }, 2500);
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
        document.getElementById('winner-modal').classList.remove('show');
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('player-names').style.display = 'none';
        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));

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
            playerDiv.className = `player-hand ${activeClass} ${isWinner ? 'winner' : ''}`;
            playerDiv.dataset.playerId = index;
            playerDiv.style.position = 'relative';

            const header = document.createElement('h3');
            header.innerHTML = `
                <span>${player.name}</span>
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
        const bankCards = document.querySelector('.bank-cards');
        const bankCount = document.getElementById('bank-count');

        bankCards.innerHTML = '';
        const displayCount = Math.min(this.bank.length, 5);
        for (let i = 0; i < displayCount; i++) {
            const card = document.createElement('div');
            card.className = 'bank-card';
            bankCards.appendChild(card);
        }

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
