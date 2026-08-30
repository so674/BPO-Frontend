import { useState } from "react";
import { Radio, ShieldCheck, Users, TrendingUp, UserCircle, AlertCircle } from "lucide-react";
import ReaderVisual from "../components/login/ReaderVisual";
import { login, setToken } from "../lib/api";
import type { CurrentUser, Role } from "../types";

const roleOptions: { role: Role; email: string; icon: typeof ShieldCheck; desc: string }[] = [
  { role: "HR", email: "hr@bpocorp.com", icon: ShieldCheck, desc: "Full operational control" },
  { role: "MANAGER", email: "manager@bpocorp.com", icon: Users, desc: "Team-level visibility" },
  { role: "CEO", email: "ceo@bpocorp.com", icon: TrendingUp, desc: "Company-wide, read-only" },
  { role: "EMPLOYEE", email: "employee@bpocorp.com", icon: UserCircle, desc: "Personal attendance view" },
];

export default function LoginPage({ onLogin }: { onLogin: (user: CurrentUser) => void }) {
  const [selected, setSelected] = useState<Role>("HR");
  const [email, setEmail] = useState(roleOptions[0].email);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickRole = (role: Role) => {
    setSelected(role);
    setEmail(roleOptions.find((r) => r.role === role)!.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setToken(token);
      onLogin({ id: user.id, name: user.name, role: user.role as Role, employeeId: user.employeeId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand + signature reader animation */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-ink-900 p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
            <Radio size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-steel-100">Pulse</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div>
            <p className="mb-8 max-w-sm text-center font-display text-xl leading-snug text-steel-100">
              One tap creates one accurate,
              <br />
              traceable attendance record.
            </p>
            <ReaderVisual />
          </div>
        </div>

        <p className="text-xs text-steel-500">
          Events are evidence. Every processed record can be traced back to its originating tap.
        </p>
      </div>

      {/* Right: sign-in */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
              <Radio size={18} />
            </span>
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-brand-400">BPO Portal</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-steel-100">Sign in to your workspace</h1>
          <p className="mt-2 text-sm text-steel-400">
            Access is scoped by role. Pick a demo account below, or enter your own credentials.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              {roleOptions.map((r) => {
                const active = selected === r.role;
                return (
                  <button
                    type="button"
                    key={r.role}
                    onClick={() => pickRole(r.role)}
                    className={`flex flex-col items-start gap-2 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      active
                        ? "border-brand-500/60 bg-brand-500/10"
                        : "border-line bg-ink-850 hover:border-steel-600"
                    }`}
                  >
                    <r.icon size={16} className={active ? "text-brand-400" : "text-steel-500"} />
                    <div>
                      <p className={`text-sm font-medium ${active ? "text-steel-100" : "text-steel-300"}`}>
                        {r.role === "HR" ? "HR" : r.role.charAt(0) + r.role.slice(1).toLowerCase()}
                      </p>
                      <p className="text-[11px] text-steel-500">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-steel-400">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-ink-850 px-3.5 py-2.5 text-sm text-steel-100 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-steel-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-ink-850 px-3.5 py-2.5 text-sm text-steel-100 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-status-absent/30 bg-status-absent/10 px-3 py-2.5 text-xs text-status-absent">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-steel-500">
            Demo password for all seeded accounts: <span className="font-mono text-steel-400">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
