import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Center, Billboard } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function FloatingText({ text, yPos = 4.5 }) {
  const balloonColor = "#FF69B4"; 
  const highlightColor = "#FFB6C1"; 
  const shadowColor = "#8B008B"; 
  
  const rigidBody = useRef();

  useFrame(({ clock }) => {
    if (rigidBody.current) {
      const t = clock.getElapsedTime();
      const yOffset = yPos + Math.sin(t * 2) * 0.2;
      rigidBody.current.setNextKinematicTranslation({ x: 0, y: yOffset, z: 0 });
    }
  });

  return (
    <RigidBody ref={rigidBody} type="kinematicPosition" colliders={false}>
      <CuboidCollider args={[7, 1.2, 1]} position={[0, 1.5, 0]} />

      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Center bottom>
          {[...Array(8)].map((_, i) => (
            <Text
              key={i}
              fontSize={2.4} 
              color={shadowColor}
              font="/fonts/Malibu.ttf"
              position={[0, 0, -0.05 * (i + 1)]}
              textAlign="center"
              maxWidth={15}
              lineHeight={1}
            >
              {text}
            </Text>
          ))}

          <Text
            fontSize={2.4}
            color={balloonColor}
            font="/fonts/Malibu.ttf"
            position={[0, 0, 0]}
            textAlign="center"
            maxWidth={15}
            lineHeight={1}
            outlineWidth={0.15}
            outlineColor="#FFFFFF"
            outlineOpacity={0.8}
          >
            {text}
          </Text>

          <Text
            fontSize={2.4}
            color={highlightColor}
            font="/fonts/Malibu.ttf"
            position={[0.03, 0.05, 0.02]}
            textAlign="center"
            maxWidth={15}
            lineHeight={1}
            fillOpacity={0.4}
          >
            {text}
          </Text>
        </Center>
      </Billboard>
    </RigidBody>
  );
}