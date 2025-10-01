import * as THREE from 'three';
import { useRef, useEffect, useState } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function BrainViewer() {
  const mountRef = useRef(null);
  // Use an object to group parts by their friendly name.
  // Example: { "Frontal Lobe": [ {points, mesh}, {points, mesh} ], ... }
  const partsRef = useRef({});
  // Menu items will be the unique friendly names.
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Create scene, camera, and renderer.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 2. Add OrbitControls.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 3. Add lights.
    const Light1 = new THREE.DirectionalLight(0xffffff, 1);
    Light1.position.set(30, 10, 100);
    scene.add(Light1);
    

    //second light add
    const Light2 = new THREE.DirectionalLight(0xffffff, 1);
    Light2.position.set(0, 0, -100);
    scene.add(Light2);


    // 4. Add a floor.
    const floorGeometry = new THREE.PlaneGeometry(410, 410);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x6f6f6f });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -200;
    scene.add(floor);

    // 5. Optional overlay (brain shadow)
    const textureLoader = new THREE.TextureLoader();
    const overlayTexture = textureLoader.load('/textures/brain-shadow.png');
    const overlayMaterial = new THREE.MeshBasicMaterial({
      map: overlayTexture,
      transparent: true,
    });
    const overlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      overlayMaterial
    );
    overlayPlane.rotation.x = -Math.PI / 2;
    overlayPlane.position.y = floor.position.y + 1;
    scene.add(overlayPlane);

    // 6. Define internal colors and friendly names.
    const brainColors = {
      pitua1: 0xfc5c65,   // bright red (pituitary)
      temp1: 0xfed330,    // warm yellow (temporal lobe)
      pariet1: 0x45aaf2,  // sky blue (parietal lobe)
      occipit1: 0x0a84ff, // neon blue (occipital lobe)
      frontal1: 0xf66386, // muted navy (frontal lobe)
      stem1: 0x8854d0,    // purple (brainstem)
      corpus1: 0xffffff,  // bright white (corpus callosum)
      cereb1: 0x26de81,   // soft green (cerebellum)
    };

    const brainPartNames = {
      pitua1: 'Pituitary',
      temp1: 'Temporal Lobe',
      pariet1: 'Parietal Lobe',
      occipit1: 'Occipital Lobe',
      frontal1: 'Frontal Lobe',
      stem1: 'Brainstem',
      corpus1: 'Corpus Callosum',
      cereb1: 'Cerebellum',
    };

    // 7. Load the OBJ model and group parts by their friendly name.
    const loader = new OBJLoader();
    loader.load('/models/brain-parts-big.obj', (object) => {
      object.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const rawName = child.name.toLowerCase();
          // Determine which key is contained in the raw name.
          const key = Object.keys(brainColors).find((k) =>
            rawName.includes(k)
          );
          const color = key ? brainColors[key] : 0xaaaaaa;
          // Use the friendly name; fall back to raw name if needed.
          const displayName = key ? brainPartNames[key] : rawName;

          // Create points (default view).
          const pointsMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.8,
          });
          const points = new THREE.Points(child.geometry, pointsMaterial);
          points.name = rawName;
          scene.add(points);

          // Create mesh (triangles) and hide it by default.
          const meshMaterial = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            visible: true,
          });
          const mesh = new THREE.Mesh(child.geometry, meshMaterial);
          mesh.name = rawName;
          scene.add(mesh);

          // Group parts by their displayName.
          if (!partsRef.current[displayName]) {
            partsRef.current[displayName] = [];
          }
          partsRef.current[displayName].push({ points, mesh });
        }
      });
      // Update the menu with unique friendly names.
      setMenuItems(Object.keys(partsRef.current));
    });

    // 8. Animation loop.
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Handle window resize.
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handler for when a menu button is clicked.
  // Only the meshes for that group become visible.
  const handleMenuClick = (friendlyName) => {
    Object.keys(partsRef.current).forEach((groupName) => {
      partsRef.current[groupName].forEach((part) => {
        if (groupName === friendlyName) {
          part.mesh.visible = true;
          part.points.visible = false;
        } else {
          part.mesh.visible = false;
          part.points.visible = true;
        }
      });
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Three.js canvas */}
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
      {/* Fixed menu in the top-left */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 100,
          background: 'rgba(255,255,255,0.8)',
          padding: '10px',
          borderRadius: '5px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {menuItems.map((name) => (
          <button
            key={name}
            onClick={() => handleMenuClick(name)}
            style={{
              display: 'block',
              marginBottom: '5px',
              width: '100%',
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BrainViewer;
