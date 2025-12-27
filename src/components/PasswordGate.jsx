import { useState } from "react";

export default function PasswordGate({ onSuccess }) {
  const [value, setValue] = useState("");
  const [showHint, setShowHint] = useState(false);

  const checkPassword = () => {
    if (value.toLowerCase() === "sweaty" || value.toLowerCase() === "sweaty jiii") {
      onSuccess();
    } else {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }
  };

  return (
    <div className="password-gate-container">
      <div className="password-box">
        <h2 className="font-malibu">One Last Surprise 💝</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
        />
        <button onClick={checkPassword}>Unlock ✨</button>
      </div>

      {showHint && (
        <div className="hint-popup">
          <p>Hint: The name only I call you 💕</p>
        </div>
      )}
    </div>
  );
}
