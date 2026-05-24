import React from 'react';
import './VideoSkeleton.css'; // We will put the specific styles here or in index.css

export default function VideoSkeleton() {
  return (
    <div className="video-card skeleton-card">
      <div className="skeleton skeleton-thumbnail"></div>
      <div className="video-info">
        <div className="skeleton skeleton-avatar"></div>
        <div className="video-text-info">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-title" style={{ width: '70%', marginTop: '8px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: '12px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '60%', marginTop: '8px' }}></div>
        </div>
      </div>
    </div>
  );
}
