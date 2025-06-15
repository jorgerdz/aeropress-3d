import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import Die from './Die';
import DieBubble, { dieInstructions, dieLabels } from './DieBubble';
import InitialOverlay from './InitialOverlay';
import { DieType } from './types';

type Position = [number, number, number];
type Velocity = [number, number, number];

const Floor: React.FC = () => {
  // Dice rolling tray dimensions - sized to fill entire viewport
  // Camera at [10,10,10] distance ≈17.3, FOV 50° sees ≈16 units at origin
  const trayWidth = 16;  // X dimension (-8 to +8) - fills viewport width
  const trayDepth = 16;  // Z dimension (-8 to +8) - fills viewport depth
  const wallHeight = 12; // High enough to contain dice bouncing
  
  return (
    <RigidBody type="fixed">
      {/* Floor - infinite plane to catch all dice */}
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Front wall - invisible barrier to contain dice */}
      <mesh position={[0, wallHeight/2, trayDepth/2]}>
        <planeGeometry args={[trayWidth, wallHeight]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      {/* Back wall - prevents dice rolling away from camera */}
      <mesh position={[0, wallHeight/2, -trayDepth/2]}>
        <planeGeometry args={[trayWidth, wallHeight]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-trayWidth/2, wallHeight/2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[trayDepth, wallHeight]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right wall */}
      <mesh position={[trayWidth/2, wallHeight/2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[trayDepth, wallHeight]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </RigidBody>
  );
};

const diceTypes: readonly DieType[] = ['grind', 'ratio', 'method', 'agitation', 'temperature'] as const;

// Stylish die colors for each type
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

const getRandomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};


const DiceScene: React.FC = () => {
  const [diceEnabled, setDiceEnabled] = useState<number[]>([]);
  const [showDice, setShowDice] = useState<boolean>(false);
  const [showInitialOverlay, setShowInitialOverlay] = useState<boolean>(true);
  const [diceVelocities, setDiceVelocities] = useState<Velocity[]>([]);
  const [diceAngularVelocities, setDiceAngularVelocities] = useState<Velocity[]>([]);
  const [isGathering, setIsGathering] = useState<boolean>(false);
  const diceRefs = useRef<(any | null)[]>([]);
  const [diceSettled, setDiceSettled] = useState<boolean>(false);
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [cameraFocusing, setCameraFocusing] = useState<boolean>(false);
  const [showBrewResults, setShowBrewResults] = useState<boolean>(false);
  const [showInstructionsFor, setShowInstructionsFor] = useState<DieType | null>(null);
  const cameraRef = useRef<any>(null);
  const [refsAssigned, setRefsAssigned] = useState<number[]>([]);

  // Function to detect which face is up based on die rotation
  const getTopFace = (rotation: any): number => {
    // Get the world up vector (0, 1, 0) and transform it by the die's inverse rotation
    // to find which local face normal is closest to world up
    const worldUp = { x: 0, y: 1, z: 0 };
    
    // Face normals in local space (corresponding to face indices in Die.tsx)
    const faceNormals = [
      { x: 0, y: 0, z: 1 },   // Front face (index 0)
      { x: 1, y: 0, z: 0 },   // Right face (index 1)  
      { x: 0, y: 1, z: 0 },   // Top face (index 2)
      { x: 0, y: -1, z: 0 },  // Bottom face (index 3)
      { x: -1, y: 0, z: 0 },  // Left face (index 4)
      { x: 0, y: 0, z: -1 }   // Back face (index 5)
    ];

    // Transform each face normal by the die's rotation to world space
    const quaternion = rotation;
    let maxDot = -1;
    let topFaceIndex = 2; // Default to top face

    faceNormals.forEach((normal, index) => {
      // Apply quaternion rotation to the normal vector
      const rotatedNormal = {
        x: (1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z)) * normal.x +
           2 * (quaternion.x * quaternion.y - quaternion.w * quaternion.z) * normal.y +
           2 * (quaternion.x * quaternion.z + quaternion.w * quaternion.y) * normal.z,
        y: 2 * (quaternion.x * quaternion.y + quaternion.w * quaternion.z) * normal.x +
           (1 - 2 * (quaternion.x * quaternion.x + quaternion.z * quaternion.z)) * normal.y +
           2 * (quaternion.y * quaternion.z - quaternion.w * quaternion.x) * normal.z,
        z: 2 * (quaternion.x * quaternion.z - quaternion.w * quaternion.y) * normal.x +
           2 * (quaternion.y * quaternion.z + quaternion.w * quaternion.x) * normal.y +
           (1 - 2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y)) * normal.z
      };

      // Dot product with world up vector
      const dot = rotatedNormal.y;
      if (dot > maxDot) {
        maxDot = dot;
        topFaceIndex = index;
      }
    });

    return topFaceIndex;
  };

  // Initial positions spread higher in the sky - spread across larger tray
  const diceStartPositions: Position[] = [
    [-4, 20, -4],
    [-2, 20, 2],
    [0, 20, 0],
    [2, 20, -2],
    [4, 20, 4],
  ];

  const finalPositions: Position[] = [
    [0, 5, 0],    // Top die
    [0, 4, 0],    // Second from top
    [0, 3, 0],    // Center die
    [0, 1.9, 0],    // Second from bottom
    [0, 0.8, 0],    // Bottom die
  ];


  // Check if dice have settled
  useEffect(() => {
    if (!showDice || diceSettled) return;
    
    // Wait for all dice to be enabled AND all refs to be assigned
    if (diceEnabled.length !== 5 || refsAssigned.length !== 5) {
      return;
    }
    
    // No delay needed since we're waiting for refs to be assigned
    const timeoutId = setTimeout(() => {
      // Verify all refs are assigned
      const validRefs = diceRefs.current.filter(ref => ref !== null);
      if (validRefs.length !== 5) {
        return;
      }

      const checkInterval = setInterval(() => {
        let allSettled = true;
        
        for (const ref of diceRefs.current) {
          if (!ref) continue;
          
          const linVel = ref.linvel();
          const angVel = ref.angvel();
          
          // Check if the die is still moving significantly
          if (
            Math.abs(linVel.x) > 0.1 || 
            Math.abs(linVel.y) > 0.1 || 
            Math.abs(linVel.z) > 0.1 ||
            Math.abs(angVel.x) > 0.1 || 
            Math.abs(angVel.y) > 0.1 || 
            Math.abs(angVel.z) > 0.1
          ) {
            allSettled = false;
            break;
          }
        }

        if (allSettled) {
            setDiceSettled(true);
          clearInterval(checkInterval);
          
          // Capture dice results
          const results: number[] = [];
          diceRefs.current.forEach((ref, index) => {
            if (ref) {
              const rotation = ref.rotation();
              const topFace = getTopFace(rotation);
              results.push(topFace);
              } else {
                results.push(2); // Default to face 2 if ref is null
            }
          });
          setDiceResults(results);
            
          // Start gathering animation after a short delay
          setTimeout(() => {
              setIsGathering(true);
          }, 500);
        }
      }, 200);

      return () => {
        clearInterval(checkInterval);
      };
    }, 100); // Small delay to ensure physics is ready
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [showDice, diceEnabled, diceSettled, refsAssigned]);

  // Handle gathering animation
  useEffect(() => {
    if (!isGathering) return;

    
    // Double-check each ref individually
    const missingRefs: number[] = [];
    diceRefs.current.forEach((ref, index) => {
      if (!ref) {
        missingRefs.push(index);
      }
    });
    
    if (missingRefs.length > 0) {
      // Retry after a short delay
      setTimeout(() => {
        setIsGathering(false);
        setTimeout(() => setIsGathering(true), 100);
      }, 500);
      return;
    }

    // Make all dice kinematic and stop them
    diceRefs.current.forEach((ref, index) => {
      if (!ref) {
        return;
      }
      const isSleeping = ref.isSleeping();
      ref.setBodyType(1); // kinematic
      
      // Wake up the body in case it's sleeping
      if (isSleeping) {
        ref.wakeUp();
      }
      
      ref.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ref.setAngvel({ x: 0, y: 0, z: 0 }, true);
    });

    // Wait a frame to ensure physics is updated
    requestAnimationFrame(() => {
      // Now capture initial positions
      const initialPositions: any[] = new Array(5);
      
      for (let index = 0; index < 5; index++) {
        const ref = diceRefs.current[index];
        if (!ref) {
          // Don't return - this would skip setting the position and cause the die to not move
          // Instead, use a fallback position
          initialPositions[index] = diceStartPositions[index] 
            ? { x: diceStartPositions[index][0], y: diceStartPositions[index][1], z: diceStartPositions[index][2] }
            : { x: 0, y: 10, z: 0 };
        } else {
          const pos = ref.translation();
          initialPositions[index] = { x: pos.x, y: pos.y, z: pos.z };
        }
      }

      let startTime = Date.now();
      const duration = 1500; // 1.5 seconds

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Simple easing
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;

        for (let index = 0; index < 5; index++) {
          const ref = diceRefs.current[index];
          if (!ref) {
            continue;
          }
          if (!initialPositions[index]) {
            const currentPos = ref.translation();
            initialPositions[index] = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
          }

          const start = initialPositions[index];
          const target = finalPositions[index];
          
          // Linear interpolation with easing
          const x = start.x + (target[0] - start.x) * eased;
          const y = start.y + (target[1] - start.y) * eased;
          const z = start.z + (target[2] - start.z) * eased;
          
          // Set position
          ref.setTranslation({ x, y, z }, true);
          
          
          // Set rotation based on dice result
          if (progress > 0.3) { // Start rotating early
            const faceIndex = diceResults[index] || 2;
            // Quaternions to orient each face toward the camera (positive Z)
            // When a face was detected as "up", we rotate so it faces the user
            const rotations = [
              { x: 0, y: 0, z: 0, w: 1 },              // Face 0 (front) - already facing camera
              { x: 0, y: -0.7071, z: 0, w: 0.7071 },   // Face 1 (right) - rotate -90° around Y
              { x: 0.7071, y: 0, z: 0, w: 0.7071 },    // Face 2 (top) - rotate 90° around X
              { x: -0.7071, y: 0, z: 0, w: 0.7071 },   // Face 3 (bottom) - rotate -90° around X
              { x: 0, y: 0.7071, z: 0, w: 0.7071 },    // Face 4 (left) - rotate 90° around Y
              { x: 0, y: 1, z: 0, w: 0 }               // Face 5 (back) - rotate 180° around Y
            ];
            ref.setRotation(rotations[faceIndex] || rotations[0], true);
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Make dice static at the end
          // Make dice static at the end
          diceRefs.current.forEach((ref) => {
            if (ref) {
              ref.setBodyType(2); // static
            }
          });
          
          setIsGathering(false);
          // Show 3D bubbles instead of 2D sidebar
          setShowBrewResults(true);
        }
      };

      animate();
    });
  }, [isGathering, diceResults]);

  // Handle camera focusing animation - triggered after UI shows
  useEffect(() => {
    if (!showBrewResults || !cameraRef.current || cameraFocusing) return;

    const camera = cameraRef.current;
    const startPosition = { ...camera.position };
    
    // Target camera position to view both dice and bubbles
    const targetPosition = { x: 2, y: 2.5, z: 8 };
    const targetLookAt = { x: 2, y: 2.5, z: 0 };

    let frame = 0;
    const duration = 120;
    const easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    setCameraFocusing(true);
    
    // Wait for canvas resize to complete before starting camera animation
    setTimeout(() => {
      const animateCamera = () => {
        if (frame >= duration) {
          setCameraFocusing(false);
          return;
        }

      const progress = frame / duration;
      const easedProgress = easing(progress);

      // Interpolate camera position
      camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
      camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
      camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

      // Look at the target  
      camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
      camera.updateProjectionMatrix();

        frame++;
        requestAnimationFrame(animateCamera);
      };

      animateCamera();
    }, 600); // Wait for bubble animation to complete
  }, [showBrewResults]);

  const generateRandomVelocities = () => {
    const velocities: Velocity[] = diceStartPositions.map(() => [
      getRandomInRange(-3, 3),    // x velocity - keeps dice within tray bounds (±4 start + ±3 vel = ±7 max)
      getRandomInRange(-2, 2),    // y velocity - some bounce for realism
      getRandomInRange(-3, 3),    // z velocity - keeps dice within tray bounds (±4 start + ±3 vel = ±7 max)
    ]);

    const angularVelocities: Velocity[] = diceStartPositions.map(() => [
      getRandomInRange(-10, 10),  // x rotation
      getRandomInRange(-10, 10),  // y rotation
      getRandomInRange(-10, 10),  // z rotation
    ]);

    setDiceVelocities(velocities);
    setDiceAngularVelocities(angularVelocities);
  };

  const rollDice = (): void => {
    // Hide the initial overlay
    setShowInitialOverlay(false);
    
    // Reset camera to original position
    if (cameraRef.current) {
      cameraRef.current.position.set(15, 15, 15);
      cameraRef.current.lookAt(0, 0, 0);
      cameraRef.current.updateProjectionMatrix();
    }
    
    // Reset all refs to ensure clean state
    diceRefs.current = Array(5).fill(null);
    setRefsAssigned([]);
    
    setShowDice(true);
    setDiceEnabled([]);
    setDiceSettled(false);
    setIsGathering(false);
    setCameraFocusing(false);
    setShowBrewResults(false);
    setDiceResults([]);
    generateRandomVelocities();
    
    // Enable dice with a slight delay between each
    diceStartPositions.forEach((_, index) => {
      setTimeout(() => {
        setDiceEnabled(prev => [...prev, index]);
      }, index * 50);
    });
  };

  const handleSceneClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    rollDice();
  };

  const handleShare = () => {
    // URL sharing functionality - will implement in next task
    console.log('Share functionality coming soon!');
  };

  return (
    <>
      {/* Instructions Modal */}
      {showInstructionsFor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setShowInstructionsFor(null)}
        >
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: `2px solid ${getDieColor(diceTypes.indexOf(showInstructionsFor))}`,
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                margin: 0,
                color: getDieColor(diceTypes.indexOf(showInstructionsFor)),
                fontSize: '18px',
                fontWeight: '600'
              }}>
                How to use: {dieLabels[showInstructionsFor]}
              </h2>
              <button
                onClick={() => setShowInstructionsFor(null)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #666',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              color: '#e0e0e0',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {dieInstructions[showInstructionsFor]}
            </div>
          </div>
        </div>
      )}

      <Canvas 
        camera={{ position: [15, 15, 15], fov: 50 }} 
        onClick={handleSceneClick}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
          camera.lookAt(0, 0, 0);
        }}
        style={{
          width: '100vw',
          height: '100vh',
          zIndex: 1
        }}
      >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Physics>
        <Floor />

        {showDice && diceStartPositions.map((position, index) => (
          <Die 
            key={index} 
            position={position}
            enabled={diceEnabled.includes(index)}
            dieType={diceTypes[index]}
            initialVelocity={diceVelocities[index]}
            initialAngularVelocity={diceAngularVelocities[index]}
            dieColor={getDieColor(index)}
            ref={(ref) => { 
              if (ref) {
                diceRefs.current[index] = ref;
                setRefsAssigned(prev => {
                  if (!prev.includes(index)) {
                    return [...prev, index].sort((a, b) => a - b);
                  }
                  return prev;
                });
              } else {
                setRefsAssigned(prev => prev.filter(i => i !== index));
              }
            }}
          />
        ))}

        {/* 3D Bubble overlays for each die result */}
        {showBrewResults && diceResults.length > 0 && diceTypes.map((dieType, index) => (
          <DieBubble
            key={`bubble-${index}`}
            position={[finalPositions[index][0] + 1.5, finalPositions[index][1], finalPositions[index][2]]}
            dieType={dieType}
            faceIndex={diceResults[index] || 0}
            dieColor={getDieColor(index)}
            visible={showBrewResults}
            onShowInstructions={setShowInstructionsFor}
          />
        ))}

        {/* Reroll button positioned below the text boxes */}
        {showBrewResults && (
          <Html
            position={[1.5, -0.5, 0]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: 'auto'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInitialOverlay(true);
                rollDice();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              Roll Again
            </button>
          </Html>
        )}
      </Physics>

      {showInitialOverlay && <InitialOverlay onBrew={rollDice} />}

    </Canvas>
    </>
  );
};

export default DiceScene; 