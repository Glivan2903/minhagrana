import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [planoStatus, setPlanoStatus] = useState<string | null>(null);
  const [vencimento, setVencimento] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        if (data.session?.user?.email) {
          // Buscar status e vencimento sempre que autenticar
          const { data: usuario } = await supabase
            .from('usuarios')
            .select('status, vencimento')
            .eq('email', data.session.user.email)
            .single();
          if (usuario) {
            setPlanoStatus(typeof usuario.status === 'string' ? usuario.status.trim().toLowerCase() : null);
            setVencimento(usuario.vencimento || null);
          }
        }
        // Configurar listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user || null);
            setLoading(false);
          }
        );
        setLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Bloqueio global para premium vencido
  useEffect(() => {
    if (
      user &&
      planoStatus === 'premium' &&
      vencimento &&
      new Date() > new Date(vencimento) &&
      location.pathname !== '/bloqueado'
    ) {
      supabase.auth.signOut();
      navigate('/bloqueado');
      toast({
        title: 'Acesso bloqueado',
        description: 'Seu período de acesso expirou. Entre em contato com o administrador para renovação.',
        variant: 'destructive',
      });
    }
  }, [user, planoStatus, vencimento, location.pathname, navigate, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Buscar status e vencimento do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('status, vencimento')
        .eq('email', email)
        .single();
      if (!userError && usuario) {
        if (typeof usuario.status === 'string' && usuario.status.trim().toLowerCase() === 'premium') {
          if (usuario.vencimento && new Date() > new Date(usuario.vencimento)) {
            navigate('/bloqueado');
            toast({
              title: 'Acesso bloqueado',
              description: 'Seu período de acesso expirou. Entre em contato com o administrador para renovação.',
              variant: 'destructive',
            });
            return;
          }
        }
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta ao Minha Grana!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, phone: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone,
          },
        },
      });

      if (error) throw error;

      // Inserir na tabela usuarios
      await supabase.from('usuarios').insert({
        email,
        nome: username,
        celular: phone,
        status: 'free',
        aceite_termos: false,
      });

      // Send welcome message via webhook
      try {
        await fetch('https://n8n.auto375bot.xyz/webhook/minhagrana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: username,
            email: email,
            phone: phone
          })
        });
        
        console.log('Webhook sent for welcome message');
      } catch (webhookError) {
        console.error('Failed to send welcome webhook:', webhookError);
      }
      
      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu email e WhatsApp para confirmar sua conta",
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente com informações diferentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Logout realizado com sucesso",
        description: "Volte sempre ao Minha Grana!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar redefinição de senha",
        description: error.message || "Verifique o email informado e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
