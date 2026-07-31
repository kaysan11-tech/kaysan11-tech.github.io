const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundY = 240;
let score = 0;
let gameOver = false;
let frameCount = 0;

const player = {
    x: 60,
    y: groundY - 30,
    size: 30,
    dy: 0,
    gravity: 0.8,
    jumpStrength: -12,
    isJumping: false
};

let obstacles = [];

function jump() {
    if (gameOver) {
        resetGame();
        return;
    }
    if (!player.isJumping) {
        player.dy = player.jumpStrength;
        player.isJumping = true;
    }
}

function resetGame() {
    score = 0;
    gameOver = false;
    obstacles = [];
    player.y = groundY - player.size;
    player.dy = 0;
    player.isJumping = false;
    frameCount = 0;
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ground
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Physics
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y >= groundY - player.size) {
        player.y = groundY - player.size;
        player.isJumping = false;
        player.dy = 0;
    }

    // Draw Player
    ctx.fillStyle = '#ff2e63';
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Obstacles
    frameCount++;
    if (frameCount % 90 === 0) {
        obstacles.push({
            x: canvas.width,
            width: 25,
            height: 30
        });
    }

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= 6;

        // Draw Spike
        ctx.fillStyle = '#f9ed69';
        ctx.beginPath();
        ctx.moveTo(obs.x, groundY);
        ctx.lineTo(obs.x + obs.width / 2, groundY - obs.height);
        ctx.lineTo(obs.x + obs.width, groundY);
        ctx.closePath();
        ctx.fill();

        // Collision Check
        if (
            player.x < obs.x + obs.width &&
            player.x + player.size > obs.x &&
            player.y + player.size > groundY - obs.height
        ) {
            gameOver = true;
        }
    }

    if (obstacles.length > 0 && obstacles[0].x < -30) {
        obstacles.shift();
        score += 10;
    }

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 20, 35);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e94560';
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width / 2, 130);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, 180);
        ctx.textAlign = 'left';
    } else {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();
