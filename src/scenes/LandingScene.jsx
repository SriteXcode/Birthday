import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text } from "@react-three/drei";
import { suspend } from "suspend-react";

const sunsetAsset = import("@pmndrs/assets/hdri/sunset.exr");
import { Physics, CuboidCollider } from "@react-three/rapier";
import { Suspense } from "react";
import Cake from "../components/Cake";
import Star from "../components/Star";
import FloatingText from "../components/FloatingText";
import ChaosManager from "../components/ChaosManager";
import CursorWind from "../components/CursorWind";
import CursorSparkles from "../components/CursorSparkles";
import PhysicalKey from "../components/PhysicalKey";
import contentData from "../data/content.json";
import { useNavigate } from "react-router-dom";

function PhysicsWorld({ isCelebrating, navigate }) {
  return (
    <Physics gravity={[0, -0.2, 0]}>
      <CuboidCollider position={[0, -5, 0]} args={[15, 0.5, 10]} />
      <CuboidCollider position={[-12, 0, 0]} args={[0.5, 20, 10]} />
      <CuboidCollider position={[12, 0, 0]} args={[0.5, 20, 10]} />
      <CuboidCollider position={[0, 0, -8]} args={[15, 20, 0.5]} />
      <CuboidCollider position={[0, 0, 8]} args={[15, 20, 0.5]} />

      <CursorWind />

      <ChaosManager 
        limit={isCelebrating ? 120 : 50} 
        spawnInterval={isCelebrating ? 40 : 400} 
      />
      
      <Cake position={[0, -2.5, 0]} />
      
      {/* 
        Positioned at yPos=3 to be approx 35% from the top of the screen visually 
        in this camera setup.
      */}
      <FloatingText text={contentData.greeting} yPos={4.2} />

      <PhysicalKey 
        position={[-6, 5, 2]} 
        onClick={() => navigate("/gallery")} 
      />
    </Physics>
  );
}

export default function LandingScene({ isCelebrating }) {
  const navigate = useNavigate();

  const stars = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 6;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  });

  return (
    <Canvas camera={{ position: [10, 5, 12], fov: 45 }}>
      <Environment files={suspend(sunsetAsset).default} background blur={0.6} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <CursorSparkles />

      <Suspense fallback={null}>
        <PhysicsWorld isCelebrating={isCelebrating} navigate={navigate} />
      </Suspense>

      <group position={[0, -3.5, 0]}>
        {stars.map((pos, i) => (
          <Float key={i} speed={2} floatIntensity={1} rotationIntensity={1}>
            <Star position={[pos.x, 0, pos.z]} />
          </Float>
        ))}
      </group>

      <OrbitControls 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3} 
        minPolarAngle={Math.PI / 4}    
        maxPolarAngle={Math.PI / 2.2}    
      />
    </Canvas>
  );
}