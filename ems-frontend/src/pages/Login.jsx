import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login, loading, authReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  if (!authReady) return <div className="grid min-h-screen place-items-center bg-slate-50"><p className="text-sm font-medium text-slate-600">Checking your session...</p></div>;
  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate("/", { replace: true });
    } catch (e) {
      setError(
        e.userMessage ||
          e.message ||
          "Unable to sign in. Check your credentials and API server.",
      );
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#101a31] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-4 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <Logo />
        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> People
            operations, simplified
          </div>
          <h1 className="text-5xl font-bold leading-[1.13] tracking-tight xl:text-6xl">
            Good teams build{" "}
            <span className="text-blue-400">great things.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            One workspace to manage your people, support your team, and keep
            work moving.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-xs text-slate-400">People</p>
            </div>
            <div>
              <p className="text-2xl font-bold">02</p>
              <p className="mt-1 text-xs text-slate-400">Attendance</p>
            </div>
            <div>
              <p className="text-2xl font-bold">03</p>
              <p className="mt-1 text-xs text-slate-400">Growth</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} PeopleDesk. Built for better work.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-12">
        <div className="w-full max-w-[410px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <p className="text-sm font-semibold text-blue-600">WELCOME BACK</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your workspace
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your account details to continue to PeopleDesk.
          </p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              First time here?
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use the admin credentials you configured in your backend
              environment. Never put your real password in source code.
            </p>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">
            Secure access · HTTP-only cookie session
          </p>
        </div>
      </section>
    </div>
  );
}
