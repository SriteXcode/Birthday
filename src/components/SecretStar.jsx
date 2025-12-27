export function SecretStar({ position, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <octahedronGeometry args={[0.25]} />
      <meshStandardMaterial
        color="#FFD966"
        emissive="#FFD966"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}
export default SecretStar