"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarMenu, SidebarItem } from "@/data/sidebarMenu";
import { ChevronDown, ChevronRight, X, Menu as MenuIcon } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenu = (menu: SidebarItem) => {
    const isActive = menu.path && pathname.startsWith(menu.path);
    const isSubMenuVisible = !openMenus[menu.title];

    return (
      <div key={menu.title} className="mb-1">
        {/* Menu Utama */}
        {menu.path && !menu.subMenu ? (
          <Link
            href={menu.path}
            className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left rounded-lg transition-all duration-200 group ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <menu.icon
                className={`mr-2 w-4 h-4 ${
                  isActive ? "text-white" : "text-primary"
                }`}
              />
              <span className="font-medium">{menu.title}</span>
            </div>
          </Link>
        ) : (
          <button
            className={`flex items-center justify-between w-full px-3 py-2 text-xs text-left rounded-lg transition-all duration-200 group ${
              isActive
                ? "bg-primary text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => menu.subMenu && toggleMenu(menu.title)}
          >
            <div className="flex items-center">
              <menu.icon
                className={`mr-2 w-4 h-4 ${
                  isActive ? "text-white" : "text-primary"
                }`}
              />
              <span className="font-medium">{menu.title}</span>
            </div>
            {menu.subMenu && (
              <div
                className={`transition-transform duration-200 ${
                  isSubMenuVisible ? "rotate-0" : "rotate-180"
                }`}
              >
                <ChevronDown
                  className={`w-3 h-3 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
              </div>
            )}
          </button>
        )}

        {/* Submenu dengan animasi */}
        {menu.subMenu && (
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isSubMenuVisible
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-3 mt-1 border-l-2 border-gray-200 pl-3 space-y-1">
              {menu.subMenu.map((sub) => {
                const isSubActive = pathname.startsWith(sub.path || "");
                return (
                  <Link
                    key={sub.title}
                    href={sub.path || "#"}
                    className={`flex items-center px-2 py-1.5 rounded-md transition-all duration-200 group ${
                      isSubActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <sub.icon
                      className={`mr-2 w-3 h-3 ${
                        isSubActive
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-primary"
                      }`}
                    />
                    <span className="text-xs">{sub.title}</span>
                    {isSubActive && (
                      <ChevronRight className="ml-auto w-3 h-3 text-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-black/10 flex items-center justify-between">
        <div>
          <Image
            src="/branding/logo.svg"
            alt="CoreQuarry Logo"
            width={128}
            height={128}
          />
          <p className="text-xs text-gray-500 mt-1">PT. Mekar Jaya Sejahtera (MekarJS)</p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
        {sidebarMenu.map((menu) => renderMenu(menu))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-black/15 rounded-lg hover:bg-gray-50"
      >
        <MenuIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col border-r border-black/10 w-64 h-screen bg-white overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white border-r border-black/15 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
