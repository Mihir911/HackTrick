import { useEffect, useRef } from "react";
import * as THREE from "three";

// A stylized neon city built with Three.js — mission nodes appear as glowing beacons.
// Missions are passed in with x,y (0-100). We project onto a ground plane and render vertical beams.
export default function City3D({ missions, activeId, onSelect }) {
    const mountRef = useRef(null);
    const rafRef = useRef(0);
    const stateRef = useRef({ camera: null, scene: null, renderer: null, raycaster: null, beacons: [], pointer: null });

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050510);
        scene.fog = new THREE.FogExp2(0x0a0a1a, 0.018);

        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 500);
        camera.position.set(0, 55, 65);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        mount.appendChild(renderer.domElement);

        // ===== Lighting =====
        const ambient = new THREE.AmbientLight(0x223355, 0.55);
        scene.add(ambient);
        const cyanLight = new THREE.PointLight(0x00E5FF, 2.5, 120);
        cyanLight.position.set(-40, 40, -40);
        scene.add(cyanLight);
        const pinkLight = new THREE.PointLight(0xFF2EA6, 2.5, 120);
        pinkLight.position.set(40, 30, 40);
        scene.add(pinkLight);

        // ===== Ground grid =====
        const grid = new THREE.GridHelper(200, 40, 0x00E5FF, 0x1a1a2e);
        grid.material.opacity = 0.35;
        grid.material.transparent = true;
        scene.add(grid);

        // Ground plane
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.MeshBasicMaterial({ color: 0x08081a })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        scene.add(ground);

        // ===== Skyline buildings — more, richer materials =====
        const buildingMat1 = new THREE.MeshStandardMaterial({ color: 0x0a0a1a, emissive: 0x00E5FF, emissiveIntensity: 0.25, roughness: 0.5, metalness: 0.6 });
        const buildingMat2 = new THREE.MeshStandardMaterial({ color: 0x1a001a, emissive: 0xFF2EA6, emissiveIntensity: 0.25, roughness: 0.5, metalness: 0.6 });
        const buildingMat3 = new THREE.MeshStandardMaterial({ color: 0x1a0006, emissive: 0xE63946, emissiveIntensity: 0.15, roughness: 0.7, metalness: 0.4 });
        for (let i = 0; i < 85; i++) {
            const w = 2.5 + Math.random() * 5;
            const h = 5 + Math.random() * 32;
            const d = 2.5 + Math.random() * 5;
            const geo = new THREE.BoxGeometry(w, h, d);
            const r = Math.random();
            const mat = r < 0.4 ? buildingMat1 : r < 0.75 ? buildingMat2 : buildingMat3;
            const b = new THREE.Mesh(geo, mat);
            let x, z;
            do {
                x = (Math.random() - 0.5) * 180;
                z = (Math.random() - 0.5) * 180;
            } while (Math.abs(x) < 45 && Math.abs(z) < 32);
            b.position.set(x, h / 2, z);
            scene.add(b);

            // Multiple window strips per building
            const numStrips = Math.floor(h / 3);
            for (let s = 0; s < numStrips; s++) {
                const stripGeo = new THREE.PlaneGeometry(w * 0.75, 0.25);
                const stripColor = Math.random() > 0.5 ? 0x00E5FF : 0xFF2EA6;
                const stripMat = new THREE.MeshBasicMaterial({ color: stripColor, transparent: true, opacity: 0.7 + Math.random() * 0.3 });
                const strip = new THREE.Mesh(stripGeo, stripMat);
                strip.position.set(x, s * 3 + 1.5, z + d / 2 + 0.02);
                scene.add(strip);
            }

            // Antenna on tall buildings
            if (h > 22 && Math.random() > 0.6) {
                const antennaGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 4);
                const antennaMat = new THREE.MeshBasicMaterial({ color: 0xE63946 });
                const antenna = new THREE.Mesh(antennaGeo, antennaMat);
                antenna.position.set(x, h + 2, z);
                scene.add(antenna);
                const tipGeo = new THREE.SphereGeometry(0.15, 8, 8);
                const tip = new THREE.Mesh(tipGeo, new THREE.MeshBasicMaterial({ color: 0xE63946 }));
                tip.position.set(x, h + 4, z);
                scene.add(tip);
            }
        }

        // ===== Particles (floating data motes) =====
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x00E5FF, size: 0.25, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ===== Roads (glowing lines) =====
        const roadMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, opacity: 0.6, transparent: true });
        const roadY = 0.05;
        [-15, 15].forEach(z => {
            const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-80, roadY, z), new THREE.Vector3(80, roadY, z)]);
            scene.add(new THREE.Line(g, roadMat));
        });
        [-20, 0, 20].forEach(x => {
            const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, roadY, -35), new THREE.Vector3(x, roadY, 35)]);
            scene.add(new THREE.Line(g, roadMat));
        });

        // ===== Beacons for missions =====
        const beacons = [];
        const beaconGroup = new THREE.Group();
        scene.add(beaconGroup);

        stateRef.current = { camera, scene, renderer, raycaster: new THREE.Raycaster(), beacons, pointer: new THREE.Vector2() };

        // ===== Interaction =====
        const onClick = (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            stateRef.current.pointer.set(nx, ny);
            stateRef.current.raycaster.setFromCamera(stateRef.current.pointer, camera);
            const meshes = beacons.map(b => b.mesh);
            const hits = stateRef.current.raycaster.intersectObjects(meshes, false);
            if (hits.length && onSelect) {
                const hit = beacons.find(b => b.mesh === hits[0].object || b.mesh.uuid === hits[0].object.uuid);
                if (hit) onSelect(hit.mission);
            }
        };
        renderer.domElement.addEventListener("click", onClick);
        renderer.domElement.style.cursor = "pointer";

        // ===== Auto-rotate camera slowly =====
        let angle = 0;
        let stopped = false;
        const animate = () => {
            if (stopped) return;
            angle += 0.0012;
            camera.position.x = Math.sin(angle) * 72;
            camera.position.z = Math.cos(angle) * 72;
            camera.position.y = 48 + Math.sin(angle * 0.5) * 6;
            camera.lookAt(0, 5, 0);

            // Animate particles falling gently
            const posAttr = particles.geometry.attributes.position;
            for (let i = 0; i < particleCount; i++) {
                posAttr.array[i * 3 + 1] -= 0.05;
                if (posAttr.array[i * 3 + 1] < 0) posAttr.array[i * 3 + 1] = 40;
            }
            posAttr.needsUpdate = true;

            // Pulse beacons
            const t = performance.now() * 0.003;
            beacons.forEach((b, i) => {
                const pulse = 1 + Math.sin(t + i) * 0.2;
                b.mesh.scale.set(pulse, 1, pulse);
                if (b.beam) {
                    b.beam.material.opacity = 0.35 + Math.sin(t + i) * 0.2;
                }
                if (b.ring) {
                    b.ring.rotation.z = t * 0.5 + i;
                }
            });

            renderer.render(scene, camera);
            rafRef.current = requestAnimationFrame(animate);
        };
        animate();

        // ===== Resize =====
        const onResize = () => {
            if (!mount) return;
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
            stopped = true;
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("click", onClick);
            renderer.dispose();
            if (mount && renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update beacons when missions change
    useEffect(() => {
        const s = stateRef.current;
        if (!s.scene) return;

        // Clear existing beacons
        s.beacons.forEach(b => {
            s.scene.remove(b.mesh);
            if (b.beam) s.scene.remove(b.beam);
            if (b.ring) s.scene.remove(b.ring);
        });
        s.beacons = [];

        missions.forEach((m) => {
            // Map m.x (0-100) to world -30..30, m.y to world -20..20
            const wx = (m.x / 100 - 0.5) * 60;
            const wz = (m.y / 100 - 0.5) * 40;
            const solved = m.solved;
            const isActive = activeId === m.id;
            const color = solved ? 0x00E5FF : isActive ? 0xFF2EA6 : 0xE63946;

            // Base cylinder (mission marker)
            const geo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 12);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(wx, 0.25, wz);
            s.scene.add(mesh);

            // Light beam up
            const beamGeo = new THREE.CylinderGeometry(0.15, 0.4, 20, 8, 1, true);
            const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(wx, 10.25, wz);
            s.scene.add(beam);

            // Ring
            const ringGeo = new THREE.RingGeometry(1.5, 1.9, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(wx, 0.06, wz);
            s.scene.add(ring);

            s.beacons.push({ mission: m, mesh, beam, ring });
        });
    }, [missions, activeId]);

    return <div ref={mountRef} className="w-full h-full absolute inset-0" data-testid="city-3d-canvas" />;
}
