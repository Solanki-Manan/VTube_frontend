import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import Channel from './pages/Channel';
import Settings from './pages/Settings';
import Playlist from './pages/Playlist';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import SearchResults from './pages/SearchResults';
import Subscriptions from './pages/Subscriptions';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

function AppLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Hide sidebar on auth pages
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const showSidebar = currentUser && !authRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      <Navbar />
      {showSidebar && <Sidebar />}
      <main className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/video/:videoId" element={<VideoPlayer />} />
          <Route path="/channel/:username" element={<Channel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/playlist/:playlistId" element={<Playlist />} />
          <Route path="/history" element={<History />} />
          <Route path="/liked" element={<LikedVideos />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content {
          padding-top: 70px;
          flex-grow: 1;
          transition: margin-left 0.2s ease;
        }
        .main-content.with-sidebar {
          margin-left: 200px;
        }
        @media (max-width: 768px) {
          .main-content.with-sidebar {
            margin-left: 60px;
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
