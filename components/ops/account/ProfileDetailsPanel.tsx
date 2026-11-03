"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Languages, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { useAppLocale } from "@/lib/i18n/useAppLocale";
import { LOCALES, LOCALE_LABEL, isLocale } from "@/i18n/config";
import { PROFILE_ERRORS } from "@/lib/profiles/api";
import { useProfile, useUpdateMyProfile } from "@/lib/profiles/hooks";
import { BIO_MAX, HEADLINE_MAX, PHONE_MAX } from "@/lib/profiles/types";
import { ErrorBlock, Field, Panel, SelectInput, Spinner, TextArea, TextInput, btn } from "../ui/primitives";

/** Public profile (headline, about, phone) saved via PATCH /profiles/me; language applies at once */
export function ProfileDetailsPanel() {
  const t = useTranslations("account");
  const { user } = useAuth();
  const userId = user ? Number(user.id) : null;
  const { data, error, mutate } = useProfile(userId);
  const update = useUpdateMyProfile();
  const errorText = useApiErrorText("account", PROFILE_ERRORS);
  const { locale, setLocale, pending } = useAppLocale();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  // fill once per account: background refreshes must not overwrite what is being typed
  const filledFor = useRef<number | null>(null);
  useEffect(() => {
    if (!data || filledFor.current === data.user.id) return;
    filledFor.current = data.user.id;
    setHeadline(data.headline ?? "");
    setBio(data.bio ?? "");
    setPhone(data.phone ?? "");
  }, [data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await update({ headline: headline.trim() || null, bio: bio.trim() || null, phone: phone.trim() || null });
      toast.success(t("details.saved"));
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      className="min-w-0"
      title={t("details.title")}
      description={t("details.hint")}
      icon={<Sparkles className="h-4 w-4" />}
      action={
        userId ? (
          <Link href={`/people/${userId}`} className={`${btn.ghost} h-10 shrink-0`} aria-label={t("details.view")}>
            <span className="hidden sm:inline">{t("details.view")}</span> <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null
      }
    >
      {error && !data ? <ErrorBlock error={new Error(t("details.loadError"))} onRetry={() => void mutate()} /> : null}
      <form onSubmit={save} className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label={t("details.headline")} hint={t("details.headlineHint")}>
            <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={HEADLINE_MAX} placeholder={t("details.headlinePlaceholder")} disabled={!data} />
          </Field>
          <Field label={t("details.phone")} hint={t("details.phoneHint")}>
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={PHONE_MAX} inputMode="tel" autoComplete="tel" disabled={!data} />
          </Field>
          <Field label={t("details.language")} hint={t("details.languageHint")}>
            <div className="relative">
              <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <SelectInput
                value={locale}
                onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
                disabled={pending}
                className="pl-9"
              >
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABEL[l].name}
                  </option>
                ))}
              </SelectInput>
            </div>
          </Field>
        </div>
        <div className="flex flex-col gap-4">
          <Field label={t("details.bio")} hint={`${bio.length} / ${BIO_MAX}`} className="flex-1">
            <TextArea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={BIO_MAX} rows={7} placeholder={t("details.bioPlaceholder")} disabled={!data} className="flex-1" />
          </Field>
          <div className="flex justify-end">
            <button type="submit" disabled={busy || !data} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null} {t("details.save")}
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
