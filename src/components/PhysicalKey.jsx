import { Float } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function PhysicalKey({ onClick, position = [-5, 5, 0] }) {
  return (
    <RigidBody 
      type="fixed" 
      colliders="hull" 
      position={position} 
      onClick={onClick}
    >
      <Float speed={4} floatIntensity={1.5} rotationIntensity={2}>
        <group scale={1}>
          <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.3, 0.08, 16, 32]} />
            <meshStandardMaterial 
              color="#FFD700" 
              metalness={0.9} 
              roughness={0.1} 
              emissive="#FFD700"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.6, -0.1, 0]}>
            <boxGeometry args={[0.15, 0.3, 0.05]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.4, -0.1, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.05]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </Float>
    </RigidBody>
  );
}