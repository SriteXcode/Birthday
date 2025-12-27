import { MeshWobbleMaterial } from "@react-three/drei";

export default function Heart(props) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <MeshWobbleMaterial
        color="#C6B7E2"
        speed={1.5}
        factor={0.4}
      />
    </mesh>
  );
}
