function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div>
            <h3 className="text-2xl font-bold mb-2">Authra</h3>
            <div className="relative mb-6">
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C62828]"></div>
            </div>
            <p className="text-gray-400 mb-6">
              We are dedicated to revolutionizing automation through innovative solutions. Our mission is to empower businesses with cutting-edge automation technology.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="hover:opacity-75">
                <img src="/facebook.svg" alt="Facebook" className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" className="hover:opacity-75">
                <img src="/twitter.svg" alt="Twitter" className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" className="hover:opacity-75">
                <img src="/instagram.svg" alt="Instagram" className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" className="hover:opacity-75">
                <img src="/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
              </a>
              <a href="https://youtube.com" className="hover:opacity-75">
                <img src="/youtube.svg" alt="YouTube" className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
            <div className="relative mb-6">
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C62828]"></div>
            </div>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Solutions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Subscribe Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Contact Info</h3>
            <div className="relative mb-6">
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C62828]"></div>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center">
                <span className="mr-2">📍</span>
                Bolpur, West Bengal, India
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                +91 8101108711
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                info@example.com
              </li>
            </ul>
          </div>

          {/* Reach Us Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Location</h3>
            <div className="relative mb-6">
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C62828]"></div>
            </div>
            <div className="h-48 bg-gray-800 rounded">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.935242!3d40.730610!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40zMDA2JzEwLjIiTiA3M8KwNTYnMDYuOSJX!5e0!3m2!1sen!2sus!4v1620841264948!5m2!1sen!2sus"
                className="w-full h-full rounded"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Authra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
