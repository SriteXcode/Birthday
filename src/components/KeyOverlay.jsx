import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

export default function KeyOverlay({ onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        width: '100px',
        height: '100px',
        cursor: 'pointer',
        zIndex: 200,
        // Optional: add a subtle glow background
        background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%'
      }}
    >
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[2, 2, 2]} intensity={1} color="#FFD700" />
        <Float speed={4} floatIntensity={1.5} rotationIntensity={2}>
          <group scale={1.2}>
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.3, 0.08, 16, 32]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 1.2, 12]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.6, -0.1, 0]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.4, -0.1, 0]}>
              <boxGeometry args={[0.15, 0.2, 0.05]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
