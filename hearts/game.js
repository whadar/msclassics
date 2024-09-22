class HeartsGame {
    constructor() {
        this.players = ['Player', 'AI 1', 'AI 2', 'AI 3'];
        this.deck = [];
        this.hands = [[], [], [], []];
        this.currentTrick = [];
        this.scores = [0, 0, 0, 0];
        this.currentPlayer = 0;
        this.heartsBroken = false;
        this.roundNumber = 0;
    }

    initializeGame() {
        this.deck = this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.startCardPassing();
    }

    startCardPassing() {
        if (this.roundNumber % 4 === 3) {
            this.determineStartingPlayer();
            this.renderGame();
            if (this.currentPlayer !== 0) {
                setTimeout(() => this.playAITurn(), 1000);
            }
            return;
        }

        const passContainer = document.getElementById('pass-container');
        const passHand = document.getElementById('pass-hand');
        const passButton = document.getElementById('pass-button');
        
        passContainer.style.display = 'flex';
        passHand.innerHTML = '';
        
        this.hands[0].forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.style.backgroundImage = `url('https://deckofcardsapi.com/static/img/${this.getCardCode(card)}.png')`;
            cardElement.onclick = () => this.toggleCardSelection(cardElement, index);
            passHand.appendChild(cardElement);
        });

        passButton.onclick = () => this.passSelectedCards();
    }

    toggleCardSelection(cardElement, index) {
        cardElement.classList.toggle('selected');
        const selectedCards = document.querySelectorAll('#pass-hand .card.selected');
        document.getElementById('pass-button').disabled = selectedCards.length !== 3;
    }

    passSelectedCards() {
        const selectedIndices = Array.from(document.querySelectorAll('#pass-hand .card.selected'))
            .map(card => Array.from(card.parentNode.children).indexOf(card));
        
        const cardsToPass = selectedIndices.map(index => this.hands[0][index]);
        this.hands[0] = this.hands[0].filter((_, index) => !selectedIndices.includes(index));

        this.passCardsForAllPlayers(cardsToPass);
    }

    passCardsForAllPlayers(humanCards) {
        const passDirection = this.roundNumber % 4; // 0: left, 1: right, 2: across
        const passedCards = [[], [], [], []];

        // Human player passing
        const humanTargetPlayer = (0 + [1, 3, 2][passDirection]) % 4;
        passedCards[humanTargetPlayer] = humanCards;

        // AI players passing
        for (let i = 1; i < 4; i++) {
            const cardsToPass = this.selectRandomCards(this.hands[i], 3);
            const targetPlayer = (i + [1, 3, 2][passDirection]) % 4;
            passedCards[targetPlayer] = passedCards[targetPlayer].concat(cardsToPass);
            this.hands[i] = this.hands[i].filter(card => !cardsToPass.includes(card));
        }

        // Add passed cards to each player's hand
        for (let i = 0; i < 4; i++) {
            this.hands[i] = this.hands[i].concat(passedCards[i]);
            this.hands[i].sort((a, b) => this.compareCards(a, b));
        }

        document.getElementById('pass-container').style.display = 'none';
        this.determineStartingPlayer();
        this.renderGame();
        if (this.currentPlayer !== 0) {
            setTimeout(() => this.playAITurn(), 1000);
        }
    }

    selectRandomCards(hand, count) {
        const shuffled = [...hand].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return suits.flatMap(suit => values.map(value => ({ suit, value })));
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        for (let i = 0; i < this.deck.length; i++) {
            this.hands[i % 4].push(this.deck[i]);
        }
        this.hands.forEach(hand => hand.sort((a, b) => this.compareCards(a, b)));
    }

    compareCards(a, b) {
        const suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
        const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        if (suitOrder.indexOf(a.suit) !== suitOrder.indexOf(b.suit)) {
            return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        }
        return valueOrder.indexOf(a.value) - valueOrder.indexOf(b.value);
    }

    determineStartingPlayer() {
        for (let i = 0; i < 4; i++) {
            if (this.hands[i].some(card => card.suit === 'clubs' && card.value === '2')) {
                this.currentPlayer = i;
                break;
            }
        }
    }

    playCard(playerIndex, card) {
        if (playerIndex !== this.currentPlayer) return false;
        
        const hand = this.hands[playerIndex];
        const cardIndex = hand.findIndex(c => c.suit === card.suit && c.value === card.value);
        if (cardIndex === -1) return false;

        if (this.currentTrick.length === 0 && !this.isValidLeadCard(card)) return false;
        if (this.currentTrick.length > 0 && !this.isValidFollowCard(playerIndex, card)) return false;

        this.currentTrick.push({ player: playerIndex, card });
        hand.splice(cardIndex, 1);

        if (card.suit === 'hearts') this.heartsBroken = true;

        this.currentPlayer = (this.currentPlayer + 1) % 4;
        this.renderGame();

        if (this.currentTrick.length === 4) {
            setTimeout(() => this.evaluateTrick(), 1000);
        } else if (this.currentPlayer !== 0) {
            setTimeout(() => this.playAITurn(), 1000);
        }

        return true;
    }

    playAITurn() {
        const hand = this.hands[this.currentPlayer];
        let playableCards = hand;

        if (this.currentTrick.length === 0) {
            playableCards = this.getValidLeadCards(hand);
        } else {
            playableCards = this.getValidFollowCards(this.currentPlayer, hand);
        }

        if (playableCards.length === 0) {
            console.error("No valid moves for AI player");
            return;
        }

        const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        this.playCard(this.currentPlayer, randomCard);
    }

    isValidLeadCard(card) {
        if (this.roundNumber === 0 && this.currentTrick.length === 0) {
            return card.suit === 'clubs' && card.value === '2';
        }
        if (this.heartsBroken) return true;
        return card.suit !== 'hearts';
    }

    getValidLeadCards(hand) {
        if (this.roundNumber === 0 && this.currentTrick.length === 0) {
            return hand.filter(card => card.suit === 'clubs' && card.value === '2');
        }
        if (this.heartsBroken) return hand;
        const nonHearts = hand.filter(card => card.suit !== 'hearts');
        return nonHearts.length > 0 ? nonHearts : hand;
    }

    isValidFollowCard(playerIndex, card) {
        const leadSuit = this.currentTrick[0].card.suit;
        if (card.suit === leadSuit) return true;
        return !this.hands[playerIndex].some(c => c.suit === leadSuit);
    }

    getValidFollowCards(playerIndex, hand) {
        const leadSuit = this.currentTrick[0].card.suit;
        const sameSuitCards = hand.filter(card => card.suit === leadSuit);
        return sameSuitCards.length > 0 ? sameSuitCards : hand;
    }

    evaluateTrick() {
        const leadSuit = this.currentTrick[0].card.suit;
        let winnerIndex = 0;
        let highestCard = this.currentTrick[0].card;

        for (let i = 1; i < 4; i++) {
            if (this.currentTrick[i].card.suit === leadSuit && 
                this.compareCards(this.currentTrick[i].card, highestCard) > 0) {
                winnerIndex = i;
                highestCard = this.currentTrick[i].card;
            }
        }

        const points = this.currentTrick.reduce((sum, play) => {
            if (play.card.suit === 'hearts') return sum + 1;
            if (play.card.suit === 'spades' && play.card.value === 'Q') return sum + 13;
            return sum;
        }, 0);

        this.scores[this.currentTrick[winnerIndex].player] += points;
        this.currentPlayer = this.currentTrick[winnerIndex].player;
        this.currentTrick = [];

        if (this.hands[0].length === 0) {
            this.endRound();
        } else if (this.currentPlayer !== 0) {
            setTimeout(() => this.playAITurn(), 1000);
        }

        this.renderGame();
    }

    endRound() {
        // Check for shoot the moon
        const shooterIndex = this.scores.findIndex(score => score === 26);
        if (shooterIndex !== -1) {
            this.scores = this.scores.map((score, index) => index === shooterIndex ? 0 : score + 26);
        }

        this.roundNumber++;

        if (this.scores.some(score => score >= 100)) {
            setTimeout(() => this.endGame(), 2000);
        } else {
            setTimeout(() => this.initializeGame(), 2000);
        }
    }

    endGame() {
        const winnerIndex = this.scores.indexOf(Math.min(...this.scores));
        alert(`Game Over! ${this.players[winnerIndex]} wins with ${this.scores[winnerIndex]} points!`);
    }

    renderGame() {
        // Update UI elements
        this.renderHand();
        this.renderTable();
        this.renderScores();
    }

    renderHand() {
        const handElement = document.getElementById('hand');
        handElement.innerHTML = '';
        this.hands[0].forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.style.backgroundImage = `url('https://deckofcardsapi.com/static/img/${this.getCardCode(card)}.png')`;
            cardElement.onclick = () => this.playCard(0, card);
            handElement.appendChild(cardElement);
        });
    }

    renderTable() {
        const tableElement = document.getElementById('table');
        tableElement.innerHTML = '';
        this.currentTrick.forEach(play => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.style.backgroundImage = `url('https://deckofcardsapi.com/static/img/${this.getCardCode(play.card)}.png')`;
            tableElement.appendChild(cardElement);
        });
    }

    getCardCode(card) {
        const valueMap = {
            'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', '10': '0', 'J': 'J', 'Q': 'Q', 'K': 'K'
        };
        const suitMap = { 'hearts': 'H', 'diamonds': 'D', 'clubs': 'C', 'spades': 'S' };
        return `${valueMap[card.value]}${suitMap[card.suit]}`;
    }

    renderScores() {
        const playersElement = document.getElementById('players');
        playersElement.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player';
            playerElement.textContent = `${player}: ${this.scores[index]}`;
            if (index === this.currentPlayer) {
                playerElement.classList.add('current-player');
            }
            playersElement.appendChild(playerElement);
        });
    }
}

// Initialize the game
const game = new HeartsGame();
game.initializeGame();