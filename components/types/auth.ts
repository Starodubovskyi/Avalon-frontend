export interface FormData {
  firstName: string;
  companyLocation: string;
  email: string;
  industry: string;
  phone: string;
  password: string;
}

export interface Testimonial {
  text: string;
  author: string;
  role: string;
  avatar: string;
}

export type AccountType = 'merchant' | 'agent';
export type FocusedField = 'firstName' | 'companyLocation' | 'email' | 'industry' | 'phone' | 'password' | null;