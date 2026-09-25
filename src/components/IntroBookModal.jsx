import React, { useState } from 'react';
import { BookOpen, Sparkles, Compass, Eye, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './IntroBookModal.css';

export function IntroBookModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [isFlipping, setIsFlipping] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsFlipping(true);
    // Page flip duration 900ms before dismissing modal
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className={`book-modal-backdrop ${isFlipping ? 'page-turning' : ''}`}>
      <div className="book-perspective-wrapper">
        <div className={`book-container ${isFlipping ? 'flip-page' : ''}`}>
          
          {/* Left / Base Decorative Page Cover */}
          <div className="book-page book-page-base">
            <div className="book-lanna-pattern-bg"></div>
            <div className="book-inner-border"></div>
          </div>

          {/* Active Front Page (Flips like an ancient gold-embossed scripture book) */}
          <div className="book-page book-page-active">
            <div className="book-lanna-pattern-bg"></div>
            <div className="book-inner-border">
              {/* Corner Kanok Ornaments */}
              <div className="kanok-corner k-tl"></div>
              <div className="kanok-corner k-tr"></div>
              <div className="kanok-corner k-bl"></div>
              <div className="kanok-corner k-br"></div>

              {/* Header Title */}
              <div className="book-header">
                <div className="book-emblem">
                  <Sparkles size={24} className="emblem-sparkle" />
                </div>
                <h1 className="book-title">{t('introTitle')}</h1>
                <p className="book-subtitle">{t('introSubtitle')}</p>
                <div className="gold-divider"></div>
              </div>

              {/* Instructions / Guide Content */}
              <div className="book-body">
                <h3 className="guide-title">
                  <Compass size={18} className="guide-icon" />
                  {t('introGuideTitle')}
                </h3>

                <ul className="guide-steps">
                  <li className="step-item">
                    <span className="step-num">๑</span>
                    <span className="step-text">{t('introGuideStep1')}</span>
                  </li>
                  <li className="step-item">
                    <span className="step-num">๒</span>
                    <span className="step-text">{t('introGuideStep2')}</span>
                  </li>
                  <li className="step-item">
                    <span className="step-num">๓</span>
                    <span className="step-text">{t('introGuideStep3')}</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="book-footer">
                <button 
                  className="start-book-btn" 
                  onClick={handleStart}
                  disabled={isFlipping}
                >
                  <BookOpen size={18} className="btn-icon" />
                  <span>{t('introStartBtn')}</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroBookModal;
