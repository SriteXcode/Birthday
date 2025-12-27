import { Float } from "@react-three/drei";

function Heart({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#C6B7E2" />
    </mesh>
  );
}

export default function HeartParticles() {
  return (
    <>
      <Float speed={1.2} floatIntensity={2}>
        <Heart position={[-1, 0.8, 0]} />
        <Heart position={[1, 1.2, -0.5]} />
        <Heart position={[0, 1.5, 0.5]} />
        <Heart position={[-0.6, 1.1, -0.3]} />
        <Heart position={[0.7, 0.9, 0.3]} />
      </Float>
    </>
  );
}
