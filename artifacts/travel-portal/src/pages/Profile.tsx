import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, User } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, Lock, User as UserIcon, Building } from "lucide-react";

const API_BASE = "/api";
function getToken() { return localStorage.getItem("token"); }
async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(options.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "", agencyName: "", address: "" });
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const picRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/login");
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, phone: user.phone || "", agencyName: user.agencyName || "", address: "" });
      setProfilePic(user.profilePic || null);
      setAgencyLogo(user.agencyLogo || null);
    }
  }, [user]);

  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profilePic" | "agencyLogo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Image too large (max 2MB)", variant: "destructive" }); return; }
    const base64 = await fileToBase64(file);
    if (type === "profilePic") setProfilePic(base64);
    else setAgencyLogo(base64);
  };

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSavingProfile(true);
    try {
      const updated: User = await apiFetch("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...profileForm, profilePic, agencyLogo }),
      });
      updateUser(updated);
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" }); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    setSavingPw(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      toast({ title: "Password changed successfully" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = (() => { try { return JSON.parse((err as Error).message)?.error || "Failed"; } catch { return "Current password is incorrect"; } })();
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return null;

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account details and preferences</p>
        </div>

        {/* ── PROFILE PICTURE + BASIC ─────────────────────────── */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserIcon className="h-4 w-4" />Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="h-20 w-20 rounded-full overflow-hidden bg-[#0d1b3e] flex items-center justify-center cursor-pointer border-2 border-[#f5c842]/30 hover:border-[#f5c842] transition-colors"
                  onClick={() => picRef.current?.click()}
                >
                  {profilePic
                    ? <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                    : <span className="text-2xl font-black text-[#f5c842]">{initials}</span>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => picRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#f5c842] text-[#0d1b3e] flex items-center justify-center shadow-md hover:bg-[#e5b832] transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={picRef} type="file" accept="image/*" className="hidden" onChange={e => handlePicUpload(e, "profilePic")} />
              </div>
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
                <button type="button" onClick={() => picRef.current?.click()} className="text-xs text-primary hover:underline mt-1">
                  Change photo
                </button>
              </div>
            </div>

            <Separator />

            {/* Edit fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input value={user.email} disabled className="h-10 bg-muted/30 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92-300-0000000" className="h-10" />
              </div>
              {user.role === "agent" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Agency Name</Label>
                  <Input value={profileForm.agencyName} onChange={e => setProfileForm(f => ({ ...f, agencyName: e.target.value }))} className="h-10" />
                </div>
              )}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Address</Label>
                <Input value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} placeholder="Office / home address" className="h-10" />
              </div>
            </div>

            {/* Agency logo for agents */}
            {user.role === "agent" && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs font-semibold">Agency Logo</Label>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-24 rounded-lg border-2 border-dashed border-border overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                    onClick={() => logoRef.current?.click()}
                  >
                    {agencyLogo
                      ? <img src={agencyLogo} alt="Agency Logo" className="h-full w-full object-contain p-1" />
                      : <span className="text-xs text-muted-foreground text-center px-1">Click to upload</span>
                    }
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>PNG, JPG up to 2MB</div>
                    {agencyLogo && (
                      <button type="button" onClick={() => setAgencyLogo(null)} className="text-destructive hover:underline">Remove</button>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePicUpload(e, "agencyLogo")} />
                </div>
              </div>
            )}

            <Button onClick={saveProfile} disabled={savingProfile} className="bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white">
              <Save className="h-4 w-4 mr-2" />
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* ── CHANGE PASSWORD ────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="h-10 pr-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">New Password</Label>
                <Input
                  type={showPw ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Confirm New Password</Label>
                <Input
                  type={showPw ? "text" : "password"}
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={changePassword} disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword} className="bg-[#0d1b3e] hover:bg-[#1a3a7c] text-white">
                <Lock className="h-4 w-4 mr-2" />
                {savingPw ? "Updating..." : "Change Password"}
              </Button>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="rounded" />
                Show passwords
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Account Type</div>
                <div className="font-semibold capitalize mt-0.5">{user.role}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Account Balance</div>
                <div className="font-semibold mt-0.5">PKR {Number(user.balance ?? 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="font-semibold mt-0.5 text-green-600">{user.isActive ? "Active" : "Inactive"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Member Since</div>
                <div className="font-semibold mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
