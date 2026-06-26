import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Image, Text, PerspectiveCamera } from "@react-three/drei";
import { suspend } from "suspend-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import contentData from "../data/content.json";

const sunsetAsset = import("@pmndrs/assets/hdri/sunset.exr");

// Helper color list for the colorful glow borders
const neonColors = ["#FF69B4", "#00FFFF", "#FFD700", "#DA70D6", "#00FF7F", "#FF4500"];

function WallPhoto({ id, url, caption, position, rotation, lightsOn, onClick }) {
  const [hovered, setHovered] = useState(false);
  const glowColor = neonColors[id % neonColors.length];

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Neon Glow Border (Backing Plane) */}
      <mesh position={[0, 0, -0.015]} scale={hovered ? [1.15, 1.15, 1] : [1.05, 1.05, 1]}>
        <planeGeometry args={[1.3, 1.6]} />
        <meshBasicMaterial color={glowColor} />
      </mesh>

      {/* Polaroid Frame (White Border) */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial color="#FFF" roughness={0.8} />
      </mesh>

      {/* The Photo */}
      <Image
        url={url}
        position={[0, 0.1, 0.005]}
        scale={[1.0, 1.0, 1]}
        toneMapped={false}
      />
    </group>
  );
}

function GirlAvatar({ avatarRef, movement }) {
  const headRef = useRef();
  const dressRef = useRef();

  useFrame((state) => {
    // Simple bobbing animation if moving
    const speedSq = movement.current.x * movement.current.x + movement.current.z * movement.current.z;
    if (speedSq > 0.01) {
      const time = state.clock.getElapsedTime();
      if (headRef.current) {
        headRef.current.position.y = 1.45 + Math.sin(time * 12) * 0.05;
      }
      if (dressRef.current) {
        dressRef.current.position.y = 0.7 + Math.sin(time * 12) * 0.02;
        dressRef.current.rotation.z = Math.sin(time * 12) * 0.05;
      }
    } else {
      if (headRef.current) headRef.current.position.y = 1.45;
      if (dressRef.current) {
        dressRef.current.position.y = 0.7;
        dressRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={avatarRef} position={[0, 0, 10.2]}>
      {/* Shadow under Avatar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#000" transparent opacity={0.25} />
      </mesh>

      {/* Dress (Pink Cone) */}
      <mesh ref={dressRef} position={[0, 0.7, 0]} castShadow>
        <coneGeometry args={[0.45, 1.0, 16]} />
        <meshStandardMaterial color="#FF69B4" roughness={0.5} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4]} />
        <meshStandardMaterial color="#FFFEEF" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4]} />
        <meshStandardMaterial color="#FFFEEF" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FFD1DC" roughness={0.6} />
      </mesh>

      {/* Cute Bow (Top of Head) */}
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.08]} />
        <meshStandardMaterial color="#FF1493" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 1.48, 0.24]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0.1, 1.48, 0.24]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

