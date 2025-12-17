'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Stars({ count = 2000 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push((Math.random() - 0.5) * 200);
      arr.push((Math.random() - 0.5) * 200);
      arr.push((Math.random() - 0.5) * 200);
    }
    return new Float32Array(arr);
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.35,
        transparent: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.015;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden text-white h-auto md:h-[250px]">

      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 60], fov: 75 }}
          gl={{ alpha: false }}
        >
          <color attach="background" args={["#14002e"]} />
          <ambientLight intensity={0.6} />
          <Stars />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-6">

        <div>
          <h2 className="text-lg font-semibold">YourBrand</h2>
          <p className="text-gray-300 text-sm">
            Building unforgettable experiences.
          </p>
        </div>

        <div>
          <ul className="space-y-1 text-sm">
            <li><a href="#home" className="hover:text-blue-400">Home</a></li>
            <li><a href="#events" className="hover:text-blue-400">Events</a></li>
            <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
          </ul>
        </div>

        <div className="flex justify-center md:justify-end gap-4 text-lg">
          <i className="fab fa-facebook-f hover:text-blue-400 cursor-pointer"></i>
          <i className="fab fa-instagram hover:text-pink-400 cursor-pointer"></i>
          <i className="fab fa-linkedin-in hover:text-blue-500 cursor-pointer"></i>
        </div>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-[5px] left-0 w-full text-center text-gray-400 text-xs py-2 border-t border-white/20">
        © {new Date().getFullYear()} YourBrand
      </div>

    </footer>
  );
}
