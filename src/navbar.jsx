function Navbar() {
  return (
    <nav className="bg-blue-950 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Portfolio</div>
        <div className="hidden md:flex space-x-6">
          <a href="#home" className="text-white hover:text-yellow-200 transition">Home</a>
          <a href="#about" className="text-white hover:text-yellow-200 transition">About</a>
          <a href="#projects" className="text-white hover:text-yellow-200 transition">Projects</a>
          <a href="#skills" className="text-white hover:text-yellow-200 transition">Skills</a>
          <a href="#contact" className="text-white hover:text-yellow-200 transition">Contact</a>
        </div>
        <div className="md:hidden">
          {/* Mobile menu button */}
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;