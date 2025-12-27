let starClicks = 0;

export function starClicked() {
  starClicks++;
  if (starClicks === 3) {
    alert("You found a secret 💖");
    starClicks = 0;
  }
}

export function secretWord(word) {
  if (word.toLowerCase() === "jiii") {
    alert("Awww 🥹💕");
  }
}
