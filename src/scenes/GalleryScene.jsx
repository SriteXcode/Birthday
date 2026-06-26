import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text, FlyControls, PerspectiveCamera } from "@react-three/drei";
import { suspend } from "suspend-react";

const sunsetAsset = import("@pmndrs/assets/hdri/sunset.exr");
import { Physics } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import PhotoFrame from "../components/PhotoFrame";
import SecretHeart from "../components/SecretHeart";
import CursorSparkles from "../components/CursorSparkles";
import ChaosManager from "../components/ChaosManager";
import { useState, useRef } from "react";
import contentData from "../data/content.json";

function MiniMapUI({ frames, playerDotRef }) {
  return (
    <div className="minimap">
      {frames.map((f, i) => (
        <div 
          key={i} 
          className="map-dot frame-dot"
          style={{ 
            left: `${(f.position[0] * 2) + 50}px`, 
            top: `${(f.position[2] * 2) + 50}px` 
          }}
        />
      ))}
      <div ref={playerDotRef} className="map-dot player-dot" />
    </div>
  );
}

function MapLogic({ playerDotRef }) {
  const { camera } = useThree();
  const LIMIT = 30;

  useFrame(() => {
    if (playerDotRef.current) {
      const x = camera.position.x * 2; 
      const y = camera.position.z * 2; 
      playerDotRef.current.style.transform = `translate(${x + 50}px, ${y + 50}px)`;
    }

    if (camera.position.x > LIMIT) camera.position.setX(LIMIT);
    if (camera.position.x < -LIMIT) camera.position.setX(-LIMIT);
    if (camera.position.z > LIMIT) camera.position.setZ(LIMIT);
    if (camera.position.z < -LIMIT) camera.position.setZ(-LIMIT);
    if (camera.position.y > LIMIT) camera.position.setY(LIMIT);
    if (camera.position.y < -LIMIT) camera.position.setY(-LIMIT);
  });

  return null;
}

// Fixed function to generate frames without using Math.random during render
const generateFrames = () => {
  const baseImages = contentData.gallery;
  const totalFrames = baseImages.length;
  const generated = [];

  for (let i = 0; i < totalFrames; i++) {
    const baseItem = baseImages[i % baseImages.length];
    generated.push({
      ...baseItem,
      id: `gen-${i}`,
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 40
      ],
      rotation: [
        (Math.random() - 0.5) * 0.5, 
        (Math.random() - 0.5) * 0.5, 
        (Math.random() - 0.5) * 0.2
      ]
    });
  }
  return generated;
};

export default function GalleryScene() {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [flyMode, setFlyMode] = useState(false);
  const cameraRef = useRef();
  const playerDotRef = useRef();

  // Use state with initializer to ensure generation happens only once and not during render loop
  const [frames] = useState(() => generateFrames());

  const resetView = () => {
    setFlyMode(false);
    setSelectedPhoto(null);
    if (cameraRef.current) {
       cameraRef.current.position.set(0, 0, 25);
       cameraRef.current.lookAt(0, 0, 0);
     }
  };

  return (
    <>
      <div className="gallery-ui">
        <button className="ui-btn" onClick={() => setFlyMode(!flyMode)}>
          {flyMode ? "Stop Flying 🛑" : "Fly in Space 🚀"}
        </button>
        <button className="ui-btn" onClick={resetView}>
          Reset View ↺
        </button>
      </div>

      <MiniMapUI frames={frames} playerDotRef={playerDotRef} />

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 25]} ref={cameraRef} fov={60} />
        <Environment files={suspend(sunsetAsset).default} background blur={0.6} />
        <ambientLight intensity={0.8} />
        
        <MapLogic playerDotRef={playerDotRef} />
        <CursorSparkles />

        {!flyMode && (
          <Float speed={2} floatIntensity={0.5}>
            <Text 
              position={[0, 8, 0]} 
              fontSize={1} 
              color="#FFF" 
              outlineWidth={0.05}
              outlineColor="#3A2F4D"
              textAlign="center"
            >
              {`Explore ${frames.length} Memories...`}
            </Text>
          </Float>
        )}

        <Physics gravity={[0, -0.01, 0]}> 
          <ChaosManager limit={30} spawnInterval={2000} />

          {frames.map((frame) => (
            <PhotoFrame 
              key={frame.id}
              url={frame.url} 
              position={frame.position} 
              rotation={frame.rotation}
              onClick={() => setSelectedPhoto(frame)} 
            />
          ))}

          <group position={[0, -5, 5]}>
             <SecretHeart onClick={() => navigate("/surprise")} />
             <Text 
               position={[0, -0.6, 0]} 
               fontSize={0.4} 
               color="white"
            >
              Next Surprise
            </Text>
          </group>
        </Physics>
        
        {flyMode ? (
          <FlyControls 
            movementSpeed={10} 
            rollSpeed={0.5} 
            dragToLook={true} 
          />
        ) : (
          <OrbitControls 
            enableZoom={true} 
            autoRotate={false}
            enablePan={true}
          />
        )}
      </Canvas>

      {selectedPhoto && (
        <div className="polaroid-popup" onClick={() => setSelectedPhoto(null)}>
          <div className="polaroid-content">
            <img src={selectedPhoto.url} alt="Memory" />
            <p className="caption">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </>
  );
}
