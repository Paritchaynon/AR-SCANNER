import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Compass, Palette, X, ChevronRight } from 'lucide-react';
import './CharacterDetailModal.css';

export function CharacterDetailModal({ character, onClose, isGatheringParticles }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('story'); // 'story' | 'concept' | 'inspiration' | 'colorMeaning'

  if (!character) return null;

  return (
    <div className={`char-modal-backdrop ${isGatheringParticles ? 'particles-gathering' : 'particles-completed'}`}>
      <div className="char-card-container">
        
        {/* Shimmering Gold Frame Overlay */}
        <div className="char-card-glow"></div>
        <div className="char-card-kanok tl"></div>
        <div className="char-card-kanok tr"></div>
        <div className="char-card-kanok bl"></div>
        <div className="char-card-kanok br"></div>

        {/* Close Button */}
        <button className="char-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Character Avatar / Hologram preview */}
        <div className="char-avatar-wrapper">
          <div className="char-avatar-ring"></div>
          {character.image && (
            <img 
              src={character.image} 
              alt={character.name} 
              className="char-avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
              }} 
            />
          )}
          <div className="char-hologram-scanline"></div>
        </div>

        {/* Character Name & Badge */}
        <div className="char-meta">
          <span className="char-badge">
            <Sparkles size={13} />
            Lanna Spirit Guardian
          </span>
          <h2 className="char-name">{character.name || character.title}</h2>
        </div>

        {/* Information Category Navigation Tabs */}
        <div className="char-nav-tabs">
          <button 
            className={`char-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            <BookOpen size={14} />
            <span>{t('tabStory')}</span>
          </button>
          <button 
            className={`char-tab-btn ${activeTab === 'concept' ? 'active' : ''}`}
            onClick={() => setActiveTab('concept')}
          >
            <Compass size={14} />
            <span>{t('tabConcept')}</span>
          </button>
          <button 
            className={`char-tab-btn ${activeTab === 'inspiration' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspiration')}
          >
            <Sparkles size={14} />
            <span>{t('tabInspiration')}</span>
          </button>
          <button 
            className={`char-tab-btn ${activeTab === 'colorMeaning' ? 'active' : ''}`}
            onClick={() => setActiveTab('colorMeaning')}
          >
            <Palette size={14} />
            <span>{t('tabColors')}</span>
          </button>
        </div>

        {/* Tab Content Body with Progressive Text Flow */}
        <div className="char-body-content">
          {activeTab === 'story' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">เรื่องราวของคาแรคเตอร์</h4>
              <p className="section-text">{character.story}</p>
            </div>
          )}

          {activeTab === 'concept' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">แนวคิดของตัวละคร (Concept)</h4>
              <p className="section-text">{character.concept}</p>
            </div>
          )}

          {activeTab === 'inspiration' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">แรงบันดาลใจในการออกแบบ</h4>
              <p className="section-text multi-line">{character.inspiration}</p>
            </div>
          )}

          {activeTab === 'colorMeaning' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">ความหมายของสี</h4>
              <p className="section-text multi-line">{character.colorMeaning}</p>
            </div>
          )}
        </div>

        {/* Dismiss Bottom Button */}
        <div className="char-modal-footer">
          <button className="confirm-dismiss-btn" onClick={onClose}>
            <span>{t('close')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default CharacterDetailModal;
