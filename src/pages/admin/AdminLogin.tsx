import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFunctions, useCurrentUser, useUsers } from "../../lib/useConvex";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuthFunctions();
  const auth = useCurrentUser();
  const convexUsers = useUsers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);
    
    if (!result.success) {
      setError(result.error || "Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    const currentUser = convexUsers?.find(u => u.email === email);
    if (!currentUser || currentUser.role !== "admin") {
      setError("Access denied. Admin credentials required.");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen bg-admin-bg">
      <div className="hidden flex-1 flex-col justify-between border-r border-admin-border bg-admin-surface p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-admin-border bg-admin-bg">
            <span className="font-display text-lg font-bold">C</span>
          </div>
          <span className="font-display text-base font-semibold">Carrow</span>
        </div>
        <div className="max-w-md">
          <p className="font-serif text-5xl leading-tight tracking-tight text-white">
            "A control room for craft —<br />quiet, considered, precise."
          </p>
          <p className="mt-6 text-sm text-admin-muted">— Studio Operating System, v3</p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-admin-muted">© 2026 Carrow Studio</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-admin-muted">Restricted Access</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Admin sign in</h1>
          <p className="mt-2 text-sm text-admin-muted">Authenticate to access the studio console.</p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <Input 
                label="Email" 
                type="email" 
                placeholder="admin@carrow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input 
                label="Password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-admin-muted hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-8 text-center text-xs text-admin-muted">Protected by Carrow Auth · SSO available</p>
        </div>
      </div>
    </div>
  );
}
