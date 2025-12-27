import { Sparkles } from "@react-three/drei";

export default function MagicSparkles() {
  return (
    <Sparkles
      count={80}
      size={6}
      speed={0.4}
      color="#FFD966"
      scale={[4, 4, 4]}
    />
  );
}
