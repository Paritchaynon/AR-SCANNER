import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Scan, X, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import './guardianField';
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

const motes = Array.from({ length: 32 }, (_, i) => {
  const angle = i * 2.4;
  const spread = 26 + (i % 7) * 8;
  return {
    '--fan-x': `${Math.cos(angle) * spread}px`,
    '--fan-y': `${Math.sin(angle) * spread - 20}px`,
    '--delay': `${(i % 8) * 38}ms`,
    '--dur': `${1080 + (i % 3) * 85}ms`,
    '--size': `${3 + i % 4}px`,
  };
});

function projectedOrigin(anchor, stage) {
  const { canvas, camera } = anchor.sceneEl;
  if (!canvas || !camera || !stage || !anchor.object3D.visible) return null;
  const point = new window.AFRAME.THREE.Vector3(0, 0, .24);
  anchor.object3D.localToWorld(point).project(camera);
  if (![point.x, point.y, point.z].every(Number.isFinite) || Math.abs(point.z) > 1) return null;
  const view = canvas.getBoundingClientRect();
  const bounds = stage.getBoundingClientRect();
  return {
    '--origin-x': `${view.left + (1 + point.x) * view.width / 2 - bounds.left - bounds.width / 2}px`,
    '--origin-y': `${view.top + (1 - point.y) * view.height / 2 - bounds.top - bounds.height / 2}px`,
  };
}

function App() {
  const { t, i18n } = useTranslation();
  
  // App Intro Modal State
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [hasStartedApp, setHasStartedApp] = useState(false);

  // States to manage the AR scan & hologram particle flow
  const [isTracking, setIsTracking] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [arEffectTargetId, setArEffectTargetId] = useState(null);
  const [captureOrigin, setCaptureOrigin] = useState(null);
  const captureStage = useRef(null);
  const hudLines = useRef(null);
  const scene = useRef(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const targetRefs = useRef([]);
  const detectionLocked = useRef(false);
  const revealTimer = useRef(null);

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

  const handleCloseCharacterModal = () => {
    setShowCharacterModal(false);
    detectionLocked.current = false;
  };

  const handleCloseIntro = () => {
    setShowIntroModal(false);
    setHasStartedApp(true);
  };

  useEffect(() => {
    if (!hasStartedApp) return;
    const cleanups = targetRefs.current.flatMap((el, index) => {
      if (!el) return [];
      const target = targetsConfig[index];
      let lastOrigin = null;
      function found() {
        if (document.hidden) return;
        setIsTracking(true);
        if (detectionLocked.current) return;
        detectionLocked.current = true;
        lastOrigin = null;
        setActiveTarget({ ...target.data, id: target.id, image: imageMap[target.id] || target.data?.image });
        setArEffectTargetId(target.id);
        revealTimer.current = setTimeout(() => {
          setCaptureOrigin(projectedOrigin(el, captureStage.current) || lastOrigin || {});
        }, 900);
      }
      const lost = () => {
        lastOrigin = projectedOrigin(el, captureStage.current) || lastOrigin;
        setIsTracking(false);
      };
      el.addEventListener('targetFound', found);
      el.addEventListener('targetLost', lost);
      if (el.object3D?.visible && el.components?.['mindar-image-target']?.invisibleMatrix) found();
      return [() => {
        el.removeEventListener('targetFound', found);
        el.removeEventListener('targetLost', lost);
      }];
    });
    return () => {
      cleanups.forEach(cleanup => cleanup());
      clearTimeout(revealTimer.current);
    };
  }, [hasStartedApp]);

  useEffect(() => {
    if (!captureOrigin) return;
    // The final mote lands at 1516 ms. Hold the collected light briefly before revealing the card.
    const timer = setTimeout(() => {
      setArEffectTargetId(null);
      setCaptureOrigin(null);
      setShowCharacterModal(true);
    }, 1740);
    return () => clearTimeout(timer);
  }, [captureOrigin]);

  useEffect(() => {
    const el = scene.current;
    let ready = false;
    let suspended = false;
    let watchdog;
    const system = () => el.systems?.['mindar-image-system'];
    function suspend() {
      clearTimeout(watchdog);
      suspended = true;
      if (ready) system().pause();
    }
    function resume() {
      if (!ready || !suspended || document.hidden) return;
      suspended = false;
      const ar = system();
      const video = ar.video;
      function restart() {
        if (document.hidden || !ready) return;
        ready = false;
        ar.stop();
        for (const anchor of ar.anchorEntities) anchor.el.updateWorldMatrix(null);
        ar.start();
      }
      if (video.srcObject?.getVideoTracks()[0]?.readyState !== 'live') {
        restart();
        return;
      }
      const previousTime = video.currentTime;
      ar.unpause();
      watchdog = setTimeout(() => {
        if (video.paused || video.currentTime === previousTime) restart();
      }, 1200);
    }
    function onReady() {
      ready = true;
      if (document.hidden) queueMicrotask(suspend);
      else suspended = false;
    }
    const visibility = () => document.hidden ? suspend() : resume();
    el.addEventListener('arReady', onReady);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', resume);
    return () => {
      clearTimeout(watchdog);
      el.removeEventListener('arReady', onReady);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', suspend);
      window.removeEventListener('pageshow', resume);
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
      if (hudLines.current) hudLines.current.style.transform =
        `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
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
          ref={hudLines}
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
        {!showCharacterModal && !arEffectTargetId && (
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

        {arEffectTargetId && (
          <div className="hologram-scan-stage" ref={captureStage} style={captureOrigin || undefined}>
            {captureOrigin ? <>
              <div className="capture-flight" aria-hidden="true">
                {motes.map((style, i) => <i key={i} className="stream-particle" style={style} />)}
              </div>
              <div className="capture-core" aria-hidden="true" />
            </> : <div className="world-scan-status">
              <div className="hologram-status-banner"><Sparkles size={15} />{t('hologramFound')}</div>
            </div>}
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
        <a-scene ref={scene}
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
              {arEffectTargetId === target.id && !captureOrigin && <a-entity guardian-field="" />}
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
