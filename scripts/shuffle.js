document.addEventListener("DOMContentLoaded", () => {
  const shuffleDuration = 3000;  // Duration
  const intervalSpeed = 100;     // Speed of shuffling 
  const typewriterSpeed = 200;   // Speed of typewriter

  const elementsToShuffle = document.querySelectorAll(".shuffle-text");

  elementsToShuffle.forEach((element) => {
    const originalText = element.textContent;  // Store the original text
    let interval;

    // Start the shuffle effect
    startShuffle(element, originalText);

    // Stop shuffle and start typewriter effect after shuffleDuration
    setTimeout(() => {
      stopShuffle(element, originalText);
    }, shuffleDuration);
  });

  // Function 
  function shuffleText(text) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return text
      .split("")
      .map((char) => (char === " " ? " " : characters[Math.floor(Math.random() * characters.length)]))
      .join("");
  }

  // Start shuffling the text
  function startShuffle(element, originalText) {
    element.textContent = shuffleText(originalText);
    const interval = setInterval(() => {
      element.textContent = shuffleText(originalText);
    }, intervalSpeed);

    element.dataset.shuffleInterval = interval;
  }

  function stopShuffle(element, originalText) {
    clearInterval(element.dataset.shuffleInterval);

    typewriterEffect(element, originalText);  // Apply typewriter effect to replace text
  }

  // Typewriter effect function to gradually replace shuffled text with original text
  function typewriterEffect(element, text) {
    let index = 0;
    const currentText = element.textContent.split("");  // Split (shuffled) text

    const type = () => {
      if (index < text.length) {
        // Replace the shuffled character with the original 
        currentText[index] = text.charAt(index);
        element.textContent = currentText.join("");
        setTimeout(type, typewriterSpeed);
      }
    };

    type();
  }
});
