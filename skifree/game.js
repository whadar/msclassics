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

// Update these variables
const initialSpeed = 5;
const initialSpeedKmh = 20;
const speedIncreaseInterval = 1000; // Increase speed every 1000 distance units
const speedIncreaseAmount = 0.1;

// Add this variable
let currentSpeedKmh = initialSpeedKmh;

// Skier object
const skier = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 20,
    height: 40,
    speed: initialSpeed,
    dx: 0,
    direction: 'left' // Add this line to set initial direction
};

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
        this.speed = skier.speed * 0.75; // Reduced speed to 75% of skier's speed
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
    ctx.fillStyle = 'white';
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
    document.getElementById('score').innerText = score;
    updateSpeedDisplay(); // Add this line to update speed display
}

function updateSpeed() {
    const speedIncrease = Math.floor(distance / speedIncreaseInterval) * speedIncreaseAmount;
    skier.speed = initialSpeed + speedIncrease;
    currentSpeedKmh = initialSpeedKmh + (speedIncrease / initialSpeed) * initialSpeedKmh;
}

function updateSpeedDisplay() {
    document.getElementById('speed').innerText = Math.round(currentSpeedKmh);
}

function update() {
    if (gameOver) {
        // Display Game Over message
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Press Enter to Restart', canvas.width / 2 - 130, canvas.height / 2 + 40);
        return;
    }

    clearCanvas();
    updateSpeed();
    moveSkier();
    drawSkier();
    drawObstacles();
    checkCollision();

    // Increase distance and update score
    distance += skier.speed;
    updateScore();

    // Spawn yeti logic
    if (distance > yetiSpawnDistance) {
        if (!yeti || yeti.y > canvas.height) {
            yeti = new Yeti();
            yetiSpawnDistance = distance + 2000 + Math.random() * 1000;
        }
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

function resetGame() {
    gameOver = false;
    score = 0;
    distance = 0;
    frame = 0;
    obstacles = [];
    yeti = null;
    yetiSpawnDistance = 2000; // Reset yeti spawn distance
    skier.x = canvas.width / 2;
    skier.speed = initialSpeed; // Reset speed to initial value
    currentSpeedKmh = initialSpeedKmh; // Reset speed to initial value
    updateSpeedDisplay(); // Update speed display
    update();
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        skier.dx = skier.speed;
        skier.direction = 'right'; // Add this line
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        skier.dx = -skier.speed;
        skier.direction = 'left'; // Add this line
    } else if (e.key === 'Enter' && gameOver) {
        resetGame();
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'ArrowLeft' ||
        e.key === 'a'
    ) {
        skier.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Start the game
update();
