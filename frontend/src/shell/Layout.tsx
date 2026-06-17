import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

// Layout is the persistent shell: sidebar on the left, active tool page on
// the right via <Outlet/>.
export function Layout() {
  return (
    <div className="grid min-h-screen grid-cols-[248px_1fr]">
      <Sidebar />
      <main className="px-11 py-9">
        <Outlet />
      </main>
    </div>
  );
}
