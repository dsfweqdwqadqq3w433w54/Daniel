import useScrollAnimation from './useScrollAnimation';
import { useState, useEffect } from 'react';

function Skills() {
  const [titleRef, titleVisible] = useScrollAnimation('skills');
  const [skillsRef, skillsVisible] = useScrollAnimation('skills');
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Different approach: Circular skill indicators with real tech logos
  const skills = [
    {
      name: "React",
      level: 90,
      icon: "⚛️", // This is the actual React logo symbol
      color: "#61DAFB",
      category: "Frontend"
    },
    {
      name: "JavaScript",
      level: 85,
      icon: "JS", // Text-based logo
      color: "#F7DF1E",
      category: "Frontend"
    },
    {
      name: "Node.js",
      level: 80,
      icon: "⬢", // Hexagon shape representing Node.js
      color: "#339933",
      category: "Backend"
    },
    {
      name: "Python",
      level: 75,
      icon: "🐍", // Python snake is the official logo
      color: "#3776AB",
      category: "Backend"
    },
    {
      name: "MongoDB",
      level: 75,
      icon: "🍃", // Leaf represents MongoDB's logo
      color: "#47A248",
      category: "Database"
    },
    {
      name: "Git",
      level: 90,
      icon: "⎇", // Git branch symbol
      color: "#F05032",
      category: "Tools"
    },
    {
      name: "Docker",
      level: 65,
      icon: "🐳", // Whale is Docker's official mascot
      color: "#2496ED",
      category: "Tools"
    },
    {
      name: "AWS",
      level: 60,
      icon: "☁️", // Cloud represents AWS
      color: "#FF9900",
      category: "Cloud"
    },
    {
      name: "TypeScript",
      level: 75,
      icon: "TS", // Text-based logo
      color: "#3178C6",
      category: "Frontend"
    },
    {
      name: "Tailwind CSS",
      level: 80,
      icon: "💨", // Wind represents Tailwind
      color: "#06B6D4",
      category: "Frontend"
    },
    {
      name: "Express.js",
      level: 85,
      icon: "E", // Express logo representation
      color: "#000000",
      category: "Backend"
    },
    {
      name: "PostgreSQL",
      level: 70,
      icon: "🐘", // Elephant is PostgreSQL's official mascot
      color: "#336791",
      category: "Database"
    }
  ];

  // Circular progress component
  const CircularProgress = ({ skill, isVisible, delay }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          setProgress(skill.level);
        }, delay);
        return () => clearTimeout(timer);
      }
    }, [isVisible, skill.level, delay]);

    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        className="relative w-32 h-32 mx-auto cursor-pointer transform transition-all duration-300 hover:scale-110"
        onMouseEnter={() => setHoveredSkill(skill.name)}
        onMouseLeave={() => setHoveredSkill(null)}
      >
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={skill.color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: hoveredSkill === skill.name ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none'
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`mb-1 flex items-center justify-center ${
            skill.icon.length <= 2
              ? 'text-xl font-bold text-gray-800'
              : 'text-3xl'
          }`}>
            {skill.icon}
          </div>
          <div className="text-lg font-bold text-gray-800">{progress}%</div>
        </div>

        {/* Skill name */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{skill.name}</p>
          <p className="text-xs text-gray-500">{skill.category}</p>
        </div>
      </div>
    );
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

          @keyframes scaleIn {
            0% {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            100% {
              transform: scale(1) rotate(0deg);
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

          .animate-scale-in {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-scale-in.visible {
            animation: scaleIn 0.8s ease-out forwards;
          }
        `}
      </style>

      <section id="skills" className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20 md:pt-32">
        <div className="w-screen max-w-none px-0 sm:px-4" style={{ width: '100vw' }}>
          <h2
            ref={titleRef}
            className={`text-xl sm:text-2xl lg:text-4xl font-bold text-center mb-4 sm:mb-8 lg:mb-16 text-gray-800 animate-fade-in-up ${titleVisible ? 'visible' : ''}`}
          >
            Skills & Technologies
          </h2>

          {/* Skills Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div
              ref={skillsRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 sm:gap-12 lg:gap-16"
            >
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={`animate-scale-in ${skillsVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CircularProgress
                    skill={skill}
                    isVisible={skillsVisible}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Skill Categories Legend */}
          <div className="max-w-4xl mx-auto mt-16 px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Frontend', 'Backend', 'Database', 'Tools', 'Cloud'].map((category, index) => (
                <div
                  key={category}
                  className="text-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                  <div className="flex flex-wrap justify-center gap-1">
                    {skills
                      .filter(skill => skill.category === category)
                      .map(skill => (
                        <span
                          key={skill.name}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {skill.icon}
                        </span>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Skills;
