"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

/** ===================== Component ===================== */

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
    <div className="space-y-8">
      {/* 2FA */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Two-Factor Authentication
        </h2>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-white/10">
          <div>
            <p className="font-medium">Enable 2FA</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Increase account security with one-time codes.
            </p>
          </div>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={twoFAEnabled || setupOpen}
              onChange={(e) => handleToggle2FA(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 after:transition" />
          </label>
        </div>

        {/* Setup wizard */}
        {setupOpen && twoFASecret && (
          <div className="mt-4 rounded-xl border border-blue-200/60 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
            <p className="font-medium mb-2">Set up your authenticator</p>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Open your authenticator app (Google Authenticator, 1Password,
                Authy, etc.).
              </li>
              <li>Use this secret to add a new account (keep it private):</li>
            </ol>

            <div className="mt-3 rounded-lg bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500">Secret</div>
              <div className="font-mono break-all">{twoFASecret}</div>
            </div>

            <div className="mt-3 rounded-lg bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500">otpauth URI</div>
              <div className="font-mono break-all text-xs">{otpauthUrl}</div>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Enter 6-digit code
                </label>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mt-1 rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
                  placeholder="123456"
                />
              </div>
              <button
                onClick={verifySetupCode}
                className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                Verify & enable
              </button>
            </div>

            {setupError && (
              <p className="mt-2 text-sm text-red-600">{setupError}</p>
            )}
          </div>
        )}

        {/* 2FA management */}
        {twoFAEnabled && (
          <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-white/10">
            <p className="font-medium">Backup codes</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use a backup code if you can’t access your authenticator. Each
              code can be used once.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBackups((v) => !v)}
                className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                {showBackups ? "Hide codes" : "Show codes"}
              </button>

              {freshBackupPlain && (
                <>
                  <button
                    onClick={() => copyBackups(freshBackupPlain)}
                    className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => downloadBackups(freshBackupPlain)}
                    className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    Download .txt
                  </button>
                </>
              )}
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
                    alert("New backup codes generated. Save them securely.");
                  }}
                  className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Regenerate
                </button>
              )}

              <button
                onClick={async () => {
                  const ok = window.confirm("Disable 2FA?");
                  if (!ok) return;
                  setTwoFAEnabled(false);
                  setTwoFASecret(null);
                  setBackups([]);
                  setFreshBackupPlain(null);
                  localStorage.removeItem(LS_KEYS.twoFASecret);
                  localStorage.removeItem(LS_KEYS.twoFABackups);
                }}
                className="rounded-xl px-3 py-2 border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/10"
              >
                Disable 2FA
              </button>
            </div>

            {showBackups && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  freshBackupPlain ??
                  backups.map(
                    (_, i) => `CODE-${(i + 1).toString().padStart(2, "0")}****`
                  )
                ).map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono dark:border-white/10"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Change password */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Change Password
        </h2>
        <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            placeholder="Current password"
            className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
          <div className="space-y-2">
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <div className="h-1 w-full rounded bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {strengthLabel}
            </div>
          </div>
          <input
            type="password"
            placeholder="Confirm new password"
            className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-white/10"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Save password
            </button>
            {pwdMsg && (
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                {pwdMsg}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Sessions
          </h2>
          <button
            onClick={revokeAllOthers}
            className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Revoke all other sessions
          </button>
        </div>

        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-white/10 dark:border-white/10">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">
                  {s.device}{" "}
                  {s.current ? (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      current
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  IP {s.ip} • {s.city || "Unknown"} • Last active:{" "}
                  {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="rounded-xl px-3 py-2 border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
