// --- Existing Button Logic ---
const surpriseButton = document.getElementById('magic-btn');
const messageParagraph = document.getElementById('message');

surpriseButton.addEventListener('click', function() {
    messageParagraph.textContent = "🎉 You clicked it! You're officially a web developer now!";
});

// --- NEW: Reaction Time Minigame Logic ---
const startBtn = document.getElementById('start-game-btn');
const reactionBox = document.getElementById('reaction-box');
const gameResult = document.getElementById('game-result');

let startTime;
let timeoutId;
let isWaitingForGreen = false;

// Function to start a new round
startBtn.addEventListener('click', function() {
    // Reset state and visuals
    gameResult.textContent = "";
    reactionBox.textContent = "Wait for GREEN...";
    reactionBox.className = "box-ready"; // Turn box RED
    isWaitingForGreen = true;
    startBtn.disabled = true; // Disable start button while playing

    // Set a random delay between 2 and 5 seconds before turning green
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    // Clear any previous timers if active
    clearTimeout(timeoutId);

    timeoutId = setTimeout(function() {
        reactionBox.textContent = "PRESS UP ARROW!";
        reactionBox.className = "box-go"; // Turn box GREEN
        startTime = Date.now(); // Record exact timestamp when green appeared
        isWaitingForGreen = false;
    }, randomDelay);
});

// Function to handle key presses (Up Arrow)
document.addEventListener('keydown', function(event) {
    // Check if the pressed key is the Up Arrow
    if (event.key === 'ArrowUp') {
        
        // Case 1: Player pressed too early (while still red)
        if (isWaitingForGreen) {
            clearTimeout(timeoutId); // Cancel the green light timer
            reactionBox.textContent = "Too early!";
            reactionBox.className = "box-waiting";
            gameResult.textContent = "❌ You pressed too early! Try again.";
            startBtn.disabled = false;
            isWaitingForGreen = false;
        } 
        // Case 2: Player pressed when box turned green
        else if (reactionBox.classList.contains('box-go')) {
            const endTime = Date.now();
            const reactionTime = endTime - startTime; // Calculate time in milliseconds
            
            reactionBox.textContent = `${reactionTime} ms!`;
            reactionBox.className = "box-waiting";
            gameResult.textContent = `⚡ Speed: ${reactionTime}ms`;
            startBtn.disabled = false;
        }
    }
});
