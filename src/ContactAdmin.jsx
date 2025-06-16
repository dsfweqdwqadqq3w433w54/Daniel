import { useState, useEffect } from 'react';
import {
  getContactSubmissions,
  markSubmissionAsRead,
  markSubmissionAsUnread,
  deleteSubmission,
  getContactStats,
  testSupabaseConnection,
  signInWithEmail,
  signOut,
  getCurrentUser,
  getCurrentSession,
  supabase
} from './supabaseClient';

function ContactAdmin() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Supabase authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Supabase authentication functions
  const checkAuthStatus = async () => {
    try {
      const { session } = await getCurrentSession();
      if (session) {
        setSession(session);
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        setAuthLoading(false);
        return true;
      } else {
        setIsAuthenticated(false);
        setAuthLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setAuthLoading(false);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const result = await signInWithEmail(loginForm.email, loginForm.password);

      if (result.success) {
        setSession(result.data.session);
        setCurrentUser(result.data.user);
        setIsAuthenticated(true);
        setLoginForm({ email: '', password: '' });
      } else {
        setAuthError(result.error || 'Login failed');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setSession(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoginForm({ email: '', password: '' });
      setAuthError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession(session);
          setCurrentUser(session.user);
          setIsAuthenticated(true);
        } else {
          setSession(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setAuthLoading(false);
      }
    );

    // Check initial auth status
    checkAuthStatus();

    return () => subscription.unsubscribe();
  }, []);

  // Navigation function
  const goBackToPortfolio = () => {
    window.location.href = '/';
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.error}`);
      }

      const [submissionsResult, statsResult] = await Promise.all([
        getContactSubmissions(),
        getContactStats()
      ]);

      if (submissionsResult.success) {
        setSubmissions(submissionsResult.data);
      } else {
        throw new Error(submissionsResult.error);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const isAuth = checkAuthStatus();
    if (isAuth) {
      loadData();
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    setActionLoading(id);
    try {
      const result = await markSubmissionAsRead(id);
      if (result.success) {
        await loadData();
      } else {
        alert('Failed to mark as read: ' + result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsUnread = async (id) => {
    setActionLoading(id);
    try {
      const result = await markSubmissionAsUnread(id);
      if (result.success) {
        await loadData();
      } else {
        alert('Failed to mark as unread: ' + result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    setActionLoading(id);
    try {
      const result = await deleteSubmission(id);
      if (result.success) {
        await loadData();
      } else {
        alert('Failed to delete: ' + result.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'new') return submission.status === 'new';
    if (filter === 'read') return submission.status === 'read';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Show login screen if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-r-blue-500 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Checking Authentication</h3>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
              <p className="text-gray-400">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={goBackToPortfolio}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl transition-all duration-300 border border-white/30"
              >
                ← Back to Portfolio
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Secure Access</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Contact your administrator for access credentials</div>
                <div>All login attempts are monitored and logged</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-r-blue-500 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Loading Admin Dashboard</h3>
          <p className="text-gray-400">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-red-400 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadData}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Retry Connection
            </button>
            <button
              onClick={goBackToPortfolio}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-300 border border-white/30"
            >
              ← Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Modern Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-400 text-sm">
                    Welcome, {currentUser?.email || 'Administrator'} • Contact Form Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 border border-white/30"
              >
                {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
              </button>
              <button
                onClick={loadData}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                🚪 Logout
              </button>
              <button
                onClick={goBackToPortfolio}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                ← Back to Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-gray-300 text-sm">Total Messages</div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 text-xl">📧</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">{stats.new}</div>
                <div className="text-gray-300 text-sm">New Messages</div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-xl">✨</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-400">{stats.read}</div>
                <div className="text-gray-300 text-sm">Read Messages</div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-xl">👁️</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-400">{stats.today}</div>
                <div className="text-gray-300 text-sm">Today</div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-orange-400 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All Messages', count: stats.total, icon: '📋', color: 'blue' },
              { key: 'new', label: 'New', count: stats.new, icon: '✨', color: 'green' },
              { key: 'read', label: 'Read', count: stats.read, icon: '👁️', color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  filter === tab.key
                    ? `bg-${tab.color}-500/30 text-${tab.color}-300 border border-${tab.color}-500/50`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === tab.key
                    ? `bg-${tab.color}-500/50`
                    : 'bg-white/20'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-white mb-4">No messages found</h3>
              <p className="text-gray-400 text-lg">
                {filter === 'all' ? 'No contact form submissions yet.' : `No ${filter} messages.`}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {submission.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{submission.name}</h4>
                          <p className="text-gray-400 text-sm">{submission.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        submission.status === 'new'
                          ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                          : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      }`}>
                        {submission.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-white mb-2">{submission.subject}</h5>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {submission.message.substring(0, 120)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
                        {formatDate(submission.submitted_at)}
                      </span>
                      <div className="flex space-x-2">
                        {submission.status === 'new' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(submission.id);
                            }}
                            disabled={actionLoading === submission.id}
                            className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                          >
                            {actionLoading === submission.id ? '...' : '✓'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsUnread(submission.id);
                            }}
                            disabled={actionLoading === submission.id}
                            className="text-yellow-400 hover:text-yellow-300 text-sm disabled:opacity-50"
                          >
                            {actionLoading === submission.id ? '...' : '↺'}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(submission.id);
                          }}
                          disabled={actionLoading === submission.id}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // List View
            <div className="p-6 space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {submission.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{submission.name}</h4>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            submission.status === 'new'
                              ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                              : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{submission.email}</p>
                        <h5 className="font-medium text-white mb-2">{submission.subject}</h5>
                        <p className="text-gray-400 text-sm mb-3">
                          {submission.message.substring(0, 200)}...
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-blue-500/50"
                      >
                        👁️ View
                      </button>
                      {submission.status === 'new' ? (
                        <button
                          onClick={() => handleMarkAsRead(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="bg-green-500/30 hover:bg-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-green-500/50 disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? '...' : '✓ Mark Read'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-yellow-500/50 disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? '...' : '↺ Mark Unread'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={actionLoading === submission.id}
                        className="bg-red-500/30 hover:bg-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-red-500/50 disabled:opacity-50"
                      >
                        {actionLoading === submission.id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Message Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedSubmission.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Message Details</h3>
                    <p className="text-gray-400">Submitted {formatDate(selectedSubmission.submitted_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <div className="text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                      {selectedSubmission.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <div className="text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                      <a href={`mailto:${selectedSubmission.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                        {selectedSubmission.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <div className="text-white bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    {selectedSubmission.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <div className="text-white bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.message}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedSubmission.status === 'new'
                        ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                        : 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    }`}>
                      {selectedSubmission.status}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Status: {selectedSubmission.status === 'new' ? 'Unread' : 'Read'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    ID: {selectedSubmission.id}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-white/20">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3 text-gray-300 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  📧 Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactAdmin;
