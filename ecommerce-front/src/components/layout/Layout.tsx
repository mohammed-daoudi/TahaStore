import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingAdminButton from './FloatingAdminButton';
import FloatingShareButton from '../sharing/FloatingShareButton';
import AdminBanner from './AdminBanner';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

function Layout() {
  const { theme } = useTheme();

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header />
      <AdminBanner />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingAdminButton />
      <FloatingShareButton />
      <Toaster position="top-center" />
    </div>
  );
}

export default Layout;