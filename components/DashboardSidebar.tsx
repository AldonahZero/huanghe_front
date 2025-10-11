"use client";

import StaggeredMenu from "./StaggeredMenu";

export default function DashboardSidebar() {
  const menuItems = [
    {
      label: "概览",
      ariaLabel: "进入 概览",
      link: "/dashboard",
    },
    {
      label: "个人页面",
      ariaLabel: "打开 个人页面",
      link: "/dashboard/profile",
    },
    { label: "设置", ariaLabel: "打开 设置", link: "/dashboard/settings" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
  ];

  return (
    <>
      {/* Desktop / large screens: fixed sidebar */}
      <aside
        style={{ width: 320 }}
        className="h-full hidden md:block overflow-hidden"
        aria-hidden={false}
      >
        <div style={{ height: "100vh", background: "transparent" }}>
          <StaggeredMenu
            className="staggered-menu--sidebar"
            position="left"
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#161515ff"
            openMenuButtonColor="#212020ff020ff"
            changeMenuColorOnOpen={true}
            colors={["#B19EEF", "#5227FF"]}
            logoUrl="/logo.ico"
            accentColor="#ff6b6b"
            onMenuOpen={() => {
              console.log("Menu opened");
              try {
                document.body.classList.add("sidebar-open");
              } catch (e) {}
            }}
            onMenuClose={() => {
              console.log("Menu closed");
              try {
                document.body.classList.remove("sidebar-open");
              } catch (e) {}
            }}
          />
        </div>
      </aside>

      {/* Mobile: floating menu button (overlay) */}
      <div className="md:hidden">
        <div className="fixed bottom-2 right-4 z-50">
          <StaggeredMenu
            position="right"
            items={menuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#262424ff"
            openMenuButtonColor="#262525ff"
            changeMenuColorOnOpen={true}
            colors={["#B19EEF", "#5227FF"]}
            logoUrl="/logo.ico"
            accentColor="#ff6b6b"
            onMenuOpen={() => console.log("Mobile menu opened")}
            onMenuClose={() => console.log("Mobile menu closed")}
            isFixed={true}
            className="sm-mobile-floating"
          />
        </div>
      </div>
    </>
  );
}
