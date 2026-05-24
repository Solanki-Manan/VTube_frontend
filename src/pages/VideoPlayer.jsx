import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, ListPlus, X, Plus } from 'lucide-react';
import { videoApi, interactionApi, userApi, playlistApi, subscriptionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comments from '../components/Comments';
import VideoCard from '../components/VideoCard';

export default function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactions State
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Playlist Modal State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [playlistLoading, setPlaylistLoading] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        // Fetch Video
        const vData = await videoApi.getVideoById(videoId);
        setVideo(vData.data);
        
        // Fetch Suggested Videos
        const sData = await videoApi.getVideos(1, 15);
        setSuggestedVideos(sData.data?.videos?.filter(v => v._id !== videoId) || []);
        
        // Add to Watch History
        if (currentUser) {
          try {
            await userApi.addVideoToHistory(videoId);
          } catch (e) {
            console.error("Failed to add to watch history", e);
          }
        }

        // Fetch Likes
        const lData = await interactionApi.getVideoLikes(videoId);
        setLikes(lData.data?.totalLikes || 0);
        setIsLiked(lData.data?.isLiked || false);
        
        // Fetch Channel Profile for Subscribers
        const channelUsername = vData.data?.owner?.username || vData.data?.ownerDetails?.username;
        if (channelUsername) {
          const pData = await userApi.getChannelProfile(channelUsername);
          setIsSubscribed(pData.data?.isSubscribed || false);
          setSubscribersCount(pData.data?.subscribersCount || 0);
        }

      } catch (err) {
        console.error("Failed to load video data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
    // Scroll to top
    window.scrollTo(0, 0);
  }, [videoId]);

  const handleLike = async () => {
    if (!currentUser) return navigate('/login');
    try {
      await interactionApi.toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser) return navigate('/login');
    try {
      const channelId = video.ownerDetails?._id || video.owner?._id || video.owner;
      await subscriptionApi.toggleSubscription(channelId);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Failed to toggle subscription", err);
      alert(err.response?.data?.message || "Failed to subscribe");
    }
  };

  const openPlaylistModal = async () => {
    if (!currentUser) return navigate('/login');
    setShowPlaylistModal(true);
    fetchUserPlaylists();
  };

  const fetchUserPlaylists = async () => {
    try {
      setPlaylistLoading(true);
      const res = await playlistApi.getUserPlaylists(currentUser._id, 1, 50);
      setUserPlaylists(res.data?.playlists || []);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      setPlaylistLoading(true);
      await playlistApi.createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      await fetchUserPlaylists(); // Await to ensure UI updates after fetching
    } catch (err) {
      alert("Failed to create playlist: " + (err.response?.data?.message || err.message));
      setPlaylistLoading(false); // Only set false on error, fetchUserPlaylists handles success false
    }
  };

  const handleToggleVideoInPlaylist = async (playlistId, isInPlaylist, playlistName) => {
    try {
      if (isInPlaylist) {
        await playlistApi.removeVideoFromPlaylist(playlistId, videoId);
        alert(`Video removed from ${playlistName}`);
      } else {
        await playlistApi.addVideoToPlaylist(playlistId, videoId);
        alert(`Video added to ${playlistName} successfully!`);
      }
      // Update local state to reflect change instantly
      setUserPlaylists(prev => prev.map(pl => {
        if (pl._id === playlistId) {
          return {
            ...pl,
            videos: isInPlaylist 
              ? pl.videos.filter(v => v !== videoId && v._id !== videoId)
              : [...pl.videos, videoId]
          };
        }
        return pl;
      }));
    } catch (err) {
      alert("Failed to update playlist: " + (err.response?.data?.message || err.message));
    }
  };



  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading Video...</div>;
  }

  if (!video) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Video not found!</div>;
  }

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

  return (
    <div className="player-container">
      {/* Left Column: Video & Details */}
      <div className="primary-column">
        <div className="video-wrapper">
          <video 
            src={video.videofile} 
            poster={video.thumbnailfile}
            controls 
            autoPlay 
            className="video-element"
          />
        </div>
        
        <h1 className="video-title">{video.title}</h1>
        
        <div className="video-meta-row">
          <div className="channel-info">
            <Link to={`/channel/${video.ownerDetails?.username || video.owner?.username}`} className="channel-link">
              <img 
                src={video.ownerDetails?.avatar || video.owner?.avatar || 'https://i.pravatar.cc/150?img=11'} 
                alt={video.ownerDetails?.fullName || 'Channel'} 
                className="channel-avatar-large" 
              />
              <div className="channel-text">
                <h3 className="channel-name">{video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel'}</h3>
                <p className="subscriber-count">
                  {subscribersCount} subscribers
                </p>
              </div>
            </Link>
            <button 
              className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
          
          <div className="actions-bar">
            <div className="action-group glass">
              <button className={`action-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />
                <span>{likes}</span>
              </button>
              <div className="divider"></div>
              <button className="action-btn">
                <ThumbsDown size={20} />
              </button>
            </div>
            
            <button className="action-btn glass single-btn" onClick={openPlaylistModal}>
              <ListPlus size={20} />
              <span>Save</span>
            </button>
            
            <button className="action-btn glass single-btn icon-only">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="description-box glass">
          <div className="description-stats">
            <span style={{ fontWeight: 600 }}>{video.views} views</span>
            <span style={{ fontWeight: 600 }}>{formatTimeAgo(video.createdAt)}</span>
          </div>
          <p className="description-text">{video.description}</p>
        </div>

        {/* Comments Section */}
        <Comments videoId={videoId} />
      </div>

      {/* Right Column: Suggested Videos */}
      <div className="secondary-column">
        {suggestedVideos.map((v) => (
          <VideoCard 
            key={v._id}
            id={v._id}
            title={v.title}
            channelName={v.ownerDetails?.fullName || v.owner?.fullName || 'Unknown'}
            username={v.ownerDetails?.username || v.owner?.username}
            views={v.views}
            createdAt={v.createdAt}
            thumbnail={v.thumbnailfile}
            avatar={v.ownerDetails?.avatar || v.owner?.avatar}
            duration={v.duration}
          />
        ))}
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content glass playlist-modal">
            <div className="modal-header">
              <h2>Save to Playlist</h2>
              <button className="close-btn" onClick={() => setShowPlaylistModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="playlists-list">
              {playlistLoading && userPlaylists.length === 0 ? (
                <div className="loading-text">Loading playlists...</div>
              ) : userPlaylists.length === 0 ? (
                <div className="loading-text">You don't have any playlists yet.</div>
              ) : (
                userPlaylists.map(pl => {
                  const isInPlaylist = pl.videos.some(v => v === videoId || v._id === videoId);
                  return (
                    <div key={pl._id} className="playlist-checkbox-item">
                      <input 
                        type="checkbox" 
                        id={`pl-${pl._id}`} 
                        checked={isInPlaylist}
                        onChange={() => handleToggleVideoInPlaylist(pl._id, isInPlaylist, pl.name)}
                      />
                      <label htmlFor={`pl-${pl._id}`}>
                        <span className="pl-name">{pl.name}</span>
                        <span className="pl-privacy">Private</span>
                      </label>
                    </div>
                  );
                })
              )}
            </div>

            <div className="create-playlist-section">
              <h3><Plus size={16}/> Create new playlist</h3>
              <form onSubmit={handleCreatePlaylist}>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  className="modal-input"
                />
                <input 
                  type="text" 
                  placeholder="Description (Optional)" 
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="modal-input"
                />
                <button type="submit" className="create-pl-btn" disabled={playlistLoading || !newPlaylistName.trim()}>
                  {playlistLoading ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .player-container {
          display: flex;
          gap: 24px;
          padding: 24px;
          max-width: 1800px;
          margin: 0 auto;
          align-items: flex-start;
        }

        .primary-column {
          flex: 1;
          min-width: 0;
        }

        .secondary-column {
          width: 400px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .video-wrapper {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .video-element {
          width: 100%;
          height: 100%;
          outline: none;
        }

        .video-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .video-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }

        .channel-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .channel-avatar-large {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .channel-text {
          display: flex;
          flex-direction: column;
        }

        .channel-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .subscriber-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .subscribe-btn {
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          margin-left: 12px;
          transition: all 0.2s;
        }

        .subscribe-btn:hover {
          opacity: 0.9;
        }

        .subscribe-btn.subscribed {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
        }

        .actions-bar {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .action-group {
          display: flex;
          align-items: center;
          border-radius: var(--radius-full);
          padding: 0;
          overflow: hidden;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn.active {
          color: var(--accent-primary);
        }

        .divider {
          width: 1px;
          height: 24px;
          background: var(--glass-border);
        }

        .single-btn {
          border-radius: var(--radius-full);
        }

        .icon-only {
          padding: 10px;
        }

        .description-box {
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .description-stats {
          display: flex;
          gap: 12px;
          font-size: 0.95rem;
        }

        .description-text {
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-wrap;
          color: var(--text-primary);
        }

        @media (max-width: 1024px) {
          .player-container {
            flex-direction: column;
          }
          .secondary-column {
            width: 100%;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          width: 90%;
          max-width: 400px;
          padding: 24px;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .playlists-list {
          max-height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          padding-right: 8px;
        }

        .playlist-checkbox-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .playlist-checkbox-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        .playlist-checkbox-item label {
          display: flex;
          justify-content: space-between;
          flex: 1;
          cursor: pointer;
          align-items: center;
        }

        .pl-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .pl-privacy {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .loading-text {
          text-align: center;
          color: var(--text-secondary);
          padding: 20px 0;
        }

        .create-playlist-section {
          border-top: 1px solid var(--glass-border);
          padding-top: 16px;
        }

        .create-playlist-section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .create-playlist-section form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: rgba(0,0,0,0.2);
          color: var(--text-primary);
          font-family: inherit;
        }

        .modal-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .create-pl-btn {
          background: var(--text-primary);
          color: var(--bg-primary);
          border: none;
          padding: 10px;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
        }

        .create-pl-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

      `}</style>
    </div>
  );
}
