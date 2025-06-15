import React from 'react';
import { Text, Html } from '@react-three/drei';
import FloatingDie from './FloatingDie';
import { DieType } from './types';

interface InitialOverlayProps {
  onBrew: () => void;
}

const diceTypes: readonly DieType[] = ['grind', 'ratio', 'method', 'agitation', 'temperature'] as const;

const getDieColor = (index: number): string => {
  const colors = [
    '#FF6B6B', // Coral red for grind
    '#4ECDC4', // Teal for ratio
    '#45B7D1', // Sky blue for method
    '#96CEB4', // Mint green for agitation
    '#FFEAA7', // Warm yellow for temperature
  ];
  return colors[index] || '#f8f8f8';
};

const InitialOverlay: React.FC<InitialOverlayProps> = ({ onBrew }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Add a semi-transparent background plane for better visibility */}
      <mesh position={[0, -1, -0.1]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      
      <Text
        position={[0, 5.5, 0]}
        fontSize={1.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        AeroPress Dice
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={0.7}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        maxWidth={12}
        textAlign="center"
        lineHeight={1.8}
      >
        Roll the dice to discover your perfect coffee brewing recipe.
        {'\n\n'}Each die represents a different brewing parameter.
      </Text>
      <Html position={[0, -7, 0]} center>
        <button
          onClick={onBrew}
          style={{
            padding: '16px 32px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#4ECDC4',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#45B7D1';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4ECDC4';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)';
          }}
        >
          BREW
        </button>
      </Html>

      {/* Floating dice arranged in a nice pattern below the button */}
      <group position={[3, 2, 3]}>
        {diceTypes.map((dieType, index) => (
          <FloatingDie
            key={dieType}
            position={[
              (index - 2) * 1.2, // Spread horizontally: -2.4, -1.2, 0, 1.2, 2.4
              Math.sin(index * 0.8) * 0.3, // Slight vertical variation
              Math.cos(index * 0.6) * 0.2 // Slight depth variation
            ]}
            dieType={dieType}
            dieColor={getDieColor(index)}
            rotationSpeed={[
              0.003 + index * 0.001, // Slightly different X rotation speeds
              0.008 + index * 0.002, // Different Y rotation speeds
              0.005 + index * 0.001  // Different Z rotation speeds
            ]}
            scale={0.8}
          />
        ))}
      </group>
    </group>
  );
};

export default InitialOverlay;