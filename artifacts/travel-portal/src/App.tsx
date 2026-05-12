import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import UmrahPackages from "@/pages/UmrahPackages";
import PackageDetail from "@/pages/PackageDetail";
import { FlightGroupsList } from "@/pages/FlightGroups";
import { FlightDetail } from "@/pages/FlightDetail";
import Bookings from "@/pages/Bookings";
import BookingDetail from "@/pages/BookingDetail";
import ETicket from "@/pages/ETicket";
import Banks from "@/pages/Banks";
import Ledger from "@/pages/Ledger";
import AgentDashboard from "@/pages/AgentDashboard";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dashboard" component={Dashboard} />

      {/* Umrah Packages */}
      <Route path="/umrah-packages" component={UmrahPackages} />
      <Route path="/umrah-packages/:id" component={PackageDetail} />

      {/* Flight Groups */}
      <Route path="/ksa-groups">
        {() => <FlightGroupsList type="ksa" />}
      </Route>
      <Route path="/ksa-groups/:id">
        {() => <FlightDetail type="ksa" />}
      </Route>
      <Route path="/uae-groups">
        {() => <FlightGroupsList type="uae" />}
      </Route>
      <Route path="/uae-groups/:id">
        {() => <FlightDetail type="uae" />}
      </Route>
      <Route path="/all-groups">
        {() => <FlightGroupsList type="all" />}
      </Route>
      <Route path="/umrah-tickets">
        {() => <FlightGroupsList type="umrah" />}
      </Route>
      <Route path="/umrah-tickets/:id">
        {() => <FlightDetail type="ksa" />}
      </Route>

      {/* Bookings */}
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id" component={BookingDetail} />

      {/* E-Ticket */}
      <Route path="/eticket/:bookingId" component={ETicket} />

      {/* Finance */}
      <Route path="/banks" component={Banks} />
      <Route path="/ledger" component={Ledger} />

      {/* Agent & Admin */}
      <Route path="/agent-dashboard" component={AgentDashboard} />
      <Route path="/admin" component={Admin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
