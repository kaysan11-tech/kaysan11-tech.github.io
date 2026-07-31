// Wait for the web page DOM to fully load before running the game
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Get the Canvas and Graphics Context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 2. Game Variables & Constants
    const groundY = 240;          // Y position where the floor starts
    let score = 0;               // Player score counter
    let gameOver = false;        // Game state flag
    let frameCount = 0;          // Tracks loop frames for obstacle spawning

    // 3. Player (Cube) Object Properties
    const player = {
        x: 60,
        y: groundY - 30,         // Start resting on the ground
        size: 30,
        dy: 0,                   // Vertical velocity (speed of movement up/down)
        gravity: 0.8,            // Pulls player back down
        jumpStrength: -12,       // Upward impulse speed
        isJumping: false,
        rotation: 0              // Rotation angle for classic Geometry Dash flips
    };

    // 4. Obstacles Array
    let obstacles = [];

    // 5. Jump Functionality
    function jump() {
        // If the game is over, restart the game on press
        if (gameOver) {
            resetGame();
            return;
        }

        // Only jump if player is currently on the ground
        if (!player.isJumping) {
            player.dy = player.jumpStrength;
            player.isJumping = true;
        }
    }

    // Reset game state back to starting defaults
    function resetGame() {
        score = 0;
        gameOver = false;
        obstacles = [];
        player.y = groundY - player.size;
        player.dy = 0;
        player.isJumping = false;
        player.rotation = 0;
        frameCount = 0;
        requestAnimationFrame(gameLoop); // Restart loop
    }

    // 6. Listeners for Keyboard and Click inputs
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            jump();
        }
    });

    canvas.addEventListener('click', () => {
        jump();
    });

    // 7. Main Game Loop (runs ~60 times per second)
    function gameLoop() {
        if (gameOver) return; // Stop loop if player loses

        // Clear the canvas on every frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- DRAW GROUND ---
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
        ctx.strokeStyle = '#00fff0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();

        // --- UPDATE & DRAW PLAYER ---
        player.dy += player.gravity; // Apply gravity
        player.y += player.dy;       // Move player vertically

        // Floor collision check
        if (player.y >= groundY - player.size) {
            player.y = groundY - player.size;
            player.isJumping = false;
            player.dy = 0;
            player.rotation = 0; // Snap upright on landing
        } else {
            // Spin player cube while airborne!
            player.rotation += 8;
        }

        // Render player cube with rotation
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate((player.rotation * Math.PI) / 180);
        ctx.fillStyle = '#ff2e63'; // Bright neon pink cube
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
        
        // Inner cube detail (Geometry Dash style)
        ctx.fillStyle = '#00fff0';
        ctx.fillRect(-player.size / 4, -player.size / 4, player.size / 2, player.size / 2);
        ctx.restore();

        // --- SPAWN & MOVE OBSTACLES (SPIKES) ---
        frameCount++;
        if (frameCount % 90 === 0) { // Spawn a new spike roughly every 1.5 seconds
            obstacles.push({
                x: canvas.width,
                width: 25,
                height: 30
            });
        }

        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= 6; // Speed spike moves to the left

            // Draw Spike (Triangle shape)
            ctx.fillStyle = '#f9ed69'; // Yellow spike color
            ctx.beginPath();
            ctx.moveTo(obs.x, groundY);
            ctx.lineTo(obs.x + obs.width / 2, groundY - obs.height);
            ctx.lineTo(obs.x + obs.width, groundY);
            ctx.closePath();
            ctx.fill();

            // Collision Detection (Check if player cube touches spike)
            if (
                player.x < obs.x + obs.width &&
                player.x + player.size > obs.x &&
                player.y + player.size > groundY - obs.height
            ) {
                gameOver = true;
            }
        }

        // Remove obstacles that have moved off the left side of the screen
        if (obstacles.length > 0 && obstacles[0].x < -30) {
            obstacles.shift();
            score += 10; // Gain score for surviving spikes!
        }

        // --- DRAW SCORE & GAME OVER TEXT ---
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Score: ${score}`, 20, 35);

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
            ctx.textAlign = 'left'; // Reset alignment
        } else {
            // Request next frame in the animation loop
            requestAnimationFrame(gameLoop);
        }
    }

    // Start the game loop for the first time
    requestAnimationFrame(gameLoop);
});
