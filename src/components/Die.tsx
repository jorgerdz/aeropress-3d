import { RigidBody } from '@react-three/rapier';
import { forwardRef } from 'react';
import DieFace from './DieFace';
import { DieType, DieProps } from './types';

interface FaceConfig {
  fontSize?: number;
  color?: string;
  offset?: number;
  maxWidth?: number;
}

const dieContent: Record<DieType, string[]> = {
  grind: [
    'Very Fine\n30 Sec',
    'Fine\n60 Seconds',
    'Medium Fine\n90 Sec',
    'Medium\n120 Sec',
    'Coarse\n4 min',
    'Your Choice'
  ],
  ratio: [
    '30g Coffee\n200g Water\n(Dilute to share)\n(1/6)',
    '24g Coffee\n200g Water\n(Dilute to share)\n(1/8)',
    '15g Coffee\n250g Water\n(Dilute to share)\n(1/16)',
    '15g Coffee\n200g Water\n(1/13)',
    '12g Coffee\n200g Water\n(1/16)',
    'Your Choice'
  ],
  method: [
    'Inverted\n30s Bloom\n60g Water',
    'Standard\n30s Bloom\n60g Water',
    'Inverted\n30s Bloom\n30g Water',
    'Standard\n30s Bloom\n30g Water',
    'Standard\nNo Bloom',
    'Inverted\nNo Bloom'
  ],
  agitation: [
    'No Stir',
    'Stir before\npressing (x2)',
    'Stir clockwise once,\nStir counter-clockwise\nonce before pressing',
    'Stir before\npressing (x1)',
    'Stir before pressing\n(North, South,\nEast, West)',
    'Your Choice'
  ],
  temperature: [
    '95C | 203F',
    '75C | 167F',
    '90C | 194F',
    '80C | 176F',
    '85C | 185F',
    'Your Choice'
  ]
};

const Die = forwardRef<any, DieProps>(({ 
  position, 
  enabled = true, 
  dieType,
  initialVelocity,
  initialAngularVelocity,
  faceConfig = {
    fontSize: 0.15,
    color: "black",
    offset: 0.051,
    maxWidth: 0.8
  }
}, ref) => {
  const faces = dieContent[dieType];

  if (!enabled) {
    return null;
  }

  return (
    <RigidBody 
      position={position} 
      restitution={0.7} 
      friction={0.2}
      linearVelocity={initialVelocity}
      angularVelocity={initialAngularVelocity}
      colliders="cuboid"
      ref={ref}
    >
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Front face */}
        <DieFace 
          position={[0, 0, 0.5]} 
          rotation={[0, 0, 0]} 
          text={faces[0]} 
          {...faceConfig}
        />
        {/* Back face */}
        <DieFace 
          position={[0, 0, -0.5]} 
          rotation={[0, Math.PI, 0]} 
          text={faces[5]} 
          {...faceConfig}
        />
        {/* Right face */}
        <DieFace 
          position={[0.5, 0, 0]} 
          rotation={[0, Math.PI / 2, 0]} 
          text={faces[1]} 
          {...faceConfig}
        />
        {/* Left face */}
        <DieFace 
          position={[-0.5, 0, 0]} 
          rotation={[0, -Math.PI / 2, 0]} 
          text={faces[4]} 
          {...faceConfig}
        />
        {/* Top face */}
        <DieFace 
          position={[0, 0.5, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          text={faces[2]} 
          {...faceConfig}
        />
        {/* Bottom face */}
        <DieFace 
          position={[0, -0.5, 0]} 
          rotation={[Math.PI / 2, 0, 0]} 
          text={faces[3]} 
          {...faceConfig}
        />
      </group>
    </RigidBody>
  );
});

Die.displayName = 'Die';

export default Die; 