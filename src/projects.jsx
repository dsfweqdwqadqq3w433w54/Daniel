import React, { useState, useEffect } from 'react';
import useScrollAnimation from './useScrollAnimation';

// Import project images
import ecommerceImage from './assets/E-Commerce Platform.jpeg';
import taskManagementImage from './assets/Task Management App.jpeg';
import weatherDashboardImage from './assets/Weather Dashboard.jpeg';

function Projects() {
  const [titleRef, titleVisible] = useScrollAnimation('projects');
  const [projectsRef, projectsVisible] = useScrollAnimation('projects');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeProject, setActiveProject] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const openImageModal = (image, title) => setSelectedImage({ image, title });
  const closeImageModal = () => setSelectedImage(null);

  // Enhanced project data with more details
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      subtitle: "Full-Stack Shopping Solution",
      description: "A comprehensive e-commerce platform featuring user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Built with modern technologies for optimal performance.",
      longDescription: "This project showcases a complete e-commerce ecosystem with features like user registration/login, product browsing with filters, shopping cart functionality, secure payment processing, order tracking, and a comprehensive admin panel for inventory management.",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe", "JWT"],
      image: ecommerceImage,
      github: "https://github.com/yourusername/ecommerce-platform",
      demo: "https://your-ecommerce-demo.netlify.app",
      status: "Completed",
      duration: "3 months",
      features: ["User Authentication", "Payment Integration", "Admin Dashboard", "Responsive Design"],
      color: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Task Management App",
      subtitle: "Collaborative Productivity Tool",
      description: "A real-time collaborative task management application with team features, project organization, deadline tracking, and instant notifications. Perfect for remote teams.",
      longDescription: "Built for modern teams, this application provides real-time collaboration features including task assignment, progress tracking, team chat, file sharing, and comprehensive project analytics with beautiful data visualizations.",
      technologies: ["React", "Socket.io", "PostgreSQL", "Tailwind CSS", "Redis", "Docker"],
      image: taskManagementImage,
      github: "https://github.com/yourusername/task-management",
      demo: "https://your-task-app-demo.netlify.app",
      status: "In Progress",
      duration: "2 months",
      features: ["Real-time Updates", "Team Collaboration", "File Sharing", "Analytics Dashboard"],
      color: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      title: "Weather Dashboard",
      subtitle: "Smart Weather Analytics",
      description: "An intelligent weather application providing detailed forecasts, historical data analysis, weather maps, and personalized alerts. Features beautiful data visualizations.",
      longDescription: "This weather dashboard combines multiple weather APIs to provide comprehensive weather information including 7-day forecasts, hourly predictions, weather maps, air quality data, and personalized weather alerts based on user preferences.",
      technologies: ["JavaScript", "Chart.js", "Weather API", "CSS3", "LocalStorage", "PWA"],
      image: weatherDashboardImage,
      github: "https://github.com/yourusername/weather-dashboard",
      demo: "https://your-weather-demo.netlify.app",
      status: "Completed",
      duration: "1 month",
      features: ["Weather Maps", "7-Day Forecast", "Air Quality", "PWA Support"],
      color: "from-orange-500 to-red-600"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && projectsVisible) {
      const interval = setInterval(() => {
        setActiveProject((prev) => (prev + 1) % projects.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, projectsVisible, projects.length]);

  const nextProject = () => {
    setActiveProject((prev) => (prev + 1) % projects.length);
    setIsAutoPlaying(false);
  };

  const prevProject = () => {
    setActiveProject((prev) => (prev - 1 + projects.length) % projects.length);
    setIsAutoPlaying(false);
  };

  const selectProject = (index) => {
    setActiveProject(index);
    setIsAutoPlaying(false);
  };

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

          @keyframes staggerFadeIn {
            0% {
              transform: translateY(30px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
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

          .animate-stagger-1 {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-stagger-1.visible {
            animation: staggerFadeIn 0.8s ease-out forwards;
            animation-delay: 0.2s;
          }

          .animate-stagger-2 {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-stagger-2.visible {
            animation: staggerFadeIn 0.8s ease-out forwards;
            animation-delay: 0.4s;
          }

          .animate-stagger-3 {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-stagger-3.visible {
            animation: staggerFadeIn 0.8s ease-out forwards;
            animation-delay: 0.6s;
          }
        `}
      </style>

      <section id="projects" className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 md:pt-32 text-white">
        <div className="w-screen max-w-none px-0 sm:px-4" style={{ width: '100vw' }}>
          <h2
            ref={titleRef}
            className={`text-xl sm:text-2xl lg:text-4xl font-bold text-center mb-4 sm:mb-8 lg:mb-16 text-white animate-fade-in-up ${titleVisible ? 'visible' : ''}`}
          >
            Featured Projects
          </h2>

          {/* Main Project Showcase */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div ref={projectsRef} className="relative">
              {/* Project Carousel */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r shadow-2xl" style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                '--tw-gradient-from': projects[activeProject].color.includes('blue') ? '#3b82f6' :
                                     projects[activeProject].color.includes('green') ? '#10b981' : '#f59e0b',
                '--tw-gradient-to': projects[activeProject].color.includes('blue') ? '#8b5cf6' :
                                   projects[activeProject].color.includes('green') ? '#06b6d4' : '#ef4444'
              }}>
                <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
                  {/* Project Info */}
                  <div className={`space-y-6 animate-slide-in-left ${projectsVisible ? 'visible' : ''}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          projects[activeProject].status === 'Completed'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {projects[activeProject].status}
                        </span>
                        <span className="text-white/70 text-sm">{projects[activeProject].duration}</span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-bold text-white">
                        {projects[activeProject].title}
                      </h3>
                      <p className="text-xl text-white/80 font-medium">
                        {projects[activeProject].subtitle}
                      </p>
                    </div>

                    <p className="text-white/90 text-lg leading-relaxed">
                      {projects[activeProject].longDescription}
                    </p>

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Key Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {projects[activeProject].features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-white/90 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {projects[activeProject].technologies.map((tech, index) => (
                          <span key={index} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <a
                        href={projects[activeProject].github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-lg text-center hover:bg-white/30 transition-all duration-300 font-medium"
                      >
                        View Code
                      </a>
                      <a
                        href={projects[activeProject].demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white text-gray-900 py-3 px-6 rounded-lg text-center hover:bg-gray-100 transition-all duration-300 font-medium"
                      >
                        Live Demo
                      </a>
                    </div>
                  </div>

                  {/* Project Image */}
                  <div className={`animate-slide-in-right ${projectsVisible ? 'visible' : ''}`}>
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => openImageModal(projects[activeProject].image, projects[activeProject].title)}
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
                      <img
                        src={projects[activeProject].image}
                        alt={projects[activeProject].title}
                        className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-xl group-hover:bg-black/10 transition-colors duration-300"></div>
                      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        Click to enlarge
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center mt-8 gap-4">
                <button
                  onClick={prevProject}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  ←
                </button>

                {/* Project Indicators */}
                <div className="flex gap-2">
                  {projects.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => selectProject(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === activeProject
                          ? 'bg-white scale-125'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextProject}
                  className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all duration-300"
                >
                  →
                </button>
              </div>

              {/* Auto-play Toggle */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-white/70 hover:text-white text-sm transition-colors duration-300"
                >
                  {isAutoPlaying ? '⏸️ Pause' : '▶️ Auto-play'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    {/* Image Modal */}
    {selectedImage && (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        onClick={closeImageModal}
      >
        <div className="relative max-w-6xl max-h-full">
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
              src={selectedImage.image}
              alt={`${selectedImage.title} (Large View)`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-center font-semibold">{selectedImage.title}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Projects;
