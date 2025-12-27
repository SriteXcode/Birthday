import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text, Center, Stars } from "@react-three/drei";
import { Physics, CuboidCollider } from "@react-three/rapier";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GiftBox from "../components/GiftBox";
import ConfettiParticles from "../components/ConfettiParticles";
import HeartParticles from "../components/HeartParticles";
import ChaosManager from "../components/ChaosManager";
import CursorSparkles from "../components/CursorSparkles";
import RevealOnScroll from "../components/RevealOnScroll";
import contentData from "../data/content.json";
import { usePersistentState } from "../hooks/usePersistentState"; 

export default function SurpriseScene() {
  const [opened, setOpened] = usePersistentState("gift_opened", false);
  const [showLetter, setShowLetter] = useState(false);
  const navigate = useNavigate();

  const renderBody = (text) => {
    const blocks = text.split('\n\n');
    return blocks.map((block, i) => {
      if (block.startsWith('### ')) {
        return (
          <RevealOnScroll key={i}>
            <h3>{block.replace('### ', '')}</h3>
          </RevealOnScroll>
        );
      }
      return (
        <RevealOnScroll key={i}>
          <p>{block}</p>
        </RevealOnScroll>
      );
    });
  };

  return (
    <>
      <Canvas camera={{ position: [0, 3, 8], fov: 45 }}>
        <Environment preset="dawn" background blur={0.8} />
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#FFB7B2" />
        
        <CursorSparkles />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {!opened && (
          <Float speed={3} floatIntensity={0.5}>
            <Text 
              position={[0, 2.5, 0]} 
              fontSize={0.4} 
              color="#FFF" 
              outlineWidth={0.02}
              outlineColor="#3A2F4D"
              textAlign="center"
            >
              Tap to Open...
            </Text>
          </Float>
        )}

        <Physics gravity={[0, -0.5, 0]}>
          <CuboidCollider position={[0, -5, 0]} args={[15, 0.5, 10]} />
          <CuboidCollider position={[0, 15, 0]} args={[15, 0.5, 10]} />
          <CuboidCollider position={[-8, 0, 0]} args={[0.5, 15, 10]} />
          <CuboidCollider position={[8, 0, 0]} args={[0.5, 15, 10]} />
          <CuboidCollider position={[0, 0, -5]} args={[15, 15, 0.5]} />

          <group position={[0, -1, 0]}>
             {/* If already opened, we can render it in open state or just keep the chaos */}
             {!opened ? (
               <GiftBox onOpen={() => setOpened(true)} />
             ) : (
               // Optional: Show empty box or just hidden if you prefer only particles
               <GiftBox onOpen={() => {}} /> 
             ) }
          </group>

          {opened && (
            <>
              <ChaosManager limit={60} spawnInterval={80} />
              
              <Float speed={4} floatIntensity={1} rotationIntensity={0.5}>
                <Center position={[0, 2, 0]}>
                  <Text
                    fontSize={1.8}
                    color="#FFD700"
                    font="/fonts/Malibu.ttf"
                    position={[0, 0, 0]}
                    outlineWidth={0.1}
                    outlineColor="#C71585"
                  >
                    SURPRISE!
                  </Text>
                  <Text
                    fontSize={1.8}
                    color="#FFF"
                    font="/fonts/Malibu.ttf"
                    position={[0.05, 0.05, 0.05]}
                    fillOpacity={0.3}
                  >
                    SURPRISE!
                  </Text>
                </Center>
              </Float>
            </>
          )}
        </Physics>

        {opened && (
          <>
            <ConfettiParticles />
            <HeartParticles />
          </>
        )}

        <OrbitControls 
          enableZoom={false} 
          autoRotate={opened} 
          autoRotateSpeed={1}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6} 
          minPolarAngle={Math.PI / 3}    
          maxPolarAngle={Math.PI / 2.2}  
        />
      </Canvas>

      {/* Show button immediately if already opened previously */}
      {opened && !showLetter && (
        <div className="gift-ui">
          <button 
            className="gift-btn"
            onClick={() => setShowLetter(true)}
            style={{ 
              animation: 'popIn 0.8s ease forwards', 
              opacity: 0 
            }} 
          >
            Read My Letter 💌
          </button>
        </div>
      )}

      {showLetter && (
        <div className="letter-overlay" onClick={() => setShowLetter(false)}>
          <div className="letter-paper" onClick={(e) => e.stopPropagation()}>
            <RevealOnScroll>
              <h2 className="letter-title">{contentData.letter.title}</h2>
            </RevealOnScroll>
            
            <div className="letter-body">
              {renderBody(contentData.letter.body)}
            </div>

            <RevealOnScroll>
              <div className="letter-signature">Forever Yours, Me 💜</div>
            </RevealOnScroll>
            
            <RevealOnScroll>
              <button className="close-letter" onClick={() => navigate("/")}>
                Replay Adventure ↺
              </button>
            </RevealOnScroll>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
