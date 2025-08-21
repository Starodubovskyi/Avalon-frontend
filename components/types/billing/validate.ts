export function normalizeCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function normalizeExp(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

export function detectBrand(num: string): "visa" | "mastercard" | "amex" | null {
  const n = num.replace(/\s+/g, "");
  if (/^4\d{6,}$/.test(n)) return "visa";
  if (/^(5[1-5]\d{4,}|2(2[2-9]\d{3}|[3-6]\d{4}|7[01]\d{3}|720\d{2}))\d*$/.test(n)) return "mastercard";
  if (/^3[47]\d{5,}$/.test(n)) return "amex";
  return null;
}

export function isCardNumberValid(num: string) {
  const n = num.replace(/\s+/g, "");
  if (n.length < 12) return false;
  let sum = 0, flip = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (flip) { d *= 2; if (d > 9) d -= 9; }
    sum += d; flip = !flip;
  }
  return sum % 10 === 0;
}

export function isExpValid(exp: string) {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const mm = parseInt(exp.slice(0, 2), 10);
  const yy = 2000 + parseInt(exp.slice(3, 5), 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const lastOfMonth = new Date(yy, mm, 0);
  return lastOfMonth >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isCvcValid(cvc: string, brand: string | null) {
  const len = brand === "amex" ? 4 : 3;
  return new RegExp(`^\\d{${len}}$`).test(cvc);
}

export function last4FromNumber(num: string) {
  const n = num.replace(/\D/g, "");
  return n.slice(-4).padStart(4, "0");
}

export function maskForPreview(num: string) {
  const n = num.replace(/\D/g, "");
  if (!n.length) return "•••• •••• •••• ••••";
  const groups = n.match(/.{1,4}/g) || [];
  return groups.join(" ").replace(/\d(?=\d{4})/g, "•");
}
