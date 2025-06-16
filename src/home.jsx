import myImage from './assets/my 1.jpg';
import CircularText from './CircularText';
import { useRef, useEffect, useState } from 'react';
import useScrollAnimation from './useScrollAnimation';

function Home() {
  const videoRef = useRef(null);
  const [textRef, textVisible] = useScrollAnimation('home');
  const [imageRef, imageVisible] = useScrollAnimation('home');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video autoplay failed:', error);
        });
      }
    }
  }, []);
  return (
    <>
      {/* Custom Animation Styles */}
      <style>
        {`
          @keyframes slideInLeft {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in-left {
            opacity: 0;
            transform: translateX(-100%);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-slide-in-left.visible {
            animation: slideInLeft 1.2s ease-out forwards;
          }

          .animate-slide-in-right {
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-slide-in-right.visible {
            animation: slideInRight 1.2s ease-out forwards;
            animation-delay: 0.3s;
          }
        `}
      </style>

      <section id="home" className="min-h-screen relative flex items-center text-white overflow-hidden pt-0 md:pt-20">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: -1 }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            minWidth: '100%',
            minHeight: '100%',
            width: '100vw',
            height: '100vh',
            zIndex: -1
          }}
          onError={(e) => {
            console.error('Video error:', e);
            console.error('Video error details:', e.target.error);
          }}
        >
          <source src="/kyem.mp4" type="video/mp4" />
          <source src="/osei.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Reduced Black Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" style={{ zIndex: 1 }}></div>



      {/* Content */}
      <div className="w-screen max-w-none px-0 sm:px-4 relative" style={{ zIndex: 10, width: '100vw' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-[80vh] lg:min-h-auto max-w-7xl mx-auto">
          {/* Text Content */}
          <div
            ref={textRef}
            className={`order-2 lg:order-1 text-center w-full animate-slide-in-right ${textVisible ? 'visible' : ''}`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight break-words">
              Hi, I'm <span className="text-yellow-400">Daniel</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 lg:mb-6 text-gray-200">
              Full Stack Developer & Problem Solver
            </p>
            <p className="text-sm sm:text-base lg:text-lg mb-6 lg:mb-8 text-gray-300 max-w-full lg:max-w-lg mx-auto lg:mx-0">
              Passionate about creating innovative solutions and bringing ideas to life through clean, efficient code.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('navigateToSection', { detail: { sectionId: 'projects' } }));
                  window.location.hash = '#projects';
                  setTimeout(() => {
                    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-yellow-300 transition text-center text-sm sm:text-base w-full sm:w-auto"
              >
                View My Work
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('navigateToSection', { detail: { sectionId: 'contact' } }));
                  window.location.hash = '#contact';
                  setTimeout(() => {
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className="border-2 border-yellow-400 text-yellow-400 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition text-center text-sm sm:text-base w-full sm:w-auto"
              >
                Get In Touch
              </a>
            </div>
          </div>

          {/* Image */}
          <div
            ref={imageRef}
            className={`order-1 lg:order-2 flex justify-center items-center mb-6 lg:mb-0 w-full animate-slide-in-left ${imageVisible ? 'visible' : ''}`}
          >
            <div className="relative flex items-center justify-center w-full max-w-sm mx-auto">
              {/* Circular Text - Responsive sizing that fits all phones */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 'min(80vw, 320px)',
                  height: 'min(80vw, 320px)',
                  maxWidth: '320px',
                  maxHeight: '320px',
                  zIndex: 30
                }}
              >
                <CircularText
                  text="FULL STACK DEVELOPER • REACT • NODE.JS • "
                  onHover="speedUp"
                  spinDuration={25}
                  className="w-full h-full pointer-events-auto"
                />

                {/* Profile Image - Responsive and visible on all phones */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
                  <div className="relative">
                    <div
                      className="rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                      style={{
                        width: 'min(60vw, 240px)',
                        height: 'min(60vw, 240px)',
                        maxWidth: '240px',
                        maxHeight: '240px'
                      }}
                      onClick={openImageModal}
                      title="Click to view larger image"
                    >
                      <img
                        src={myImage}
                        alt="Daniel - Full Stack Developer"
                        className="w-full h-full object-cover object-center"
                        style={{
                          objectPosition: 'center center',
                          transform: 'scale(1.05)',
                          transformOrigin: 'center center'
                        }}
                      />
                    </div>

                    {/* Decorative elements with emojis - Positioned close to the image but outside overflow */}
                    <div
                      className="absolute bg-yellow-400 rounded-full opacity-40 flex items-center justify-center"
                      style={{
                        top: '0.5rem',
                        right: '0.5rem',
                        width: 'min(15vw, 80px)',
                        height: 'min(15vw, 80px)',
                        zIndex: 25
                      }}
                    >
                      <span className="text-2xl md:text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                        🤪
                      </span>
                    </div>
                    <div
                      className="absolute bg-blue-500 rounded-full opacity-40 flex items-center justify-center"
                      style={{
                        bottom: '0.5rem',
                        left: '0.5rem',
                        width: 'min(12vw, 64px)',
                        height: 'min(12vw, 64px)',
                        zIndex: 25
                      }}
                    >
                      <span className="text-xl md:text-2xl animate-pulse">
                        🥰
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Image Modal */}
    {isImageModalOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        onClick={closeImageModal}
      >
        <div className="relative max-w-4xl max-h-full">
          {/* Close button */}
          <button
            onClick={closeImageModal}
            className="absolute -top-12 right-0 text-white text-2xl hover:text-yellow-400 transition-colors duration-300 z-10"
            aria-label="Close image"
          >
            ✕
          </button>

          {/* Large image */}
          <div className="relative">
            <img
              src={myImage}
              alt="Daniel - Full Stack Developer (Large View)"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-center font-semibold">Daniel - Full Stack Developer</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Home;
