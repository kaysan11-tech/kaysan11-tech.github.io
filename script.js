window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // Canvas & World Constants
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const GROUND_Y = 320;
    const LEVEL_LENGTH = 12000; // Total level distance in pixels

    // Engine Variables
    let gameSpeed = 7.5;
    let distanceTraveled = 0;
    let gameOver = false;
    let victory = false;
    let holdingJump = false;

    // Background Color Pulse (RobTop GD style effect)
    let bgHue = 200;

    // Player Cube Object
    const player = {
        x: 120,
        y: GROUND_Y - 40,
        size: 40,
        dy: 0,
        gravity: 0.95,
        jumpForce: -14.2,
        isGrounded: true,
        rotation: 0
    };

    // Particle Trail Array
    let particles = [];

    // Obstacle Map (1 = Spike, 2 = Block, 3 = Spike on Block)
    const levelMap = [
        { x: 700, type: 1 },
        { x: 1100, type: 1 },
        { x: 1400, type: 2 },
        { x: 1700, type: 1 },
        { x: 2100, type: 3 },
        { x: 2600, type: 1 },
        { x: 2700, type: 1 },
        { x: 3200, type: 2 },
        { x: 3240, type: 2 },
        { x: 3700, type: 3 },
        { x: 4200, type: 1 },
        { x: 4250, type: 1 },
        { x: 4300, type: 1 },
        { x: 4900, type: 2 },
        { x: 5400, type: 3 },
        { x: 6000, type: 1 },
        { x: 6600, type: 2 },
        { x: 7200, type: 3 },
        { x: 8000, type: 1 },
        { x: 8800, type: 3 },
        { x: 9600, type: 1 },
        { x: 9650, type: 1 },
        { x: 10500, type: 3 }
    ];

    let activeObstacles = [...levelMap];

    // Jump Logic
    function handleJump() {
        if (gameOver || victory) {
            restartGame();
            return;
        }
        if (player.isGrounded) {
            player.dy = player.jumpForce;
            player.isGrounded = false;
        }
    }

    function restartGame() {
        distanceTraveled = 0;
        gameOver = false;
        victory = false;
        player.y = GROUND_Y - player.size;
        player.dy = 0;
        player.isGrounded = true;
        player.rotation = 0;
        activeObstacles = JSON.parse(JSON.stringify(levelMap));
        particles = [];
        requestAnimationFrame(gameLoop);
    }

    // Input Handling (Supports Hold-to-Jump)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            holdingJump = true;
            handleJump();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            holdingJump = false;
        }
    });

    canvas.addEventListener('mousedown', () => { holdingJump = true; handleJump(); });
    canvas.addEventListener('mouseup', () => { holdingJump = false; });

    // Spawn Particles Behind Player
    function createParticle() {
        particles.push({
            x: player.x,
            y: player.y + player.size - 5,
            size: Math.random() * 6 + 2,
            speedX: -gameSpeed * 0.5,
            speedY: (Math.random() - 0.5) * 2,
            life: 1.0
        });
    }

    // Main Engine Game Loop
    function gameLoop() {
        if (gameOver || victory) return;

        // 1. UPDATE PHYSICS
        distanceTraveled += gameSpeed;

        // Auto-jump if holding key down on floor contact
        if (holdingJump && player.isGrounded) {
            handleJump();
        }

        player.dy += player.gravity;
        player.y += player.dy;

        // Ground Collision & Dynamic Snap-Rotation
        if (player.y >= GROUND_Y - player.size) {
            player.y = GROUND_Y - player.size;
            player.dy = 0;
            player.isGrounded = true;
            // Snap rotation to nearest 90 degrees when landing
            player.rotation = Math.round(player.rotation / 90) * 90;
        } else {
            player.isGrounded = false;
            player.rotation += 8.5; // RobTop style airborne square flip
            createParticle();
        }

        // Progress Calculation
        let progressPercent = Math.min(100, Math.floor((distanceTraveled / LEVEL_LENGTH) * 100));
        progressBar.style.width = progressPercent + '%';
        progressText.innerText = progressPercent + '%';

        if (distanceTraveled >= LEVEL_LENGTH) {
            victory = true;
        }

        // 2. RENDERING SCENE
        bgHue = (bgHue + 0.2) % 360;
        ctx.fillStyle = `hsl(${bgHue}, 60%, 10%)`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw Animated Grid Lines
        ctx.strokeStyle = `hsl(${bgHue}, 80%, 25%)`;
        ctx.lineWidth = 1;
        let gridOffset = distanceTraveled % 40;
        for (let x = -gridOffset; x < CANVAS_WIDTH; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, GROUND_Y);
            ctx.stroke();
        }

        // Draw Floor & Glowing Edge
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
        ctx.strokeStyle = `hsl(${bgHue}, 100%, 50%)`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.stroke();

        // Render Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 0.04;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            ctx.fillStyle = `rgba(0, 255, 255, ${p.life})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }

        // Render Player Cube with Dual Color Scheme
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate((player.rotation * Math.PI) / 180);

        // Outer Lime Green Body
        ctx.fillStyle = '#a6ff00';
        ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);

        // Inner Cyan Accent Box
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-player.size / 4, -player.size / 4, player.size / 2, player.size / 2);

        // GD Icon Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-player.size / 3, -player.size / 3, 6, 6);
        ctx.fillRect(player.size / 3 - 6, -player.size / 3, 6, 6);
        ctx.restore();

        // 3. DRAW & CHECK OBSTACLES
        for (let i = activeObstacles.length - 1; i >= 0; i--) {
            let obs = activeObstacles[i];
            let screenX = obs.x - distanceTraveled + player.x;

            if (screenX < -100) continue; // Offscreen left

            // Render Spike (Type 1)
            if (obs.type === 1) {
                ctx.fillStyle = '#ff0055';
                ctx.beginPath();
                ctx.moveTo(screenX, GROUND_Y);
                ctx.lineTo(screenX + 20, GROUND_Y - 40);
                ctx.lineTo(screenX + 40, GROUND_Y);
                ctx.closePath();
                ctx.fill();

                // Hitbox Collision
                if (
                    player.x < screenX + 30 &&
                    player.x + player.size > screenX + 10 &&
                    player.y + player.size > GROUND_Y - 35
                ) {
                    gameOver = true;
                }
            }
            // Render Block Platform (Type 2)
            else if (obs.type === 2) {
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(screenX, GROUND_Y - 40, 40, 40);
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(screenX, GROUND_Y - 40, 40, 40);

                // Collision
                if (
                    player.x < screenX + 40 &&
                    player.x + player.size > screenX &&
                    player.y + player.size > GROUND_Y - 40
                ) {
                    gameOver = true;
                }
            }
            // Render Spike sitting on top of Block (Type 3)
            else if (obs.type === 3) {
                // Block
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(screenX, GROUND_Y - 40, 40, 40);
                // Spike on top
                ctx.fillStyle = '#ff0055';
                ctx.beginPath();
                ctx.moveTo(screenX, GROUND_Y - 40);
                ctx.lineTo(screenX + 20, GROUND_Y - 80);
                ctx.lineTo(screenX + 40, GROUND_Y - 40);
                ctx.closePath();
                ctx.fill();

                // Collision
                if (
                    player.x < screenX + 35 &&
                    player.x + player.size > screenX + 5 &&
                    player.y + player.size > GROUND_Y - 75
                ) {
                    gameOver = true;
                }
            }
        }

        // 4. OVERLAY SCREENS
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#ff0055';
            ctx.font = 'bold 42px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL FAILED!', CANVAS_WIDTH / 2, 180);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px sans-serif';
            ctx.fillText('Click or Press Space to Retry', CANVAS_WIDTH / 2, 230);
            ctx.textAlign = 'left';
        } else if (victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 42px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL COMPLETE! 🏆', CANVAS_WIDTH / 2, 180);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px sans-serif';
            ctx.fillText('100% Completed! Click to Play Again', CANVAS_WIDTH / 2, 230);
            ctx.textAlign = 'left';
        } else {
            requestAnimationFrame(gameLoop);
        }
    }

    // Launch Game Loop
    requestAnimationFrame(gameLoop);
});
