import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, Menu, User, Briefcase, Plane, Ticket, CreditCard, Building, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const NavLinks = () => (
    <>
      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link href="/umrah-packages" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Briefcase className="h-4 w-4" />
        Umrah Packages
      </Link>
      <Link href="/ksa-groups" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Plane className="h-4 w-4" />
        KSA One Way
      </Link>
      <Link href="/uae-groups" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Plane className="h-4 w-4" />
        UAE One Way
      </Link>
      <Link href="/all-groups" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Plane className="h-4 w-4" />
        All Groups
      </Link>
      <Link href="/umrah-tickets" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Ticket className="h-4 w-4" />
        Umrah Tickets
      </Link>
      <Link href="/bookings" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <Building className="h-4 w-4" />
        My Bookings
      </Link>
      <Link href="/banks" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <CreditCard className="h-4 w-4" />
        Banks
      </Link>
      <Link href="/ledger" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
        <CreditCard className="h-4 w-4" />
        My Ledger
      </Link>
      {user?.role === "agent" && (
        <Link href="/agent-dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
          <User className="h-4 w-4" />
          Agent Dashboard
        </Link>
      )}
      {user?.role === "admin" && (
        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-md">
          <Settings className="h-4 w-4" />
          Admin Panel
        </Link>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col bg-sidebar border-sidebar-border text-sidebar-foreground">
            <div className="flex items-center gap-2 mb-8 mt-4 px-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-sidebar-primary">TravelPortal</span>
            </div>
            <nav className="grid gap-2 text-lg font-medium">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Link href="/" className="hidden md:flex items-center gap-2 text-lg font-bold mr-6">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-primary-foreground tracking-tight">TravelPortal</span>
          </Link>
          <div className="ml-auto flex-1 sm:flex-initial">
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium hover:underline px-4 py-2">Login</Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        {user && (
          <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
            <nav className="grid items-start gap-1 px-4 py-6 text-sm font-medium">
              <NavLinks />
            </nav>
          </aside>
        )}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}