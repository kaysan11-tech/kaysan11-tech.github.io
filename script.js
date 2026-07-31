// --- Existing Button Logic ---
const surpriseButton = document.getElementById('magic-btn');
const messageParagraph = document.getElementById('message');

surpriseButton.addEventListener('click', function() {
    messageParagraph.textContent = "🎉 You clicked it! You're officially a web developer now!";
});

// --- NEW: Reaction Time Minigame Logic ---
const reactionBox = document.getElementById('reaction-box');
const gameResult = document.getElementById('game-result');

let startTime;
let timeoutId;
let gameState = 'idle'; // Game states: 'idle', 'waiting', 'active'

// Single event listener for the Up Arrow key
document.addEventListener('keydown', function(event) {
    if (event.key !== 'ArrowUp') return; // Ignore any key that isn't Up Arrow

    // --- STATE 1: Start / Reset a round ---
    if (gameState === 'idle') {
        gameState = 'waiting';
        
        // Reset visual state
        gameResult.textContent = "";
        reactionBox.textContent = "Wait for GREEN...";
        reactionBox.className = "box-ready"; // Turn box RED

        // Random delay between 2 and 5 seconds
        const randomDelay = Math.floor(Math.random() * 3000) + 2000;

        clearTimeout(timeoutId);

        timeoutId = setTimeout(function() {
            reactionBox.textContent = "PRESS UP ARROW!";
            reactionBox.className = "box-go"; // Turn box GREEN
            startTime = Date.now();
            gameState = 'active'; // Ready for user input
        }, randomDelay);
    } 
    
    // --- STATE 2: Pressed too early ---
    else if (gameState === 'waiting') {
        clearTimeout(timeoutId); // Cancel the green light timer
        reactionBox.textContent = "Too early!";
        reactionBox.className = "box-waiting";
        gameResult.textContent = "❌ You pressed too early! Press UP ARROW to try again.";
        gameState = 'idle'; // Reset state so they can try again
    } 

    // --- STATE 3: Success! Player hit UP ARROW on GREEN ---
    else if (gameState === 'active') {
        const endTime = Date.now();
        const reactionTime = endTime - startTime; // Calculate speed in ms
        
        reactionBox.textContent = `${reactionTime} ms!`;
        reactionBox.className = "box-waiting";
        gameResult.textContent = `⚡ Speed: ${reactionTime}ms! Press UP ARROW to play again.`;
        gameState = 'idle'; // Reset state so they can play again
    }
});
