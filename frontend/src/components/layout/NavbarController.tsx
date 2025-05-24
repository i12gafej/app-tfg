import { useAuth } from '@/context/auth.context';
import PublicNavbar from './PublicNavbar';
import UserNavbar from './UserNavbar';
import AdminNavbar from './AdminNavbar';

const NavbarController = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <PublicNavbar />;
  }

  if (user?.admin) {
    return <AdminNavbar />;
  }

  return <UserNavbar />;
};

export default NavbarController; 
 
 
 
 
 