import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export default function GiftBox({ onOpen }) {
  const group = useRef();
  const lidRef = useRef();
  const [clicks, setClicks] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // Animation Logic
  useFrame((state, delta) => {
    if (shakeIntensity > 0 && group.current) {
      group.current.rotation.z = (Math.random() - 0.5) * shakeIntensity;
      group.current.rotation.x = (Math.random() - 0.5) * shakeIntensity;
      setShakeIntensity((prev) => Math.max(0, prev - delta * 2));
    }

    if (isOpen && lidRef.current) {
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, -Math.PI / 1.1, delta * 3);
      lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, 1.2, delta * 3);
      lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, -1.2, delta * 3);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isOpen) return;

    if (clicks < 2) {
      setClicks(prev => prev + 1);
      setShakeIntensity(0.6); // Stronger shake
    } else {
      setIsOpen(true);
      setShakeIntensity(1.2); 
      setTimeout(() => {
        setShakeIntensity(0);
        onOpen();
      }, 200);
    }
  };

  const boxColor = "#FFB7B2"; // Pastel Pink
  const ribbonColor = "#FFD700"; // Gold

  return (
    <group ref={group} onClick={handleClick} scale={1.2}> {/* Slightly larger box */}
      <pointLight position={[0, 0, 0]} intensity={isOpen ? 3 : 0} color="#FFD700" distance={4} decay={2} />

      {/* BOX BODY - Rounded edges for elegance */}
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.1} smoothness={4} position={[0, -0.75, 0]}>
        <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
      </RoundedBox>

      {/* RIBBON (Vertical Wrap) */}
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[1.52, 1.5, 0.3]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[0.3, 1.5, 1.52]} />
        <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.2} />
      </mesh>
      
      {/* BOX LID (Pivot Group) */}
      <group ref={lidRef} position={[0, 0, -0.75]}> 
        <group position={[0, 0, 0.75]}>
          {/* Lid Mesh */}
          <RoundedBox args={[1.6, 0.3, 1.6]} radius={0.05} smoothness={4} position={[0, 0.15, 0]}>
             <meshStandardMaterial color={boxColor} roughness={0.3} metalness={0.1} />
          </RoundedBox>

          {/* Lid Ribbon Cross */}
          <mesh position={[0, 0.15, 0]}>
             <boxGeometry args={[1.62, 0.3, 0.3]} />
             <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
             <boxGeometry args={[0.3, 0.3, 1.62]} />
             <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.2} />
          </mesh>
          
          {/* Big Bow on Top */}
          <group position={[0, 0.45, 0]}>
            <mesh rotation={[0, 0, Math.PI/4]}>
              <torusKnotGeometry args={[0.35, 0.1, 64, 8, 2, 3]} />
              <meshStandardMaterial color={ribbonColor} metalness={0.6} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
