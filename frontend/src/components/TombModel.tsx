import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Chamber } from '@/types';

interface TombModelProps {
  chamber: Chamber;
  showWireframe?: boolean;
}

export default function TombModel({ chamber, showWireframe = false }: TombModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const dimensions = useMemo(() => {
    const width = chamber.width || 5;
    const height = chamber.height || 5;
    const length = chamber.length || 5;
    return { width, height, length };
  }, [chamber]);
  
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x8B7355,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), []);
  
  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x6B5344,
    roughness: 0.95,
    metalness: 0.05,
  }), []);
  
  const wallPaintMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xC4A35A,
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: 0.9,
  }), []);
  
  useFrame(() => {
  });
  
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[dimensions.width, dimensions.length]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>
      
      <mesh position={[0, dimensions.height / 2, -dimensions.length / 2]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      <mesh position={[dimensions.width / 2, dimensions.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.length, dimensions.height, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      <mesh position={[-dimensions.width / 2, dimensions.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.length, dimensions.height, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      <mesh position={[0, dimensions.height / 2, dimensions.length / 2]} rotation={[Math.PI, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.width, dimensions.height, 0.3]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      <mesh position={[0, dimensions.height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[dimensions.width, dimensions.length]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      <mesh position={[0, dimensions.height / 2, -dimensions.length / 2 + 0.2]}>
        <planeGeometry args={[dimensions.width - 1, dimensions.height - 1]} />
        <primitive object={wallPaintMaterial} attach="material" />
      </mesh>
      
      <mesh position={[dimensions.width / 2 - 0.2, dimensions.height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[dimensions.length - 1, dimensions.height - 1]} />
        <primitive object={wallPaintMaterial} attach="material" />
      </mesh>
      
      <mesh position={[-dimensions.width / 2 + 0.2, dimensions.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[dimensions.length - 1, dimensions.height - 1]} />
        <primitive object={wallPaintMaterial} attach="material" />
      </mesh>
      
      {showWireframe && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.length)]} />
          <lineBasicMaterial color={0x4A7C59} linewidth={2} />
        </lineSegments>
      )}
      
      <group position={[dimensions.width / 2 - 0.15, 0.2, -dimensions.length / 4]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={0xE8A838} emissive={0xE8A838} emissiveIntensity={0.3} />
      </group>
      <group position={[-dimensions.width / 2 + 0.15, 0.2, dimensions.length / 4]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={0xE8A838} emissive={0xE8A838} emissiveIntensity={0.3} />
      </group>
    </group>
  );
}
