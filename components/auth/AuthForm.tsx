'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook, FaArrowLeft } from 'react-icons/fa';
import { AuthApi, extractAuthError } from '@/lib/api/auth';

type AccountType = 'business' | 'personal';
type FocusedField = 'firstName' | 'lastName' | 'businessName' | 'location' | 'email' | 'phone' | 'password' | 'confirmPassword' | null;

interface FormData {
  firstName: string;
  lastName: string;
  businessName: string;
  location: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// 1. Добавляем интерфейс для пропсов
interface AuthFormProps {
  onClose?: () => void;
  initialLoginMode?: boolean;
}

// 2. Деструктурируем пропс
export default function AuthForm({ onClose, initialLoginMode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(() => {
    if (typeof initialLoginMode === 'boolean') return initialLoginMode;
    const mode = searchParams.get('mode');
    if (mode === 'login') return true;
    if (mode === 'register') return false;
    return Boolean(searchParams.get('next'));
  });
  const [step, setStep] = useState<number>(1);
  const [accountType, setAccountType] = useState<AccountType>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    businessName: '',
    location: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  const gradientTextClass = "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";
  const gradientBgClass = "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600";
  const focusBorderClass = "border-blue-600 ring-4 ring-blue-600/10 bg-white";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    if (isLoginMode) {
      setIsSubmitting(true);
      try {
        await AuthApi.login({ email: formData.email, password: formData.password });
        redirectAfterAuth();
      } catch (error: unknown) {
        setFormError(extractAuthError(error));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (!acceptedPolicy) {
      setFormError("Please accept the Privacy Policy");
      return;
    }

    const firstName =
      accountType === "business"
        ? formData.businessName.trim()
        : formData.firstName.trim();
    const lastName = formData.lastName.trim() || "—";

    setIsSubmitting(true);
    try {
      await AuthApi.register({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
      });
      redirectAfterAuth();
    } catch (error: unknown) {
      setFormError(extractAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  function isSafeRelativePath(path: string): boolean {
    if (!path.startsWith("/") || path.startsWith("//")) return false;
    if (path.includes("://") || path.includes("\\")) return false;
    if (/%5c/i.test(path) || /\s/.test(path)) return false;
    return true;
  }

  function redirectAfterAuth() {
    const nextRaw = searchParams.get("next");
    const intent = searchParams.get("intent");
    let dest = "/maps";

    if (nextRaw && isSafeRelativePath(nextRaw)) {
      dest = nextRaw;
    }

    if (intent === "add-pin") {
      const hashIndex = dest.indexOf("#");
      const withoutHash = hashIndex >= 0 ? dest.slice(0, hashIndex) : dest;
      const qIndex = withoutHash.indexOf("?");
      const pathname = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
      const query = qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "";
      const params = new URLSearchParams(query);
      if (!params.get("intent")) params.set("intent", "add-pin");
      const qs = params.toString();
      dest = qs ? `${pathname}?${qs}` : pathname;
    }

    onClose?.();
    router.replace(dest);
  }

  const toggleMode = (): void => {
    setIsLoginMode(!isLoginMode);
    setStep(1);
    setFormError(null);
  };

  const goBack = (): void => {
    setStep(1);
  };

  return (
    <div className={`
        bg-white flex flex-col justify-center relative z-20 
        w-full lg:w-[50%] 
        p-8 lg:p-12 
        rounded-t-[2rem] lg:rounded-t-none lg:rounded-l-[3.5rem] 
        shadow-[0_-10px_40px_rgba(0,0,0,0.2)] lg:shadow-[-20px_0_60px_rgba(0,0,0,0.3)]
        overflow-y-auto
        flex-1 lg:flex-auto
    `}>
      
      {!isLoginMode && step === 2 && (
        <button 
            onClick={goBack}
            className="absolute top-6 left-6 lg:top-8 lg:left-8 text-gray-400 hover:text-gray-600 flex items-center gap-2 transition-colors font-medium text-sm"
        >
            <FaArrowLeft /> Back
        </button>
      )}

      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 mt-4">
        {isLoginMode 
          ? 'Welcome back!' 
          : step === 1 ? 'Create an account' : 'Complete Profile'}
      </h2>
      <p className="text-sm text-gray-500 mb-6 lg:mb-8">
        {isLoginMode 
          ? 'Log in to manage your pins and analytics' 
          : step === 1 
            ? 'Choose your account type to get started'
            : 'Fill in your details to finish setup'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full mx-auto lg:mx-0">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        
        {/* --- ШАГ 1: Тип аккаунта --- */}
        {!isLoginMode && step === 1 && (
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex-1 py-2 lg:py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                accountType === 'business'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Business
            </button>
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`flex-1 py-2 lg:py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                accountType === 'personal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal
            </button>
          </div>
        )}

        {/* Email Field */}
        {(isLoginMode || step === 1) && (
             <input
             type="email"
             required
             placeholder="E-mail Address"
             value={formData.email}
             onChange={(e) => setFormData({...formData, email: e.target.value})}
             onFocus={() => setFocusedField('email')}
             onBlur={() => setFocusedField(null)}
             className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 ${
               focusedField === 'email' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
             }`}
           />
        )}

        {/* --- ШАГ 2 --- */}
        {!isLoginMode && step === 2 && (
          <>
            {accountType === 'personal' && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 ${
                        focusedField === 'firstName' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                        }`}
                    />
                     <input
                        type="text"
                        required
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 ${
                        focusedField === 'lastName' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                        }`}
                    />
                </div>
            )}

            {accountType === 'business' && (
                <input
                    type="text"
                    required
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    onFocus={() => setFocusedField('businessName')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 ${
                    focusedField === 'businessName' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                    }`}
                />
            )}

            <input
                type="tel"
                required
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 ${
                  focusedField === 'phone' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                }`}
            />

            <div className="relative">
                <select
                    value={formData.location}
                    required
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 appearance-none cursor-pointer ${
                    focusedField === 'location' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                    }`}
                >
                    <option value="">Select Region</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">European Union</option>
                    <option value="asia">Asia Pacific</option>
                    <option value="other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </>
        )}

        {/* --- Пароли --- */}
        {(isLoginMode || step === 2) && (
          <div className="space-y-3 lg:space-y-4">
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 pr-14 ${
                    focusedField === 'password' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 text-xs lg:text-sm font-medium`}
                >
                     {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            {!isLoginMode && step === 2 && (
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-5 py-3 lg:py-3.5 bg-gray-50 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 pr-14 ${
                        focusedField === 'confirmPassword' ? focusBorderClass : 'border-transparent hover:bg-gray-100'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 text-xs lg:text-sm font-medium`}
                    >
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                </div>
            )}
          </div>
        )}

        {isLoginMode && (
          <div className="text-right">
            <button
              type="button"
              className={`text-sm font-medium ${gradientTextClass} hover:underline transition-all`}
            >
              Forgot password?
            </button>
          </div>
        )}

        {!isLoginMode && step === 2 && (
          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="privacy"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="mt-1 w-4 h-4 lg:w-5 lg:h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-xs text-gray-500 cursor-pointer leading-tight">
              I accept the <a href="#" className={`font-semibold ${gradientTextClass} hover:underline`}>Privacy Policy</a>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${gradientBgClass} text-white font-bold py-3.5 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 transform active:scale-95 hover:scale-[1.02] hover:opacity-95 shadow-lg shadow-blue-500/25 mt-4 lg:mt-6 text-sm lg:text-base disabled:opacity-60 disabled:hover:scale-100`}
        >
          {isSubmitting
            ? (isLoginMode ? 'Signing in…' : 'Creating account…')
            : isLoginMode 
            ? 'Log in' 
            : step === 1 ? 'Next Step' : 'Create Account'}
        </button>

        {/* Social Buttons */}
        {(isLoginMode || step === 1) && (
            <>
                <div className="relative flex py-4 lg:py-5 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] lg:text-xs font-medium uppercase tracking-wider">Or continue with</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="flex items-center justify-center py-3 lg:py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95">
                        <FcGoogle size={22} className="lg:w-6 lg:h-6" />
                    </button>
                    
                    <button type="button" className="flex items-center justify-center py-3 lg:py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95">
                        <FaApple size={22} className="text-gray-900 lg:w-6 lg:h-6" />
                    </button>

                    <button type="button" className="flex items-center justify-center py-3 lg:py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl lg:rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95">
                        <FaFacebook size={22} className="text-[#1877F2] lg:w-6 lg:h-6" />
                    </button>
                </div>
            </>
        )}

        <div className="text-center text-sm text-gray-600 pt-4 pb-2 lg:pb-0">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className={`font-bold ${gradientTextClass} hover:underline transition-all`}
          >
            {isLoginMode ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  );
}