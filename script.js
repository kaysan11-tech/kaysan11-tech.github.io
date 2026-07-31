window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const modeDisplay = document.getElementById('modeDisplay');

    // Engine Setup
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const GROUND_Y = 330;
    const CEILING_Y = 50;
    const LEVEL_LENGTH = 14000;

    let gameSpeed = 7.5;
    let distanceTraveled = 0;
    let gameOver = false;
    let victory = false;
    let holdingJump = false;
    let bgHue = 200;

    // Player Object
    const player = {
        x: 120,
        y: GROUND_Y - 35,
        size: 35,
        dy: 0,
        mode: 'cube',      // 'cube', 'ship', or 'ball'
        gravity: 0.9,
        gravityDir: 1,     // 1 for down, -1 for inverted ceiling (Ball mode)
        jumpForce: -13.5,
        isGrounded: true,
        rotation: 0
    };

    let particles = [];

    // Obstacles & Portals Map
    // Types: 1=Spike, 2=Block, 10=Ship Portal (Magenta), 11=Ball Portal (Orange), 12=Cube Portal (Green)
    const levelMap = [
        { x: 600, type: 1 },
        { x: 900, type: 1 },
        { x: 1200, type: 10 }, // --- SHIP PORTAL ---
        { x: 1600, type: 1 },
        { x: 1800, type: 2, y: 200 },
        { x: 2200, type: 1 },
        { x: 2500, type: 11 }, // --- BALL PORTAL ---
        { x: 2900, type: 1 },
        { x: 3300, type: 1 },
        { x: 3700, type: 12 }, // --- CUBE PORTAL ---
        { x: 4200, type: 2, y: GROUND_Y - 40 },
        { x: 4700, type: 10 }, // --- SHIP PORTAL ---
        { x: 5200, type: 1 },
        { x: 5800, type: 11 }, // --- BALL PORTAL ---
        { x: 6400, type: 1 },
        { x: 7000, type: 12 }  // --- CUBE PORTAL ---
    ];

    let activeObstacles = [...levelMap];

    // Interaction Trigger
    function handleJump() {
        if (gameOver || victory) {
            restartGame();
            return;
        }

        if (player.mode === 'cube') {
            if (player.isGrounded) {
                player.dy = player.jumpForce;
                player.isGrounded = false;
            }
        } else if (player.mode === 'ball') {
            if (player.isGrounded) {
                // Flip gravity upside down or back right-side up!
                player.gravityDir *= -1;
                player.isGrounded = false;
            }
        }
    }

    function restartGame() {
        distanceTraveled = 0;
        gameOver = false;
        victory = false;
        player.mode = 'cube';
        player.gravityDir = 1;
        player.y = GROUND_Y - player.size;
        player.dy = 0;
        player.isGrounded = true;
        player.rotation = 0;
        activeObstacles = JSON.parse(JSON.stringify(levelMap));
        particles = [];
        updateModeUI();
        requestAnimationFrame(gameLoop);
    }

    function updateModeUI() {
        modeDisplay.innerText = player.mode.toUpperCase();
        if (player.mode === 'cube') modeDisplay.style.color = '#a6ff00';
        if (player.mode === 'ship') modeDisplay.style.color = '#ff00ff';
        if (player.mode === 'ball') modeDisplay.style.color = '#ff8800';
    }

    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (!holdingJump) handleJump();
            holdingJump = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') holdingJump = false;
    });

    canvas.addEventListener('mousedown', () => {
        if (!holdingJump) handleJump();
        holdingJump = true;
    });
    canvas.addEventListener('mouseup', () => holdingJump = false);

    // Particle Trail Engine
    function createParticle() {
        particles.push({
            x: player.x,
            y: player.y + player.size / 2,
            size: Math.random() * 5 + 2,
            speedX: -gameSpeed * 0.4,
            speedY: (Math.random() - 0.5) * 2,
            life: 1.0
        });
    }

    // Main Engine Game Loop
    function gameLoop() {
        if (gameOver || victory) return;

        distanceTraveled += gameSpeed;

        // 1. GAMEMODE PHYSICS ENGINES
        if (player.mode === 'ship') {
            // Ship flying physics: Holding jump rockets up, releasing drops down
            if (holdingJump) {
                player.dy -= 0.65; // Thrust upward
            } else {
                player.dy += 0.55; // Gravity pull down
            }
            player.dy = Math.max(-8, Math.min(8, player.dy)); // Terminal velocity limit
            player.y += player.dy;

            // Pitch ship nose based on speed
            player.rotation = player.dy * 4;

            // Roof and Floor Bounds for Ship
            if (player.y <= CEILING_Y) {
                player.y = CEILING_Y;
                player.dy = 0;
            }
            if (player.y >= GROUND_Y - player.size) {
                player.y = GROUND_Y - player.size;
                player.dy = 0;
            }
            createParticle();

        } else if (player.mode === 'ball') {
            // Ball Gravity-Flip Physics
            player.dy += player.gravity * 0.8 * player.gravityDir;
            player.y += player.dy;

            // Bottom Ground Collision
            if (player.gravityDir === 1 && player.y >= GROUND_Y - player.size) {
                player.y = GROUND_Y - player.size;
                player.dy = 0;
                player.isGrounded = true;
            }
            // Ceiling Ground Collision
            else if (player.gravityDir === -1 && player.y <= CEILING_Y) {
                player.y = CEILING_Y;
                player.dy = 0;
                player.isGrounded = true;
            } else {
                player.isGrounded = false;
            }
            player.rotation += 10 * player.gravityDir;

        } else {
            // Cube Mode Physics
            if (holdingJump && player.isGrounded) handleJump();

            player.dy += player.gravity;
            player.y += player.dy;

            if (player.y >= GROUND_Y - player.size) {
                player.y = GROUND_Y - player.size;
                player.dy = 0;
                player.isGrounded = true;
                player.rotation = Math.round(player.rotation / 90) * 90;
            } else {
                player.isGrounded = false;
                player.rotation += 8;
                createParticle();
            }
        }

        // Progress Percent
        let progressPercent = Math.min(100, Math.floor((distanceTraveled / LEVEL_LENGTH) * 100));
        progressBar.style.width = progressPercent + '%';
        progressText.innerText = progressPercent + '%';

        if (distanceTraveled >= LEVEL_LENGTH) victory = true;

        // 2. RENDER GRAPHICS
        bgHue = (bgHue + 0.2) % 360;
        ctx.fillStyle = `hsl(${bgHue}, 50%, 8%)`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Ceiling Line
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);
        ctx.strokeStyle = `hsl(${bgHue}, 100%, 50%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, CEILING_Y);
        ctx.lineTo(CANVAS_WIDTH, CEILING_Y);
        ctx.stroke();

        // Floor Line
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.stroke();

        // Particles
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

        // Render Player Avatar (Cube / Ship / Ball)
        ctx.save();
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
        ctx.rotate((player.rotation * Math.PI) / 180);

        if (player.mode === 'ship') {
            // Draw Rocket Ship Shape
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(-15, -15);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-15, 15);
            ctx.closePath();
            ctx.fill();
            // Window
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(0, -5, 8, 8);
        } else if (player.mode === 'ball') {
            // Draw Rolling Ball Shape
            ctx.fillStyle = '#ff8800';
            ctx.beginPath();
            ctx.arc(0, 0, player.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-6, -6, 12, 12);
        } else {
            // Standard Cube Shape
            ctx.fillStyle = '#a6ff00';
            ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-player.size / 4, -player.size / 4, player.size / 2, player.size / 2);
        }
        ctx.restore();

        // 3. OBSTACLES & PORTALS
        for (let i = activeObstacles.length - 1; i >= 0; i--) {
            let obs = activeObstacles[i];
            let screenX = obs.x - distanceTraveled + player.x;

            if (screenX < -100) continue;

            // Spikes (Type 1)
            if (obs.type === 1) {
                ctx.fillStyle = '#ff0055';
                ctx.beginPath();
                ctx.moveTo(screenX, GROUND_Y);
                ctx.lineTo(screenX + 17, GROUND_Y - 35);
                ctx.lineTo(screenX + 35, GROUND_Y);
                ctx.closePath();
                ctx.fill();

                if (
                    player.x < screenX + 28 &&
                    player.x + player.size > screenX + 7 &&
                    player.y + player.size > GROUND_Y - 30
                ) {
                    gameOver = true;
                }
            } 
            // Portals (Type 10=Ship, 11=Ball, 12=Cube)
            else if (obs.type >= 10) {
                let portalColor = '#ff00ff'; // Ship (Magenta)
                if (obs.type === 11) portalColor = '#ff8800'; // Ball (Orange)
                if (obs.type === 12) portalColor = '#a6ff00'; // Cube (Green)

                // Render Portal Oval Ring
                ctx.strokeStyle = portalColor;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.ellipse(screenX, GROUND_Y - 80, 15, 60, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Touch Portal Check
                if (
                    player.x < screenX + 20 &&
                    player.x + player.size > screenX - 20
                ) {
                    if (obs.type === 10 && player.mode !== 'ship') {
                        player.mode = 'ship';
                        updateModeUI();
                    } else if (obs.type === 11 && player.mode !== 'ball') {
                        player.mode = 'ball';
                        updateModeUI();
                    } else if (obs.type === 12 && player.mode !== 'cube') {
                        player.mode = 'cube';
                        player.gravityDir = 1;
                        updateModeUI();
                    }
                }
            }
        }

        // 4. GAME OVER / VICTORY OVERLAYS
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#ff0055';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CRASHED!', CANVAS_WIDTH / 2, 180);
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px sans-serif';
            ctx.fillText('Click or Press Space to Retry', CANVAS_WIDTH / 2, 230);
            ctx.textAlign = 'left';
        } else if (victory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL COMPLETE! 🏆', CANVAS_WIDTH / 2, 180);
            ctx.textAlign = 'left';
        } else {
            requestAnimationFrame(gameLoop);
        }
    }

    requestAnimationFrame(gameLoop);
});
