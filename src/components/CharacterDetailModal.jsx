import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, BookOpen, Compass, Palette, X } from 'lucide-react';
import './CharacterDetailModal.css';
import CharacterTurntable from './CharacterTurntable';

export function CharacterDetailModal({ character, onClose, isGatheringParticles }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('story'); // 'story' | 'concept' | 'inspiration' | 'colorMeaning'

  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, 240);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

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
      className={`char-modal-backdrop ${isGatheringParticles ? 'particles-gathering' : 'particles-completed'}${closing ? ' is-closing' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setClosing(true);
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
            setClosing(true);
          }} 
          aria-label={t('close')}
        >
          <X size={18} />
        </button>

        <CharacterTurntable portrait={character.image} />

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
          {[
            ['story', 'labelStory'],
            ['concept', 'labelConcept'],
            ['inspiration', 'labelInspiration'],
            ['colorMeaning', 'labelColors'],
          ].map(([key, label]) => (
            <div key={key} className="tab-pane" aria-hidden={activeTab !== key}>
              <h4 className="section-label">{t(label)}</h4>
              <p className="section-text">{charData[key]}</p>
            </div>
          ))}
        </div>

        {/* Dismiss Bottom Button */}
        <div className="char-modal-footer">
          <button 
            className="confirm-dismiss-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setClosing(true);
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
