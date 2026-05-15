import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Eye, EyeOff, MessageCircle, Phone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user as Parameters<typeof setAuth>[1]);
        sessionStorage.removeItem("balanceShown");
        toast({ title: `Welcome back, ${res.user.name}!` });
        setLocation("/dashboard");
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Incorrect email or password.";
        toast({ title: "Login failed", description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
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
          <div className="text-2xl text-[#f5c842]" style={{ fontFamily: "Georgia, serif" }}>
            لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Pakistan's most trusted Umrah travel agency. Serving pilgrims since 2009 with premium packages and unmatched care.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[["5000+", "Pilgrims"], ["15+", "Years"], ["99%", "Satisfaction"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-black text-[#f5c842]">{v}</div>
                <div className="text-xs text-white/50 mt-0.5">{l}</div>
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

      {/* Right login form */}
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
            <h2 className="text-2xl font-black tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to manage your bookings and packages</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-sm">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com"
                {...form.register("email")} className="h-11 border-border/60 focus-visible:ring-[#0d1b3e]" />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
                <Link href="/forgot-password" className="text-xs text-[#0d1b3e] hover:underline font-medium dark:text-primary">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  {...form.register("password")} className="h-11 pr-10 border-border/60 focus-visible:ring-[#0d1b3e]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-11 bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white font-bold text-base"
              disabled={loginMutation.isPending}>
              {loginMutation.isPending
                ? <span className="flex items-center gap-2"><Lock className="h-4 w-4 animate-pulse" /> Signing in...</span>
                : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#0d1b3e] dark:text-primary font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
