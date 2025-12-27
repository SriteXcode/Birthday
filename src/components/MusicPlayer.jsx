import { useState, useRef } from "react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="music-player">
      <audio ref={audioRef} loop>
        <source src="/music/bgm.mp3" type="audio/mpeg" />
      </audio>
      <button onClick={togglePlay} className="music-btn">
        {playing ? "🔊" : "🔇"}
      </button>
    </div>
  );
}
