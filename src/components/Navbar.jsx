import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Video, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { videoApi } from '../services/api';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await videoApi.getVideos(1, 5, searchQuery);
        setSuggestions(data.data?.videos || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/results?search_query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    navigate(`/results?search_query=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="nav-left">
        <Link to="/" className="logo">
          <div className="logo-icon"><Video size={24} color="var(--accent-primary)" /></div>
          <span>VTube</span>
        </Link>
      </div>

      <div className="nav-center">
        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-bar">
            <input 
              type="text" 
              placeholder="Search premium content..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="search-btn"><Search size={20} /></button>
          </form>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass">
              {suggestions.map((video) => (
                <div 
                  key={video._id} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(video.title)}
                >
                  <Search size={16} className="suggestion-icon" />
                  <span className="suggestion-text">{video.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <button onClick={toggleTheme} className="icon-btn theme-btn" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {currentUser ? (
          <>
            <Link to={`/channel/${currentUser.username}`} className="profile-btn" title="Your Channel">
              <img 
                src={currentUser.avatar || 'https://i.pravatar.cc/150?img=11'} 
                alt={currentUser.fullName || "User Avatar"} 
                className="avatar" 
                onError={(e) => { e.target.src = 'https://i.pravatar.cc/150?img=11'; }}
              />
            </Link>
            <button onClick={handleLogout} className="icon-btn logout-btn" title="Logout">
              <LogOut size={20} />
              <span className="logout-label">Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">Log In</Link>
        )}
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 100;
        }

        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .logo-icon {
          background: rgba(123, 44, 191, 0.15);
          padding: 6px;
          border-radius: var(--radius-md);
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-full);
          transition: background var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: var(--bg-tertiary);
          color: var(--accent-secondary);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
        }

        .logout-btn:hover {
          color: #ff4757;
          border-color: rgba(255,71,87,0.4);
          background: rgba(255,71,87,0.08);
        }

        .theme-btn {
          margin-right: 8px;
        }

        .nav-center {
          flex: 1;
          max-width: 600px;
          margin: 0 40px;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-full);
          padding: 4px 16px;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .search-bar:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 15px rgba(123, 44, 191, 0.2);
        }

        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 8px;
          font-size: 1rem;
          outline: none;
        }

        .search-bar input::placeholder {
          color: var(--text-secondary);
        }

        .search-suggestions {
          position: absolute;
          top: 110%;
          left: 0;
          right: 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .suggestion-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background-color var(--transition-fast);
          color: var(--text-primary);
        }

        .suggestion-item:hover {
          background-color: var(--bg-tertiary);
        }

        .suggestion-icon {
          color: var(--text-secondary);
        }

        .suggestion-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          transition: color var(--transition-fast);
        }

        .search-btn:hover {
          color: var(--accent-primary);
        }

        .profile-btn {
          cursor: pointer;
          border-radius: var(--radius-full);
          overflow: hidden;
          width: 40px;
          height: 40px;
          border: 2px solid transparent;
          transition: border-color var(--transition-fast);
        }
        
        .profile-btn:hover {
          border-color: var(--accent-secondary);
        }

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </nav>
  );
}
