
import React from 'react';
import Logo from '@/components/Logo';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
