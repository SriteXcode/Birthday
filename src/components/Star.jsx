export default function Star({ position, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <octahedronGeometry args={[0.3]} />
      <meshStandardMaterial
        color="#FFD966"
        emissive="#FFD966"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}
