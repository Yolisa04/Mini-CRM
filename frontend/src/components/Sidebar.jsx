import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Leads', to: '/leads', icon: UsersIcon },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold">CRM</div>
      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
