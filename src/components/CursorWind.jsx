import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CylinderCollider } from "@react-three/rapier";

export default function CursorWind() {
  const rigidBody = useRef();

  useFrame(({ pointer, viewport }) => {
    if (rigidBody.current) {
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      rigidBody.current.setNextKinematicTranslation({ x, y, z: 0 });
    }
  });

  return (
    <RigidBody 
      ref={rigidBody} 
      type="kinematicPosition" 
      colliders={false} 
      position={[0, 0, 0]}
    >
      <CylinderCollider args={[10, 1.5]} rotation={[Math.PI / 2, 0, 0]} />
    </RigidBody>
  );
}
