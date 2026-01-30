import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Balloon from "./Balloon";

export default function ChaosManager({ limit = 50, spawnInterval = 400 }) {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons((prev) => {
        if (prev.length < limit) {
          const x = (Math.random() - 0.5) * 12;
          const z = (Math.random() - 0.5) * 8;
          // Floor is at -4.5 (top surface). Spawning at -4 ensures they are above the floor.
          const y = -4;
          const scale = 0.8 + Math.random() * 0.7;
          return [...prev, { id: uuidv4(), position: [x, y, z], scale }];
        }
        return prev;
      });
    }, spawnInterval);
    return () => clearInterval(interval);
  }, [limit, spawnInterval]);

  const handlePop = (id) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <>
      {balloons.map((b) => (
        <Balloon 
          key={b.id} 
          position={b.position} 
          scale={b.scale}
          onPop={() => handlePop(b.id)} 
        />
      ))}
    </>
  );
}