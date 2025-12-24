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
        inputs.forEach((input, index) => {
            this.players.push({
                id: index,
                name: input.value || `Player ${index + 1}`,
                hand: []
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

        // Start finding highest double phase
        this.gamePhase = 'findDouble';
        this.findAndPlayHighestDouble();
    }

    findAndPlayHighestDouble() {
        // Collect all cards from all players
        let allCards = [];
        this.players.forEach((player, playerIndex) => {
            player.hand.forEach(card => {
                allCards.push({ card, playerIndex });
            });
        });

        // Find highest double
        const highestDouble = findHighestDouble(allCards.map(c => c.card));

        if (highestDouble) {
            // Find which player has it
            const holder = allCards.find(c => c.card.id === highestDouble.id);
            this.currentPlayerIndex = holder.playerIndex;

            // Remove from player's hand and place on board
            const player = this.players[holder.playerIndex];
            const cardIndex = player.hand.findIndex(c => c.id === highestDouble.id);
            player.hand.splice(cardIndex, 1);

            // Place on board (doubles are vertical)
            this.board.push({
                card: highestDouble,
                isDouble: true
            });
            this.leftEnd = highestDouble.leftValue;
            this.rightEnd = highestDouble.rightValue;

            // Move to next player
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.gamePhase = 'playing';

            this.updateStatus(`${player.name} played the highest double (${highestDouble.leftValue}:${highestDouble.rightValue}). ${this.getCurrentPlayer().name}'s turn!`);
        } else {
            // No doubles - each player draws until someone gets a double
            this.updateStatus('No doubles! Each player draws a card...', 'warning');

            // Draw for each player
            let foundDouble = false;
            for (let player of this.players) {
                if (this.bank.length > 0) {
                    const drawnCard = this.bank.pop();
                    player.hand.push(drawnCard);
                    if (isDouble(drawnCard)) {
                        foundDouble = true;
                    }
                }
            }

            if (foundDouble || this.bank.length === 0) {
                // Try again to find highest double
                setTimeout(() => this.findAndPlayHighestDouble(), 1000);
            } else {
                setTimeout(() => this.findAndPlayHighestDouble(), 500);
            }
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

        // Check which sides this card can be played on
        const canPlayLeft = canPlayOn(card, this.leftEnd);
        const canPlayRight = canPlayOn(card, this.rightEnd);

        if (canPlayLeft && canPlayRight && this.leftEnd !== this.rightEnd) {
            this.updateStatus('Click LEFT or RIGHT on the board to place your card!', 'highlight');
            this.showPlacementZones(true, true);
        } else if (canPlayLeft) {
            this.playCard(card, 'left');
        } else {
            this.playCard(card, 'right');
        }
    }

    showPlacementZones(showLeft, showRight) {
        this.renderBoard(showLeft, showRight);
    }

    playCard(card, side) {
        const player = this.getCurrentPlayer();
        const cardIndex = player.hand.findIndex(c => c.id === card.id);

        if (cardIndex === -1) return;

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

    drawFromBank() {
        if (this.gamePhase !== 'playing') return;
        if (this.bank.length === 0) {
            this.updateStatus('Bank is empty!', 'warning');
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
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.hasDrawnThisTurn = false;
        this.selectedCard = null;

        // Check for game blocked (no one can play and bank is empty)
        if (this.isGameBlocked()) {
            this.endGameBlocked();
            return;
        }

        const player = this.getCurrentPlayer();
        const canPlay = this.canCurrentPlayerPlay();

        if (canPlay) {
            this.updateStatus(`${player.name}'s turn. Select a card to play!`, 'highlight');
        } else if (this.bank.length > 0) {
            this.updateStatus(`${player.name}'s turn. No matching cards - draw from bank!`);
        } else {
            this.updateStatus(`${player.name}'s turn. No matching cards and bank is empty - skip turn!`, 'warning');
        }

        this.render();
    }

    isGameBlocked() {
        if (this.bank.length > 0) return false;

        // Check if any player can play
        return !this.players.some(player =>
            player.hand.some(card =>
                canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd)
            )
        );
    }

    endGame(winner) {
        // First winner completed their hand
        this.firstWinner = winner;
        this.winners = [winner];
        winner.isWinner = true;

        this.updateStatus(`${winner.name} says: "I Won!" - Checking if others can also win...`, 'success');
        this.render();

        // Check if other players can complete WITHOUT drawing from bank
        this.gamePhase = 'checkingWinners';

        // Give a moment to show the first winner, then check others
        setTimeout(() => this.checkOtherWinners(), 1500);
    }

    // Check if a player can empty their hand without drawing (simulated play)
    canPlayerWinWithoutDrawing(player) {
        if (player.hand.length === 0) return true;
        if (player.isWinner) return true;

        // Simulate: can this player play all their cards?
        // We need to simulate the game state for this player
        let simulatedHand = [...player.hand];
        let simulatedLeftEnd = this.leftEnd;
        let simulatedRightEnd = this.rightEnd;

        let changed = true;
        while (changed && simulatedHand.length > 0) {
            changed = false;

            for (let i = 0; i < simulatedHand.length; i++) {
                const card = simulatedHand[i];

                // Check if card can be played on left
                if (card.leftValue === simulatedLeftEnd || card.rightValue === simulatedLeftEnd) {
                    // Play on left
                    if (card.rightValue === simulatedLeftEnd) {
                        simulatedLeftEnd = card.leftValue;
                    } else {
                        simulatedLeftEnd = card.rightValue;
                    }
                    simulatedHand.splice(i, 1);
                    changed = true;
                    break;
                }

                // Check if card can be played on right
                if (card.leftValue === simulatedRightEnd || card.rightValue === simulatedRightEnd) {
                    // Play on right
                    if (card.leftValue === simulatedRightEnd) {
                        simulatedRightEnd = card.rightValue;
                    } else {
                        simulatedRightEnd = card.leftValue;
                    }
                    simulatedHand.splice(i, 1);
                    changed = true;
                    break;
                }
            }
        }

        return simulatedHand.length === 0;
    }

    checkOtherWinners() {
        // Check each player (except first winner) if they can complete without drawing
        const potentialWinners = this.players.filter(p => !p.isWinner && this.canPlayerWinWithoutDrawing(p));

        if (potentialWinners.length > 0) {
            // Add them to winners
            potentialWinners.forEach(p => {
                p.isWinner = true;
                this.winners.push(p);
            });
        }

        // Now show the final result
        this.showFinalResult();
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
        this.gamePhase = 'ended';

        // Find player with fewest cards
        let minCards = Infinity;
        let winners = [];

        this.players.forEach(player => {
            if (player.hand.length < minCards) {
                minCards = player.hand.length;
                winners = [player];
            } else if (player.hand.length === minCards) {
                winners.push(player);
            }
        });

        this.winners = winners;
        winners.forEach(w => w.isWinner = true);

        const singleWinnerContent = document.getElementById('single-winner-content');
        const circleWinnersContent = document.getElementById('circle-winners-content');

        if (winners.length === 1) {
            singleWinnerContent.style.display = 'block';
            circleWinnersContent.style.display = 'none';
            document.getElementById('winner-name').textContent = `${winners[0].name} wins with fewest cards!`;
        } else {
            singleWinnerContent.style.display = 'none';
            circleWinnersContent.style.display = 'block';
            document.getElementById('winners-names').textContent =
                `It's a tie! ${winners.map(w => w.name).join(' & ')} share the victory!`;
            this.animateWeWon();
        }

        document.getElementById('winner-modal').classList.add('show');
        this.render();
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

            const playerDiv = document.createElement('div');
            playerDiv.className = `player-hand ${isActive ? 'active' : 'inactive'} ${isWinner ? 'winner' : ''}`;
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

                // Mark playable cards
                if (isActive && this.gamePhase === 'playing') {
                    const canPlay = canPlayOn(card, this.leftEnd) || canPlayOn(card, this.rightEnd);
                    if (canPlay) {
                        dominoEl.classList.add('playable');
                    } else {
                        dominoEl.classList.add('disabled');
                    }
                }

                // Mark selected card
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

        // Board cards
        this.board.forEach((item, index) => {
            const isVertical = item.isDouble;
            const dominoEl = createDominoElement(item.card, isVertical, true);
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

        if (this.gamePhase !== 'playing') {
            drawBtn.disabled = true;
            passBtn.disabled = true;
            return;
        }

        const canPlay = this.canCurrentPlayerPlay();

        // Draw button: enabled if player can't play and hasn't drawn yet and bank has cards
        drawBtn.disabled = canPlay || this.hasDrawnThisTurn || this.bank.length === 0;

        // Pass button: enabled if player has drawn and still can't play, OR bank is empty and can't play
        passBtn.disabled = canPlay || (!this.hasDrawnThisTurn && this.bank.length > 0);
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('current-player-name');
        if (this.gamePhase === 'playing' || this.gamePhase === 'findDouble') {
            indicator.textContent = this.getCurrentPlayer().name;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new VicaDominoGame();
});
