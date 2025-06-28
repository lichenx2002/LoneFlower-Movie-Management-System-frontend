import React from 'react';
import './index.module.css';

export interface LoadingProps {
  /** 加载类型 */
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  /** 加载大小 */
  size?: 'small' | 'medium' | 'large';
  /** 加载文本 */
  text?: string;
  /** 是否显示文本 */
  showText?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 是否全屏显示 */
  fullScreen?: boolean;
  /** 背景色 */
  backgroundColor?: string;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  text = '加载中...',
  showText = true,
  className = '',
  fullScreen = false,
  backgroundColor = 'rgba(255, 255, 255, 0.8)'
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const renderSpinner = () => (
    <div className={`loading-spinner loading-${size}`}>
      <div className="spinner"></div>
    </div>
  );

  const renderDots = () => (
    <div className={`loading-dots loading-${size}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`loading-pulse loading-${size}`}>
      <div className="pulse"></div>
    </div>
  );

  const renderSkeleton = () => (
    <div className={`loading-skeleton loading-${size}`}>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`loading-container ${className}`}>
      {renderLoader()}
      {showText && text && (
        <div className="loading-text">{text}</div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="loading-fullscreen"
        style={{ backgroundColor }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loading; 