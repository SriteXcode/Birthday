import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

export default function CursorSparkles() {
  const group = useRef();

  useFrame(({ pointer, viewport }) => {
    if (group.current) {
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      group.current.position.set(x, y, 0);
    }
  });

  return (
    <group ref={group}>
      <Sparkles 
        count={20} 
        scale={2} 
        size={4} 
        speed={0.5} 
        opacity={0.8} 
        color="#FFD700" 
      />
      <pointLight intensity={0.5} distance={3} color="#FFD700" />
    </group>
  );
}
