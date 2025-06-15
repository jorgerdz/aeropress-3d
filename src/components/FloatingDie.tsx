import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import DieFace from './DieFace';
import { DieType } from './types';

interface FloatingDieProps {
  position: [number, number, number];
  dieType: DieType;
  dieColor?: string;
  rotationSpeed?: [number, number, number];
  scale?: number;
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
    'Stir clockwise,\nStir counter-clockwise\n',
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

const FloatingDie: React.FC<FloatingDieProps> = ({ 
  position, 
  dieType,
  dieColor = "#f8f8f8",
  rotationSpeed = [0.005, 0.01, 0.007],
  scale = 0.8
}) => {
  const meshRef = useRef<any>(null);
  const faces = dieContent[dieType];

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0];
      meshRef.current.rotation.y += rotationSpeed[1];
      meshRef.current.rotation.z += rotationSpeed[2];
    }
  });

  const faceConfig = {
    fontSize: 0.12 * scale,
    color: "black",
    offset: 0.041 * scale,
    maxWidth: 0.6 * scale
  };

  return (
    <group position={position} scale={scale}>
      <group ref={meshRef}>
        <RoundedBox 
          args={[1, 1, 1]} 
          radius={0.1} 
          smoothness={4}
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color={dieColor} 
            roughness={0.3}
            metalness={0.1}
          />
        </RoundedBox>
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
    </group>
  );
};

export default FloatingDie;