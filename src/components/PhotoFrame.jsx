import { Float, Image, Text } from "@react-three/drei";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PhotoFrame({ url, position, rotation = [0, 0, 0], onClick }) {
  const [hovered, setHover] = useState(false);
  const group = useRef();

  // Smooth hover animation
  useFrame((state, delta) => {
    if (group.current) {
      const targetScale = hovered ? 1.15 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.2}>
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

        {/* Optional: "Click me" hint or tape effect could go here */}
      </group>
    </Float>
  );
}
