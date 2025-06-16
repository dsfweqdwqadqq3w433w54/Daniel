import { useRef, useEffect, useState } from "react";

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const activeIndexRef = useRef(activeIndex);

  // Keep ref in sync with state
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Debug initial state
  useEffect(() => {
    console.log(`GooeyNav initialized with activeIndex: ${initialActiveIndex}, current activeIndex: ${activeIndex}`);
  }, [initialActiveIndex, activeIndex]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (
    distance,
    pointIndex,
    totalPoints
  ) => {
    const angle =
      ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  const createParticle = (
    i,
    t,
    d,
    r
  ) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };
  const makeParticles = (element) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove("active");
      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add("particle");
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--color-${p.color}, white)`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);
        point.classList.add("point");
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add("active");
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };
  const updateEffectPosition = (element) => {
    if (!navRef.current || !filterRef.current || !textRef.current) return;

    // Get the navigation container (the ul element) and its parent div
    const navContainer = navRef.current;
    const navParent = navContainer.parentElement;
    if (!navContainer || !navParent) return;

    const parentRect = navParent.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - parentRect.x}px`,
      top: `${pos.y - parentRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleClick = (e, index) => {
    e.preventDefault();
    const liEl = e.currentTarget;
    const item = items[index];

    // Close mobile menu when a link is clicked
    setIsMobileMenuOpen(false);

    // Set navigation flag to prevent scroll detection interference
    setIsNavigating(true);

    // Navigate to the section
    if (item.href && item.href.startsWith('#')) {
      const sectionId = item.href.substring(1);

      // Dispatch custom event for animation trigger
      window.dispatchEvent(new CustomEvent('navigateToSection', {
        detail: { sectionId }
      }));

      // Update the URL hash
      window.location.hash = item.href;

      // Special handling for home section - scroll to top
      if (sectionId === 'home') {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          // Clear navigation flag after scroll completes
          setTimeout(() => setIsNavigating(false), 1000);
        }, 100);
      } else {
        // Then scroll to the section with a small delay to allow animation reset
        setTimeout(() => {
          const targetElement = document.querySelector(item.href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
          // Clear navigation flag after scroll completes
          setTimeout(() => setIsNavigating(false), 1000);
        }, 100);
      }
    } else if (item.href) {
      window.location.href = item.href;
      setIsNavigating(false);
    }

    if (activeIndex === index) {
      // Even if same index, still trigger animation by updating hash
      if (item.href && item.href.startsWith('#')) {
        // Force trigger hash change event
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
      // Clear navigation flag if no scrolling needed
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    setActiveIndex(index);
    updateEffectPosition(liEl);
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll(".particle");
      particles.forEach((p) => filterRef.current.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };
  const handleKeyDown = (
    e,
    index
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        handleClick(
          { currentTarget: liEl },
          index
        );
      }
    }
  };
  // Scroll-based active section detection
  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll detection if currently navigating via click
      if (isNavigating) {
        return;
      }

      // DYNAMIC APPROACH: Use the actual items array order
      const scrollY = window.scrollY;
      let newActiveIndex = 0; // Default to first item (Home)

      // Get all sections in the order they appear in the items array
      const sections = [];
      items.forEach((item, index) => {
        if (item.href && item.href.startsWith('#')) {
          const element = document.querySelector(item.href);
          if (element) {
            const rect = element.getBoundingClientRect();
            const offsetTop = rect.top + scrollY;
            sections.push({
              index,
              name: item.label,
              offsetTop,
              element
            });
          }
        }
      });

      if (sections.length === 0) {
        console.log('No sections found');
        return;
      }

      console.log(`Section positions:`, sections.map(s => `${s.name} (index ${s.index}): ${s.offsetTop}px`).join(', '));
      console.log(`Current scroll: ${scrollY}px`);
      console.log(`Items array:`, items.map((item, index) => `${index}: ${item.label}`).join(', '));
      console.log(`Current activeIndex: ${activeIndexRef.current} (${items[activeIndexRef.current]?.label})`);

      // SIMPLIFIED AND IMPROVED HOME DETECTION
      const aboutSection = sections.find(s => s.index === 1);
      const viewportHeight = window.innerHeight;

      // Calculate a more reliable home threshold
      // Use the About section position as reference, or fallback to viewport-based calculation
      let homeEndThreshold;
      if (aboutSection) {
        // Home section ends when we're halfway to the About section
        homeEndThreshold = aboutSection.offsetTop * 0.5;
      } else {
        // Fallback: use viewport height as threshold
        homeEndThreshold = viewportHeight * 0.8;
      }

      console.log(`Home end threshold: ${homeEndThreshold}px, About section at: ${aboutSection?.offsetTop || 'N/A'}px`);

      // STEP 1: Check if we're in the Home section (top area)
      if (scrollY < homeEndThreshold) {
        newActiveIndex = 0;
        console.log(`In Home section (${scrollY}px < ${homeEndThreshold}px threshold)`);
      }
      // STEP 2: Check other sections from bottom to top
      else {
        // Start with the assumption we're in the last section
        newActiveIndex = sections.length - 1;

        // Check each section from bottom to top to find which one we're actually in
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];

          // Skip home section since we handled it above
          if (section.index === 0) continue;

          // Calculate buffer based on section
          let buffer = 150; // Standard buffer
          if (section.index === 1) { // About section
            buffer = 100; // Smaller buffer for About to make it easier to trigger
          }

          // Check if we've scrolled past this section's trigger point
          if (scrollY >= section.offsetTop - buffer) {
            newActiveIndex = section.index;
            console.log(`Scrolled into ${section.name} at ${scrollY}px (trigger: ${section.offsetTop - buffer}px, actual top: ${section.offsetTop}px)`);
            break;
          }
        }
      }

      console.log(`Scroll: ${scrollY}px -> Section: ${items[newActiveIndex]?.label}`);

      // Update if changed
      if (newActiveIndex !== activeIndexRef.current) {
        console.log(`Changing from ${items[activeIndexRef.current]?.label} to ${items[newActiveIndex]?.label}`);
        setActiveIndex(newActiveIndex);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);

    // Initial check after a longer delay to ensure DOM is ready and avoid overriding initial state
    setTimeout(() => {
      console.log('Running initial scroll check...');
      handleScroll();
    }, 1000);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [items, isNavigating]); // Removed activeIndex to prevent excessive re-renders

  // Close mobile menu when clicking on the backdrop
  useEffect(() => {
    const handleBackdropClick = (event) => {
      // Close menu if clicking on the backdrop (not on menu items)
      if (event.target.classList.contains('bg-black') && event.target.classList.contains('bg-opacity-95')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleBackdropClick);
      document.addEventListener('touchstart', handleBackdropClick);
      // Prevent body scroll when menu is open
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll when menu is closed
      document.body.classList.remove('menu-open');
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleBackdropClick);
      document.removeEventListener('touchstart', handleBackdropClick);
      document.body.classList.remove('menu-open');
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Handle hash changes to update active state
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.substring(1);
      if (currentHash) {
        const hashIndex = items.findIndex(item =>
          item.href && item.href.substring(1) === currentHash
        );
        if (hashIndex !== -1 && hashIndex !== activeIndexRef.current) {
          console.log(`Hash change detected - updating active section to: ${items[hashIndex]?.label}`);
          setActiveIndex(hashIndex);
        }
      }
    };

    // Check initial hash on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [items]); // Removed activeIndex to prevent excessive re-renders

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll("li")[
      activeIndex
    ];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add("active");
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll("li")[
        activeIndex
      ];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      {/* This effect is quite difficult to recreate faithfully using Tailwind, so a style tag is a necessary workaround */}
      <style>
        {`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
            --color-1: #ff6b6b;
            --color-2: #4ecdc4;
            --color-3: #45b7d1;
            --color-4: #f9ca24;
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
            transform: translateZ(0);
          }
          .effect.text {
            color: white;
            transition: color 0.3s ease;
          }
          .effect.text.active {
            color: black;
          }
          .effect.filter {
            filter: none;
            mix-blend-mode: normal;
          }
          .effect.filter::before {
            content: "";
            position: absolute;
            inset: -75px;
            z-index: -2;
            background: transparent;
          }
          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: white;
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
          }
          .effect.active::after {
            animation: pill 0.3s ease both;
          }
          @keyframes pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            transform-origin: center;
          }
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }
          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
          li.active {
            color: black;
            text-shadow: none;
          }
          li.active::after {
            opacity: 1;
            transform: scale(1);
          }
          li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 8px;
            background: white;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }

          /* Ensure mobile menu stays fixed */
          .mobile-menu-fixed {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 50 !important;
          }

          .mobile-menu-panel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            width: 100dvw !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow-y: auto !important;
          }

          /* Prevent scrolling when menu is open */
          body.menu-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
          }

          /* Ensure mobile hamburger button is always visible on mobile */
          @media (max-width: 768px) {
            .mobile-hamburger-btn {
              display: flex !important;
              position: fixed !important;
              top: 1rem !important;
              right: 1rem !important;
              z-index: 70 !important;
              visibility: visible !important;
              opacity: 1 !important;
              pointer-events: auto !important;
            }

            /* Hide desktop nav on mobile */
            .desktop-nav {
              display: none !important;
            }

            /* Full width mobile menu */
            .mobile-menu-panel {
              width: 100vw !important;
              width: 100dvw !important;
            }
          }

          /* Hide mobile button on desktop */
          @media (min-width: 769px) {
            .mobile-hamburger-btn {
              display: none !important;
            }
          }

          /* Ensure proper positioning for navigation effects */
          .desktop-nav {
            position: relative;
            overflow: visible;
          }

          .desktop-nav > div {
            position: relative;
            overflow: visible;
          }
        `}
      </style>
      <div className="relative w-full flex justify-center" ref={containerRef}>
        {/* Desktop Navigation */}
        <nav
          className="desktop-nav hidden md:flex relative justify-center w-full"
          style={{ transform: "translate3d(0,0,0.01px)" }}
        >
          <div className="relative">
            <ul
              ref={navRef}
              className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-6 xl:gap-8 list-none p-0 px-1 sm:px-2 md:px-3 m-0 relative z-[3] justify-center flex-wrap"
              style={{
                color: "white",
                textShadow: "none",
                maxWidth: "100vw",
                overflowX: "hidden"
              }}
            >
              {items.map((item, index) => (
                <li
                  key={index}
                  className={`py-[0.3em] sm:py-[0.4em] md:py-[0.6em] px-[0.4em] sm:px-[0.6em] md:px-[1em] rounded-full relative cursor-pointer transition-[background-color_color] duration-300 ease text-white text-xs sm:text-sm md:text-base whitespace-nowrap touch-manipulation min-w-fit ${activeIndex === index ? "active" : ""
                    }`}
                  onClick={(e) => handleClick(e, index)}
                  onTouchStart={(e) => {
                    // Add touch feedback
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onTouchEnd={(e) => {
                    // Reset touch feedback
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="outline-none block"
                    role="button"
                    tabIndex={0}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {/* Effect elements positioned relative to the navigation */}
            <span className="effect filter" ref={filterRef} />
            <span className="effect text" ref={textRef} />
          </div>
        </nav>

        {/* Mobile Hamburger Menu - Always visible on mobile */}
        <div>
          {/* Hamburger Button - Fixed positioning with higher z-index */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-hamburger-btn fixed top-4 right-4 z-[70] flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-900 via-black to-gray-800 backdrop-blur-md rounded-xl border-2 border-yellow-400 border-opacity-60 hover:border-opacity-100 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/40 active:scale-95 md:hidden"
            aria-label="Toggle mobile menu"
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 70,
              display: 'flex',
              backgroundColor: '#1f2937',
              border: '2px solid #fbbf24'
            }}
          >
            <div className="relative w-8 h-8 flex flex-col justify-center items-center">
              <span
                className={`block w-8 h-1 bg-yellow-400 transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}
              />
              <span
                className={`block w-8 h-1 bg-yellow-400 transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block w-8 h-1 bg-yellow-400 transition-all duration-300 rounded-full ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-2'
                }`}
              />
            </div>
          </button>

        </div>

        {/* Mobile Menu Dropdown - Outside container for proper positioning */}
        <div
          className={`mobile-menu-fixed transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-500 ${isMobileMenuOpen ? 'bg-opacity-60' : 'bg-opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'fixed' }}
          />

          {/* Sliding Menu Panel */}
          <div
            className={`mobile-menu-panel w-full transform transition-transform duration-500 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(251, 191, 36, 0.2)'
            }}
          >
            {/* Background Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%),
                  linear-gradient(45deg, transparent 40%, rgba(251, 191, 36, 0.1) 50%, transparent 60%)
                `
              }}
            />

            <div className="relative flex flex-col h-full px-6 py-20 max-w-sm mx-auto w-full">
              {/* Menu Title */}
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-3 tracking-wide">Navigation</h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full shadow-lg shadow-yellow-400/30 mx-auto"></div>
              </div>

              {/* Menu Items */}
              <nav className="flex flex-col space-y-6 flex-1">
                {items.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(e, index);
                    }}
                    className={`group text-white text-2xl font-semibold transition-all duration-300 transform hover:scale-105 py-6 px-8 rounded-2xl border-2 border-transparent hover:border-yellow-400 text-center relative overflow-hidden ${
                      activeIndex === index
                        ? 'text-yellow-400 border-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-400/5 shadow-lg shadow-yellow-400/20'
                        : 'hover:text-yellow-400 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent border-white/20'
                    }`}
                  >
                    {/* Button background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:to-transparent transition-all duration-300 rounded-2xl"></div>

                    {/* Icon and text */}
                    <div className="relative flex items-center justify-center space-x-4">
                      <span className="text-3xl">
                        {index === 0 ? '🏠' : index === 1 ? '👨‍💻' : index === 2 ? '🚀' : index === 3 ? '⚡' : '📧'}
                      </span>
                      <span className="text-xl">{item.label}</span>
                    </div>

                    {/* Active indicator */}
                    {activeIndex === index && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Close instruction */}
              <div className="mt-8 pt-6 border-t border-gray-600/30">
                <p className="text-gray-400 text-sm text-center">Tap anywhere outside to close</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GooeyNav;
