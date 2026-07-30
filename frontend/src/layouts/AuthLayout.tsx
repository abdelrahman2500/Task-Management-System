import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <header>Navbar for Auth</header>

      <aside>Sidebar</aside>

      <main>
        <Outlet />
      </main>

      <footer>Footer</footer>
    </>
  );
}
