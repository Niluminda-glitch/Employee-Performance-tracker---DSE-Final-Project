import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, BookOpen, HeartPulse, Bell, LogOut, Users, ClipboardList, Menu, ChevronDown, CheckCheck, Send, BarChart } from "lucide-react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const TopNavigation = ({
  userRole
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    logout
  } = useAuth();
  const {
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatDate,
    loading
  } = useNotifications();
  const isMobile = useIsMobile();
  const handleLogout = () => {
    // Logout the user
    logout();

    // Redirect to login page
    navigate("/");
  };

  // Define navigation links based on user role
  const getNavigationItems = () => {
    const commonLinks = [{
      title: "Profile",
      href: "/profile",
      icon: User
    }, {
      title: "Find Mentor",
      href: "/mentors",
      icon: BookOpen
    }, {
      title: "Wellbeing",
      href: "/wellbeing",
      icon: HeartPulse
    }, {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null
    }];

    // Add role-specific dashboard links
    if (userRole === "employee") {
      return [{
        title: "Dashboard",
        href: "/employee-dashboard",
        icon: LayoutDashboard
      }, ...commonLinks];
    } else if (userRole === "supervisor") {
      return [{
        title: "Dashboard",
        href: "/supervisor-dashboard",
        icon: LayoutDashboard
      }, {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart
      }, ...commonLinks];
    } else if (userRole === "manager") {
      return [{
        title: "Dashboard",
        href: "/manager-dashboard",
        icon: LayoutDashboard
      }, {
        title: "Team Management",
        href: "/team-management",
        icon: Users
      }, {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart
      }, ...commonLinks];
    }
    return commonLinks;
  };
  const navItems = getNavigationItems();

  // Get the user label based on role
  const getUserRoleLabel = () => {
    if (userRole === "employee") return "Employee";
    if (userRole === "supervisor") return "Supervisor";
    if (userRole === "manager") return "Manager";
    return "User";
  };

  // Check if a menu item is active
  const isActiveRoute = href => {
    return location.pathname === href;
  };
  return <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-elevation-1 transition-all duration-300 animate-fade-in">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3 animate-slide-in-left">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-all duration-300">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-gradient-enhanced">EmpTrack</h1>
            <p className="text-xs font-medium tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              {userRole === "employee" && "Employee Dashboard"}
              {userRole === "supervisor" && "Supervisor Dashboard"}
              {userRole === "manager" && "Manager Dashboard"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        {!isMobile && <NavigationMenu className="hidden md:flex animate-slide-in-top">
            <NavigationMenuList className="gap-2">
              {navItems.map((item, index) => {
                // If this is the notifications item and we have a popover, render it differently
                if (item.title === "Notifications" && !isMobile) {
                  return (
                    <NavigationMenuItem key={item.title}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Link
                              to={item.href}
                              className={cn(
                                "group inline-flex h-10 w-max items-center justify-center rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                                "hover:shadow-elevation-1 hover:-translate-y-0.5",
                                isActiveRoute(item.href) ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-sm border border-purple-200/50" : ""
                              )}
                              style={{ animationDelay: `${index * 50}ms` }}
                              // Allow navigation to notifications page regardless of unread count
                            >
                              <item.icon className={cn(
                                "mr-2 h-4 w-4 transition-colors",
                                isActiveRoute(item.href) ? "text-purple-700" : "text-purple-500 group-hover:text-purple-700"
                              )} />
                              {item.title}
                              {item.badge && (
                                <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                          <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-medium">Recent Notifications</h3>
                            {unreadCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-8 text-xs"
                              >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all as read
                              </Button>
                            )}
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {loading ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Loading notifications...
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No notifications
                              </div>
                            ) : (
                              <div>
                                {notifications.slice(0, 5).map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={cn(
                                      "p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50",
                                      !notification.is_read && "bg-purple-50"
                                    )}
                                    onClick={() => {
                                      if (!notification.is_read) {
                                        markAsRead(notification.id);
                                      }
                                    }}
                                  >
                                    <div className="flex items-start">
                                      <Bell className={cn(
                                        "h-4 w-4 mt-0.5 mr-2",
                                        !notification.is_read ? "text-purple-600" : "text-gray-400"
                                      )} />
                                      <div>
                                        <p className={cn(
                                          "text-sm font-medium",
                                          !notification.is_read && "text-purple-900"
                                        )}>
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                          {notification.message}
                                        </p>
                                        {notification.relatedUser && (
                                          <div className="flex items-center mt-1">
                                            <User className="h-3 w-3 text-purple-600 mr-1" />
                                            <p className="text-xs text-purple-700">
                                              {notification.relatedUser.full_name}
                                            </p>
                                          </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {formatDate(notification.created_at)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="p-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-center text-xs"
                              onClick={() => navigate('/notifications')}
                            >
                              View all notifications
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </NavigationMenuItem>
                  );
                }

                // Regular menu items
                return (
                  <NavigationMenuItem key={item.title}>
                    <Link
                      to={item.href}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                        "hover:shadow-elevation-1 hover:-translate-y-0.5",
                        isActiveRoute(item.href) ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-sm border border-purple-200/50" : ""
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <item.icon className={cn(
                        "mr-2 h-4 w-4 transition-colors",
                        isActiveRoute(item.href) ? "text-purple-700" : "text-purple-500 group-hover:text-purple-700"
                      )} />
                      {item.title}
                      {item.badge && (
                        <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>}

        {/* Mobile Menu Trigger */}
        {isMobile && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl animate-zoom-in">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map(item => <DropdownMenuItem key={item.title} asChild>
                  <Link to={item.href} className={cn("flex items-center cursor-pointer", isActiveRoute(item.href) ? "bg-purple-50 text-purple-700" : "")}>
                    <item.icon className={cn("mr-2 h-4 w-4", isActiveRoute(item.href) ? "text-purple-700" : "text-purple-500")} />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>)}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}

        {/* User Menu & Logout */}
        <div className="flex items-center gap-3 animate-slide-in-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2 items-center">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm border border-purple-200">
                  <span className="text-sm font-semibold text-purple-700">
                    {userRole === "employee" && "E"}
                    {userRole === "supervisor" && "S"}
                    {userRole === "manager" && "M"}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{getUserRoleLabel()}</span>
                  <span className="text-xs text-muted-foreground">Account</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl animate-zoom-in">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className={cn("flex items-center cursor-pointer", isActiveRoute("/profile") ? "bg-purple-50 text-purple-700" : "")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications" className={cn("flex items-center cursor-pointer", isActiveRoute("/notifications") ? "bg-purple-50 text-purple-700" : "")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </Link>
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
    </header>;
};
export default TopNavigation;