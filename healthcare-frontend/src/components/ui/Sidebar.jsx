import { NavLink } from "react-router-dom";
import { menuConfig } from "../../utils/menuConfig";

export default function Sidebar({ role, isOpen, setIsOpen }) {
  const menuItems = menuConfig[role] || [];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r shadow-2xl p-6 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-blue-600">
          MediClaim
        </h2>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <nav className="space-y-3">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
