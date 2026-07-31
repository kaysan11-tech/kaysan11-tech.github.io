// Safely run code only when the DOM is ready
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Safety check to ensure canvas element exists
    if (!canvas) {
        console.error('Error: gameCanvas element not found in HTML!');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Game Variables
    const groundY = 240;
    let score = 0;
    let gameOver = false;
    let frameCount = 0;
    let animationFrameId;

    // Player Object
    const player = {
        x: 60,
        y: groundY - 30,
        size: 30,
        dy: 0,
        gravity: 0.8,
        jumpStrength: -12,
        isJumping: false,
        rotation: 0
    };

    let obstacles = [];

    // Jump Handler
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

    // Reset Game Function
    function resetGame() {
        score = 0;
        gameOver = false;
        obstacles = [];
        player.y = groundY - player.size;
        player.dy = 0;
        player.isJumping = false;
        player.rotation = 0;
        frameCount = 0;
        
        // Cancel existing loop before restarting
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gameLoop();
    }

    // Keyboard & Mouse Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault(); // Prevents page scrolling down when pressing Spacebar
            jump();
        }
    });

    canvas.addEventListener('click', jump);

    // Main Game Loop
    function gameLoop() {
        if (gameOver) return;

        // Clear canvas screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Ground
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
        ctx.strokeStyle = '#00fff0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();

        // Update Physics
        player.dy += player.gravity;
        player.y += player.dy;

        // Floor collision
        if (player.y >= groundY - player.size) {
            player.y = groundY - player.size;
            player.isJumping = false;
            player.dy = 0;
            player.rotation = 0;
        } else {
            player.rotation += 8; // Spin during jump
        }

        // Render Player
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate((player.rotation * Math.PI) / 180);
        ctx.fillStyle = '#ff2e63';
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
        ctx.fillStyle = '#00fff0';
        ctx.fillRect(-player.size / 4, -player.size / 4, player.size / 2, player.size / 2);
        ctx.restore();

        // Obstacles & Collision Check
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

            // Collision Detection
            if (
                player.x < obs.x + obs.width &&
                player.x + player.size > obs.x &&
                player.y + player.size > groundY - obs.height
            ) {
                gameOver = true;
            }
        }

        // Score tracking
        if (obstacles.length > 0 && obstacles[0].x < -30) {
            obstacles.shift();
            score += 10;
        }

        // Draw Score UI
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Score: ${score}`, 20, 35);

        // Game Over Screen
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER!', canvas.width / 2, 130);

            ctx.fillStyle = '#ffffff';
            ctx.font = '18px sans-serif';
            ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 170);
            ctx.fillText('Press Space or Click to Play Again', canvas.width / 2, 210);
            ctx.textAlign = 'left';
        } else {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // Launch game
    gameLoop();
});
