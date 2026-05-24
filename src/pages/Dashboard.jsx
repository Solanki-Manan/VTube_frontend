import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, subscriptionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Video, Eye, ThumbsUp, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoCard from '../components/VideoCard';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribers Modal State
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await userApi.getChannelStats(currentUser._id);
        setStats(statsRes.data);
        
        // Fetch videos
        const videosRes = await userApi.getChannelVideos(currentUser._id, 1, 50); // Get up to 50 latest videos
        setVideos(videosRes.data?.videos || []);
        
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err.response?.data?.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate]);

  const handleOpenSubscribers = async () => {
    setShowSubscribersModal(true);
    if (subscribers.length === 0) {
      try {
        setSubscribersLoading(true);
        const res = await subscriptionApi.getChannelSubscribers(currentUser._id);
        setSubscribers(res.data?.subscribers || []);
      } catch (err) {
        console.error("Failed to fetch subscribers", err);
      } finally {
        setSubscribersLoading(false);
      }
    }
  };

  if (loading) return <div className="loading-container">Loading Dashboard...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!stats) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><BarChart2 size={32} /> Creator Dashboard</h1>
        <p>Welcome back, {currentUser?.fullName}! Here's how your channel is doing.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper views-icon">
            <Eye size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Views</h3>
            <p className="stat-number">{(stats?.totalviews || 0).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card glass-card clickable" onClick={handleOpenSubscribers}>
          <div className="stat-icon-wrapper subscribers-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Subscribers (Click to View)</h3>
            <p className="stat-number">{(stats?.totalsubscribers || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper likes-icon">
            <ThumbsUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Likes</h3>
            <p className="stat-number">{(stats?.totallikes || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper videos-icon">
            <Video size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Videos</h3>
            <p className="stat-number">{(stats?.totalvideos || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Your Uploads</h2>
        {videos.length === 0 ? (
          <div className="no-content glass">You haven't uploaded any videos yet.</div>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard 
                key={video._id}
                id={video._id}
                title={video.title}
                channelName={currentUser.fullName}
                username={currentUser.username}
                views={video.views}
                createdAt={video.createdAt}
                thumbnail={video.thumbnailfile}
                avatar={currentUser.avatar}
                duration={video.duration}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subscribers Modal */}
      {showSubscribersModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Your Subscribers</h2>
              <button className="close-btn" onClick={() => setShowSubscribersModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="subscribers-list">
              {subscribersLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading subscribers...</div>
              ) : subscribers.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You don't have any subscribers yet.
                </div>
              ) : (
                subscribers.map((sub) => (
                  <Link to={`/channel/${sub.subscriber.username}`} key={sub._id} className="subscriber-item">
                    <img 
                      src={sub.subscriber.avatar || 'https://i.pravatar.cc/150'} 
                      alt={sub.subscriber.fullName} 
                      className="subscriber-avatar"
                    />
                    <div className="subscriber-details">
                      <h4>{sub.subscriber.fullName}</h4>
                      <span>@{sub.subscriber.username}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--text-primary);
          margin: 0;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform var(--transition-fast);
        }

        .stat-card.clickable {
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card.clickable:hover {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 30px rgba(123, 44, 191, 0.2);
        }

        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .views-icon {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
        }

        .subscribers-icon {
          background: rgba(155, 89, 182, 0.2);
          color: #9b59b6;
        }

        .likes-icon {
          background: rgba(52, 152, 219, 0.2);
          color: #3498db;
        }

        .videos-icon {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        .stat-info h3 {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1;
        }

        .dashboard-content h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .loading-container, .error-container {
          padding: 100px;
          text-align: center;
          font-size: 1.2rem;
        }

        .error-container {
          color: #e74c3c;
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
          max-width: 500px;
          padding: 32px;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
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

        .subscribers-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .subscribers-list::-webkit-scrollbar {
          width: 6px;
        }

        .subscribers-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .subscribers-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .subscriber-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: inherit;
          transition: background var(--transition-fast);
        }

        .subscriber-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .subscriber-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .subscriber-details h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .subscriber-details span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
