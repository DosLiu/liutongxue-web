import { useEffect } from 'react';
import type { SceneProjectBlock } from '../constants/sceneProjects';
import './SceneQrModal.css';

type SceneQrModalProps = {
  block: SceneProjectBlock | null;
  onClose: () => void;
};

export default function SceneQrModal({ block, onClose }: SceneQrModalProps) {
  useEffect(() => {
    if (!block) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [block, onClose]);

  if (!block?.qr) {
    return null;
  }

  return (
    <div className="scene-qr-modal" role="presentation" onClick={onClose}>
      <div
        className="scene-qr-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${block.title}小程序码`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="scene-qr-modal__close" aria-label="关闭" onClick={onClose}>
          ×
        </button>

        <h2 className="scene-qr-modal__title">{block.title}</h2>

        {block.qr.imageSrc ? (
          <img className="scene-qr-modal__image" src={block.qr.imageSrc} alt={`${block.title}小程序码`} />
        ) : (
          <div className="scene-qr-modal__image scene-qr-modal__image--placeholder" aria-hidden="true">
            小程序码待替换
          </div>
        )}

        <p className="scene-qr-modal__caption">{block.qr.caption}</p>
      </div>
    </div>
  );
}
