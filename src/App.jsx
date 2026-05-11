import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Scan, X } from 'lucide-react';
import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import './App.css';
import { targetsConfig } from './config/targetsConfig';

function App() {
  const { t, i18n } = useTranslation();
  
  // States to manage the flow
  const [isTracking, setIsTracking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const [arEffectTargetId, setArEffectTargetId] = useState(null);
  
  const targetRefs = useRef([]);
  const detectionLocked = useRef(false);
  const currentTargetRef = useRef(null);
  
  // Ref to track the latest isTracking value inside the closure
  const trackingRef = useRef(false);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const triggerDetection = (targetData) => {
    setActiveTarget(targetData);
    setArEffectTargetId(targetData.id); // Trigger 3D AR particle effect
    setShowPanel(false);
    setShowParticles(true);
    
    // Play particle effect for 1.5 seconds, then show panel
    setTimeout(() => {
      setShowParticles(false);
      setArEffectTargetId(null); // Clear 3D AR effect
      setShowPanel(true);
    }, 1500);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    detectionLocked.current = false; // Unlock so it can automatically detect again
    
    // If the camera is still pointing at the target, instantly re-trigger
    if (trackingRef.current && currentTargetRef.current) {
      detectionLocked.current = true;
      triggerDetection(currentTargetRef.current);
    }
  };

  useEffect(() => {
    const cleanupFns = [];
    
    targetRefs.current.forEach((targetEl, index) => {
      if (!targetEl) return;
      
      const targetData = targetsConfig[index];
      
      const handleTargetFound = () => {
        console.log(`Target ${targetData.index} found!`);
        setIsTracking(true);
        trackingRef.current = true;
        currentTargetRef.current = targetData;
        
        // Prevent re-triggering the particles/panel if it's already locked
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

  return (
    <div className="app-container">
      {/* UI Overlay */}
      <div className="ui-layer">
        <header className="header">
          <div className="title">
            <Scan className="icon" size={24} />
            <h1>{t('appTitle')}</h1>
          </div>
          <button className="lang-toggle" onClick={toggleLanguage}>
            <Globe className="icon" size={18} />
            {i18n.language === 'en' ? 'EN' : 'TH'}
          </button>
        </header>

        {/* Viewfinder shows when not tracking and panel is closed */}
        {!isTracking && !showPanel && !showParticles && (
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

        {/* Particle Effect Overlay */}
        {showParticles && (
          <div className="particle-container">
            <div className="sparkle s1"></div>
            <div className="sparkle s2"></div>
            <div className="sparkle s3"></div>
            <div className="sparkle s4"></div>
            <div className="sparkle s5"></div>
            <div className="glow-orb"></div>
          </div>
        )}

        {/* Info Panel */}
        {showPanel && activeTarget && (
          <div className="info-panel">
            <div className="info-content">
              <h2>{t(activeTarget.titleKey)}</h2>
              <p>{t(activeTarget.descKey)}</p>
              <button className="close-btn" onClick={handleClosePanel}>
                {t('close')} <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AR Scene */}
      <div className="ar-container">
        <a-scene
          mindar-image={`imageTargetSrc: ${import.meta.env.BASE_URL}targets.mind; autoStart: true; uiLoading: no; uiScanning: no`}
          color-space="sRGB"
          renderer="colorManagement: true, physicallyCorrectLights"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          {targetsConfig.map((target, idx) => (
            <a-entity 
              key={target.id}
              mindar-image-target={`targetIndex: ${target.index}`} 
              ref={el => targetRefs.current[idx] = el}
            >
              {/* Temporary 3D Particle Burst on the physical object */}
              {arEffectTargetId === target.id && (
                <a-entity>
                  {/* Soft Center Aura */}
                  <a-circle radius="0.3" color="#FDE047" material="shader: flat; transparent: true" animation="property: scale; from: 0 0 0; to: 1.5 1.5 1.5; dur: 800; easing: easeOutQuad" animation__fade="property: material.opacity; from: 0.6; to: 0; dur: 800"></a-circle>
                  {/* Floating Lantern Particles */}
                  <a-sphere radius="0.03" color="#FDE047" material="shader: flat" animation="property: position; from: 0 0 0; to: 0.2 0.8 0; dur: 2000; easing: easeOutQuad" animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2000; easing: easeInQuad"></a-sphere>
                  <a-sphere radius="0.04" color="#EF4444" material="shader: flat" animation="property: position; from: 0 0 0; to: -0.2 0.6 0.1; dur: 2000; easing: easeOutQuad" animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2000; easing: easeInQuad"></a-sphere>
                  <a-sphere radius="0.03" color="#F59E0B" material="shader: flat" animation="property: position; from: 0 0 0; to: 0.1 0.7 -0.1; dur: 2000; easing: easeOutQuad" animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2000; easing: easeInQuad"></a-sphere>
                  <a-sphere radius="0.02" color="#FDE047" material="shader: flat" animation="property: position; from: 0 0 0; to: -0.15 0.9 0; dur: 2000; easing: easeOutQuad" animation__scale="property: scale; from: 1 1 1; to: 0 0 0; dur: 2000; easing: easeInQuad"></a-sphere>
                </a-entity>
              )}
            </a-entity>
          ))}
        </a-scene>
      </div>
    </div>
  );
}

export default App;
