import { useState, useEffect } from 'react';
import { Html, Text } from '@react-three/drei';
import { DieType } from './types';

interface DieBubbleProps {
  position: [number, number, number];
  dieType: DieType;
  faceIndex: number;
  dieColor: string;
  visible: boolean;
  onShowInstructions: (dieType: DieType) => void;
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

const dieLabels: Record<DieType, string> = {
  grind: 'Grind Size',
  ratio: 'Coffee Ratio',
  method: 'Brewing Method',
  agitation: 'Agitation',
  temperature: 'Water Temperature'
};

const dieInstructions: Record<DieType, string> = {
  grind: 'Grind Size Controls:\n\n• Very Fine (30s): Use espresso-fine grind, brew for 30 seconds total\n• Fine (60s): Use pour-over fine grind, brew for 1 minute\n• Medium Fine (90s): Standard AeroPress grind, brew for 1.5 minutes\n• Medium (120s): Slightly coarser grind, brew for 2 minutes\n• Coarse (4min): French press coarseness, brew for 4 minutes\n\nGrind size affects extraction rate - finer grinds extract faster and need less time.',
  
  ratio: 'Coffee to Water Ratio:\n\n• Strong ratios (1:6, 1:8): Concentrated brew meant to be diluted with hot water after brewing\n• Medium ratios (1:13, 1:16): Ready to drink without dilution\n• Weaker ratio (1:16): Lighter, more tea-like coffee\n\nAdjust to taste - stronger ratios give more intense flavor, weaker ratios are more subtle.',
  
  method: 'Brewing Method:\n\n• Standard: AeroPress right-side up, filter in cap, coffee and water added from top\n• Inverted: AeroPress upside down, allows longer steeping without dripping\n• Bloom: Pre-wet coffee with small amount of water, wait 30s, then add rest\n• No Bloom: Add all water at once for simpler brewing\n\nInverted method gives more control over steeping time.',
  
  agitation: 'Stirring Technique:\n\n• No Stir: Gentle extraction, cleaner cup\n• Light Stir (x1-x2): Ensures even saturation\n• Directional Stir: Clockwise then counter-clockwise creates even extraction\n• Cross Stir (N,S,E,W): Four stirs in cardinal directions\n\nMore agitation increases extraction and strength.',
  
  temperature: 'Water Temperature:\n\n• 95°C (203°F): Hot brewing, full extraction, bold flavors\n• 90°C (194°F): Standard AeroPress temperature\n• 85°C (185°F): Medium heat, balanced extraction\n• 80°C (176°F): Cooler brewing, less bitter\n• 75°C (167°F): Cold-ish brewing, very smooth\n\nLower temperatures reduce bitterness and acidity.'
};

const DieBubble: React.FC<DieBubbleProps> = ({ 
  position, 
  dieType, 
  faceIndex, 
  dieColor, 
  visible,
  onShowInstructions
}) => {
  const [scale, setScale] = useState(0);
  
  useEffect(() => {
    if (visible) {
      setTimeout(() => setScale(1), 100);
    } else {
      setScale(0);
    }
  }, [visible]);

  if (!visible) return null;

  const content = dieContent[dieType][faceIndex] || dieContent[dieType][0];
  const label = dieLabels[dieType];
  const instructions = dieInstructions[dieType];

  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.3s ease-out',
        pointerEvents: 'auto'
      }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: `2px solid ${dieColor}`,
          borderRadius: '12px',
          padding: '12px',
          minWidth: '220px',
          maxWidth: '264px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <h3 style={{
              margin: 0,
              color: dieColor,
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flex: 1
            }}>
              {label}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowInstructions(dieType);
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: dieColor,
                border: `2px solid ${dieColor}`,
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${dieColor}20`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ?
            </button>
          </div>
          
          <p style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '12px',
            lineHeight: '1.4',
            whiteSpace: 'pre-line'
          }}>
            {content}
          </p>
        </div>

      </div>
    </Html>
  );
};

export default DieBubble;
export { dieInstructions, dieLabels };