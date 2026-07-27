import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span>{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
