import { MeshWobbleMaterial } from "@react-three/drei";

export function SecretHeart(props) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <MeshWobbleMaterial
        color="#C6B7E2"
        speed={2}
        factor={0.6}
      />
    </mesh>
  );
}

export default SecretHeart