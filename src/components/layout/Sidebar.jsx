import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { menuItems } from '../../constants/menuItems';
import './Sidebar.css';

const Sidebar = () => {
  const { hasAccess } = useAuth();

  // Filter menu items based on user access
  const accessibleMenus = menuItems.filter(item => hasAccess(item.menu));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">SLA Admin</h2>
      </div>
      <nav className="sidebar-nav">
        {accessibleMenus.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.path === '/'}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
