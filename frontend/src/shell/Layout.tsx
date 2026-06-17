import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

// Layout is the persistent shell: sidebar on the left, active tool page on
// the right via <Outlet/>.
export function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
