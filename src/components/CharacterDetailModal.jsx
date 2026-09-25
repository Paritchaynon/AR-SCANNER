import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Compass, Palette, X, ChevronRight } from 'lucide-react';
import './CharacterDetailModal.css';

export function CharacterDetailModal({ character, onClose, isGatheringParticles }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('story'); // 'story' | 'concept' | 'inspiration' | 'colorMeaning'

  if (!character) return null;

  // Dynamically resolve character translation for current language so changing language immediately reflects
  const targetId = character.id;
  const translated = targetId ? (t(`targets.${targetId}`, { returnObjects: true }) || {}) : {};
  const charData = {
    ...character,
    name: translated.name || character.name || character.title,
    title: translated.title || character.title,
    story: translated.story || character.story,
    concept: translated.concept || character.concept,
    inspiration: translated.inspiration || character.inspiration,
    colorMeaning: translated.colorMeaning || character.colorMeaning,
  };

  return (
    <div 
      className={`char-modal-backdrop ${isGatheringParticles ? 'particles-gathering' : 'particles-completed'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="char-card-container"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Shimmering Gold Frame Overlay */}
        <div className="char-card-kanok tl"></div>
        <div className="char-card-kanok tr"></div>
        <div className="char-card-kanok bl"></div>
        <div className="char-card-kanok br"></div>

        {/* Close Button */}
        <button 
          className="char-close-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Character Cultural Emblem / Mystical Crest */}
        <div className="char-avatar-wrapper">
          <div className="char-avatar-ring"></div>
          <div className="char-avatar-emblem">
            <Sparkles size={38} className="emblem-core-sparkle" />
          </div>
          <div className="char-hologram-scanline"></div>
        </div>

        {/* Character Name & Badge */}
        <div className="char-meta">
          <span className="char-badge">
            <Sparkles size={13} />
            {t('lannaGuardian')}
          </span>
          <h2 className="char-name">{charData.name || charData.title}</h2>
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
              <h4 className="section-label">{t('labelStory')}</h4>
              <p className="section-text">{charData.story}</p>
            </div>
          )}

          {activeTab === 'concept' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">{t('labelConcept')}</h4>
              <p className="section-text">{charData.concept}</p>
            </div>
          )}

          {activeTab === 'inspiration' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">{t('labelInspiration')}</h4>
              <p className="section-text multi-line">{charData.inspiration}</p>
            </div>
          )}

          {activeTab === 'colorMeaning' && (
            <div className="tab-pane active-pane animate-fade">
              <h4 className="section-label">{t('labelColors')}</h4>
              <p className="section-text multi-line">{charData.colorMeaning}</p>
            </div>
          )}
        </div>

        {/* Dismiss Bottom Button */}
        <div className="char-modal-footer">
          <button 
            className="confirm-dismiss-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <span>{t('close')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default CharacterDetailModal;
