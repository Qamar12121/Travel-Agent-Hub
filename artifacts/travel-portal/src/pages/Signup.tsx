import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Eye, EyeOff, User, Briefcase, CheckCircle, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select an account type"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "customer" },
  });

  const onSubmit = (data: SignupFormValues) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuth(res.token, res.user);
          toast({ title: "Account created!", description: "Welcome to Bin Yasin Travels." });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Registration failed", description: "This email may already be in use.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-[#0d1b3e] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5c842' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 max-w-sm text-center space-y-6">
          <div className="h-16 w-16 bg-[#f5c842] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Plane className="h-8 w-8 text-[#0d1b3e]" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-1">Bin Yasin Travels</h1>
            <div className="text-[#f5c842]/60 text-xl" style={{ fontFamily: "Georgia, serif" }}>بن یاسین ٹریولز</div>
          </div>
          <div className="space-y-3">
            {[
              "Access exclusive Umrah packages",
              "Manage KSA & UAE flight groups",
              "Track all your bookings in one place",
              "On-hold booking — 2hr guarantee",
              "Complete ledger & bank management",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                <CheckCircle className="h-4 w-4 text-[#f5c842] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2 text-xs text-white/50 pt-4">
            <a href="tel:+923001234567" className="flex items-center justify-center gap-1.5 hover:text-white/80 transition-colors">
              <Phone className="h-3.5 w-3.5" /> +92-300-123-4567
            </a>
            <a href="https://wa.me/923001234567" className="flex items-center justify-center gap-1.5 hover:text-white/80 transition-colors">
              <MessageCircle className="h-3.5 w-3.5 text-green-400" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-2">
            <div className="h-10 w-10 bg-[#0d1b3e] rounded-xl flex items-center justify-center">
              <Plane className="h-5 w-5 text-[#f5c842]" />
            </div>
            <div>
              <div className="font-black text-sm">Bin Yasin Travels</div>
              <div className="text-xs text-muted-foreground">بن یاسین ٹریولز</div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Create your account</h2>
            <p className="text-muted-foreground text-sm">Join thousands of pilgrims and agents on Bin Yasin Travels</p>
          </div>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "customer", icon: User, label: "Pilgrim / Customer", desc: "Book Umrah packages & flights" },
              { value: "agent", icon: Briefcase, label: "Travel Agent", desc: "Manage clients & earn commissions" },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setSelectedRole(value); form.setValue("role", value); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === value
                    ? "border-[#0d1b3e] bg-[#0d1b3e]/5 dark:bg-[#0d1b3e]/30"
                    : "border-border hover:border-[#0d1b3e]/40"
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${selectedRole === value ? "text-[#0d1b3e] dark:text-[#f5c842]" : "text-muted-foreground"}`} />
                <div className={`text-sm font-bold ${selectedRole === value ? "text-foreground" : "text-muted-foreground"}`}>{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-sm">Full Name</Label>
              <Input
                id="name"
                placeholder="Muhammad Ahmed"
                {...form.register("name")}
                className="h-11 border-border/60 focus-visible:ring-[#0d1b3e]"
                data-testid="input-name"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                className="h-11 border-border/60 focus-visible:ring-[#0d1b3e]"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  {...form.register("password")}
                  className="h-11 pr-10 border-border/60 focus-visible:ring-[#0d1b3e]"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Hidden role input synced to selectedRole */}
            <input type="hidden" {...form.register("role")} value={selectedRole} />

            <Button
              type="submit"
              className="w-full h-11 bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white font-bold text-base"
              disabled={registerMutation.isPending}
              data-testid="button-signup"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0d1b3e] dark:text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
