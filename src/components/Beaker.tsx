import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';

interface BeakerProps {
  position: [number, number, number];
  onRelease: () => void;
}

const Beaker: React.FC<BeakerProps> = ({ position, onRelease }) => {
  const beakerRef = useRef<any>();
  const [isShaking, setIsShaking] = useState(false);
  const shakeAmplitude = 0.4;
  const shakeSpeed = 12;
  const wallThickness = 0.2;
  const beakerRadius = 2;
  const beakerHeight = 4;
  
  useFrame((state) => {
    if (isShaking && beakerRef.current) {
      const time = state.clock.getElapsedTime();
      beakerRef.current.setNextKinematicTranslation({
        x: position[0] + Math.sin(time * shakeSpeed) * shakeAmplitude,
        y: position[1] + Math.sin(time * shakeSpeed * 1.5) * 0.2,
        z: position[2] + Math.cos(time * shakeSpeed * 0.8) * shakeAmplitude
      });
    }
  });

  useEffect(() => {
    if (beakerRef.current) {
      setTimeout(() => {
        setIsShaking(true);
      }, 3000);
      
      setTimeout(() => {
        setIsShaking(false);
        onRelease();
      }, 5000);
    }
  }, [onRelease]);

  return (
    <RigidBody 
      ref={beakerRef}
      type="kinematicPosition"
      position={position}
    >
      <group>
        {/* Visual components */}
        <Cylinder args={[beakerRadius, beakerRadius, wallThickness, 32]} position={[0, wallThickness/2, 0]}>
          <meshStandardMaterial color="#88ccff" />
        </Cylinder>

        <Cylinder 
          args={[beakerRadius, beakerRadius, beakerHeight, 32, 1, true]} 
          position={[0, beakerHeight/2, 0]}
        >
          <meshStandardMaterial 
            color="#88ccff" 
            opacity={0.5} 
            transparent={true}
            side={THREE.DoubleSide}
          />
        </Cylinder>

        {/* Physics colliders */}
        <group>
          {/* Bottom collider */}
          <RigidBody type="fixed" position={[0, wallThickness/2, 0]} restitution={0.5} friction={0.8}>
            <CylinderCollider args={[wallThickness/2, beakerRadius]} />
          </RigidBody>

          {/* Outer wall collider */}
          <RigidBody type="fixed" position={[0, beakerHeight/2, 0]} restitution={0.5} friction={0.2}>
            <CylinderCollider args={[beakerHeight/2, beakerRadius + wallThickness/2]} />
          </RigidBody>

          {/* Inner wall collider (negative space) */}
          <RigidBody type="fixed" position={[0, beakerHeight/2, 0]} restitution={0.5} friction={0.2}>
            <CylinderCollider args={[beakerHeight/2 - wallThickness, beakerRadius - wallThickness/2]} />
          </RigidBody>
        </group>
      </group>
    </RigidBody>
  );
};

export default Beaker; 