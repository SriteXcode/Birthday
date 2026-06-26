import { Image, Text } from "@react-three/drei";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PhotoFrame({ url, position, rotation = [0, 0, 0], onClick }) {
  const [hovered, setHover] = useState(false);
  const group = useRef();
  
  // Keep track of the initial position
  const initialY = position[1];

  // Smooth hover scaling and stable bouncing (bobbing)
  useFrame((state, delta) => {
    if (group.current) {
      // 1. Scale bounce on hover
      const targetScale = hovered ? 1.15 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
      
      // 2. Stable up and down bounce (bobbing)
      const time = state.clock.getElapsedTime();
      // Add a phase offset based on X and Z coordinates so not all frames bounce in unison
      const phaseOffset = (position[0] * 0.5) + (position[2] * 0.3);
      group.current.position.y = initialY + Math.sin(time * 1.5 + phaseOffset) * 0.25;
    }
  });

  return (
    <group 
      ref={group}
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Polaroid Frame (White Border) */}
      <mesh position={[0, -0.1, -0.01]}>
        <boxGeometry args={[1.8, 2.2, 0.05]} />
        <meshStandardMaterial color="#FFF" roughness={0.8} />
      </mesh>

      {/* The Photo */}
      <Image
        url={url}
        position={[0, 0.1, 0.02]} // Shifted up slightly to leave space at bottom
        scale={[1.5, 1.5, 1]}
        toneMapped={false}
      />
    </group>
  );
}
