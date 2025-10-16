"use client";

import { useAuth } from "@/contexts/AuthContext";
import StaggeredMenu from "./StaggeredMenu";

export default function DashboardSidebar() {
  const { user } = useAuth();

  // 基础菜单项
  const baseMenuItems = [
    {
      label: "概览",
      ariaLabel: "进入 概览",
      link: "/dashboard",
    },
    {
      label: "全息令牌",
      ariaLabel: "查看 全息令牌",
      link: "/dashboard/profile",
    },
    {
      label: "个人信息",
      ariaLabel: "管理 个人信息",
      link: "/dashboard/account",
    },
  ];

  // 分角色菜单项（方便后续扩展老师/会员的不同入口）
  const isPrivileged = user?.role === "admin" || user?.role === "teacher";
  const privilegedMenuItems = [
    {
      label: "团队管理",
      ariaLabel: "管理 团队",
      link: "/dashboard/teams",
    },
    // 未来可在此追加更多管理员/老师专属菜单项
  ];

  const memberMenuItems = [
    {
      label: "查看团队",
      ariaLabel: "查看 团队",
      link: "/dashboard/teams",
    },
    // 未来可在此追加更多会员专属菜单项
  ];

  const settingsItem = {
    label: "设置",
    ariaLabel: "打开 设置",
    link: "/dashboard/settings",
  };

  // 组合菜单项
  const menuItems = [
    ...baseMenuItems,
    ...(user ? (isPrivileged ? privilegedMenuItems : memberMenuItems) : []),
    settingsItem,
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
