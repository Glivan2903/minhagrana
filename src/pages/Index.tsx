
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redireciona para a página de login
    navigate("/login");
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-minhagrana-primary">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Minha Grana</h1>
        <p className="text-xl">Carregando seu painel financeiro...</p>
      </div>
    </div>
  );
};

export default Index;
