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
import { sendEmailWithFallback, validateEmailConfig } from './emailService';

function ContactAdmin() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyForm, setReplyForm] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Navigation menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('messages');

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

  // Reply functionality
  const handleReplyClick = (submission) => {
    setReplyForm({
      to: submission.email,
      subject: `Re: ${submission.subject}`,
      message: `\n\n--- Original Message ---\nFrom: ${submission.name} <${submission.email}>\nDate: ${formatDate(submission.submitted_at)}\nSubject: ${submission.subject}\n\n${submission.message}`
    });
    setShowReplyModal(true);
    setReplySuccess(false);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setSendingReply(true);

    try {
      // Check EmailJS configuration
      const emailConfig = validateEmailConfig();
      console.log('Email configuration:', emailConfig);

      // Clear any previous errors
      setReplyError('');

      // Prepare reply data
      const replyData = {
        to: replyForm.to,
        toName: selectedSubmission.name,
        fromName: currentUser?.email?.split('@')[0] || 'Admin',
        fromEmail: currentUser?.email || 'admin@yoursite.com',
        subject: replyForm.subject,
        message: replyForm.message
      };

      // Send email using EmailJS with fallback
      const result = await sendEmailWithFallback(replyData);

      if (result.success) {
        // Mark as replied
        await markSubmissionAsRead(selectedSubmission.id);

        setReplySuccess(true);

        // Show success message with method used
        console.log(`Email sent successfully via ${result.method}`);

        // Store the method for display in success message
        setReplySuccess(result.method);

        setTimeout(() => {
          setShowReplyModal(false);
          setSelectedSubmission(null);
          loadData(); // Refresh the data
        }, 4000);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }

    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyError(error.message || 'Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyForm({ to: '', subject: '', message: '' });
    setReplySuccess(false);
    setReplyError('');
  };

  // Navigation menu functions
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Keep menu open when switching sections
  };

  const handleMenuAction = (action) => {
    action(); // Execute the action function
    setIsMenuOpen(false); // Close menu after action
  };

  // Load data function (moved here to be available for navigationActions)
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

  // Navigation menu items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Statistics',
      type: 'section'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '📧',
      description: 'Contact Form Submissions',
      type: 'section'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Admin Configuration',
      type: 'section'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Usage Statistics',
      type: 'section'
    }
  ];

  // Navigation action items
  const navigationActions = [
    {
      id: 'view-toggle',
      label: viewMode === 'grid' ? 'List View' : 'Grid View',
      icon: viewMode === 'grid' ? '📋' : '🔲',
      description: `Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`,
      type: 'action',
      action: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid')
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: '🔄',
      description: 'Reload data',
      type: 'action',
      action: loadData
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: '←',
      description: 'Back to portfolio',
      type: 'action',
      action: goBackToPortfolio
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      description: 'Sign out of admin',
      type: 'action',
      action: handleLogout,
      danger: true
    }
  ];

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
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-r-blue-500 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Checking Authentication</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
              <p className="text-gray-600">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={goBackToPortfolio}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-all duration-300 border border-gray-300"
              >
                ← Back to Portfolio
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Secure Access</p>
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
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-r-blue-500 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Loading Admin Dashboard</h3>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadData}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Retry Connection
            </button>
            <button
              onClick={goBackToPortfolio}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-all duration-300 border border-gray-300"
            >
              ← Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Modern Header */}
      <div className={`bg-gray-50 border-b border-gray-200 shadow-sm transition-all duration-300 ${
        isMenuOpen ? 'md:ml-64' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout - Horizontal */}
          <div className="hidden md:flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button - Hidden when menu is open */}
              {!isMenuOpen && (
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-300 border border-gray-300"
                  title="Open navigation menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 text-sm">
                    Welcome, {currentUser?.email || 'Administrator'} • Contact Form Management
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Layout - Vertical Stacked */}
          <div className="md:hidden py-4 space-y-4">
            {/* Header Info Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 text-xs">
                    Welcome, {currentUser?.email || 'Administrator'}
                  </p>
                </div>
              </div>

              {/* Mobile Hamburger Menu Button - Hidden when menu is open */}
              {!isMenuOpen && (
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-300 border border-gray-300"
                  title="Open navigation menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Left Navigation Menu */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            onClick={closeMenu}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-4">
          {/* Navigation Sections */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Sections</h3>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Action Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Actions</h3>
            {navigationActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleMenuAction(action.action)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  action.danger
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{action.icon}</span>
                <div>
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            Admin Panel v1.0
          </div>
        </div>
      </div>

      {/* Backdrop Overlay - Only on mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden"
          onClick={closeMenu}
        ></div>
      )}

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${isMenuOpen ? 'md:ml-64' : ''}`}
      >
        {/* Modern Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-600 text-sm">Total Messages</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">📧</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.new}</div>
                <div className="text-gray-600 text-sm">New Messages</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✨</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{stats.read}</div>
                <div className="text-gray-600 text-sm">Read Messages</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">👁️</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.today}</div>
                <div className="text-gray-600 text-sm">Today</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
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
                    ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-300`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === tab.key
                    ? `bg-${tab.color}-200 text-${tab.color}-800`
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Display */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No messages found</h3>
              <p className="text-gray-600 text-lg">
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
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
                          <h4 className="font-semibold text-gray-900">{submission.name}</h4>
                          <p className="text-gray-600 text-sm">{submission.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        submission.status === 'new'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-purple-100 text-purple-700 border border-purple-300'
                      }`}>
                        {submission.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">{submission.subject}</h5>
                      <p className="text-gray-600 text-sm line-clamp-3">
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
                            className="text-green-600 hover:text-green-700 text-sm disabled:opacity-50"
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
                            className="text-yellow-600 hover:text-yellow-700 text-sm disabled:opacity-50"
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
                          className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
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
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 hover:shadow-md transition-all duration-300"
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
                          <h4 className="font-semibold text-gray-900">{submission.name}</h4>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            submission.status === 'new'
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-purple-100 text-purple-700 border border-purple-300'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{submission.email}</p>
                        <h5 className="font-medium text-gray-900 mb-2">{submission.subject}</h5>
                        <p className="text-gray-600 text-sm mb-3">
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
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-blue-300"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleReplyClick(submission)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-green-300"
                      >
                        📧 Reply
                      </button>
                      {submission.status === 'new' ? (
                        <button
                          onClick={() => handleMarkAsRead(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-emerald-300 disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? '...' : '✓ Mark Read'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-yellow-300 disabled:opacity-50"
                        >
                          {actionLoading === submission.id ? '...' : '↺ Mark Unread'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={actionLoading === submission.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm transition-all duration-300 border border-red-300 disabled:opacity-50"
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
      {selectedSubmission && !showReplyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedSubmission.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Message Details</h3>
                    <p className="text-gray-600">Submitted {formatDate(selectedSubmission.submitted_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {selectedSubmission.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                        {selectedSubmission.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    {selectedSubmission.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="text-gray-900 bg-gray-50 p-6 rounded-xl border border-gray-200 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.message}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedSubmission.status === 'new'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-purple-100 text-purple-700 border border-purple-300'
                    }`}>
                      {selectedSubmission.status}
                    </span>
                    <span className="text-gray-600 text-sm">
                      Status: {selectedSubmission.status === 'new' ? 'Unread' : 'Read'}
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    ID: {selectedSubmission.id}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReplyClick(selectedSubmission)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  📧 Reply to Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📧</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Reply to Message</h3>
                    <p className="text-gray-600">Replying to {selectedSubmission.name}</p>
                  </div>
                </div>
                <button
                  onClick={closeReplyModal}
                  className="text-gray-500 hover:text-gray-700 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              {replySuccess ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">✅</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-4">Reply Sent Successfully!</h3>
                  <p className="text-gray-600 text-lg">
                    {replySuccess === 'emailjs'
                      ? 'Your reply has been sent directly to the recipient\'s inbox via EmailJS.'
                      : replySuccess === 'web3forms'
                      ? 'Your reply has been sent directly to the recipient\'s inbox via Web3Forms.'
                      : replySuccess === 'demo'
                      ? 'Demo email sent successfully! Check the browser console to see the email content. This is a simulation - no real email was sent.'
                      : 'Your email client has been opened with the pre-filled reply message. Please send it from your email client.'
                    }
                  </p>
                  {replySuccess === 'demo' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-700 text-sm">
                        🧪 <strong>Demo Mode:</strong> To send real emails, follow the setup guide in WEB3FORMS_SETUP.md (2 minutes) or set VITE_DEMO_MODE=false in .env.local
                      </p>
                    </div>
                  )}
                  {replySuccess === 'client' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-700 text-sm">
                        💡 <strong>Tip:</strong> To send emails directly from the dashboard, set up Web3Forms following the guide in WEB3FORMS_SETUP.md
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                      <input
                        type="email"
                        value={replyForm.to}
                        onChange={(e) => setReplyForm({ ...replyForm, to: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={replyForm.subject}
                        onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                    <textarea
                      value={replyForm.message}
                      onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                      rows={12}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Type your reply here..."
                      required
                    />
                  </div>

                  {replyError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                      {replyError}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeReplyModal}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingReply ? (
                        <span className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          <span>Sending...</span>
                        </span>
                      ) : (
                        '📧 Send Reply'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      </div> {/* Close main content area */}
    </div>
  );
}

export default ContactAdmin;
