const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameOver = false;
let score = 0;
let distance = 0;
let frame = 0;
let obstacles = [];
let yeti = null;
let yetiSpawnDistance = 2000;

// Speed variables
const initialSpeed = 5;
const initialSpeedKmh = 20;
const speedIncreaseInterval = 1000; // Increase speed every 1000 distance units
const speedIncreaseAmount = 0.1;

// Current speed
let currentSpeedKmh = initialSpeedKmh;

// Skier object
const skier = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 20,
    height: 40,
    speed: initialSpeed,
    dx: 0,
    direction: 'left' // Initial direction
};

// Function to resize canvas
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    skier.x = canvas.width / 2;
    skier.y = canvas.height - 100;
}

// Call resizeCanvas once at the start and add an event listener for window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Obstacle class
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.type = type; // 'tree' or 'rock'
    }

    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.textBaseline = 'top';
        if (this.type === 'tree') {
            // Draw a tree emoji
            ctx.fillText('🌲', this.x, this.y);
        } else if (this.type === 'rock') {
            // Draw a rock emoji
            ctx.fillText('🪨', this.x, this.y);
        }
    }

    update() {
        this.y += skier.speed;
        this.draw();
    }
}

// Yeti class
class Yeti {
    constructor() {
        this.x = Math.random() * (canvas.width - 50);
        this.y = -100;
        this.width = 40;
        this.height = 60;
        this.speed = skier.speed * 0.75; // 75% of skier's speed
    }

    draw() {
        // Draw a yeti using skier emoji
        ctx.font = `${this.height}px Arial`;
        ctx.textBaseline = 'top';
        ctx.fillText('⛷️', this.x, this.y);
    }

    update() {
        // Move towards the skier
        if (this.x < skier.x) {
            this.x += this.speed / 3; // Reduced horizontal speed
        } else {
            this.x -= this.speed / 3; // Reduced horizontal speed
        }
        this.y += this.speed;
        this.draw();
    }
}

function drawSkier() {
    ctx.save();
    ctx.translate(skier.x, skier.y);

    // Draw snowboarder emoji
    ctx.font = `${skier.height}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (skier.direction === 'left') {
        ctx.scale(-1, 1);
    }
    ctx.fillText('🏂', 0, 0);

    ctx.restore();
}

function createObstacle() {
    const x = Math.random() * (canvas.width - 30);
    const y = -60;
    const type = Math.random() > 0.5 ? 'tree' : 'rock';
    const obstacle = new Obstacle(x, y, type);
    obstacles.push(obstacle);
}

function drawObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        // Remove obstacles that have moved off-screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
        }
    });
}

function checkCollision() {
    // Check collision with obstacles
    obstacles.forEach((obstacle) => {
        if (
            skier.x - skier.width / 2 < obstacle.x + obstacle.size &&
            skier.x + skier.width / 2 > obstacle.x &&
            skier.y < obstacle.y + obstacle.size &&
            skier.y + skier.height > obstacle.y
        ) {
            gameOver = true;
        }
    });

    // Check collision with yeti
    if (yeti) {
        if (
            skier.x - skier.width / 2 < yeti.x + yeti.width &&
            skier.x + skier.width / 2 > yeti.x &&
            skier.y < yeti.y + yeti.height &&
            skier.y + skier.height > yeti.y
        ) {
            gameOver = true;
        }
    }
}

function clearCanvas() {
    ctx.fillStyle = 'white'; // Change this to white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSkier() {
    skier.x += skier.dx;

    // Prevent the skier from moving off-screen
    if (skier.x - skier.width / 2 < 0) {
        skier.x = skier.width / 2;
    }
    if (skier.x + skier.width / 2 > canvas.width) {
        skier.x = canvas.width - skier.width / 2;
    }
}

function updateScore() {
    score = Math.floor(distance / 10);
    document.getElementById('scoreValue').innerText = score;
    updateSpeedDisplay(); // Update speed display
}

function updateSpeed() {
    const speedIncrease = Math.floor(distance / speedIncreaseInterval) * speedIncreaseAmount;
    skier.speed = initialSpeed + speedIncrease;
    currentSpeedKmh = initialSpeedKmh + (speedIncrease / initialSpeed) * initialSpeedKmh;
}

function updateSpeedDisplay() {
    document.getElementById('speedValue').innerText = Math.round(currentSpeedKmh);
}

function update() {
    clearCanvas(); // Clear the canvas at the start of each frame

    if (gameOver) {
        // Display Game Over message
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px Arial';
        ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    updateSpeed();
    moveSkier();
    drawSkier();
    drawObstacles();
    checkCollision();

    // Increase distance and update score
    distance += skier.speed;
    updateScore();

    // Spawn yeti logic
    if (distance > yetiSpawnDistance && (!yeti || yeti.y > canvas.height)) {
        yeti = new Yeti();
        yetiSpawnDistance = distance + 2000 + Math.random() * 1000;
    }

    if (yeti) {
        yeti.update();
    }

    // Create obstacles at intervals (adjust based on speed)
    if (frame % Math.max(10, Math.floor(50 / (skier.speed / initialSpeed))) === 0) {
        createObstacle();
    }

    frame++;
    requestAnimationFrame(update);
}

// Add event listeners for keyboard controls
function keyDown(e) {
    if (e.key === 'ArrowLeft') {
        skier.dx = -skier.speed;
        skier.direction = 'left';
    } else if (e.key === 'ArrowRight') {
        skier.dx = skier.speed;
        skier.direction = 'right';
    }
}

function keyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        skier.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Add event listener for Enter key to restart the game
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && gameOver) {
        resetGame();
        update();
    }
});

// Function to reset the game
function resetGame() {
    gameOver = false;
    score = 0;
    distance = 0;
    frame = 0;
    obstacles = [];
    yeti = null;
    yetiSpawnDistance = 2000;
    skier.x = canvas.width / 2;
    skier.y = canvas.height - 100;
    skier.speed = initialSpeed;
    currentSpeedKmh = initialSpeedKmh;
    updateSpeedDisplay();
}

// Add touch control variables
let touchStartX = 0;
let touchEndX = 0;

// Add touch event listeners for touch controls
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling while touching the canvas
    touchEndX = event.touches[0].clientX;
    let touchDiff = touchEndX - touchStartX;

    if (touchDiff > 50) { // Threshold to prevent accidental moves
        skier.dx = skier.speed;
        skier.direction = 'right';
        touchStartX = touchEndX;
    } else if (touchDiff < -50) {
        skier.dx = -skier.speed;
        skier.direction = 'left';
        touchStartX = touchEndX;
    }
}

function handleTouchEnd(event) {
    skier.dx = 0;
    touchStartX = 0;
    touchEndX = 0;
}

// Modify the event listener for restarting the game to include touch
canvas.addEventListener('click', function(e) {
    if (gameOver) {
        resetGame();
        update();
    }
});

// Start the game
update();
