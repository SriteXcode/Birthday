import { useRef, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

const BALLOON_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD", "#FF9F43", "#FF9FF3", "#D6A2E8"];

export default function Balloon({ position, onPop, scale = 1 }) {
  const rigidBody = useRef();
  const [popped, setPopped] = useState(false);
  const [color] = useState(() => BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]);

  useFrame(() => {
    if (!popped && rigidBody.current) {
      if (!rigidBody.current.isDisposed) {
         try {
            rigidBody.current.applyImpulse({ 
              x: (Math.random() - 0.5) * 0.005, 
              y: 0.04 * scale, 
              z: (Math.random() - 0.5) * 0.005 
            }, true);
            
            rigidBody.current.applyTorqueImpulse({ 
              x: (Math.random() - 0.5) * 0.0001, 
              y: (Math.random() - 0.5) * 0.0001, 
              z: (Math.random() - 0.5) * 0.0001 
            }, true);

            const currentPos = rigidBody.current.translation();
            if (currentPos.y > 15) {
              setPopped(true);
              onPop && onPop();
            }
         } catch (e) {
            console.warn("Physics body error", e);
         }
      }
    }
  });

  const handlePop = (e) => {
    e.stopPropagation();
    if (popped) return;
    setPopped(true);
    onPop && onPop(); 
  };

  if (popped) return null;

  return (
    <RigidBody 
      ref={rigidBody} 
      position={position} 
      linearDamping={1.5} 
      angularDamping={1.5} 
      colliders="ball" 
      restitution={1.2}
    >
      <group onClick={handlePop} scale={scale}>
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.1} 
            metalness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.08, 0.12, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <line position={[0, -0.5, 0]}> 
          <bufferGeometry>
            <float32BufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, 0, -1.5, 0])} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="white" transparent opacity={0.4} />
        </line>
      </group>
    </RigidBody>
  );
}
