import { LogOut, Upload, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-semibold text-foreground">DataLoader</h1>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={isActive('/upload') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Cargar CSV
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
              {user?.role}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
