import { NavLink } from "react-router-dom";
import { tools, toolPath } from "../registry";

// Sidebar is fully data-driven: it renders one entry per registered tool.
export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="brand">Dev Toolbox</div>
      <ul>
        {tools.map((t) => (
          <li key={t.id}>
            <NavLink
              to={toolPath(t.id)}
              className={({ isActive }) => (isActive ? "active" : "")}
              title={t.description}
            >
              {t.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
