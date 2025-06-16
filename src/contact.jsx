import useScrollAnimation from './useScrollAnimation';
import { useState, useEffect } from 'react';
import { submitContactForm } from './supabaseClient';

function Contact() {
  const [titleRef, titleVisible] = useScrollAnimation('contact');
  const [cardsRef, cardsVisible] = useScrollAnimation('contact');
  const [formRef, formVisible] = useScrollAnimation('contact');

  const [activeCard, setActiveCard] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'General Inquiry'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);



  // Contact methods with interactive cards
  const contactMethods = [
    {
      id: 'email',
      title: 'Email Me',
      subtitle: 'Quick Response',
      description: 'Send me an email and I\'ll respond within 24 hours',
      icon: '📧',
      value: 'kyemdaniel23@gmail.com',
      action: 'mailto:kyemdaniel23@gmail.com',
      color: 'from-blue-500 to-cyan-500',
      bgPattern: 'radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%)'
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      subtitle: 'Professional Network',
      description: 'Connect with me on LinkedIn for professional opportunities',
      icon: '💼',
      value: 'linkedin.com/feed',
      action: 'https://www.linkedin.com/feed/',
      color: 'from-indigo-500 to-purple-500',
      bgPattern: 'radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)'
    },
    {
      id: 'github',
      title: 'GitHub',
      subtitle: 'Code Repository',
      description: 'Check out my projects and contribute to open source',
      icon: '💻',
      value: 'github.com/dsfweqdwqadqq3w433w54',
      action: 'https://github.com/dsfweqdwqadqq3w433w54',
      color: 'from-gray-600 to-gray-800',
      bgPattern: 'radial-gradient(circle at 50% 50%, #4b5563 0%, transparent 50%)'
    },
    {
      id: 'phone',
      title: 'Call Me',
      subtitle: 'Direct Discussion',
      description: 'Call me directly to discuss your project in detail',
      icon: '📞',
      value: '0599739719',
      action: 'tel:0599739719',
      color: 'from-green-500 to-emerald-500',
      bgPattern: 'radial-gradient(circle at 70% 30%, #10b981 0%, transparent 50%)'
    }
  ];

  // Auto-rotate contact cards
  useEffect(() => {
    if (cardsVisible) {
      const interval = setInterval(() => {
        setActiveCard((prev) => (prev + 1) % contactMethods.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [cardsVisible, contactMethods.length]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: formData.subject
      });

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', subject: 'General Inquiry' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);

      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }
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
              transform: scale(0.8) rotate(-5deg);
              opacity: 0;
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }

          @keyframes slideInUp {
            0% {
              transform: translateY(100px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
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
            transform: scale(0.8) rotate(-5deg);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-scale-in.visible {
            animation: scaleIn 0.8s ease-out forwards;
          }

          .animate-slide-up {
            opacity: 0;
            transform: translateY(100px);
            transition: opacity 0.1s ease, transform 0.1s ease;
          }

          .animate-slide-up.visible {
            animation: slideInUp 1s ease-out forwards;
          }

          .contact-card-active {
            animation: pulse 2s infinite;
          }
        `}
      </style>

      <section id="contact" className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 md:pt-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #fbbf24 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 50%)
            `
          }}></div>
        </div>

        <div className="w-screen max-w-none px-0 sm:px-4 relative z-10" style={{ width: '100vw' }}>
          <h2
            ref={titleRef}
            className={`text-xl sm:text-2xl lg:text-4xl font-bold text-center mb-4 sm:mb-8 lg:mb-16 animate-fade-in-up ${titleVisible ? 'visible' : ''}`}
          >
            Let's Work Together
          </h2>

          {/* Interactive Contact Cards */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
            <div
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {contactMethods.map((method, index) => (
                <div
                  key={method.id}
                  className={`relative group cursor-pointer animate-scale-in ${cardsVisible ? 'visible' : ''} ${
                    activeCard === index ? 'contact-card-active' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  onClick={() => {
                    if (method.action.startsWith('http')) {
                      window.open(method.action, '_blank');
                    } else if (method.action.startsWith('mailto')) {
                      window.location.href = method.action;
                    } else {
                      document.querySelector('#contact-form')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                    <div className="absolute inset-0 rounded-xl opacity-20" style={{
                      background: method.bgPattern
                    }}></div>

                    <div className="relative z-10">
                      <div className="text-4xl mb-4">{method.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                      <p className="text-sm text-white/70 mb-3">{method.subtitle}</p>
                      <p className="text-white/90 text-sm mb-4">{method.description}</p>
                      <p className="text-xs text-white/60 font-mono">{method.value}</p>
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Contact Form */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div
              ref={formRef}
              id="contact-form"
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 lg:p-12 border border-white/20 animate-slide-up ${formVisible ? 'visible' : ''}`}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Send Me a Message</h3>
                <p className="text-white/80">Have a project in mind? Let's discuss how we can work together.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300 placeholder-white/50"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300 placeholder-white/50"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300 text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}
                  >
                    <option value="General Inquiry" style={{ backgroundColor: '#1f2937', color: 'white' }}>General Inquiry</option>
                    <option value="Project Collaboration" style={{ backgroundColor: '#1f2937', color: 'white' }}>Project Collaboration</option>
                    <option value="Job Opportunity" style={{ backgroundColor: '#1f2937', color: 'white' }}>Job Opportunity</option>
                    <option value="Freelance Work" style={{ backgroundColor: '#1f2937', color: 'white' }}>Freelance Work</option>
                    <option value="Other" style={{ backgroundColor: '#1f2937', color: 'white' }}>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-300 placeholder-white/50 resize-none"
                    placeholder="Tell me about your project or inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-white/20 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300">✅ Message sent successfully! I'll get back to you soon.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="text-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300">❌ Failed to send message. Please try again or contact me directly.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
