import { Package } from 'lucide-react';

function Header() {
  return (
    <header className="bg-white border-b border-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-[#C62828] p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark">Authra</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button 
                className="h-10 px-6 text-sm font-medium text-white bg-[#E95C28] 
                  rounded-md hover:bg-[#D45521] transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#E95C28]/50 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
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