"use client";

import StaggeredMenu from "./StaggeredMenu";

export default function DashboardSidebar() {
  const menuItems = [
    {
      label: "概览",
      ariaLabel: "Go to dashboard overview",
      link: "/dashboard",
    },
    {
      label: "监控列表",
      ariaLabel: "View monitored items",
      link: "/dashboard/listings",
    },
    { label: "设置", ariaLabel: "Open settings", link: "/dashboard/settings" },
  ];

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
  ];

  return (
    <aside style={{ width: 256 }} className="h-full">
      <div style={{ height: "100vh", background: "transparent" }}>
        <StaggeredMenu
          position="left"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          changeMenuColorOnOpen={true}
          colors={["#B19EEF", "#5227FF"]}
          logoUrl="/logo.ico"
          accentColor="#ff6b6b"
          onMenuOpen={() => console.log("Menu opened")}
          onMenuClose={() => console.log("Menu closed")}
        />
      </div>
    </aside>
  );
}
