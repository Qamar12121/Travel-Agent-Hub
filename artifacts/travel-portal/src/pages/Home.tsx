import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plane, Search, Star, ShieldCheck, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-sidebar text-sidebar-foreground rounded-xl overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/90 to-sidebar/50 z-10"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565552643954-1eb311145b80?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="container relative z-20 px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                <Star className="mr-2 h-4 w-4" fill="currentColor" /> Premium B2B Travel Portal
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                The Complete Solution for <span className="text-primary">Travel Agents</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-sidebar-foreground/80 md:text-xl leading-relaxed">
                Access exclusive Umrah packages, manage real-time KSA/UAE flight groups, and streamline your entire agency workflow in one powerful platform.
              </p>
              <div className="w-full max-w-sm space-y-4 sm:flex sm:space-x-4 sm:space-y-0 justify-center pt-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                    Join as Agent
                  </Button>
                </Link>
                <Link href="/umrah-packages">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base bg-transparent border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground">
                    Browse Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 bg-card rounded-xl border border-border mb-12 shadow-sm">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plane className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Live Flight Groups</h3>
                <p className="text-muted-foreground">Access real-time KSA and UAE flight groups. Secure seats instantly with immediate confirmation.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Verified Umrah Packages</h3>
                <p className="text-muted-foreground">Premium 21-day and 28-day packages with top-rated hotels in Makkah and Madinah.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 sm:col-span-2 md:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">2-Hour Booking Holds</h3>
                <p className="text-muted-foreground">Secure inventory without immediate payment. Hold flights or packages for up to 2 hours while finalizing details.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}