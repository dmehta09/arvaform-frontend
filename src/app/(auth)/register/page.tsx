import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free ArvaForm account to start building beautiful forms in minutes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
