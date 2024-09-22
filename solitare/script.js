const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];

const stockPile = document.getElementById('stock');
const wastePile = document.getElementById('waste');
const foundations = document.querySelectorAll('.foundation');
const tableau = document.getElementById('tableau');

let selectedCard = null;

// Initialize the game
function initGame() {
    deck = createDeck();
    shuffleDeck(deck);
    setupTableau();
    stockPile.addEventListener('click', drawFromStock);
}

// Create a new deck of cards
function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                suit: suit,
                value: value,
                color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                faceUp: false
            });
        }
    }
    return deck;
}

// Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Set up the tableau piles
function setupTableau() {
    for (let i = 0; i < 7; i++) {
        const pile = document.createElement('div');
        pile.classList.add('tableau-pile', 'pile');
        pile.setAttribute('data-index', i);
        tableau.appendChild(pile);

        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            if (j === i) {
                card.faceUp = true;
            }
            addCardToPile(card, pile);
        }
    }
}

// Add a card to a pile
function addCardToPile(card, pile) {
    const cardDiv = createCardElement(card);
    pile.appendChild(cardDiv);
    updateCardPositions(pile);
}

// Create a card DOM element
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    if (card.faceUp) {
        cardDiv.textContent = `${card.value} ${getSuitSymbol(card.suit)}`;
        if (card.color === 'red') {
            cardDiv.classList.add('red');
        }
    } else {
        cardDiv.classList.add('face-down');
    }
    cardDiv.setAttribute('data-suit', card.suit);
    cardDiv.setAttribute('data-value', card.value);
    cardDiv.setAttribute('data-color', card.color);
    cardDiv.setAttribute('data-faceup', card.faceUp);
    cardDiv.addEventListener('click', cardClickHandler);
    return cardDiv;
}

// Update card positions in a pile
function updateCardPositions(pile) {
    const cards = pile.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.top = `${index * 20}px`;
    });
}

// Handle stock pile click
function drawFromStock() {
    if (deck.length > 0) {
        const card = deck.pop();
        card.faceUp = true;
        const cardDiv = createCardElement(card);
        wastePile.appendChild(cardDiv);
    } else {
        // Reset stock from waste pile
        while (wastePile.firstChild) {
            const cardDiv = wastePile.lastChild;
            const card = getCardFromElement(cardDiv);
            card.faceUp = false;
            deck.unshift(card);
            wastePile.removeChild(cardDiv);
        }
    }
}

// Get suit symbol
function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
    }
}

// Handle card click
function cardClickHandler(e) {
    const cardDiv = e.currentTarget;
    const card = getCardFromElement(cardDiv);
    const pile = cardDiv.parentElement;

    // Flip face-down card if it's the last card in the pile
    if (cardDiv.classList.contains('face-down')) {
        const isLastCard = cardDiv === pile.lastChild;
        if (isLastCard) {
            card.faceUp = true;
            cardDiv.classList.remove('face-down');
            cardDiv.textContent = `${card.value} ${getSuitSymbol(card.suit)}`;
            if (card.color === 'red') {
                cardDiv.classList.add('red');
            }
            cardDiv.setAttribute('data-faceup', true);
        }
        return;
    }

    // If no card is selected, select the clicked card
    if (!selectedCard) {
        selectedCard = cardDiv;
        cardDiv.classList.add('selected');
    } else {
        // Attempt to move the selected card to the clicked pile
        const sourceCardDiv = selectedCard;
        const sourceCard = getCardFromElement(sourceCardDiv);
        const sourcePile = sourceCardDiv.parentElement;

        if (isValidMove(sourceCardDiv, cardDiv)) {
            moveCard(sourceCardDiv, cardDiv.parentElement);
            updateCardPositions(sourcePile);
            updateCardPositions(cardDiv.parentElement);
        }
        sourceCardDiv.classList.remove('selected');
        selectedCard = null;
    }

    checkWinCondition();
}

// Check if moving a card is valid
function isValidMove(cardDiv, targetPile) {
    const card = getCardFromElement(cardDiv);
    const pile = targetPile;

    if (pile.classList.contains('foundation')) {
        // Move to foundation
        const foundationSuit = pile.getAttribute('data-suit');
        if (card.suit !== foundationSuit) return false;

        const topCard = pile.lastChild ? getCardFromElement(pile.lastChild) : null;
        if (!topCard && card.value === 'A') return true;
        if (topCard && isNextInFoundation(topCard, card)) return true;
    } else if (pile.classList.contains('tableau-pile') || pile.id === 'tableau') {
        // Move to tableau
        const topCard = pile.lastChild ? getCardFromElement(pile.lastChild) : null;
        if (!topCard && card.value === 'K') return true;
        if (topCard && isNextInTableau(topCard, card)) return true;
    }
    return false;
}

// Check if the card can be placed on the foundation
function isNextInFoundation(topCard, card) {
    return cardValueToNumber(card.value) === cardValueToNumber(topCard.value) + 1;
}

// Check if the card can be placed on the tableau
function isNextInTableau(topCard, card) {
    return cardValueToNumber(card.value) === cardValueToNumber(topCard.value) - 1 &&
        card.color !== topCard.color;
}

// Convert card value to number
function cardValueToNumber(value) {
    if (value === 'A') return 1;
    if (value === 'J') return 11;
    if (value === 'Q') return 12;
    if (value === 'K') return 13;
    return parseInt(value);
}

// Move card to new pile
function moveCard(cardDiv, newPile) {
    const movingCards = [];
    let sibling = cardDiv;
    while (sibling) {
        movingCards.push(sibling);
        sibling = sibling.nextSibling;
    }
    for (let card of movingCards) {
        const sourcePile = card.parentElement;
        sourcePile.removeChild(card);
        newPile.appendChild(card);
    }
}

// Get card data from DOM element
function getCardFromElement(cardDiv) {
    return {
        suit: cardDiv.getAttribute('data-suit'),
        value: cardDiv.getAttribute('data-value'),
        color: cardDiv.getAttribute('data-color'),
        faceUp: cardDiv.getAttribute('data-faceup') === 'true'
    };
}

// Check win condition
function checkWinCondition() {
    const foundationPiles = document.querySelectorAll('.foundation');
    let complete = true;
    foundationPiles.forEach(pile => {
        const topCard = pile.lastChild ? getCardFromElement(pile.lastChild) : null;
        if (!topCard || cardValueToNumber(topCard.value) !== 13) {
            complete = false;
        }
    });
    if (complete) {
        alert('Congratulations! You Win!');
    }
}

// Start the game
initGame();
