import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bell,
  MessageSquare,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Gavel,
  Scale,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

const Navbar = ({ variant = "landing" }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine variant based on authentication state if not explicitly provided
  const actualVariant =
    variant === "landing" && isAuthenticated ? "dashboard" : variant;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const landingNavItems = [
    { href: "/how-it-works", label: "How It Works", icon: Scale },
    { href: "/about", label: "About Us", icon: Shield },
    { href: "/features", label: "Features", icon: Gavel },
  ];

  const dashboardNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: FileText },
    { href: "/how-it-works", label: "How It Works", icon: Scale },
    { href: "/about", label: "About", icon: Shield },
    { href: "/features", label: "Features", icon: Gavel },
  ];

  const navItems =
    actualVariant === "landing" ? landingNavItems : dashboardNavItems;

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to={"/"}
                className="flex items-center space-x-3 group"
                onClick={closeMobileMenu}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <img src={logo} alt="Lawra Logo" className="w-6 h-6" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    Lawra
                  </span>
                  <span className="text-xs text-slate-500 font-medium -mt-1">
                    Legal Contracts
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-slate-100 text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {actualVariant === "landing" && !isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </Button>

                  {/* AI Assistant */}
                  <Link to="/ai-assistant">
                    <Button variant="ghost" size="sm" className="space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden xl:inline">AI Assistant</span>
                    </Button>
                  </Link>

                  {/* New Contract */}
                  <Link to="/create-contract">
                    <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 space-x-2">
                      <Plus className="w-4 h-4" />
                      <span className="hidden xl:inline">New Contract</span>
                    </Button>
                  </Link>

                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full hover:bg-slate-100"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-slate-200 hover:ring-slate-300 transition-all">
                          <AvatarImage
                            src={user?.avatar}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        {user?.enabled && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Shield className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-64 p-2"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.avatar}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          {user?.name && (
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {user.name}
                            </p>
                          )}
                          {user?.email && (
                            <p className="text-xs text-slate-500 truncate">
                              {user.email}
                            </p>
                          )}
                          {user?.enabled && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 p-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 p-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50 p-2"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40">
            <div className="bg-white border-b border-slate-200 shadow-xl">
              <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-slate-100 text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile User Section */}
                {isAuthenticated ? (
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4">
                      <Avatar className="h-12 w-12 ring-2 ring-slate-200">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {user?.name && (
                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>
                        )}
                        {user?.email && (
                          <p className="text-sm text-slate-500">{user.email}</p>
                        )}
                        {user?.enabled && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="space-y-3 px-4">
                      <Link to="/create-contract" onClick={closeMobileMenu}>
                        <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg justify-start space-x-3">
                          <Plus className="w-5 h-5" />
                          <span>New Contract</span>
                        </Button>
                      </Link>

                      <div className="grid grid-cols-2 gap-3">
                        <Link to="/ai-assistant" onClick={closeMobileMenu}>
                          <Button
                            variant="outline"
                            className="w-full justify-start space-x-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>AI Assistant</span>
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          className="w-full justify-start space-x-2 relative"
                        >
                          <Bell className="w-4 h-4" />
                          <span>Notifications</span>
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Link to="/profile" onClick={closeMobileMenu}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start space-x-2"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Button>
                        </Link>

                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-6 space-y-3 px-4">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg justify-center">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
