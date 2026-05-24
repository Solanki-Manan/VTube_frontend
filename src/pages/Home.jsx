import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from '../components/VideoSkeleton';
import { videoApi } from '../services/api';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const categories = ["All", "Gaming", "Music", "Live", "Computer Programming", "Podcasts", "News"];
  const [activeCategory, setActiveCategory] = useState("All");

  // Reset videos and page when query changes
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
  }, [query, activeCategory]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (page === 1) setLoading(true);
        const data = await videoApi.getVideos(page, 10, query);
        
        const fetchedVideos = data.data?.videos || [];
        
        if (fetchedVideos.length === 0) {
          setHasMore(false);
        } else {
          setVideos(prev => page === 1 ? fetchedVideos : [...prev, ...fetchedVideos]);
          if (fetchedVideos.length < 10) setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch videos", err);
        setError("Failed to load videos. Is your backend running?");
      } finally {
        setLoading(false);
      }
    };
    
    if (hasMore) {
      fetchVideos();
    }
  }, [query, activeCategory, page]);

  const lastVideoElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="home-container">
      <div className="categories glass">
        {['All', 'Gaming', 'Music', 'Live', 'Computer Programming', 'Podcasts', 'News'].map((cat) => (
          <button key={cat} className={`category-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>
      
      {error ? (
        <div className="error-message" style={{ margin: 20 }}>{error}</div>
      ) : videos.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>No videos found! Try uploading one.</div>
      ) : (
        <div className="video-grid">
          {videos.map((video, index) => {
            if (videos.length === index + 1) {
              return (
                <div ref={lastVideoElementRef} key={video._id}>
                  <VideoCard 
                    id={video._id}
                    title={video.title}
                    channelName={video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel'}
                    username={video.ownerDetails?.username || video.owner?.username}
                    views={video.views}
                    createdAt={video.createdAt}
                    thumbnail={video.thumbnailfile}
                    avatar={video.ownerDetails?.avatar || video.owner?.avatar}
                    duration={video.duration}
                  />
                </div>
              );
            } else {
              return (
                <VideoCard 
                  key={video._id}
                  id={video._id}
                  title={video.title}
                  channelName={video.ownerDetails?.fullName || video.owner?.fullName || 'Unknown Channel'}
                  username={video.ownerDetails?.username || video.owner?.username}
                  views={video.views}
                  createdAt={video.createdAt}
                  thumbnail={video.thumbnailfile}
                  avatar={video.ownerDetails?.avatar || video.owner?.avatar}
                  duration={video.duration}
                />
              );
            }
          })}
          
          {loading && [...Array(8)].map((_, i) => <VideoSkeleton key={`skeleton-${i}`} />)}
        </div>
      )}
      
      {!hasMore && videos.length > 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
          You've reached the end!
        </div>
      )}

      <style>{`
        .home-container {
          padding: 24px;
          max-width: 1800px;
          margin: 0 auto;
        }
        
        .categories {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-full);
          margin-bottom: 32px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
        }
        
        .categories::-webkit-scrollbar {
          display: none;
        }
        
        .category-pill {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          cursor: pointer;
          white-space: nowrap;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        
        .category-pill:hover, .category-pill.active {
          background: var(--accent-primary);
          border-color: var(--accent-secondary);
          box-shadow: 0 0 10px var(--accent-glow);
        }
        
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        /* Staggered animation delays for the grid items */
        .video-grid > *:nth-child(1) { animation-delay: 0.1s; }
        .video-grid > *:nth-child(2) { animation-delay: 0.2s; }
        .video-grid > *:nth-child(3) { animation-delay: 0.3s; }
        .video-grid > *:nth-child(4) { animation-delay: 0.4s; }
        .video-grid > *:nth-child(5) { animation-delay: 0.5s; }
        .video-grid > *:nth-child(6) { animation-delay: 0.6s; }
        .video-grid > *:nth-child(7) { animation-delay: 0.7s; }
        .video-grid > *:nth-child(8) { animation-delay: 0.8s; }
      `}</style>
    </div>
  );
}
