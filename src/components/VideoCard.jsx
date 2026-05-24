import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ListPlus } from 'lucide-react';

export default function VideoCard({ 
  id, title, channelName, username, views, createdAt, thumbnail, avatar, duration,
  isOwner, onEdit, onDelete, onAddToPlaylist 
}) {
  const navigate = useNavigate();

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Format date
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    if (username) {
      navigate(`/channel/${username}`);
    }
  };

  return (
    <div className="video-card" onClick={() => navigate(`/video/${id}`)}>
      <div className="thumbnail-container">
        <img 
          src={thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800'} 
          alt={title} 
          className="thumbnail" 
        />
        <div className="duration-badge">{formatDuration(duration)}</div>
        
        {isOwner && (
          <div className="owner-actions" onClick={(e) => e.stopPropagation()}>
            <button className="owner-btn add-playlist-btn" onClick={() => onAddToPlaylist(id)} title="Add to Playlist">
              <ListPlus size={16} />
            </button>
            <button className="owner-btn edit-btn" onClick={() => onEdit(id)} title="Edit Video">
              <Edit2 size={16} />
            </button>
            <button className="owner-btn delete-btn" onClick={() => onDelete(id)} title="Delete Video">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="video-info">
        <img 
          src={avatar || 'https://i.pravatar.cc/150?img=11'} 
          alt={channelName} 
          className="channel-avatar" 
          onClick={handleChannelClick}
          onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?img=11'; }} 
        />
        <div className="video-details">
          <h3 className="video-title">{title}</h3>
          <div className="channel-name" onClick={handleChannelClick}>{channelName}</div>
          <div className="video-stats">
            {views || 0} views • {formatTimeAgo(createdAt)}
          </div>
        </div>
      </div>

      <style>{`
        .video-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid transparent;
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }

        .video-card:hover {
          border-color: var(--glass-border);
          transform: translateY(-2px);
        }

        .thumbnail-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
        }

        .thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .video-card:hover .thumbnail {
          transform: scale(1.05);
        }

        .duration-badge {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .owner-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .video-card:hover .owner-actions {
          opacity: 1;
        }

        .owner-btn {
          background: rgba(0,0,0,0.7);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .owner-btn:hover {
          transform: scale(1.1);
        }

        .add-playlist-btn:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .edit-btn:hover {
          background: var(--accent-primary);
        }

        .delete-btn:hover {
          background: #ff4d4d;
        }

        .video-info {
          display: flex;
          gap: 12px;
          padding: 0 12px 12px 12px;
        }

        .channel-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
        }

        .video-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow: hidden;
        }

        .video-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .channel-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .channel-name:hover {
          color: var(--text-primary);
        }

        .video-stats {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .video-card:hover .video-title {
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
}
