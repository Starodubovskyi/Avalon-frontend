"use client";

import { useEffect, useMemo, useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Company } from "@/components/types/company.types";

import { section } from "../ui/classes";
import Progress from "./ui/Progress";
import StickyNav from "./ui/StickyNav";

import StepCompany from "../steps/StepCompany";
import StepTeam from "../steps/StepTeam";
import StepLineUp from "../steps/StepLineUp";
import StepBranding from "../steps/StepBranding";
import StepLocation from "../steps/StepLocation";
import StepContacts from "../steps/StepContacts";
import StepAbout from "../steps/StepAbout";

import { MOCK_USERS } from "../data/mockUsers";
import { DirectoryUser, LineUpItem, Step, TeamMember } from "./types";

countries.registerLocale(enLocale);

type CompanyForm = Omit<Company, "id" | "category" | "status" | "employees"> & {
  employees?: string;
  team: TeamMember[];
  lineup: LineUpItem[];
};

const EMPTY_LINEUP_DRAFT: LineUpItem = {
  id: "",
  name: "",
  port: "",
  window: "",
  notes: "",
};

export default function CompanyRegistrationForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: Company) => void;
  initialData?: Company;
}) {
  const countryList = useMemo(
    () => Object.entries(countries.getNames("en")),
    []
  );

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultForm: CompanyForm = {
    legalName: "",
    businessName: "",
    employees: "",
    founded: "",
    lat: 51.505,
    lng: -0.09,
    logoUrl: "",
    bannerUrl: "",
    pinUrl: "",
    activity: "",
    country: "",
    city: "",
    servicedPorts: "",
    address: "",
    state: "",
    postalCode: "",
    telephone: "",
    fax: "",
    email: "",
    website: "",
    poBox: "",
    tagline: "",
    description: "",
    team: [],
    lineup: [],
  };

  const [formData, setFormData] = useState<CompanyForm>(() =>
    initialData
      ? {
          ...defaultForm,
          ...initialData,
          employees:
            (initialData as any).employees !== undefined &&
            (initialData as any).employees !== null
              ? String((initialData as any).employees)
              : "",
          team: (initialData as any).team ?? [],
          lineup: (initialData as any).lineup ?? [],
        }
      : defaultForm
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [pin, setPin] = useState<File | null>(null);

  useEffect(() => {
    setLogo(null);
    setBanner(null);
    setPin(null);
    if (initialData) {
      setFormData({
        ...defaultForm,
        ...initialData,
        employees:
          (initialData as any).employees !== undefined &&
          (initialData as any).employees !== null
            ? String((initialData as any).employees)
            : "",
        team: (initialData as any).team ?? [],
        lineup: (initialData as any).lineup ?? [],
      });
    } else {
      setFormData(defaultForm);
    }
  }, [initialData]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => res(reader.result as string);
      reader.onerror = (e) => rej(e);
    });

  const validate = () => {
    const v: Record<string, string> = {};
    if (!formData.legalName) v.legalName = "Legal Name is required";
    if (!formData.businessName) v.businessName = "Business Name is required";
    if (!formData.address) v.address = "Address is required";
    if (!formData.email) v.email = "Email is required";
    if (!formData.website) v.website = "Website is required";
    if (!formData.activity) v.activity = "Activity is required";
    if (!formData.description) v.description = "Description is required";
    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const finalLogoUrl = logo ? await toBase64(logo) : formData.logoUrl || "";
      const finalBannerUrl = banner
        ? await toBase64(banner)
        : formData.bannerUrl || "";
      const finalPinUrl = pin ? await toBase64(pin) : formData.pinUrl || "";

      const payload: Company = {
        id: initialData?.id ?? "",
        businessName: formData.businessName || "",
        legalName: formData.legalName || undefined,
        activity: formData.activity || undefined,
        tagline: formData.tagline || undefined,

        bannerUrl: finalBannerUrl || undefined,
        logoUrl: finalLogoUrl || undefined,
        pinUrl: finalPinUrl || undefined,

        description: formData.description || undefined,
        website: formData.website || undefined,
        email: formData.email || undefined,
        founded: formData.founded || undefined,
        employees:
          formData.employees !== undefined && formData.employees !== ""
            ? formData.employees
            : undefined,
        servicedPorts: formData.servicedPorts || undefined,

        country: formData.country || undefined,
        state: formData.state || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,

        lat: formData.lat,
        lng: formData.lng,

        telephone: formData.telephone || undefined,
        fax: formData.fax || undefined,
        poBox: formData.poBox || undefined,

        category: (initialData as any)?.category,
        status: (initialData as any)?.status,
      } as Company;

      (payload as any).team = formData.team;
      (payload as any).lineup = formData.lineup;

      onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [memberDraft, setMemberDraft] = useState<TeamMember>({
    id: "",
    firstName: "",
    lastName: "",
    role: "",
    profileUrl: "",
    avatarUrl: "",
    isDeputy: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_USERS.filter((u) => {
      const hay =
        `${u.firstName} ${u.lastName} ${u.role} ${u.username}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 6);
  }, [searchQuery]);

  const pickDirectoryUser = (u: DirectoryUser) => {
    setMemberDraft({
      id: "",
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      profileUrl: u.profileUrl,
      avatarUrl: u.avatarUrl || "",
      isDeputy: false,
    });
    setSearchQuery(`${u.firstName} ${u.lastName}`);
  };

  const addMember = () => {
    if (!memberDraft.firstName || !memberDraft.lastName || !memberDraft.role)
      return;
    const newMember: TeamMember = {
      ...memberDraft,
      id: crypto.randomUUID(),
      profileUrl: memberDraft.profileUrl?.trim() || undefined,
      avatarUrl: memberDraft.avatarUrl?.trim() || undefined,
      isDeputy: !!memberDraft.isDeputy,
    };
    setFormData((p) => ({ ...p, team: [...p.team, newMember] }));
    setMemberDraft({
      id: "",
      firstName: "",
      lastName: "",
      role: "",
      profileUrl: "",
      avatarUrl: "",
      isDeputy: false,
    });
    setSearchQuery("");
  };

  const removeMember = (id: string) => {
    setFormData((p) => ({ ...p, team: p.team.filter((m) => m.id !== id) }));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editProfileUrl, setEditProfileUrl] = useState("");
  const [editIsDeputy, setEditIsDeputy] = useState(false);

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditRole(m.role);
    setEditProfileUrl(m.profileUrl ?? "");
    setEditIsDeputy(!!m.isDeputy);
  };
  const saveEdit = () => {
    if (!editingId) return;
    setFormData((p) => ({
      ...p,
      team: p.team.map((m) =>
        m.id === editingId
          ? {
              ...m,
              role: editRole,
              profileUrl: editProfileUrl || undefined,
              isDeputy: editIsDeputy,
            }
          : m
      ),
    }));
    setEditingId(null);
    setEditRole("");
    setEditProfileUrl("");
    setEditIsDeputy(false);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditRole("");
    setEditProfileUrl("");
    setEditIsDeputy(false);
  };

  const [lineupDraft, setLineupDraft] =
    useState<LineUpItem>(EMPTY_LINEUP_DRAFT);

  const addLineupItem = () => {
    if (!lineupDraft.port && !lineupDraft.name) return;

    const item: LineUpItem = {
      ...lineupDraft,
      id: crypto.randomUUID(),
      window: lineupDraft.window?.trim() || undefined,
      notes: lineupDraft.notes?.trim() || undefined,
    };

    setFormData((p) => ({ ...p, lineup: [...p.lineup, item] }));

    setLineupDraft(EMPTY_LINEUP_DRAFT);
  };

  const removeLineupItem = (id: string) => {
    setFormData((p) => ({ ...p, lineup: p.lineup.filter((i) => i.id !== id) }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[100dvh] max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
        {initialData ? "Edit Company Profile" : "Register Company"}
      </h2>
      <p className="text-sm text-gray-600 dark:text-neutral-300">
        Welcome to the Avalon Business Directory. Please provide your details.
        The more complete your profile is, the more visibility it will get.
      </p>

      <Progress step={step} />

      {step === 1 && (
        <div className={section}>
          <StepCompany
            formData={formData}
            errors={errors}
            setFormData={setFormData}
          />
        </div>
      )}

      {step === 2 && (
        <div className={section}>
          <StepTeam
            team={formData.team}
            memberDraft={memberDraft}
            setMemberDraft={setMemberDraft}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredUsers={filteredUsers}
            pickDirectoryUser={pickDirectoryUser}
            addMember={addMember}
            removeMember={removeMember}
            editingId={editingId}
            setEditingId={setEditingId}
            editRole={editRole}
            setEditRole={setEditRole}
            editProfileUrl={editProfileUrl}
            setEditProfileUrl={setEditProfileUrl}
            editIsDeputy={editIsDeputy}
            setEditIsDeputy={setEditIsDeputy}
            startEdit={startEdit}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
          />
        </div>
      )}

      {step === 3 && (
        <div className={section}>
          <StepLineUp
            lineup={formData.lineup}
            lineupDraft={lineupDraft}
            setLineupDraft={setLineupDraft}
            addLineupItem={addLineupItem}
            removeLineupItem={removeLineupItem}
          />
        </div>
      )}

      {step === 4 && (
        <div className={section}>
          <StepBranding
            logo={logo}
            setLogo={setLogo}
            banner={banner}
            setBanner={setBanner}
            pin={pin}
            setPin={setPin}
            formData={formData}
          />
        </div>
      )}

      {step === 5 && (
        <div className={section}>
          <StepLocation
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            countryList={countryList}
            pin={pin}
          />
        </div>
      )}

      {step === 6 && (
        <div className={section}>
          <StepContacts
            formData={formData}
            errors={errors}
            setFormData={setFormData}
          />
        </div>
      )}

      {step === 7 && (
        <div className={section}>
          <StepAbout
            formData={formData}
            errors={errors}
            setFormData={setFormData}
          />
        </div>
      )}

      <StickyNav
        step={step}
        setStep={(updater) => setStep(updater)}
        isSubmitting={isSubmitting}
        isEditing={!!initialData}
        handleSubmit={() => handleSubmit()}
      />
    </form>
  );
}
