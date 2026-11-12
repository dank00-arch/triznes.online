/**
 * ГЛАВНЫЙ 3D-ДВИЖОК КАРТЫ СОЧИ (THREE.JS / WEBGL)
 * Отрисовывает береговую линию Черного моря, рельеф Сочи, 3D-башни узлов
 * (Приморская, Морпорт, Навагинская, XPRO, ТЕАТР ТУЗ, Школа ремонта, Поляна),
 * энергетические линии между Триснасом и Аполлоном и живые аватары персонажей.
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gpsToSochi3D, WORLD_THEMES } from '../config/sochiWorldConfig';

export default function Sochi3DMatrixCanvas({
  worldMode = 'hybrid',
  nodes = [],
  characters = [],
  selectedNode,
  onSelectNode
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const theme = WORLD_THEMES[worldMode] || WORLD_THEMES.hybrid;

    // 1. Инициализация 3D-сцены Сочи
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.bgHex);
    scene.fog = new THREE.FogExp2(theme.fogHex, 0.0018);

    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 4000);
    camera.position.set(0, 140, 210);
    camera.lookAt(0, 10, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Координатная сетка и береговая линия Сочи
    const grid = new THREE.GridHelper(1200, 60, theme.gridPrimary, theme.gridSecondary);
    grid.position.y = 0;
    scene.add(grid);

    // Освещение сцены
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const coreLight = new THREE.PointLight(0x00ffcc, 2.5, 600);
    coreLight.position.set(20, 90, 25);
    scene.add(coreLight);

    const apolloLight = new THREE.PointLight(0xff0055, 2.5, 600);
    apolloLight.position.set(-20, 80, 5);
    scene.add(apolloLight);

    // 3. Отрисовка узлов города Сочи и голографических лучей
    const clickableMeshes = [];
    const nodePositions = {};

    nodes.forEach((node) => {
      const pos = gpsToSochi3D(node.lat, node.lng, node.elevation_m || 10);
      nodePositions[node.id] = new THREE.Vector3(pos.x, pos.y, pos.z);

      const towerHeight = (node.tier || 5) * 3.5;
      const color = new THREE.Color(node.colorHex || '#00FFCC');

      // Башня локации
      const geo = new THREE.CylinderGeometry(3.2, 5.5, towerHeight, 6);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: worldMode === 'real' ? 0.25 : 0.7,
        wireframe: theme.wireframeBuildings,
        roughness: 0.2,
        metalness: 0.8
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, pos.y + towerHeight / 2, pos.z);
      mesh.userData = { node };
      scene.add(mesh);
      clickableMeshes.push(mesh);

      // Световой маяк в небо (для Cyber и Hybrid режимов)
      if (worldMode !== 'real') {
        const beamGeo = new THREE.CylinderGeometry(0.4, 7, 160, 12, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(pos.x, pos.y + 80, pos.z);
        scene.add(beam);
      }
    });

    // 4. Силовая линия синхронизации Ядра: Приморская (Триснас) <-> Морпорт (Аполлон) <-> Навагинская
    if (nodePositions['triznes_primorskaya'] && nodePositions['sochiwood_morport'] && nodePositions['navaginskaya_artery']) {
      const points = [
        nodePositions['triznes_primorskaya'],
        nodePositions['sochiwood_morport'],
        nodePositions['navaginskaya_artery'],
        nodePositions['triznes_primorskaya']
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 });
      const energyLoop = new THREE.Line(lineGeo, lineMat);
      energyLoop.position.y = 18;
      scene.add(energyLoop);
    }

    // 5. Отрисовка аватаров персонажей и ИИ-ассистентов (Триснас и Аполлон)
    const avatarMeshes = [];
    characters.forEach((char) => {
      const pos = gpsToSochi3D(char.lat, char.lng, char.elevation || 30);
      const color = new THREE.Color(char.primary_hex || '#00FFCC');
      const geo = char.is_ai_core
        ? new THREE.OctahedronGeometry(7, 1)
        : new THREE.SphereGeometry(3.8, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        wireframe: char.is_ai_core
      });
      const avatar = new THREE.Mesh(geo, mat);
      avatar.position.set(pos.x, pos.y + 35, pos.z);
      scene.add(avatar);
      avatarMeshes.push(avatar);
    });

    // 6. Обработка клика по локациям Сочи (Raycaster)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableMeshes);
      if (intersects.length > 0 && onSelectNode) {
        onSelectNode(intersects[0].object.userData.node);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 7. Анимационный цикл
    let reqId;
    const clock = new THREE.Clock();
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Плавное парение и вращение ядер Триснаса и Аполлона
      avatarMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = t * 1.2 + idx;
        mesh.position.y += Math.sin(t * 2.5 + idx) * 0.08;
      });

      // Легкий орбитальный дрейф камеры над Сочи
      camera.position.x = Math.sin(t * 0.12) * 35;
      camera.lookAt(0, 12, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [worldMode, nodes, characters]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh', cursor: 'grab' }} />;
}
