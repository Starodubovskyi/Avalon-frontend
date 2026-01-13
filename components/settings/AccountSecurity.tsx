"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Shield,
  Key,
  Smartphone,
  LogOut,
  RefreshCw,
  Copy,
  Download,
  SmartphoneNfc,
} from "lucide-react";
import clsx from "clsx";

// Стили
const CARD_CLASS =
  "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm p-6 sm:p-8";
const INPUT_CLASS =
  "w-full rounded-full border-none bg-gray-100/50 dark:bg-white/5 px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all";
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

// --- ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ---
const LS_KEYS = {
  pwd: "avalon.auth.passwordHash",
  sessions: "avalon.security.sessions",
  currentSessionId: "avalon.security.currentSessionId",
  twoFAEnabled: "avalon.security.twoFA.enabled",
  twoFASecret: "avalon.security.twoFA.secret",
  twoFABackups: "avalon.security.twoFA.backups",
} as const;
type Session = {
  id: string;
  device: string;
  ip: string;
  city?: string;
  lastActive: string;
  current?: boolean;
};
type BackupHash = { hash: string; used?: boolean };
const b32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = u8;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  const ab = new ArrayBuffer(byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}
function base32Encode(bytes: Uint8Array) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += b32Alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += b32Alphabet[(value << (5 - bits)) & 31];
  while (output.length % 8) output += "=";
  return output;
}
function base32Decode(b32: string): Uint8Array {
  const clean = b32.toUpperCase().replace(/=+$/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = b32Alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}
async function sha256Hex(s: string) {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", toArrayBuffer(enc));
  const arr = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < arr.length; i++) {
    hex += arr[i].toString(16).padStart(2, "0");
  }
  return hex;
}
function toBigEndianCounter(counter: number) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  const hi = Math.floor(counter / 2 ** 32);
  const lo = counter >>> 0;
  view.setUint32(0, hi);
  view.setUint32(4, lo);
  return new Uint8Array(buf);
}
async function hmacSha1(key: Uint8Array, msg: Uint8Array) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, toArrayBuffer(msg));
  return new Uint8Array(sig);
}
async function totp(secretB32: string, timestamp = Date.now()) {
  const step = 30;
  const counter = Math.floor(timestamp / 1000 / step);
  const key = base32Decode(secretB32);
  const cnt = toBigEndianCounter(counter);
  const hmac = await hmacSha1(key, cnt);
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = (bin % 1_000_000).toString().padStart(6, "0");
  return code;
}
function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 5);
}
function fmtNow(): string {
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `Today, ${hh}:${mm}`;
}
function detectDevice(): string {
  const ua = (
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  ).toLowerCase();
  const isWin = ua.includes("windows");
  const isMac = ua.includes("macintosh") || ua.includes("mac os");
  const isLinux = ua.includes("linux") && !ua.includes("android");
  const isAndroid = ua.includes("android");
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const browser =
    /chrome|safari|firefox|edg|brave|opr/.exec(ua)?.[0] ?? "browser";
  const os = isWin
    ? "Windows"
    : isMac
    ? "macOS"
    : isLinux
    ? "Linux"
    : isAndroid
    ? "Android"
    : isIOS
    ? "iOS"
    : "OS";
  const br =
    browser === "edg"
      ? "Edge"
      : browser === "opr"
      ? "Opera"
      : browser === "chrome"
      ? "Chrome"
      : browser === "safari"
      ? "Safari"
      : browser === "firefox"
      ? "Firefox"
      : "Browser";
  return `${br} • ${os}`;
}
function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AccountSecurity() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupHash[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [freshBackupPlain, setFreshBackupPlain] = useState<string[] | null>(
    null
  );
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "seed-1",
      device: "Chrome • Windows",
      ip: "81.23.10.2",
      city: "Bucharest",
      lastActive: "Today, 11:22",
      current: true,
    },
    {
      id: "seed-2",
      device: "Safari • iPhone",
      ip: "81.23.10.2",
      city: "Galați",
      lastActive: "Aug 18, 21:03",
    },
  ]);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdHash, setPwdHash] = useState<string | null>(null);
  const currentSessionIdRef = useRef<string>("");

  useEffect(() => {
    const savedHash = localStorage.getItem(LS_KEYS.pwd);
    if (savedHash) {
      setPwdHash(savedHash);
    } else {
      sha256Hex("ChangeMe123!").then((h) => {
        localStorage.setItem(LS_KEYS.pwd, h);
        setPwdHash(h);
      });
    }
    const enabled = localStorage.getItem(LS_KEYS.twoFAEnabled) === "1";
    const secret = localStorage.getItem(LS_KEYS.twoFASecret);
    const backupsJson = localStorage.getItem(LS_KEYS.twoFABackups);
    setTwoFAEnabled(enabled);
    setTwoFASecret(secret);
    setBackups(backupsJson ? (JSON.parse(backupsJson) as BackupHash[]) : []);
    const savedCurrent =
      localStorage.getItem(LS_KEYS.currentSessionId) || crypto.randomUUID();
    currentSessionIdRef.current = savedCurrent;
    localStorage.setItem(LS_KEYS.currentSessionId, savedCurrent);
    const stored = localStorage.getItem(LS_KEYS.sessions);
    if (stored) {
      const parsed: Session[] = JSON.parse(stored);
      const upd = parsed.map((s) => ({ ...s, current: s.id === savedCurrent }));
      setSessions(upd);
    } else {
      const dev = detectDevice();
      const curr: Session = {
        id: savedCurrent,
        device: dev,
        ip: "81.23.10.2",
        city: "Bucharest",
        lastActive: fmtNow(),
        current: true,
      };
      const others = sessions
        .filter((s) => !s.current)
        .map((s) => ({ ...s, current: false }));
      const init = [curr, ...others];
      setSessions(init);
      localStorage.setItem(LS_KEYS.sessions, JSON.stringify(init));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.twoFAEnabled, twoFAEnabled ? "1" : "0");
  }, [twoFAEnabled]);
  useEffect(() => {
    if (twoFASecret) localStorage.setItem(LS_KEYS.twoFASecret, twoFASecret);
  }, [twoFASecret]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.twoFABackups, JSON.stringify(backups));
  }, [backups]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    const t = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => (s.current ? { ...s, lastActive: fmtNow() } : s))
      );
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  const otpauthUrl = useMemo(() => {
    if (!twoFASecret) return "";
    const issuer = encodeURIComponent("Avalon");
    const label = encodeURIComponent("User");
    return `otpauth://totp/${label}?secret=${twoFASecret}&issuer=${issuer}&digits=6&period=30&algorithm=SHA1`;
  }, [twoFASecret]);

  const handleToggle2FA = useCallback(
    async (checked: boolean) => {
      if (checked) {
        if (twoFAEnabled) return;
        const rand = new Uint8Array(20);
        crypto.getRandomValues(rand);
        const secret = base32Encode(rand).replace(/=+$/, "");
        setTwoFASecret(secret);
        setSetupOpen(true);
        setSetupCode("");
        setSetupError(null);
        setFreshBackupPlain(null);
      } else {
        if (!twoFAEnabled) {
          setSetupOpen(false);
          setTwoFASecret(null);
          return;
        }
        const ok = window.confirm("Disable 2FA? You can re-enable it later.");
        if (!ok) return;
        setTwoFAEnabled(false);
        setTwoFASecret(null);
        setBackups([]);
        setSetupOpen(false);
        setFreshBackupPlain(null);
        localStorage.removeItem(LS_KEYS.twoFASecret);
        localStorage.removeItem(LS_KEYS.twoFABackups);
      }
    },
    [twoFAEnabled]
  );
  const verifySetupCode = useCallback(async () => {
    if (!twoFASecret) return;
    const trimsix = setupCode.trim();
    if (!/^\d{6}$/.test(trimsix)) {
      setSetupError("Enter the 6-digit code from your authenticator.");
      return;
    }
    const now = Date.now();
    const codes = await Promise.all([
      totp(twoFASecret, now - 30_000),
      totp(twoFASecret, now),
      totp(twoFASecret, now + 30_000),
    ]);
    if (!codes.includes(trimsix)) {
      setSetupError(
        "Invalid code. Make sure the time on your device is correct."
      );
      return;
    }
    const plain = Array.from({ length: 10 }).map(() =>
      `${Math.random().toString(36).slice(2, 6)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`.toUpperCase()
    );
    const hashes = await Promise.all(plain.map((c) => sha256Hex(c)));
    const stored: BackupHash[] = hashes.map((h) => ({ hash: h, used: false }));
    setBackups(stored);
    setFreshBackupPlain(plain);
    setTwoFAEnabled(true);
    setSetupOpen(false);
    setSetupError(null);
    alert("Two-factor authentication enabled.");
  }, [setupCode, twoFASecret]);
  const copyBackups = useCallback(async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      alert("Backup codes copied.");
    } catch {
      alert("Copy failed.");
    }
  }, []);
  const downloadBackups = useCallback((codes: string[]) => {
    const content = `Your Avalon backup codes (store securely):\n\n${codes.join(
      "\n"
    )}\n`;
    downloadText("avalon-backup-codes.txt", content);
  }, []);
  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    alert("Session revoked.");
  }
  function revokeAllOthers() {
    const curr = currentSessionIdRef.current;
    setSessions((prev) => prev.filter((s) => s.id === curr));
    alert("All other sessions revoked.");
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (!oldPass || !newPass || !confirmPass) {
      setPwdMsg("Fill all fields.");
      return;
    }
    if (newPass !== confirmPass) {
      setPwdMsg("Passwords do not match.");
      return;
    }
    if (newPass.length < 8) {
      setPwdMsg("New password must be at least 8 characters.");
      return;
    }
    const oldHash = await sha256Hex(oldPass);
    if (pwdHash && oldHash !== pwdHash) {
      setPwdMsg("Current password is incorrect.");
      return;
    }
    const newHash = await sha256Hex(newPass);
    localStorage.setItem(LS_KEYS.pwd, newHash);
    setPwdHash(newHash);
    setOldPass("");
    setNewPass("");
    setConfirmPass("");
    setPwdMsg("Password changed.");
  }
  const strength = useMemo(() => passwordStrength(newPass), [newPass]);
  const strengthLabel = [
    "Very weak",
    "Weak",
    "OK",
    "Good",
    "Strong",
    "Very strong",
  ][strength];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 2FA Section */}
      <section className={CARD_CLASS}>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="text-blue-500" size={24} /> Two-Factor
          Authentication
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Enable 2FA
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Increase account security with one-time codes.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={twoFAEnabled || setupOpen}
              onChange={(e) => handleToggle2FA(e.target.checked)}
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Setup wizard */}
        {setupOpen && twoFASecret && (
          <div className="mt-6 rounded-3xl border border-blue-200/60 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
            <p className="font-bold mb-3 text-blue-900 dark:text-blue-200">
              Set up your authenticator
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>
                Open your authenticator app (Google Authenticator, Authy, etc.).
              </li>
              <li>Use this secret to add a new account:</li>
            </ol>

            <div className="grid gap-3">
              <div className="rounded-xl bg-white/70 dark:bg-black/20 border border-blue-100 dark:border-white/5 p-4">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Secret Key
                </div>
                <div className="font-mono text-sm break-all text-blue-700 dark:text-blue-300 select-all">
                  {twoFASecret}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex gap-3">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className={clsx(
                    INPUT_CLASS,
                    "font-mono text-center tracking-widest text-lg max-w-[150px]"
                  )}
                  placeholder="000000"
                />
                <button
                  onClick={verifySetupCode}
                  className={clsx(
                    "rounded-full px-6 py-2 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform",
                    GRADIENT_BG
                  )}
                >
                  Verify
                </button>
              </div>
            </div>

            {setupError && (
              <p className="mt-3 text-sm text-red-500 font-medium">
                {setupError}
              </p>
            )}
          </div>
        )}

        {/* Backups */}
        {twoFAEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-sm">Backup codes</p>
                <p className="text-xs text-gray-500">
                  Use if you lose access to your device.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBackups((v) => !v)}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition"
                >
                  {showBackups ? "Hide" : "Show"}
                </button>
                {freshBackupPlain && (
                  <>
                    <button
                      onClick={() => copyBackups(freshBackupPlain)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => downloadBackups(freshBackupPlain)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200"
                    >
                      <Download size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {!freshBackupPlain && (
              <button
                onClick={async () => {
                  const plain = Array.from({ length: 10 }).map(() =>
                    `${Math.random().toString(36).slice(2, 6)}-${Math.random()
                      .toString(36)
                      .slice(2, 6)}`.toUpperCase()
                  );
                  const hashes = await Promise.all(
                    plain.map((c) => sha256Hex(c))
                  );
                  setBackups(hashes.map((h) => ({ hash: h, used: false })));
                  setFreshBackupPlain(plain);
                  alert("New backup codes generated.");
                }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-4"
              >
                <RefreshCw size={12} /> Generate new codes
              </button>
            )}

            {showBackups && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  freshBackupPlain ??
                  backups.map(
                    (_, i) => `CODE-${(i + 1).toString().padStart(2, "0")}****`
                  )
                ).map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-center text-xs font-mono dark:border-white/10 dark:bg-white/5"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={async () => {
                if (!window.confirm("Disable 2FA?")) return;
                setTwoFAEnabled(false);
                setTwoFASecret(null);
                setBackups([]);
                setFreshBackupPlain(null);
                localStorage.removeItem(LS_KEYS.twoFASecret);
                localStorage.removeItem(LS_KEYS.twoFABackups);
              }}
              className="mt-4 text-xs font-bold text-red-500 hover:text-red-600"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </section>

      {/* Password Section */}
      <section className={CARD_CLASS}>
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Key className="text-purple-500" size={24} /> Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-3 mb-1 block">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-3 mb-1 block">
                  Confirm New
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-3 mb-1 block">
                New Password
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={INPUT_CLASS}
                placeholder="••••••••"
              />

              <div className="mt-3 px-2">
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span>Strength</span>
                  <span
                    className={clsx(
                      strength < 3 ? "text-red-500" : "text-green-500"
                    )}
                  >
                    {strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className={clsx(
                      "h-full transition-all duration-500",
                      strength < 2
                        ? "bg-red-500"
                        : strength < 4
                        ? "bg-amber-500"
                        : "bg-green-500"
                    )}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {pwdMsg && (
              <span className="text-sm font-medium text-blue-600">
                {pwdMsg}
              </span>
            )}
            <button
              type="submit"
              className={clsx(
                "ml-auto rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform",
                GRADIENT_BG
              )}
            >
              Update Password
            </button>
          </div>
        </form>
      </section>

      {/* Sessions Section */}
      <section className={CARD_CLASS}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Smartphone className="text-green-500" size={24} /> Active Sessions
          </h2>
          <button
            onClick={revokeAllOthers}
            className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-full transition-colors border border-red-200 dark:border-red-900/30"
          >
            Revoke Others
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-black/40 flex items-center justify-center text-gray-500 shadow-sm">
                  {s.device.includes("Phone") ? (
                    <Smartphone size={20} />
                  ) : (
                    <SmartphoneNfc size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {s.device}
                    </p>
                    {s.current && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {s.ip} • {s.city || "Unknown"} • {s.lastActive}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Revoke"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
