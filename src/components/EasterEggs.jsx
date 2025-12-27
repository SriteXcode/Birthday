import { useEffect } from "react";

export default function EasterEggs() {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === "j") {
        console.log("🥚 Easter egg listening...");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return null; // invisible logic-only component
}
