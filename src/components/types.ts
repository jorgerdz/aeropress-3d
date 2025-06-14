export type DieType = 'grind' | 'ratio' | 'method' | 'agitation' | 'temperature';

export interface FaceConfig {
  fontSize?: number;
  color?: string;
  offset?: number;
  maxWidth?: number;
}

export interface DieProps {
  position: [number, number, number];
  enabled?: boolean;
  dieType: DieType;
  faceConfig?: FaceConfig;
  initialVelocity?: [number, number, number];
  initialAngularVelocity?: [number, number, number];
}

export interface DieFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  text: string;
  fontSize?: number;
  color?: string;
  offset?: number;
  maxWidth?: number;
} 