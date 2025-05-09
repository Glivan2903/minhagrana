
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-minhagrana-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-8">Página não encontrada</p>
        <Button asChild>
          <Link to="/dashboard" className="bg-minhagrana-primary hover:bg-minhagrana-primary-dark">
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
