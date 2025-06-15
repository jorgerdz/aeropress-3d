import { useState, useEffect } from 'react';
import { DieType } from './types';

interface BrewResultsProps {
  diceResults: number[];
  diceTypes: readonly DieType[];
  visible: boolean;
  onReroll: () => void;
  onShare: () => void;
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

const BrewResults: React.FC<BrewResultsProps> = ({ 
  diceResults, 
  diceTypes, 
  visible, 
  onReroll, 
  onShare 
}) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      className={`brew-results-sidebar ${fadeIn ? 'slide-in' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        right: fadeIn ? 0 : '-400px',
        width: '400px',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        zIndex: 1000,
        transition: 'right 0.5s ease-in-out',
        boxShadow: 'none',
        padding: '24px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Your AeroPress Recipe
      </h1>
        
      <div style={{ marginBottom: '24px' }}>
        {diceTypes.map((dieType, index) => {
          const resultIndex = diceResults[index] || 0;
          const result = dieContent[dieType][resultIndex];
          
          return (
            <div 
              key={dieType}
              style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                borderRadius: '6px',
                border: '1px solid #404040'
              }}
            >
              <h3 style={{ 
                margin: '0 0 6px 0',
                color: '#e0e0e0',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {dieLabels[dieType]}
              </h3>
              <p style={{ 
                margin: 0,
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: '1.3',
                whiteSpace: 'pre-line'
              }}>
                {result}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button
          onClick={onReroll}
          style={{
            padding: '12px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Roll Again
        </button>
        
        <button
          onClick={onShare}
          style={{
            padding: '12px 16px',
            backgroundColor: '#28a745',
            color: 'white', 
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e7e34'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
        >
          Share Recipe
        </button>
      </div>
    </div>
  );
};

export default BrewResults;