
import React from 'react';
import Logo from '@/components/Logo';
import { LoginForm } from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
