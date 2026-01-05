'use client';

import { HomeIcon } from "@heroicons/react/24/solid";
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
  const FacebookIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
    </svg>
  );

  const InstagramIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.343 3.608 1.318.975.975 1.256 2.242 1.318 3.608.058 1.266.07 1.646.07 4.84 0 3.204-.012 3.584-.07 4.85-.062 1.366-.343 2.633-1.318 3.608-.975.975-2.242 1.256-3.608 1.318-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-1.366-.062-2.633-.343-3.608-1.318-.975-.975-1.256-2.242-1.318-3.608-.058-1.266-.07-1.646-.07-4.85 0-3.204.012-3.584.07-4.85.062-1.366.343-2.633 1.318-3.608.975-.975 2.242-1.256 3.608-1.318 1.266-.058 1.646-.07 4.85-.07zM12 6.838a5.162 5.162 0 1 0 0 10.324 5.162 5.162 0 0 0 0-10.324zm6.406-.845a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );

  const LinkedInIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.23 0H1.77C.79 0 0 .774 0 1.727v20.545C0 23.227.79 24 1.77 24h20.46c.98 0 1.77-.773 1.77-1.727V1.727C24 .774 23.21 0 22.23 0zM7.06 20.452H3.56V9h3.5v11.452zM5.31 7.433a2.03 2.03 0 1 1 0-4.06 2.03 2.03 0 0 1 0 4.06zM20.452 20.452h-3.5v-5.57c0-1.328-.027-3.037-1.85-3.037-1.85 0-2.134 1.445-2.134 2.94v5.667h-3.5V9h3.36v1.561h.047c.468-.887 1.61-1.82 3.314-1.82 3.545 0 4.2 2.334 4.2 5.37v6.341z" />
    </svg>
  );
  return (
    <footer className="relative w-full overflow-hidden text-white">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 60], fov: 75 }} gl={{ alpha: false }}>
          <color attach="background" args={["#14002e"]} />
          <ambientLight intensity={0.6} />
          <Stars />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-lg font-semibold">YourBrand</h2>
          <p className="text-gray-300 text-sm mt-2">
            Building unforgettable experiences with creativity and precision.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#home" className="hover:text-blue-400">Home</a></li>
            <li><a href="#events" className="hover:text-blue-400">Events</a></li>
            <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Contact Us</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              📞 <a href="tel:9030406896" className="hover:text-blue-400">
                9030406896
              </a>
            </p>
            <p>
              ✉️ <a href="mailto:info@emircorp.com" className="hover:text-blue-400">
                info@emircorp.com
              </a>
            </p>
          </div>
        </div>

        {/* Social (New Column) */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Social Media</h3>

          <div className="flex gap-4 mt-4">
            <a href="https://www.facebook.com/profile.php?id=61585491871963" target="_blank">
              <FacebookIcon className="h-6 w-6 text-white hover:text-blue-400" />
            </a>

            <a href="https://www.instagram.com/epudu_events/" target="_blank">
              <InstagramIcon className="h-6 w-6 text-white hover:text-pink-400" />
            </a>

            <a href="https://www.linkedin.com/company/yourcompany" target="_blank">
              <LinkedInIcon className="h-6 w-6 text-white hover:text-blue-500" />
            </a>
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 text-center text-gray-400 text-xs py-2 border-t border-white/20">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </div>

    </footer>


  );
}
