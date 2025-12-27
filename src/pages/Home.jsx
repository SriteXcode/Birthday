import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingScene from "../scenes/LandingScene";
import KeyOverlay from "../components/KeyOverlay";

export default function Home() {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const navigate = useNavigate();

  const handleCelebrate = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
  };

  return (
    <div className="full-screen">
      {/* Golden Key locked at top-left 40px */}
      <KeyOverlay onClick={() => navigate("/gallery")} />
      
      <LandingScene isCelebrating={isCelebrating} />
      
      {!isCelebrating && (
        <button className="celebrate-cta" onClick={handleCelebrate}>
          Celebrate 20 ✨
        </button>
      )}

      <p className="tap-text">Tap the Golden Key to begin 🗝️</p>
    </div>
  );
}