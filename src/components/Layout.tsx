
import React from "react";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-mi-neutral">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default Layout;
