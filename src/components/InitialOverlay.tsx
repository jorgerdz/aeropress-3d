import React from 'react';
import { Text, Html } from '@react-three/drei';

interface InitialOverlayProps {
  onBrew: () => void;
}

const InitialOverlay: React.FC<InitialOverlayProps> = ({ onBrew }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Add a semi-transparent background plane for better visibility */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[14, 12]} />
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
    </group>
  );
};

export default InitialOverlay;