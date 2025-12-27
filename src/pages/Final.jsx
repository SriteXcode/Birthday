import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import contentData from "../data/content.json";

export default function Final() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const fullText = contentData.letter.body;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index === fullText.length) clearInterval(timer);
    }, 50); // Speed of typing

    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px",
        background: "linear-gradient(180deg, #E9E3F5 0%, #FFFFFF 100%)"
      }}
    >
      <div style={{ maxWidth: "600px" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>💜</h1>
        <h2 style={{ color: "#3A2F4D", marginBottom: "30px" }}>
          {contentData.letter.title}
        </h2>
        
        <p style={{ 
          whiteSpace: "pre-line", 
          fontSize: "1.2rem", 
          lineHeight: "1.8",
          color: "#555",
          minHeight: "100px" 
        }}>
          {displayedText}
          <span className="cursor">|</span>
        </p>

        <button 
          onClick={() => navigate("/")}
          style={{
            marginTop: "50px",
            padding: "12px 24px",
            background: "#FFD966",
            border: "none",
            borderRadius: "20px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          Replay the Adventure ↺
        </button>
      </div>

      <style>{`
        .cursor {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}