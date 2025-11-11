// App.jsx
import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { CourseDetailPage } from './components/CourseDetailPage';
import { WriteGuidanceModal } from './components/WriteGuidanceModal';
import { MyWishlistPage } from './components/MyWishlistPage';
import { UserProfilePage } from './components/UserProfilePage';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentPage('search');
    }
  };

  const handleCourseClick = (courseCode) => {
    setSelectedCourse(courseCode);
    setCurrentPage('course');
  };

  const handleWishlistClick = () => {
    setCurrentPage('wishlist');
  };

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handleLogoClick = () => {
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onCourseClick={handleCourseClick} onSearch={handleSearch} />;
      case 'search':
        return (
          <SearchResultsPage
            searchQuery={searchQuery}
            onCourseClick={handleCourseClick}
          />
        );
      case 'course':
        return (
          <CourseDetailPage
            courseCode={selectedCourse || 'CS101'}
            onWriteGuidanceClick={() => setIsWriteModalOpen(true)}
          />
        );
      case 'wishlist':
        return <MyWishlistPage onCourseClick={handleCourseClick} />;
      case 'profile':
        return <UserProfilePage onCourseClick={handleCourseClick} />;
      default:
        return <HomePage onCourseClick={handleCourseClick} onSearch={handleSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearchChange={handleSearch}
        onWishlistClick={handleWishlistClick}
        onProfileClick={handleProfileClick}
        onLogoClick={handleLogoClick}
      />

      {renderPage()}

      <WriteGuidanceModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        courseCode={selectedCourse || 'CS101'}
        courseName="Introduction to Computer Science"
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="mb-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
                CourseReviewHub
              </h4>
              <p className="text-gray-600">
                แพลตฟอร์มแนะนำรายวิชาแบบ Peer-to-Peer 
                เพื่อนักศึกษาโดยนักศึกษา
              </p>
            </div>

            <div>
              <h5 className="mb-3">เมนู</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <button 
                    onClick={handleLogoClick}
                    className="hover:text-[#6C5CE7] transition-colors"
                  >
                    หน้าแรก
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('search')}
                    className="hover:text-[#6C5CE7] transition-colors"
                  >
                    ค้นหาวิชา
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleWishlistClick}
                    className="hover:text-[#6C5CE7] transition-colors"
                  >
                    รายการที่บันทึกไว้
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="mb-3">ช่วยเหลือ</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-[#6C5CE7] transition-colors">
                    วิธีใช้งาน
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C5CE7] transition-colors">
                    คำถามที่พบบ่อย
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C5CE7] transition-colors">
                    ติดต่อเรา
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>© 2025 CourseReviewHub. สร้างด้วย ❤️ เพื่อนักศึกษา</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
