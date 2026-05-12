import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, Menu, User, Briefcase, Plane, Ticket, CreditCard, Building, LayoutDashboard, Settings, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

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

  const NavLinks = () => (
    <>
      {visibleItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive(href)
              ? "bg-primary/20 text-primary font-semibold"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-[#0d1b3e] px-4 md:px-6 shadow-md">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col bg-sidebar border-sidebar-border text-sidebar-foreground p-0">
            <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
              <div className="h-9 w-9 bg-[#f5c842] rounded-lg flex items-center justify-center flex-shrink-0">
                <Plane className="h-5 w-5 text-[#0d1b3e]" />
              </div>
              <div>
                <div className="font-black text-sm leading-tight">Bin Yasin Travels</div>
                <div className="text-xs text-sidebar-foreground/50">بن یاسین ٹریولز</div>
              </div>
            </div>
            <nav className="flex-1 overflow-auto grid gap-1 p-3 text-sm font-medium">
              <NavLinks />
            </nav>
            <div className="p-3 border-t border-sidebar-border">
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors">
                <MessageCircle className="h-4 w-4 text-green-500" /> +92-300-123-4567
              </a>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-4">
          <div className="h-8 w-8 bg-[#f5c842] rounded-lg flex items-center justify-center flex-shrink-0">
            <Plane className="h-4 w-4 text-[#0d1b3e]" />
          </div>
          <div className="hidden sm:block">
            <div className="font-black text-sm text-white leading-tight tracking-tight">Bin Yasin Travels</div>
            <div className="text-xs text-white/40 leading-none">بن یاسین ٹریولز</div>
          </div>
        </Link>

        {/* Desktop nav quick links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {[
            { href: "/umrah-packages", label: "Umrah Packages" },
            { href: "/ksa-groups", label: "KSA One Way" },
            { href: "/uae-groups", label: "UAE One Way" },
            { href: "/umrah-tickets", label: "Umrah Tickets" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(href) ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
                <Badge className="text-xs capitalize bg-[#f5c842]/20 text-[#f5c842] border-[#f5c842]/30 px-2 py-0 h-4 mt-0.5">
                  {user.role}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10 border border-white/20 h-8">
                <LogOut className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-[#f5c842] text-[#0d1b3e] hover:bg-[#e5b832] font-bold h-8">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── BODY ─────────────────────────────────────────────────── */}
      <div className="flex flex-1">
        {user && (
          <aside className="hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
            <div className="flex-1 overflow-auto">
              <nav className="grid items-start gap-1 px-3 py-4 text-sm font-medium">
                <NavLinks />
              </nav>
            </div>
            <div className="p-3 border-t border-sidebar-border">
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors">
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