function SceneLogic({ 
  avatarRef, 
  movement, 
  doorOpen, 
  doorRef, 
  lightsOn, 
  setSelectedPhoto,
  setCanOpenDoor,
  setCanTurnLights,
  yaw,
  rotationInput,
  cameraHeightOffset
}) {
  const { camera } = useThree();

  // Load photos
  const gallery = contentData.gallery;

  // Helper to dynamically generate packed photo coordinates for a wall
  const generateCoordsForWall = (wallType, count) => {
    const coords = [];
    const rows = 3;
    const itemsPerRow = Math.ceil(count / rows);
    let index = 0;

    for (let r = 0; r < rows; r++) {
      const y = 1.35 + r * 2.1; // Row heights: 1.35, 3.45, 5.55
      const countInThisRow = Math.min(itemsPerRow, count - index);
      if (countInThisRow <= 0) break;

      const span = 13.0; // Packed closer on wall width/depth of 16
      const start = -span / 2;
      const step = countInThisRow > 1 ? span / (countInThisRow - 1) : 0;

      for (let c = 0; c < countInThisRow; c++) {
        const val = countInThisRow > 1 ? start + c * step : 0;
        if (wallType === "left") {
          coords.push({ pos: [-7.8, y, val], rot: [0, Math.PI / 2, 0] });
        } else if (wallType === "right") {
          coords.push({ pos: [7.8, y, val], rot: [0, -Math.PI / 2, 0] });
        } else if (wallType === "back") {
          coords.push({ pos: [val, y, -7.8], rot: [0, 0, 0] });
        }
        index++;
      }
    }
    return coords;
  };

  // Generate coordinates for all 59 photos
  const leftWallCoords = generateCoordsForWall("left", 20);
  const rightWallCoords = generateCoordsForWall("right", 20);
  const backWallCoords = generateCoordsForWall("back", 19);

  useFrame((state, delta) => {
    if (!avatarRef.current) return;

    // Rotate camera view continuously using Right Joystick horizontal value
    if (rotationInput.current.x !== 0) {
      yaw.current -= rotationInput.current.x * delta * 2.2;
    }

    // Move camera height up/down using Right Joystick vertical value
    if (rotationInput.current.y !== 0) {
      cameraHeightOffset.current -= rotationInput.current.y * delta * 3.5;
      cameraHeightOffset.current = Math.max(-0.8, Math.min(4.0, cameraHeightOffset.current));
    }

    // Movement calculation (relative to camera yaw)
    // Invert left/right controls: right button moves left and vice versa
    let dx = -movement.current.x;
    let dz = -movement.current.z;

    const len = Math.sqrt(dx * dx + dz * dz);
    let worldDX = 0;
    let worldDZ = 0;

    if (len > 0.01) {
      const ndx = dx / (len > 1 ? len : 1);
      const ndz = dz / (len > 1 ? len : 1);

      // Correct standard 2D vector rotation based on camera yaw
      worldDX = (ndx * Math.cos(yaw.current)) + (ndz * Math.sin(yaw.current));
      worldDZ = (ndx * -Math.sin(yaw.current)) + (ndz * Math.cos(yaw.current));

      const speed = 5 * delta * Math.min(len, 1.0);
      let nextX = avatarRef.current.position.x + worldDX * speed;
      let nextZ = avatarRef.current.position.z + worldDZ * speed;

      // Outer wall boundaries
      if (nextX < -7.1) nextX = -7.1;
      if (nextX > 7.1) nextX = 7.1;

      // Door boundary collision
      if (!doorOpen) {
        if (avatarRef.current.position.z >= 8.2 && nextZ < 8.2) {
          nextZ = 8.2;
        }
        if (avatarRef.current.position.z < 7.8 && nextZ > 7.8) {
          nextZ = 7.8;
        }
      }

      // Outer garden and inner house boundaries
      if (nextZ < -7.1) nextZ = -7.1;
      if (nextZ > 13) nextZ = 13;

      // Update avatar position
      avatarRef.current.position.x = nextX;
      avatarRef.current.position.z = nextZ;

      // Smoothly rotate avatar 360 degrees towards movement direction
      const targetAngle = Math.atan2(worldDX, worldDZ);
      let diff = targetAngle - avatarRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      avatarRef.current.rotation.y += diff * 0.15;
    }

    // Trigger checks
    const currentZ = avatarRef.current.position.z;
    const currentX = avatarRef.current.position.x;

    // Near door check (outside) - wider trigger bounds so popup arrives reliably
    if (currentZ >= 7.8 && currentZ <= 10.5 && Math.abs(currentX) < 2.5) {
      setCanOpenDoor(true);
    } else {
      setCanOpenDoor(false);
    }

    // Inside and near light check
    if (currentZ < 7.0) {
      setCanTurnLights(true);
    } else {
      setCanTurnLights(false);
    }

    // Smooth door opening rotation
    if (doorRef.current) {
      const targetAngle = doorOpen ? Math.PI / 1.8 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetAngle, delta * 5);
    }

    // Orbiting Camera follow at shoulder-height with height offset
    const avatarPos = avatarRef.current.position;
    const offsetBehind = 2.8;
    const offsetSide = 0.45;
    const height = 1.65 + (cameraHeightOffset.current || 0);

    // Compute camera target position based on camera yaw orbiting angle
    const targetCamX = avatarPos.x - Math.sin(yaw.current) * offsetBehind + Math.cos(yaw.current) * offsetSide;
    const targetCamZ = avatarPos.z - Math.cos(yaw.current) * offsetBehind - Math.sin(yaw.current) * offsetSide;
    const targetCamY = avatarPos.y + height;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

    // Camera looks slightly ahead in the direction of yaw at head level
    const lookTargetX = avatarPos.x + Math.sin(yaw.current) * 1.5;
    const lookTargetZ = avatarPos.z + Math.cos(yaw.current) * 1.5;
    camera.lookAt(lookTargetX, avatarPos.y + 1.45, lookTargetZ);
  });

  // Calculate photo mapping to wall coordinates
  let photoIndex = 0;

  return (
    <group>
      {/* Left Wall Photos */}
      {leftWallCoords.map((coord, idx) => {
        const photo = gallery[photoIndex++ % gallery.length];
        return (
          <WallPhoto 
            key={`left-${idx}`}
            id={photoIndex}
            url={photo.url}
            caption={photo.caption}
            position={coord.pos}
            rotation={coord.rot}
            lightsOn={lightsOn}
            onClick={() => setSelectedPhoto(photo)}
          />
        );
      })}

      {/* Back Wall Photos */}
      {backWallCoords.map((coord, idx) => {
        const photo = gallery[photoIndex++ % gallery.length];
        return (
          <WallPhoto 
            key={`back-${idx}`}
            id={photoIndex}
            url={photo.url}
            caption={photo.caption}
            position={coord.pos}
            rotation={coord.rot}
            lightsOn={lightsOn}
            onClick={() => setSelectedPhoto(photo)}
          />
        );
      })}

      {/* Right Wall Photos */}
      {rightWallCoords.map((coord, idx) => {
        const photo = gallery[photoIndex++ % gallery.length];
        return (
          <WallPhoto 
            key={`right-${idx}`}
            id={photoIndex}
            url={photo.url}
            caption={photo.caption}
            position={coord.pos}
            rotation={coord.rot}
            lightsOn={lightsOn}
            onClick={() => setSelectedPhoto(photo)}
          />
        );
      })}
    </group>
  );
}

