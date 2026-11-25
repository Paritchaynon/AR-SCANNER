import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Compass, Sparkles, Palette, ChevronDown, X } from 'lucide-react';
import './CharacterDetailModal.css';

const sections = [
  ['story', 'labelStory', BookOpen],
  ['concept', 'labelConcept', Compass],
  ['inspiration', 'labelInspiration', Sparkles],
  ['colorMeaning', 'labelColors', Palette],
];

export function CharacterDetailModal({ character, onClose }) {
  const { t } = useTranslation();
  const dialog = useRef(null);
  const [expanded, setExpanded] = useState('story');

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    return () => element.close();
  }, [character?.id]);

  if (!character) return null;
  const translated = t(`targets.${character.id}`, { returnObjects: true });
  const name = translated.name || character.name || character.title;

  return (
    <dialog ref={dialog} className="guardian-record" aria-labelledby="guardian-name"
      onCancel={onClose} onClick={event => {
        if (event.target === dialog.current) onClose();
      }}>
      <div className="guardian-sheet">
        <header className="guardian-heading">
          <div className="guardian-portrait">
            {character.image ? <img src={character.image} alt="" /> : <Sparkles />}
          </div>
          <div className="guardian-identity">
            <span><Sparkles size={14} /> {t('lannaGuardian')}</span>
            <h2 id="guardian-name">{name}</h2>
          </div>
          <button className="guardian-close" onClick={onClose} aria-label={t('close')}><X size={19} /></button>
        </header>
        <div className="guardian-chapters">
          {sections.map(([key, label, Icon]) => (
            <section key={key}>
              <h3>
                <button aria-expanded={expanded === key} aria-controls={`guardian-${key}`}
                  onClick={() => setExpanded(expanded === key ? null : key)}>
                  <Icon size={19} /><span>{t(label)}</span><ChevronDown size={17} />
                </button>
              </h3>
              <p id={`guardian-${key}`} hidden={expanded !== key}>{translated[key] || character[key]}</p>
            </section>
          ))}
        </div>
        <footer><button onClick={onClose}>{t('close')}</button></footer>
      </div>
    </dialog>
  );
}

export default CharacterDetailModal;
