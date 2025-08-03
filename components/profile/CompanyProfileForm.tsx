"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface CompanyProfileData {
  logo?: string;
  companyName: string;
  email: string;
  phone?: string;
  emailSignature?: string;
  password?: string;
  confirmPassword?: string;
}

const CompanyProfileForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompanyProfileData>({
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      emailSignature: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка сохранённых данных из localStorage (если есть)
    const savedCompany = localStorage.getItem("companyProfile");
    if (savedCompany) {
      const data = JSON.parse(savedCompany);
      reset(data);
      if (data.logo) setLogoPreview(data.logo);
    }
  }, [reset]);

  const onSubmit = (data: CompanyProfileData) => {
    if (data.password && data.password !== data.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    // Сохраняем в localStorage (для примера)
    localStorage.setItem("companyProfile", JSON.stringify(data));
    toast({
      title: "Профиль компании обновлен",
      description: "Данные успешно сохранены",
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
    >
      <div>
        <Label>Логотип компании</Label>
        <div className="mt-2 flex items-center gap-4">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company Logo"
              className="w-20 h-20 rounded-md object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center border">
              Нет логотипа
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="cursor-pointer text-sm text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>

      <div>
        <Label>Название компании</Label>
        <Input
          {...register("companyName", { required: "Введите название компании" })}
          placeholder="ООО Ромашка"
          className="mt-1"
        />
        {errors.companyName && (
          <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <Label>Email компании</Label>
        <Input
          type="email"
          {...register("email", {
            required: "Введите email",
            pattern: {
              value:
                /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
              message: "Введите корректный email",
            },
          })}
          placeholder="company@example.com"
          className="mt-1"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label>Телефон</Label>
        <Input
          {...register("phone")}
          placeholder="+7 (999) 123-45-67"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Подпись для писем</Label>
        <textarea
          {...register("emailSignature")}
          placeholder="С уважением, Команда ООО Ромашка"
          rows={3}
          className="w-full mt-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <Label>Новый пароль</Label>
        <Input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="mt-1"
          autoComplete="new-password"
        />
      </div>

      <div>
        <Label>Подтверждение пароля</Label>
        <Input
          type="password"
          {...register("confirmPassword")}
          placeholder="••••••••"
          className="mt-1"
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full">
        Сохранить
      </Button>
    </form>
  );
};

export default CompanyProfileForm;
