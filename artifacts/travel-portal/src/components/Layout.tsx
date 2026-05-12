import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import {
  LogOut, Menu, User, Briefcase, Plane, Ticket, CreditCard,
  Building, LayoutDashboard, Settings, BookOpen, MessageCircle,
  Sun, Moon, Home, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["customer", "agent", "admin"] },
    { href: "/umrah-packages", icon: Briefcase, label: "Umrah Packages", roles: null },
    { href: "/ksa-groups", icon: Plane, label: "KSA One Way", roles: null },
    { href: "/uae-groups", icon: Plane, label: "UAE One Way", roles: null },
    { href: "/all-groups", icon: Plane, label: "All Groups", roles: null },
    { href: "/umrah-tickets", icon: Ticket, label: "Umrah Tickets", roles: null },
    { href: "/bookings", icon: BookOpen, label: "My Bookings", roles: ["customer", "agent", "admin"] },
    { href: "/banks", icon: Building, label: "Banks", roles: ["customer", "agent", "admin"] },
    { href: "/ledger", icon: CreditCard, label: "My Ledger", roles: ["customer", "agent", "admin"] },
    { href: "/agent-dashboard", icon: User, label: "Agent Dashboard", roles: ["agent"] },
    { href: "/admin", icon: Settings, label: "Admin Panel", roles: ["admin"] },
  ];

  const visibleItems = navItems.filter(item =>
    item.roles === null || (user && item.roles.includes(user.role))
  );

  const isActive = (href: string) => location === href;

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {visibleItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
            isActive(href)
              ? "bg-sidebar-primary/20 text-sidebar-primary font-semibold shadow-sm"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <Icon className={`h-4 w-4 flex-shrink-0 ${isActive(href) ? "text-sidebar-primary" : ""}`} />
          <span className="flex-1">{label}</span>
          {isActive(href) && <ChevronRight className="h-3 w-3 opacity-50" />}
        </Link>
      ))}
    </>
  );

  const ThemeToggle = ({ className = "" }: { className?: string }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`h-8 w-8 rounded-lg transition-colors ${className}`}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 text-white/70 hover:text-white" />
      )}
    </Button>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0d1b3e] px-4 md:px-6 shadow-lg">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white hover:bg-white/10 h-8 w-8">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col bg-sidebar border-sidebar-border text-sidebar-foreground p-0">
            {/* Mobile sidebar header */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
              <div className="h-9 w-9 bg-[#f5c842] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Plane className="h-5 w-5 text-[#0d1b3e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm leading-tight">Bin Yasin Travels</div>
                <div className="text-xs text-sidebar-foreground/50">بن یاسین ٹریولز</div>
              </div>
            </div>

            {/* User info in mobile sidebar */}
            {user && (
              <div className="px-4 py-3 border-b border-sidebar-border bg-sidebar-accent/30">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#f5c842]/20 border border-[#f5c842]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#f5c842]">{user.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight truncate">{user.name}</div>
                    <Badge className="text-[10px] capitalize bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 px-1.5 py-0 h-4 mt-0.5">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-auto grid gap-0.5 p-3 text-sm font-medium">
              {/* Home link */}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                Home
              </Link>
              <Separator className="my-1.5 bg-sidebar-border/50" />
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>

            <div className="p-3 border-t border-sidebar-border space-y-1">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>WhatsApp Support</span>
              </a>
              {user && (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-2 group">
          <div className="h-8 w-8 bg-[#f5c842] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-[#e5b832] transition-colors">
            <Plane className="h-4 w-4 text-[#0d1b3e]" />
          </div>
          <div className="hidden sm:block">
            <div className="font-black text-sm text-white leading-tight tracking-tight">Bin Yasin Travels</div>
            <div className="text-[10px] text-white/40 leading-none">بن یاسین ٹریولز</div>
          </div>
        </Link>

        {/* Desktop nav quick links */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {[
            { href: "/", label: "Home" },
            { href: "/umrah-packages", label: "Umrah Packages" },
            { href: "/ksa-groups", label: "KSA One Way" },
            { href: "/uae-groups", label: "UAE One Way" },
            { href: "/umrah-tickets", label: "Umrah Tickets" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle className="text-white/70 hover:text-white hover:bg-white/10" />

          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
                <Badge className="text-[10px] capitalize bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 px-2 py-0 h-4 mt-0.5">
                  {user.role}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10 border border-white/15 h-8 px-3 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs font-medium">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="text-sm font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-bold h-8 px-4 shadow-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── BODY ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        {user && (
          <aside className="hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex flex-shrink-0">
            {/* Sidebar user card */}
            <div className="px-3 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5 px-2">
                <div className="h-9 w-9 rounded-full bg-[#f5c842]/15 border border-[#f5c842]/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-[#f5c842]">{user.name[0]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-tight truncate text-sidebar-foreground">{user.name}</div>
                  <Badge className="text-[10px] capitalize bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 px-1.5 py-0 h-4 mt-0.5">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <nav className="grid items-start gap-0.5 px-3 py-3 text-sm font-medium">
                <NavLinks />
              </nav>
            </div>

            <div className="p-3 border-t border-sidebar-border space-y-1">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
