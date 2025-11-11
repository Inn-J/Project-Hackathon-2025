import { Search, Bookmark, User } from 'lucide-react';

interface HeaderProps {
  onSearchChange?: (value: string) => void;
  onWishlistClick?: () => void;
  onProfileClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({ onSearchChange, onWishlistClick, onProfileClick, onLogoClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <button 
            onClick={onLogoClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <h1 className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              CourseReviewHub
            </h1>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาวิชาที่ใช่…"
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onWishlistClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <Bookmark className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={onProfileClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Profile"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
