import { Text } from '@react-three/drei';
import { DieFaceProps } from './types';

const DieFace = ({ 
  position, 
  rotation, 
  text, 
  fontSize = 0.15, 
  color = "black", 
  offset = 0.051,
  maxWidth = 0.8
}: DieFaceProps) => {
  return (
    <group position={position} rotation={rotation}>
      <Text
        position={[0, 0, offset]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={maxWidth}
        textAlign="center"
        lineHeight={1.2}
      >
        {text}
      </Text>
    </group>
  );
};

export default DieFace; 