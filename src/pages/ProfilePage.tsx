import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Lock, CreditCard } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nome: '',
    email: '',
    celular: '',
    created_at: '',
    ultima_atualizacao: '',
    status: '',
    aceite_termos: false,
    data_aceite_termos: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error || !data) throw error || new Error('Usuário não encontrado');

        setProfile({
          nome: data.nome,
          email: data.email,
          celular: data.celular,
          created_at: data.created_at,
          ultima_atualizacao: data.ultima_atualizacao,
          status: data.status,
          aceite_termos: data.aceite_termos,
          data_aceite_termos: data.data_aceite_termos,
        });
      } catch (error: any) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.email, toast]);

  const userInitials = profile.nome
    ? profile.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          username: profile.nome,
          phone: profile.celular
        }
      });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso",
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen pl-2 pr-4 py-6 space-y-6 flex flex-col">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl bg-minhagrana-primary text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-medium">{profile.nome}</h3>
            <p className="text-muted-foreground">{profile.email}</p>
            
            <div className="w-full mt-6 space-y-4">
              <div className="flex justify-between">
                <span>Celular:</span>
                <span>{profile.celular || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Data de cadastro:</span>
                <span>{profile.created_at ? new Date(profile.created_at).toLocaleString('pt-BR') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Último acesso:</span>
                <span>{profile.ultima_atualizacao ? new Date(profile.ultima_atualizacao).toLocaleString('pt-BR') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{profile.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Aceite dos Termos:</span>
                <span>{profile.aceite_termos ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span>Data do Aceite:</span>
                <span>{profile.data_aceite_termos ? new Date(profile.data_aceite_termos).toLocaleString('pt-BR') : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Atualizar Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Atualizar Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Nome completo
                  </label>
                  <Input 
                    id="fullName" 
                    value={profile.nome}
                    onChange={(e) => setProfile({...profile, nome: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    E-mail
                  </label>
                  <Input 
                    id="email" 
                    value={profile.email}
                    readOnly
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Celular
                    <span className="ml-1 text-muted-foreground text-xs">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      value={profile.celular}
                      onChange={(e) => setProfile({...profile, celular: e.target.value})}
                      placeholder="557193998011"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-2 bg-green-500 hover:bg-green-600"
                  disabled={loading}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={18} />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                    Senha atual
                  </label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    Nova senha
                  </label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirmar nova senha
                  </label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Alterar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Faturamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={18} />
              Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plano atual:</span>
              <span className="font-medium">{profile.status}</span>
            </div>
            
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={() => {
                window.open('https://wa.me/557199622786?text=Olá, gostaria de contratar o plano Premium do Minha Grana!', '_blank');
              }}
            >
              Adquirir Plano Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
