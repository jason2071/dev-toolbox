import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./shell/Layout";
import { tools, toolPath } from "./registry";

// Routes are generated from the registry: one <Route> per tool. The index
// redirects to the first registered tool.
export function App() {
  const first = tools[0];
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={first ? <Navigate to={toolPath(first.id)} replace /> : <Empty />}
        />
        {tools.map(({ id, Page }) => (
          <Route key={id} path={`tools/${id}`} element={<Page />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function Empty() {
  return <p className="text-slate-500">No tools registered.</p>;
}

function NotFound() {
  return <p className="text-slate-500">Tool not found.</p>;
}
