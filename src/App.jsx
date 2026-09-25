import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Scan, X, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './App.css';
import { targetsConfig } from './config/targetsConfig';
import IntroBookModal from './components/IntroBookModal';
import CharacterDetailModal from './components/CharacterDetailModal';
import cardFrameImg from './assets/hud/card-frame.png';
import linesImg from './assets/hud/lines.png';

// Import character image assets
import img1 from './assets/image1.jpeg';
import img2 from './assets/image2.jpeg';
import img3 from './assets/image3.jpeg';
import img4 from './assets/image4.jpeg';
import img5 from './assets/image5.png';
import img6 from './assets/image6.jpeg';
import img7 from './assets/image7.jpeg';
import img8 from './assets/image8.jpeg';
import img9 from './assets/image9.jpeg';
import img10 from './assets/image10.jpeg';
import img11 from './assets/image11.jpeg';
import img12 from './assets/image12.jpeg';

const imageMap = {
  target_0: img1,
  target_1: img2,
  target_2: img4,
  target_3: img5,
  target_4: img6,
  target_5: img7,
  target_6: img9,
  target_7: img10,
  target_8: img11,
  target_9: img8,
  target_10: img12
};

function App() {
  const { t, i18n } = useTranslation();
  
  // App Intro Modal State
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [hasStartedApp, setHasStartedApp] = useState(false);

  // States to manage the AR scan & hologram particle flow
  const [isTracking, setIsTracking] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [arEffectTargetId, setArEffectTargetId] = useState(null);
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });

  // Hologram to Particles Dissolve flow states
  // hologramPhase: null | 'hologram' | 'dissolving' | 'streaming' | 'completed'
  const [hologramPhase, setHologramPhase] = useState(null);
  const [streamParticles, setStreamParticles] = useState([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  
  const targetRefs = useRef([]);
  const detectionLocked = useRef(false);
  const currentTargetRef = useRef(null);
  const trackingRef = useRef(false);
  const animTimeoutsRef = useRef([]);

  const clearAnimTimeouts = () => {
    animTimeoutsRef.current.forEach(id => clearTimeout(id));
    animTimeoutsRef.current = [];
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.() ||
      document.documentElement.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
      document.webkitExitFullscreen?.();
    }
  };

  // Trigger when target found:
  // Phase 1 (0-1200ms): Target Hologram projects upwards with light beams & scanning grid
  // Phase 2 (1200-2400ms): Hologram dissolves into 30+ glowing golden/magic particles
  // Phase 3 (2400-3600ms): Particles stream/fly into the bottom center info container
  // Phase 4 (3600ms+): Information reveals character card completely
  const triggerDetection = (targetData) => {
    // Resolve dynamic character info from translation
    const rawTarget = t(`targets.${targetData.id}`, { returnObjects: true }) || targetData.data || {};
    const characterData = {
      ...rawTarget,
      id: targetData.id,
      image: imageMap[targetData.id] || targetData.data?.image
    };

    setActiveTarget(characterData);
    setArEffectTargetId(targetData.id);
    setHologramPhase('hologram');
    setShowCharacterModal(false);

    // Generate gradual, smoothly dispersed particle streams
    const particles = Array.from({ length: 36 }).map((_, i) => {
      const angle = (i / 36) * Math.PI * 2;
      const distance = 45 + Math.random() * 80;
      const delay = (i % 6) * 0.12 + Math.random() * 0.15;
      const size = 5 + Math.random() * 7;
      const duration = 2.0 + Math.random() * 0.8;
      return {
        id: i,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        delay,
        size,
        duration
      };
    });
    setStreamParticles(particles);

    // Phase 1 -> 2: Hologram gently expands and dissolves in parallel with particles (after 1.8s)
    const t1 = setTimeout(() => {
      setHologramPhase('dissolving');
    }, 1800);

    // Phase 2 -> 3: Dissolved particles gently stream downwards into receiver (after 3.4s)
    const t2 = setTimeout(() => {
      setHologramPhase('streaming');
    }, 3400);

    // Phase 3 -> 4: Character information smoothly reveals (after 5.2s)
    const t3 = setTimeout(() => {
      setHologramPhase('completed');
      setArEffectTargetId(null);
      setShowCharacterModal(true);
    }, 5200);

    animTimeoutsRef.current = [t1, t2, t3];
  };

  const handleCloseCharacterModal = () => {
    clearAnimTimeouts();
    setShowCharacterModal(false);
    setHologramPhase(null);
    setArEffectTargetId(null);
    
    // Unlock detection after a 1.5s grace cooldown so closing works and does not instantly pop back up
    setTimeout(() => {
      detectionLocked.current = false;
    }, 1500);
  };

  const handleCloseIntro = () => {
    setShowIntroModal(false);
    setHasStartedApp(true);
  };

  useEffect(() => {
    const cleanupFns = [];
    
    targetRefs.current.forEach((targetEl, index) => {
      if (!targetEl) return;
      
      const targetData = targetsConfig[index];
      if (!targetData) return;
      
      const handleTargetFound = () => {
        console.log(`Target ${targetData.index} found!`);
        setIsTracking(true);
        trackingRef.current = true;
        currentTargetRef.current = targetData;
        
        // Prevent re-triggering if already locked or user in intro
        if (detectionLocked.current) return;
        
        detectionLocked.current = true;
        triggerDetection(targetData);
      };
      
      const handleTargetLost = () => {
        console.log(`Target ${targetData.index} lost!`);
        setIsTracking(false);
        trackingRef.current = false;
        if (currentTargetRef.current?.id === targetData.id) {
          currentTargetRef.current = null;
        }
      };

      targetEl.addEventListener('targetFound', handleTargetFound);
      targetEl.addEventListener('targetLost', handleTargetLost);
      
      cleanupFns.push(() => {
        targetEl.removeEventListener('targetFound', handleTargetFound);
        targetEl.removeEventListener('targetLost', handleTargetLost);
      });
    });

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, []);

  // Gyroscope / Pointer tracking for subtle line motion
  useEffect(() => {
    let animId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(-45, Math.min(45, e.beta - 45));
        targetX = (clampedGamma / 45) * 16;
        targetY = (clampedBeta / 45) * 16;
      }
    };

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * 16;
      targetY = ((e.clientY - centerY) / centerY) * 16;
    };

    const updateMotion = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setGyroOffset({
        x: parseFloat(currentX.toFixed(2)),
        y: parseFloat(currentY.toFixed(2))
      });
      animId = requestAnimationFrame(updateMotion);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="app-container">
      
      {/* Intro Book Modal (Opens on launch, flips like a book to reveal app) */}
      <IntroBookModal 
        isOpen={showIntroModal} 
        onClose={handleCloseIntro} 
      />

      {/* Lanna Cultural HUD Overlay Frame (Responsive) */}
      <div className={`hud-frame-container ${isTracking ? 'tracking' : ''} ${showCharacterModal ? 'panel-open' : ''}`}>
        <img 
          src={cardFrameImg} 
          alt="Lanna AR Frame" 
          className={`hud-frame-img ${hasStartedApp ? 'hud-dissolve' : ''}`} 
        />
        
        <img 
          src={linesImg} 
          alt="Lanna Lines" 
          className={`hud-lines-img hud-lines-glow ${hasStartedApp ? 'hud-dissolve' : ''}`} 
          style={{
            transform: `translate3d(${gyroOffset.x}px, ${gyroOffset.y}px, 0)`
          }}
        />

        <div className="hud-corner-glow"></div>
      </div>

      {/* Lanna Borders */}
      <div className="lanna-top-ornament"></div>
      <div className="lanna-bottom-border"></div>

      {/* UI Overlay */}
      <div className="ui-layer">
        <header className="header">
          <div className="header-actions">
            <button className="fullscreen-btn" onClick={handleFullscreen} aria-label="Fullscreen">
              <Maximize2 size={16} />
            </button>
            <button className="lang-toggle" onClick={toggleLanguage}>
              <Globe size={15} />
              {i18n.language === 'en' ? 'EN' : 'TH'}
            </button>
          </div>
        </header>

        {/* Viewfinder scanning state */}
        {!isTracking && !showCharacterModal && !hologramPhase && (
          <div className="scanning-wrapper">
            <div className="scan-viewfinder">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
              <div className="scan-laser"></div>
            </div>
            <p className="scan-instruction-text">{t('scanInstruction')}</p>
          </div>
        )}

        {/* Hologram -> Particles -> Stream to Information Animation Layer */}
        {hologramPhase && hologramPhase !== 'completed' && activeTarget && (
          <div className="hologram-scan-stage">
            {/* Hologram Projection */}
            <div className={`hologram-projection ${hologramPhase}`}>
              <div className="hologram-light-cone"></div>
              <div className="hologram-target-disc">
                <div className="target-ring r1"></div>
                <div className="target-ring r2"></div>
                <div className="target-ring r3"></div>
              </div>

              {/* Hologram Target Mystic Emblem Pod */}
              <div className="hologram-avatar-pod">
                <div className="hologram-emblem-core">
                  <Sparkles size={52} className="hologram-symbol-sparkle" />
                </div>
                <div className="hologram-grid-scan"></div>
              </div>

              <div className="hologram-status-banner">
                <Sparkles size={16} className="sparkle-pulse" />
                <span>
                  {hologramPhase === 'hologram' && t('hologramFound')}
                  {(hologramPhase === 'dissolving' || hologramPhase === 'streaming') && t('transmittingData')}
                </span>
              </div>
            </div>

            {/* Dissolving Particles Streaming Towards the Data Receiver */}
            <div className={`particle-stream-layer ${hologramPhase}`}>
              {streamParticles.map((p) => (
                <div 
                  key={p.id}
                  className="stream-particle"
                  style={{
                    '--dx': `${p.dx}px`,
                    '--dy': `${p.dy}px`,
                    '--delay': `${p.delay}s`,
                    '--dur': `${p.duration}s`,
                    width: `${p.size}px`,
                    height: `${p.size}px`
                  }}
                />
              ))}
            </div>

            {/* Bottom Data Receptor Portal */}
            <div className={`data-receptor-portal ${hologramPhase === 'streaming' ? 'absorbing' : ''}`}>
              <div className="receptor-glow"></div>
            </div>
          </div>
        )}
      </div>

      {/* Character Detail Modal (Rich info: Name, Concept, Inspiration, Story, Colors) */}
      {showCharacterModal && activeTarget && (
        <CharacterDetailModal 
          character={activeTarget}
          onClose={handleCloseCharacterModal}
        />
      )}

      {/* AR Scene with Multi-target Support & 2D Hologram in 3D space */}
      <div className="ar-container">
        <a-scene
          mindar-image={`imageTargetSrc: ${import.meta.env.BASE_URL}targets.mind; autoStart: true; uiLoading: no; uiScanning: no`}
          color-space="sRGB"
          renderer="colorManagement: true, physicallyCorrectLights"
          vr-mode-ui="enabled: false"
          xr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-assets>
            {targetsConfig.map(t => (
              <img 
                key={`asset-${t.id}`} 
                id={`img-${t.id}`} 
                src={imageMap[t.id] || t.data?.image} 
                crossOrigin="anonymous" 
              />
            ))}
          </a-assets>

          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          {targetsConfig.map((target, idx) => (
            <a-entity 
              key={target.id}
              mindar-image-target={`targetIndex: ${target.index}`} 
              ref={el => targetRefs.current[idx] = el}
            >
              {/* 2D Hologram Matrix projected on the physical scanned target */}
              {arEffectTargetId === target.id && (
                <a-entity position="0 0 0.04">
                  {/* Outer Hologram Target Frame */}
                  <a-ring 
                    radius-inner="0.48" 
                    radius-outer="0.52" 
                    color="#FDE047" 
                    material="shader: flat; transparent: true; opacity: 0.85"
                    animation="property: rotation; to: 0 0 360; dur: 4000; loop: true; easing: linear"
                    animation__fade="property: material.opacity; from: 0.85; to: 0; dur: 3000; easing: easeInQuad"
                  />

                  {/* Concentric Geometric Hologram Ring */}
                  <a-ring 
                    radius-inner="0.32" 
                    radius-outer="0.35" 
                    color="#F59E0B" 
                    material="shader: flat; transparent: true; opacity: 0.75"
                    animation="property: rotation; to: 0 0 -360; dur: 5000; loop: true; easing: linear"
                    animation__fade="property: material.opacity; from: 0.75; to: 0; dur: 2800; easing: easeInQuad"
                  />

                  {/* Sacred Lanna Target Center Emblem */}
                  <a-circle 
                    radius="0.22" 
                    color="#D97706" 
                    material="shader: flat; transparent: true; opacity: 0.5"
                    animation="property: scale; from: 0.8 0.8 0.8; to: 1.15 1.15 1.15; dur: 1000; dir: alternate; loop: true"
                    animation__dissolve="property: material.opacity; from: 0.5; to: 0; dur: 2600; easing: easeInQuad"
                  />

                  {/* Hologram Laser Scanning Beam traversing across the target */}
                  <a-plane 
                    position="0 0 0.02" 
                    height="0.04" 
                    width="1" 
                    color="#FDE047" 
                    material="shader: flat; transparent: true; opacity: 0.9"
                    animation="property: position; from: 0 -0.5 0.02; to: 0 0.5 0.02; dur: 1200; loop: true; dir: alternate; easing: linear"
                    animation__fade="property: material.opacity; from: 0.9; to: 0; dur: 2500; easing: easeInQuad"
                  />

                  {/* Light Orbs / Particles bursting upward as hologram dissolves */}
                  <a-sphere 
                    radius="0.04" 
                    color="#FDE047" 
                    material="shader: flat" 
                    animation="property: position; from: 0 0 0.02; to: 0.35 0.7 0.25; dur: 2000; easing: easeOutQuad" 
                    animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2000; easing: easeInQuad"
                  />
                  <a-sphere 
                    radius="0.04" 
                    color="#EF4444" 
                    material="shader: flat" 
                    animation="property: position; from: 0 0 0.02; to: -0.35 0.6 0.2; dur: 2200; easing: easeOutQuad" 
                    animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2200; easing: easeInQuad"
                  />
                  <a-sphere 
                    radius="0.035" 
                    color="#F59E0B" 
                    material="shader: flat" 
                    animation="property: position; from: 0 0 0.02; to: 0.15 0.8 0.15; dur: 1900; easing: easeOutQuad" 
                    animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 1900; easing: easeInQuad"
                  />
                  <a-sphere 
                    radius="0.03" 
                    color="#FDE047" 
                    material="shader: flat" 
                    animation="property: position; from: 0 0 0.02; to: -0.2 0.85 0.1; dur: 2100; easing: easeOutQuad" 
                    animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2100; easing: easeInQuad"
                  />
                  <a-sphere 
                    radius="0.035" 
                    color="#FDE047" 
                    material="shader: flat" 
                    animation="property: position; from: 0 0 0.02; to: 0 0.9 0.2; dur: 2400; easing: easeOutQuad" 
                    animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2400; easing: easeInQuad"
                  />
                </a-entity>
              )}
            </a-entity>
          ))}
        </a-scene>
      </div>

      {/* Landscape Lock Overlay */}
      <div className="landscape-overlay">
        <RotateCcw className="rotate-icon" size={48} />
        <p>{t('rotateDevice')}</p>
      </div>
    </div>
  );
}

export default App;
