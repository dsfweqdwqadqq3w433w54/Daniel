
import { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary.jsx';
import GooeyNav from './GooeyNav.jsx';
import Home from './home.jsx';
import About from './about.jsx';
import Projects from './projects.jsx';
import Skills from './skills.jsx';
import Contact from './contact.jsx';
import ContactAdmin from './ContactAdmin.jsx';

function App() {
  const [currentRoute, setCurrentRoute] = useState('home');

  // Navigation items for GooeyNav
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ];

  // Simple hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || 'home';
      setCurrentRoute(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Show admin panel if route is admin
  if (currentRoute === 'admin') {
    return (
      <ErrorBoundary>
        <ContactAdmin />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {/* Fixed GooeyNav at the top - Responsive for both mobile and desktop */}
      <div
        className="fixed top-0 left-0 right-0 z-30 md:backdrop-blur-md md:border-b md:border-white/10 mobile-navbar"
        style={{
          position: 'fixed',
          zIndex: 30
        }}
      >
        <div className="w-full flex justify-center px-4 py-4">
          <GooeyNav
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
      </div>

      <Home />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </ErrorBoundary>
  );

}

export default App;

