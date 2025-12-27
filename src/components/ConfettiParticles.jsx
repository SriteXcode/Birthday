import { Sparkles } from "@react-three/drei";

export default function ConfettiParticles() {
  return (
    <Sparkles
      count={120}
      size={4}
      speed={0.6}
      color="#FFD966"
      scale={[6, 6, 6]}
    />
  );
}
