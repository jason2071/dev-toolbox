import { NavLink } from "react-router-dom";
import { tools, toolPath } from "../registry";

// Per-tool accent dot colors, by registration order.
const DOTS = ["bg-indigo-500", "bg-pink-500", "bg-emerald-500"];

// Sidebar is fully data-driven: one entry per registered tool.
export function Sidebar() {
  return (
    <nav className="border-r border-slate-200 bg-white px-3.5 py-4 shadow-sm">
      <div className="bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text px-2.5 pb-4 pt-2 text-[17px] font-extrabold tracking-tight text-transparent">
        Dev Toolbox
      </div>
      <ul className="flex flex-col gap-1">
        {tools.map((t, i) => (
          <li key={t.id}>
            <NavLink
              to={toolPath(t.id)}
              title={t.description}
              className={({ isActive }) =>
                "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition " +
                (isActive
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/35"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      "h-2 w-2 flex-none rounded-full " +
                      (isActive ? "bg-white" : DOTS[i % DOTS.length])
                    }
                  />
                  {t.name}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
