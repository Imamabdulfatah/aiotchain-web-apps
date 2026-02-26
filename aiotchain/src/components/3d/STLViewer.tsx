"use client";

import { Center, OrbitControls, Stage } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface STLModelProps {
  url: string;
}

const STLModel = ({ url }: STLModelProps) => {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  // Auto-rotate effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Center top>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.3} />
      </mesh>
    </Center>
  );
};

export default function STLViewer({ url }: { url: string }) {
  if (!url) return null;

  return (
    <div className="w-full h-full bg-slate-100/50 rounded-3xl overflow-hidden cursor-move">
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
        <pointLight position={[-10, -10, -10]} />
        
        <React.Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <STLModel url={url} />
          </Stage>
        </React.Suspense>
        
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      </Canvas>
      <div className="absolute bottom-4 right-4 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-sm pointer-events-none">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          3D Interactive Mode (Drag to Rotate)
        </p>
      </div>
    </div>
  );
}
