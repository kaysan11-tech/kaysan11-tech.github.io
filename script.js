// Wait for the DOM (document structure) to fully load before running JavaScript
document.addEventListener('DOMContentLoaded', () => {
    
    // Select the button element by its unique ID from the HTML file
    const greetButton = document.getElementById('greet-btn');

    // Add an event listener to trigger an action whenever the user clicks the button
    greetButton.addEventListener('click', () => {
        alert('Hello, future web developer! 🎉 You successfully connected JavaScript to your HTML!');
    });

});
