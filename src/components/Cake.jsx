import { Float, Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Cake({ position }) {
  // Wrapped in a fixed RigidBody for collision
  // Using "hull" collider to roughly match the cake shape
  return (
    <RigidBody position={position} type="fixed" colliders="hull" restitution={0.2}>
      <Float speed={1} floatIntensity={0.2} rotationIntensity={0.1}>
        <group position={[0, -0.5, 0]}>
          {/* Bottom Tier */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />
            <meshStandardMaterial color="#FFB7B2" />
          </mesh>
          
          {/* Middle Tier */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.8, 32]} />
            <meshStandardMaterial color="#FFDAC1" />
          </mesh>

          {/* Top Tier */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.8, 32]} />
            <meshStandardMaterial color="#E2F0CB" />
          </mesh>

          {/* Decoration */}
          <mesh position={[0, -0.1, 0]}>
             <torusGeometry args={[0.9, 0.05, 16, 32]} />
             <meshStandardMaterial color="#FFF" />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
             <torusGeometry args={[0.6, 0.05, 16, 32]} />
             <meshStandardMaterial color="#FFF" />
          </mesh>

          {/* "20" Text Topper */}
          <Text
            position={[0, 2.2, 0]}
            fontSize={0.8}
            color="#FFD700"
            font="/fonts/Malibu.ttf"
            outlineWidth={0.05}
            outlineColor="#FFA500"
          >
            20
          </Text>

          {/* Candles */}
          {[-0.3, 0.3].map((x, i) => (
            <group key={i} position={[x, 1.5, 0]}>
              <mesh>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                <meshStandardMaterial color="#FF9AA2" />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={2} />
              </mesh>
              <pointLight position={[0, 0.4, 0]} intensity={0.5} color="orange" distance={1} />
            </group>
          ))}
        </group>
      </Float>
    </RigidBody>
  );
}