export default function SweatyHomeScene() {
  const navigate = useNavigate();
  const avatarRef = useRef();
  const doorRef = useRef();
  const movement = useRef({ x: 0, z: 0 });
  const yaw = useRef(0);
  const rotationInput = useRef({ x: 0, y: 0 });
  const cameraHeightOffset = useRef(0);

  const [doorOpen, setDoorOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [canOpenDoor, setCanOpenDoor] = useState(false);
  const [canTurnLights, setCanTurnLights] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Keyboard controls listener
  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

    const updateMovement = () => {
      let x = 0;
      let z = 0;
      if (keys.w || keys.ArrowUp) z = -1;
      if (keys.s || keys.ArrowDown) z = 1;
      if (keys.a || keys.ArrowLeft) x = -1;
      if (keys.d || keys.ArrowRight) x = 1;

      movement.current = { x, z };
    };

    const handleKeyDown = (e) => {
      if (e.key in keys) {
        keys[e.key] = true;
        updateMovement();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key in keys) {
        keys[e.key] = false;
        updateMovement();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Screen drag controls to rotate camera view 360 degrees around character
  useEffect(() => {
    let isDraggingScreen = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const handleStart = (clientX, clientY) => {
      isDraggingScreen = true;
      dragStartX = clientX;
      dragStartY = clientY;
    };

    const handleMove = (clientX, clientY) => {
      if (!isDraggingScreen) return;
      const dx = clientX - dragStartX;
      const dy = clientY - dragStartY;

      yaw.current -= dx * 0.007; // Update orbiting camera yaw angle
      cameraHeightOffset.current -= dy * 0.012; // Adjust height with drag Y movement
      cameraHeightOffset.current = Math.max(-0.8, Math.min(4.0, cameraHeightOffset.current));

      dragStartX = clientX;
      dragStartY = clientY;
    };

    const handleEnd = () => {
      isDraggingScreen = false;
    };

    const onMouseDown = (e) => {
      // Don't drag screen when interacting with UI, popup overlays or joystick
      if (e.target.closest('.joystick-container') || e.target.closest('.game-hud') || e.target.closest('.game-popup-overlay') || e.target.closest('.polaroid-popup') || e.target.closest('.nav-container')) {
        return;
      }
      handleStart(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      handleEnd();
    };

    const onTouchStart = (e) => {
      if (e.target.closest('.joystick-container') || e.target.closest('.game-hud') || e.target.closest('.game-popup-overlay') || e.target.closest('.polaroid-popup') || e.target.closest('.nav-container')) {
        return;
      }
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Joystick handlers
  const handleJoystickMove = (data) => {
    movement.current = { x: data.x, z: data.y };
  };

  const handleJoystickEnd = () => {
    movement.current = { x: 0, z: 0 };
  };

  const handleJoystickRotate = (data) => {
    rotationInput.current = { x: data.x, y: data.y };
  };

  const handleJoystickEndRotate = () => {
    rotationInput.current = { x: 0, y: 0 };
  };

  const showDoorPopup = canOpenDoor && !doorOpen;
  const showLightsPopup = canTurnLights && !lightsOn && doorOpen;

  return (
    <div className="home-scene-container">
      {/* Game HUD Overlay */}
      <div className="game-hud">
        <div className="objective-panel">
          {!doorOpen ? (
            <p>Walk to the door to enter! 🚪</p>
          ) : !lightsOn ? (
            <p>Step inside and find the light switch! 💡</p>
          ) : (
            <p>Tap the glowing photos on the walls to inspect them! 💖</p>
          )}
        </div>
      </div>

      {/* Open Door Popup Modal */}
      {showDoorPopup && (
        <div className="game-popup-overlay">
          <div className="game-popup-card">
            <h2>Knock Knock! 🚪</h2>
            <p>You've reached the front door of Sweaty's House. Would you like to enter?</p>
            <button className="popup-action-btn pulse-anim" onClick={() => setDoorOpen(true)}>
              Open Door & Enter ✨
            </button>
          </div>
        </div>
      )}

      {/* Turn Lights On Popup Modal */}
      {showLightsPopup && (
        <div className="game-popup-overlay">
          <div className="game-popup-card yellow-border">
            <h2>It's Dark in Here... 💡</h2>
            <p>Turn on the lights to illuminate the house and reveal all the glowing memories on the walls.</p>
            <button className="popup-action-btn yellow-btn pulse-anim" onClick={() => setLightsOn(true)}>
              Turn Lights On 💡
            </button>
          </div>
        </div>
      )}

      {/* Screen Dual Joystick Overlay */}
      <DualJoysticks 
        onMove={handleJoystickMove} 
        onEndMove={handleJoystickEnd} 
        onRotate={handleJoystickRotate}
        onEndRotate={handleJoystickEndRotate}
      />

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0.5, 1.65, 13.8]} fov={50} />
        <Environment files={suspend(sunsetAsset).default} background blur={0.65} />

        {/* Lighting setup based on switch state - even darker to enhance glows */}
        <ambientLight intensity={lightsOn ? 0.12 : 0.002} color={lightsOn ? "#FFF" : "#4A3B66"} />
        
        {/* Main ceiling light */}
        <pointLight 
          position={[0, 6, 0]} 
          intensity={lightsOn ? 0.95 : 0} 
          distance={20} 
          color="#FFFDF0" 
          castShadow 
          shadow-bias={-0.001}
        />
        
        {/* Soft magical secondary glow when lights are off */}
        <pointLight 
          position={[0, 3, 4]} 
          intensity={lightsOn ? 0.1 : 0.2} 
          distance={12} 
          color="#BA68C8"
        />

        <GirlAvatar avatarRef={avatarRef} movement={movement} />

        {/* House Walls & Floor - reduced house dimensions to 16x16 */}
        <group>
          {/* Wood floor inside house */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[16, 16]} />
            <meshStandardMaterial color="#8D6E63" roughness={0.8} />
          </mesh>

          {/* Grass outside house */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 18]} receiveShadow>
            <planeGeometry args={[40, 20]} />
            <meshStandardMaterial color="#66BB6A" roughness={1.0} />
          </mesh>

          {/* Back Wall */}
          <mesh position={[0, 4, -8]} receiveShadow castShadow>
            <boxGeometry args={[16, 8, 0.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>

          {/* Left Wall */}
          <mesh position={[-8, 4, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 8, 16.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>

          {/* Right Wall */}
          <mesh position={[8, 4, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 8, 16.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>

          {/* Front Wall with doorway - made opaque */}
          {/* Left partition */}
          <mesh position={[-5, 4, 8]} receiveShadow castShadow>
            <boxGeometry args={[6, 8, 0.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>
          {/* Right partition */}
          <mesh position={[5, 4, 8]} receiveShadow castShadow>
            <boxGeometry args={[6, 8, 0.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>
          {/* Top header above door */}
          <mesh position={[0, 7, 8]} receiveShadow castShadow>
            <boxGeometry args={[4, 2, 0.4]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.9} />
          </mesh>

          {/* Opening Door */}
          <group position={[2, 0, 8]}> {/* Pivot point at the door frame hinge */}
            <mesh ref={doorRef} position={[-2, 3, 0]} castShadow>
              <boxGeometry args={[4, 6, 0.15]} />
              <meshStandardMaterial color="#E0F7FA" roughness={0.6} metalness={0.1} transparent opacity={0.8} />
            </mesh>
          </group>
        </group>

        {/* Scene controller and Wall Photos */}
        <SceneLogic 
          avatarRef={avatarRef}
          movement={movement}
          doorOpen={doorOpen}
          doorRef={doorRef}
          lightsOn={lightsOn}
          setSelectedPhoto={setSelectedPhoto}
          setCanOpenDoor={setCanOpenDoor}
          setCanTurnLights={setCanTurnLights}
          yaw={yaw}
          rotationInput={rotationInput}
          cameraHeightOffset={cameraHeightOffset}
        />
      </Canvas>

      {/* Polaroid details popup when clicked */}
      {selectedPhoto && (
        <div className="polaroid-popup" onClick={() => setSelectedPhoto(null)}>
          <div className="polaroid-content">
            <img src={selectedPhoto.url} alt="Memory" />
            <p className="caption">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// On-screen touch dual joystick implementation
function DualJoysticks({ onMove, onEndMove, onRotate, onEndRotate }) {
  return (
    <>
      {/* Left Joystick: Movement */}
      <JoystickInstance 
        side="left" 
        label="Move 🕹️" 
        onMove={onMove} 
        onEnd={onEndMove} 
      />
      
      {/* Right Joystick: Rotate Camera */}
      <JoystickInstance 
        side="right" 
        label="Look 👀" 
        onMove={onRotate} 
        onEnd={onEndRotate} 
      />
    </>
  );
}

function JoystickInstance({ side, label, onMove, onEnd }) {
  const containerRef = useRef();
  const thumbRef = useRef();
  const isDragging = useRef(false);

  const handleStart = (clientX, clientY) => {
    isDragging.current = true;
    updatePosition(clientX, clientY);
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging.current) return;
    updatePosition(clientX, clientY);
  };

  const handleEnd = () => {
    isDragging.current = false;
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(-50%, -50%)`;
    }
    onEnd();
  };

  const updatePosition = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 40; // Max movement radius of thumb

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    if (thumbRef.current) {
      thumbRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }

    onMove({
      x: dx / maxRadius,
      y: dy / maxRadius
    });
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDragging.current) {
        // Find touch corresponding to this side or joystick
        const rect = containerRef.current.getBoundingClientRect();
        let closestTouch = null;
        let minDist = Infinity;
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const dist = Math.sqrt(Math.pow(t.clientX - (rect.left + rect.width/2), 2) + Math.pow(t.clientY - (rect.top + rect.height/2), 2));
          if (dist < minDist) {
            minDist = dist;
            closestTouch = t;
          }
        }
        if (closestTouch && minDist < 150) { // Touch within reasonable distance
          handleMove(closestTouch.clientX, closestTouch.clientY);
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isDragging.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let touchStillActive = false;
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const dist = Math.sqrt(Math.pow(t.clientX - (rect.left + rect.width/2), 2) + Math.pow(t.clientY - (rect.top + rect.height/2), 2));
          if (dist < 150) {
            touchStillActive = true;
            break;
          }
        }
        if (!touchStillActive) {
          handleEnd();
        }
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        handleEnd();
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div 
      className={`joystick-container ${side}-joystick`}
      ref={containerRef}
      onTouchStart={(e) => {
        handleStart(e.touches[e.touches.length - 1].clientX, e.touches[e.touches.length - 1].clientY);
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
    >
      <div className="joystick-base"></div>
      <div ref={thumbRef} className="joystick-thumb"></div>
      <div className="joystick-hint">{label}</div>
    </div>
  );
}
