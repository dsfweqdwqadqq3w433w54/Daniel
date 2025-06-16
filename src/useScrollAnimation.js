import { useState, useRef, useEffect } from 'react';

// Custom hook for scroll-triggered animations
const useScrollAnimation = (sectionId, threshold = 0.2, rootMargin = '0px 0px -50px 0px') => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log(`Section ${sectionId} is visible via scroll - triggering animation`);
          setIsVisible(true);
        } else {
          console.log(`Section ${sectionId} is no longer visible - resetting for re-trigger`);
          // Reset animations when scrolling away to allow re-triggering
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, sectionId]);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigation = (event) => {
      const targetSectionId = event.detail?.sectionId;
      console.log(`Navigation event - target: ${targetSectionId}, current: ${sectionId}`);

      if (sectionId === targetSectionId) {
        console.log(`Triggering animation for section: ${sectionId}`);
        // Reset and trigger animation when navigating to this section
        setIsVisible(false);
        // Force a reflow to ensure the reset is applied
        if (ref.current) {
          ref.current.offsetHeight;
        }
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } else {
        // Reset other sections when navigating away
        setIsVisible(false);
      }
    };

    const handleScrollToSection = (event) => {
      const targetSectionId = event.detail?.sectionId;
      console.log(`Scroll-to-section event - target: ${targetSectionId}, current: ${sectionId}`);

      if (sectionId === targetSectionId) {
        console.log(`Triggering scroll-based animation for section: ${sectionId}`);
        // Reset and trigger animation when scrolling to this section
        setIsVisible(false);
        // Force a reflow to ensure the reset is applied
        if (ref.current) {
          ref.current.offsetHeight;
        }
        setTimeout(() => {
          setIsVisible(true);
        }, 50); // Slightly faster for scroll-based triggers
      }
    };

    const handleHashChange = () => {
      const currentHash = window.location.hash.substring(1);
      console.log(`Hash changed to: ${currentHash}, section: ${sectionId}`);

      if (sectionId === currentHash) {
        console.log(`Triggering animation for section: ${sectionId}`);
        // Reset and trigger animation when navigating to this section
        setIsVisible(false);
        // Force a reflow to ensure the reset is applied
        if (ref.current) {
          ref.current.offsetHeight;
        }
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } else {
        // Reset other sections when navigating away
        setIsVisible(false);
      }
    };

    // Also check on mount in case we're already on the right hash
    const currentHash = window.location.hash.substring(1);
    if (sectionId === currentHash) {
      console.log(`Initial load - triggering animation for section: ${sectionId}`);
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }

    window.addEventListener('navigateToSection', handleNavigation);
    window.addEventListener('scrollToSection', handleScrollToSection);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('navigateToSection', handleNavigation);
      window.removeEventListener('scrollToSection', handleScrollToSection);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sectionId]);

  return [ref, isVisible];
};

export default useScrollAnimation;
