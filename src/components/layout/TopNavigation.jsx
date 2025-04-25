import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, BookOpen, HeartPulse, Bell, LogOut, Users, ClipboardList, Menu, ChevronDown } from "lucide-react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/hooks/use-media-query";

const TopNavigation = ({ userRole = "employee" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      {
        name: "Profile",
        href: "/profile",
        icon: <User className="h-4 w-4 mr-2" />,
      },
      {
        name: "Find Mentor",
        href: "/find-mentor",
        icon: <BookOpen className="h-4 w-4 mr-2" />,
      },
      {
        name: "Wellbeing",
        href: "/wellbeing",
        icon: <HeartPulse className="h-4 w-4 mr-2" />,
      },
    ];

    const roleSpecificLinks = {
      employee: [
        {
          name: "Dashboard",
          href: "/employee-dashboard",
          icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
        },
      ],
      supervisor: [
        {
          name: "Dashboard",
          href: "/supervisor-dashboard",
          icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
        },
        {
          name: "Team",
          href: "/team",
          icon: <Users className="h-4 w-4 mr-2" />,
        },
      ],
      manager: [
        {
          name: "Dashboard",
          href: "/manager-dashboard",
          icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
        },
        {
          name: "Departments",
          href: "/departments",
          icon: <Users className="h-4 w-4 mr-2" />,
        },
        {
          name: "Reports",
          href: "/reports",
          icon: <ClipboardList className="h-4 w-4 mr-2" />,
        },
      ],
    };

    return [...(roleSpecificLinks[userRole] || []), ...commonLinks];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-2 mr-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl">EmpTrack</span>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex mx-6">
          <NavigationMenuList className="flex space-x-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location.pathname === link.href
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {link.icon}
                  {link.name}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <div className="md:hidden flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  className={cn(
                    location.pathname === link.href && "bg-purple-50 text-purple-700"
                  )}
                  onClick={() => navigate(link.href)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side items */}
        <div className="ml-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-700">
                    {user?.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                  </span>
                </div>
                {!isMobile && (
                  <>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.full_name || "User"}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex items-center border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
