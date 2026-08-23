import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OS_TOPICS, TOPIC_CATEGORIES } from '../data/topics';
import './LaunchPage.css';

export default function LaunchPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery] = useState('');
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // --- Three.js Background Ambient Particle Sphere ---
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create Cyber Node Particles
    const particlesCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const cyanColor = new THREE.Color('#38bdf8');
    const purpleColor = new THREE.Color('#8054e8');

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const mixedColor = cyanColor.clone().lerp(purpleColor, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0008;
      particlesMesh.rotation.x += 0.0004;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Filter topics based on search and category tab
  const filteredTopics = OS_TOPICS.filter((topic) => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keyConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLaunchTopic = (topic) => {
    if (topic.route) {
      navigate(topic.route);
    }
  };

  return (
    <div className="launch-page">
      {/* Dynamic Three.js Background Canvas */}
      <div className="launch-canvas-bg" ref={canvasRef} />

      <div className="launch-container">
        {/* Hero Section */}
        <section className="launch-hero-banner">
          <h1 className="launch-hero-title">
            Operating System
          </h1>
        </section>

        {/* Toolbar & Category Filters */}
        <div className="launch-controls-bar">
          {/* Category Tabs */}
          <div className="category-tabs">
            {TOPIC_CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? OS_TOPICS.length
                  : OS_TOPICS.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                  <span className="tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Explorer Style Topics List */}
        <div className="topic-explorer-list">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="topic-explorer-row"
              onClick={() => handleLaunchTopic(topic)}
            >
              <div className="explorer-row-left">
                <span className="explorer-number">{topic.id}</span>
                <span className="explorer-topic-name">{topic.title}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#f8fafc' }}>No topics match your query</h3>
            <p>Try searching for different terms like "Linux", "Thread", or "Paging".</p>
          </div>
        )}
      </div>
    </div>
  );
}
