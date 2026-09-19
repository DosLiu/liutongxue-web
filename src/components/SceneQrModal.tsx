import { useEffect, useRef } from 'react';
import type { SceneProjectCard } from '../constants/sceneProjects';
import './SceneQrModal.css';

type SceneQrModalProps = {
  block: SceneProjectCard | null;
  onClose: () => void;
};

export default function SceneQrModal({ block, onClose }: SceneQrModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isOpen = Boolean(block?.qr);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 锁定背景滚动（含 iOS 触摸滚动穿透），关闭后恢复原滚动位置
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      htmlOverflow: html.style.overflow,
      htmlScrollBehavior: html.style.scrollBehavior
    };
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      html.style.overflow = previous.htmlOverflow;

      // 全局 scroll-behavior: smooth 会让恢复滚动变成动画，这里临时改为瞬时
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = previous.htmlScrollBehavior;
    };
  }, [isOpen]);

  // 打开时聚焦弹窗、Tab 不逃逸，关闭后把焦点还给触发元素
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      event.preventDefault();
      closeButtonRef.current?.focus();
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

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
        <button
          ref={closeButtonRef}
          type="button"
          className="scene-qr-modal__close"
          aria-label="关闭"
          onClick={onClose}
        >
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