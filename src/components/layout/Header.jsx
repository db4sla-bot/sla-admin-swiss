import { useState } from 'react';
import { Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Business Management</h1>
        </div>
        <div className="header-right">
          <button className="header-icon-btn">
            <Bell size={20} />
          </button>
          <button className="header-icon-btn">
            <Settings size={20} />
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              className="header-profile"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User size={20} />
              <span>{user?.employeeName || 'Admin'}</span>
              <ChevronDown size={16} />
            </button>
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-name">{user?.employeeName}</div>
                  <div className="profile-email">{user?.email}</div>
                </div>
                <div className="profile-divider"></div>
                <div className="profile-access">
                  <span className="profile-label">Access Level:</span>
                  <span className={`access-badge ${user?.userAccess === 'Admin' ? 'admin' : user?.userAccess === 'Can Edit' ? 'edit' : 'view'}`}>
                    {user?.userAccess}
                  </span>
                </div>
                {user?.accessMenus && user.accessMenus.length > 0 && (
                  <>
                    <div className="profile-divider"></div>
                    <div className="profile-menus">
                      <span className="profile-label">Access to:</span>
                      <div className="menu-tags">
                        {user.accessMenus.map(menu => (
                          <span key={menu} className="menu-tag">{menu}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="profile-divider"></div>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
