import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, PenLine, Target, Radio, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Goal {
  id: number;
  descricao: string;
  valor_meta: number;
  valor_atual: number;
  data_inicio: string;
  data_fim: string;
  usuario_id: number;
  finalizada?: boolean;
  status: string;
  titulo?: string;
  categoria?: string;
  data_finalizada?: string;
  data_prevista?: string;
}

const CATEGORIAS = [
  'Viagem', 'Educação', 'Emergência', 'Aposentadoria', 'Carro', 'Casa', 'Casamento', 'Investimento', 'Eletrônicos', 'Outro'
];
const STATUS = ['Em andamento', 'Finalizada'];

const GoalsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMeta, setEditMeta] = useState<any>(null);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    valor_meta: '',
    valor_atual: '',
    data_inicio: '',
    data_prevista: '',
    categoria: '',
    status: STATUS[0],
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .order('data_fim', { ascending: true });

      if (error) throw error;
      setGoals(data as Goal[] || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (atual: number, meta: number) => {
    return Math.min(Math.round((atual / meta) * 100), 100);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const filteredGoals = goals.filter(goal =>
    goal.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar metas em andamento e finalizadas
  const metasAndamento = goals.filter(g => {
    const progresso = g.valor_meta > 0 ? (g.valor_atual / g.valor_meta) * 100 : 0;
    return (!g.finalizada && g.status !== 'Finalizada' && progresso < 100);
  });
  const metasFinalizadas = goals.filter(g => {
    const progresso = g.valor_meta > 0 ? (g.valor_atual / g.valor_meta) * 100 : 0;
    return (g.finalizada || g.status === 'Finalizada' || progresso >= 100);
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDeleteMeta = async (metaId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) return;
    try {
      const { error } = await supabase.from('metas').delete().eq('id', metaId);
      if (error) throw error;
      fetchGoals();
      toast({ title: 'Meta excluída com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro ao excluir meta', description: err.message, variant: 'destructive' });
    }
  };

  const handleEditMeta = (meta: any) => {
    setEditMeta(meta);
    setForm({
      titulo: meta.titulo || '',
      descricao: meta.descricao || '',
      valor_meta: meta.valor_meta?.toString() || '',
      valor_atual: meta.valor_atual?.toString() || '',
      data_inicio: meta.data_inicio || '',
      data_prevista: meta.data_prevista || '',
      categoria: meta.categoria || '',
      status: meta.status || STATUS[0],
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      if (editMeta) {
        const { error } = await supabase.from('metas').update({
          titulo: form.titulo,
          descricao: form.descricao,
          valor_meta: Number(form.valor_meta),
          valor_atual: Number(form.valor_atual),
          data_inicio: form.data_inicio,
          data_prevista: form.data_prevista || null,
          categoria: form.categoria,
          status: form.status,
          finalizada: form.status === 'Finalizada',
          data_finalizada: form.status === 'Finalizada' ? new Date().toISOString().slice(0, 10) : null
        }).eq('id', editMeta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('metas').insert({
          usuario_id: user.id,
          titulo: form.titulo,
          descricao: form.descricao,
          valor_meta: Number(form.valor_meta),
          valor_atual: Number(form.valor_atual),
          data_inicio: form.data_inicio,
          data_prevista: form.data_prevista || null,
          categoria: form.categoria,
          status: form.status,
          finalizada: form.status === 'Finalizada',
          data_finalizada: form.status === 'Finalizada' ? new Date().toISOString().slice(0, 10) : null
        });
        if (error) throw error;
      }
      setModalOpen(false);
      setEditMeta(null);
      fetchGoals();
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar meta',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditMeta(null);
    setForm({
      titulo: '', descricao: '', valor_meta: '', valor_atual: '', data_inicio: '', data_prevista: '', categoria: '', status: STATUS[0],
    });
  };

  const handleOpenModal = async () => {
    if (!user?.email) {
      setModalOpen(true);
      return;
    }
    // Buscar o id do usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .single();
    let saldo = 0;
    if (usuario) {
      // Buscar todas as transações do usuário
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('valor, tipo')
        .eq('usuario_id', usuario.id);
      const receitas = (transacoes || []).filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor || 0), 0);
      const despesas = (transacoes || []).filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor || 0), 0);
      saldo = receitas - despesas;
    }
    setForm(f => ({ ...f, valor_atual: saldo.toString() }));
    setModalOpen(true);
  };

  // Componente de Card de Meta padronizado
  function MetaCard({ meta, finalizada = false }: { meta: any, finalizada?: boolean }) {
    const progresso = meta.valor_meta > 0 ? Math.round((meta.valor_atual / meta.valor_meta) * 100) : 0;
    const diasRestantes = meta.data_prevista ? calculateDaysRemaining(meta.data_prevista) : null;

    return (
      <Card key={meta.id} className="w-full flex flex-col md:flex-row items-center justify-between gap-6 p-6 shadow-sm border border-gray-200 bg-white rounded-2xl my-3">
        {/* Esquerda: Título e categoria */}
        <div className="flex-1 min-w-[180px] flex flex-col gap-2 items-start">
          <CardTitle className="text-2xl font-bold mb-1">{meta.titulo || meta.descricao}</CardTitle>
          <div className="flex items-center gap-2">
            {meta.categoria && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-base font-medium text-gray-700 border border-gray-200">
                <Target size={16} /> {meta.categoria}
              </span>
            )}
          </div>
        </div>

        {/* Centro: Progresso e dias restantes */}
        <div className="flex flex-col items-center min-w-[180px] max-w-[220px] w-full">
          {!finalizada && (
            <>
              <span className="text-base font-semibold text-gray-700 mb-1">Progresso: {progresso}%</span>
              <Progress value={progresso} className="h-3 w-full mb-2" />
              {diasRestantes !== null && (
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'}
                </span>
              )}
            </>
          )}
          {finalizada && (
            <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">Concluída</span>
          )}
        </div>

        {/* Direita: Valores e datas */}
        <div className="flex flex-col gap-2 min-w-[180px] items-end">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Meta</span>
            <span className="text-lg font-bold text-gray-900">R$ {Number(meta.valor_meta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">{finalizada ? 'Valor alcançado' : 'Saldo atual'}</span>
            <span className="text-lg font-bold text-gray-900">R$ {Number(meta.valor_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex flex-col items-end mt-2">
            {!finalizada ? (
              <span className="text-xs text-gray-500">Início: {format(new Date(meta.data_inicio), 'dd/MM/yyyy')}</span>
            ) : (
              <span className="text-xs text-gray-500">Concluída em: {meta.data_finalizada ? format(new Date(meta.data_finalizada), 'dd/MM/yyyy') : '-'}</span>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 items-center min-w-[60px]">
          <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditMeta(meta)}>
            <PenLine className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDeleteMeta(meta.id)}>
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen pl-2 pr-4 py-8 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-muted-foreground text-base mt-1">
            Crie objetivos personalizados — como viajar, quitar dívidas ou fazer uma reserva de emergência — e acompanhe seu progresso.
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded shadow-none text-lg" onClick={handleOpenModal}>
          <Plus className="mr-2 h-5 w-5" /> Nova meta
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
            </DialogHeader>
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input name="titulo" placeholder="Ex: Viagem para a Europa" value={form.titulo} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea name="descricao" className="w-full border rounded px-3 py-2 min-h-[60px]" placeholder="Descreva sua meta financeira" value={form.descricao} onChange={handleFormChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor da meta</label>
                <Input name="valor_meta" type="number" min="0" step="0.01" value={form.valor_meta} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Saldo atual</label>
                <Input name="valor_atual" type="number" min="0" step="0.01" value={form.valor_atual} onChange={handleFormChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data de início</label>
                <Input name="data_inicio" type="date" value={form.data_inicio} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data prevista</label>
                <Input name="data_prevista" type="date" value={form.data_prevista} onChange={handleFormChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select name="categoria" className="w-full border rounded px-3 py-2" value={form.categoria} onChange={handleFormChange} required>
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" className="w-full border rounded px-3 py-2" value={form.status} onChange={handleFormChange} required>
                  {STATUS.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Metas em andamento */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Radio className="text-gray-700" size={24} />
          <span className="font-semibold text-2xl">Metas em andamento</span>
        </div>
        <div className="flex flex-col gap-6">
          {loading ? (
            <span>Carregando...</span>
          ) : metasAndamento.length === 0 ? (
            <span className="text-gray-500 text-center w-full">Você não tem metas em andamento. Clique em "Nova meta" para começar.</span>
          ) : (
            metasAndamento.map((goal) => (
              <MetaCard key={goal.id} meta={goal} />
            ))
          )}
        </div>
      </div>

      {/* Metas finalizadas */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="text-green-500" size={24} />
          <span className="font-semibold text-2xl">Metas finalizadas</span>
        </div>
        <div className="flex flex-col gap-6">
          {loading ? (
            <span>Carregando...</span>
          ) : metasFinalizadas.length === 0 ? (
            <span className="text-gray-500 text-center w-full">Você ainda não finalizou nenhuma meta.</span>
          ) : (
            metasFinalizadas.map((goal) => (
              <MetaCard key={goal.id} meta={goal} finalizada />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
