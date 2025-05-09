import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BloqueadoPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center max-w-md">
        <Lock className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2 text-center">Acesso Bloqueado</h1>
        <p className="text-gray-600 mb-4 text-center">
          Seu período de acesso ao Minha Grana expirou.<br />
          Entre em contato com o administrador para renovar sua assinatura e voltar a utilizar a plataforma.
        </p>
        <Button
          className="w-full bg-green-500 hover:bg-green-600 mt-2"
          onClick={() => window.open('https://wa.me/557199622786?text=Olá, preciso renovar meu acesso ao Minha Grana!', '_blank')}
        >
          Falar com o Suporte no WhatsApp
        </Button>
        <Button
          className="w-full mt-2"
          variant="outline"
          onClick={() => navigate('/login')}
        >
          Voltar para o login
        </Button>
      </div>
    </div>
  );
};

export default BloqueadoPage; 