import { Canvas } from "@react-three/fiber";
import { Float, MeshWobbleMaterial } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

function LoadingBalloon({ onBurst }) {
  const { animatedScale } = useSpring({
    from: { animatedScale: 0.5 },
    to: { animatedScale: 3.5 },
    config: { duration: 3000 },
    onRest: onBurst,
  });

  return (
    <Float speed={5} floatIntensity={1} rotationIntensity={1}>
      {/* @eslint-disable-next-line react/jsx-no-undef */}
      <animated.mesh scale={animatedScale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshWobbleMaterial
          factor={0.6}
          speed={2}
          color="#FF69B4"
          roughness={0.1}
          metalness={0.1}
        />
      </animated.mesh>
    </Float>
  );
}

export default function Loader({ onFinished }) {
  return (
    <div className="loader-screen">
      <Canvas>
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <LoadingBalloon onBurst={onFinished} />
      </Canvas>
      <div className="loader-text">Inflating Surprise... 🎈</div>
    </div>
  );
}
