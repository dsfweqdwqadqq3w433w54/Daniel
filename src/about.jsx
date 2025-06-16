import myImage from './assets/my 3.jpg'
import useScrollAnimation from './useScrollAnimation';
import { useState } from 'react';

function About() {
  const [titleRef, titleVisible] = useScrollAnimation('about');
  const [imageRef, imageVisible] = useScrollAnimation('about');
  const [contentRef, contentVisible] = useScrollAnimation('about');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);
  return (
    <>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeInUp {
            0% {
              transform: translateY(50px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes slideInLeft {
            0% {
              transform: translateX(-100px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInRight {
            0% {
              transform: translateX(100px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-fade-in-up {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-fade-in-up.visible {
            animation: fadeInUp 1s ease-out forwards;
          }

          .animate-slide-in-left {
            opacity: 0;
            transform: translateX(-100px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-slide-in-left.visible {
            animation: slideInLeft 1.2s ease-out forwards;
            animation-delay: 0.3s;
          }

          .animate-slide-in-right {
            opacity: 0;
            transform: translateX(100px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-slide-in-right.visible {
            animation: slideInRight 1.2s ease-out forwards;
            animation-delay: 0.6s;
          }
        `}
      </style>

      <section id="about" className="min-h-screen bg-gray-100 py-32 md:pt-48">
      <div className="w-screen max-w-none px-0 sm:px-4" style={{ width: '100vw' }}>
        <h2
          ref={titleRef}
          className={`text-xl sm:text-2xl lg:text-4xl font-bold text-center mb-4 sm:mb-8 lg:mb-12 text-gray-800 animate-fade-in-up ${titleVisible ? 'visible' : ''}`}
        >
          About Me
        </h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-0">
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8 lg:gap-16 items-start">
            {/* Profile Image - Larger and more prominent */}
            <div
              ref={imageRef}
              className={`lg:col-span-2 flex justify-center w-full animate-slide-in-left ${imageVisible ? 'visible' : ''}`}
            >
              <div className="relative w-full max-w-sm lg:max-w-none">
                <div
                  className="w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] rounded-3xl overflow-hidden shadow-2xl mx-auto cursor-pointer"
                  onClick={openImageModal}
                  title="Click to view larger image"
                >
                  <img
                    src={myImage}
                    alt="Daniel - About Me"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Enhanced decorative elements with emojis */}
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl -z-10 opacity-20 blur-lg"></div>
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400 rounded-full opacity-30 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>
                    🤪
                  </span>
                </div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-blue-400 rounded-full opacity-30 flex items-center justify-center">
                  <span className="text-xl md:text-2xl animate-pulse">
                    🥰
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className={`lg:col-span-3 space-y-8 animate-slide-in-right ${contentVisible ? 'visible' : ''}`}
            >
              <div className="about-mobile-text">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Who I Am</h3>
                <p className="text-gray-600 mb-6 text-xl leading-relaxed">
                  I'm a passionate full-stack developer with a love for creating innovative solutions
                  and bringing ideas to life through code. With experience in modern web technologies,
                  I enjoy tackling complex problems and building user-friendly applications.
                </p>
                <p className="text-gray-600 mb-8 text-xl leading-relaxed">
                  When I'm not coding, you can find me exploring new technologies, contributing to
                  open-source projects, or enjoying outdoor activities. I believe in continuous
                  learning and staying up-to-date with the latest industry trends.
                </p>

                {/* Skills Tags */}
                <div className="mb-6 sm:mb-10">
                  <h4 className="text-xl font-semibold mb-4 text-gray-800">Core Technologies</h4>
                  <div className="flex flex-wrap gap-3 about-mobile-tags">
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">JavaScript</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">React</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">Node.js</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">Python</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">TypeScript</span>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">MongoDB</span>
                  </div>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Quick Facts</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">🎓</span>
                      Computer Science Graduate
                    </li>
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">💼</span>
                      3+ Years of Development Experience
                    </li>
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">🌍</span>
                      Remote Developer
                    </li>
                  </ul>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">☕</span>
                      Coffee Enthusiast
                    </li>
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">🎮</span>
                      Gaming & Tech Lover
                    </li>
                    <li className="flex items-center">
                      <span className="text-2xl mr-3">🚀</span>
                      Always Learning
                    </li>
                  </ul>
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
              alt="Daniel - About Me (Large View)"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-center font-semibold">Daniel - About Me</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default About;
