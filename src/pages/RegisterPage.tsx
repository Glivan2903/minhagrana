
import React from 'react';
import Logo from '@/components/Logo';
import { RegisterForm } from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
