import { Canvas } from "@react-three/fiber";
import FloatingText from "../components/FloatingText";

export default function EndingScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={1} />
      <FloatingText text="Some people feel like home ✨" />
    </Canvas>
  );
}
