import { Package } from 'lucide-react';

function Header() {
  return (
    <header className="bg-white border-b border-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="bg-[#C62828] p-3 rounded-md shadow-md flex items-center justify-center"
              aria-hidden="true"
            >
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-dark">Authra</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button
              className="h-10 px-5 text-sm font-medium text-white bg-gradient-to-br from-[#E95C28] to-[#F28A4D] \
                rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E95C28]/30 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Login"
              title="Login"
              disabled={false}
            >
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;