import { NavLink } from "react-router-dom";
import { menuConfig } from "../../utils/menuConfig";

export default function Sidebar({ role }) {
  const menuItems = menuConfig[role] || [];

  return (
    <div className="w-64 h-screen bg-white border-r shadow-sm p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-8">
        MediClaim
      </h2>

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
