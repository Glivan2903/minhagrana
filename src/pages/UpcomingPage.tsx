import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const UpcomingPage = () => {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [form, setForm] = useState({
    tipo: 'saida',
    valor: '',
    descricao: '',
    categoria_id: '',
    data_prevista: '',
    recorrente: false,
    periodicidade: '',
    status: 'pendente',
    pagador_recebedor: '',
    mes_previsto: '',
    parcelamento: false,
    numero_parcelas: '',
    parcela_atual: '',
    transacao_id: ''
  });
  const [categories, setCategories] = useState<{id: number, descricao: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let usuarioId = null;
        let usuarioStatus = '';
        if (user?.email) {
          const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id, status')
            .eq('email', user.email)
            .single();
          if (usuarioError) throw usuarioError;
          usuarioId = usuario?.id;
          usuarioStatus = usuario?.status;
          setUserStatus(usuarioStatus);
        }
        // Buscar lançamentos futuros
        let lancData: any[] = [];
        if (usuarioId) {
          // @ts-ignore
          const { data, error: lancError } = await supabase
            .from('lancamentos_futuros' as any)
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_prevista', { ascending: true });
          if (lancError) throw lancError;
          lancData = data || [];
        }
        setLancamentos(lancData);
        // Buscar categorias
        const { data: catData, error: catError } = await supabase
          .from('categoria_trasacoes')
          .select('id, descricao');
        if (catError) throw catError;
        setCategories(catData || []);
      } catch (err: any) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user?.email) {
      setError('Você precisa estar logado para adicionar lançamentos futuros.');
      return;
    }
    // Limite para plano free
    if (userStatus === 'free' && lancamentos.length >= 5) {
      setError('No plano Free você só pode criar até 5 lançamentos futuros. Contrate o plano Premium para adicionar mais.');
      return;
    }
    try {
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();
      if (usuarioError || !usuario) throw usuarioError || new Error('Usuário não encontrado');
      // @ts-ignore
      await supabase.from('lancamentos_futuros' as any).insert({
        usuario_id: usuario.id,
        ...form,
        valor: Number(form.valor),
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        parcelamento: !!form.parcelamento,
        numero_parcelas: form.numero_parcelas ? Number(form.numero_parcelas) : null,
        parcela_atual: form.parcela_atual ? Number(form.parcela_atual) : null,
      });
      setForm({
        tipo: 'saida', valor: '', descricao: '', categoria_id: '', data_prevista: '', recorrente: false,
        periodicidade: '', status: 'pendente', pagador_recebedor: '', mes_previsto: '', parcelamento: false,
        numero_parcelas: '', parcela_atual: '', transacao_id: ''
      });
      // Recarregar lançamentos
      // @ts-ignore
      const { data } = await supabase
        .from('lancamentos_futuros' as any)
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('data_prevista', { ascending: true });
      setLancamentos(data || []);
    } catch (err: any) {
      setError('Erro ao adicionar lançamento.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lançamentos Futuros</h1>
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div>
          <label>Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="border rounded px-2 py-1">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>
        <div>
          <label>Valor</label>
          <Input name="valor" type="number" value={form.valor} onChange={handleChange} />
        </div>
        <div>
          <label>Descrição</label>
          <Input name="descricao" value={form.descricao} onChange={handleChange} />
        </div>
        <div>
          <label>Categoria</label>
          <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="border rounded px-2 py-1">
            <option value="">Selecione</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.descricao}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Data Prevista</label>
          <Input name="data_prevista" type="date" value={form.data_prevista} onChange={handleChange} />
        </div>
        <div>
          <label>Recorrente</label>
          <input name="recorrente" type="checkbox" checked={!!form.recorrente} onChange={handleChange} />
        </div>
        <div>
          <label>Periodicidade</label>
          <Input name="periodicidade" value={form.periodicidade} onChange={handleChange} />
        </div>
        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1">
            <option value="pendente">Pendente</option>
            <option value="efetivado">Efetivado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label>Pagador/Recebedor</label>
          <Input name="pagador_recebedor" value={form.pagador_recebedor} onChange={handleChange} />
        </div>
        <div>
          <label>Mês Previsto</label>
          <Input name="mes_previsto" value={form.mes_previsto} onChange={handleChange} placeholder="YYYY-MM" />
        </div>
        <div>
          <label>Parcelamento</label>
          <input name="parcelamento" type="checkbox" checked={!!form.parcelamento} onChange={handleChange} />
        </div>
        <div>
          <label>Nº Parcelas</label>
          <Input name="numero_parcelas" type="number" value={form.numero_parcelas} onChange={handleChange} />
        </div>
        <div>
          <label>Parcela Atual</label>
          <Input name="parcela_atual" type="number" value={form.parcela_atual} onChange={handleChange} />
        </div>
        <div>
          <label>Transação ID</label>
          <Input name="transacao_id" value={form.transacao_id} onChange={handleChange} />
        </div>
        <Button type="submit" className="bg-minhagrana-primary">Adicionar</Button>
      </form>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando lançamentos...</div>
        ) : (
          <table className="min-w-full border mt-4">
            <thead>
              <tr>
                <th className="border px-2 py-1">Data Prevista</th>
                <th className="border px-2 py-1">Descrição</th>
                <th className="border px-2 py-1">Tipo</th>
                <th className="border px-2 py-1">Valor</th>
                <th className="border px-2 py-1">Categoria</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Pagador/Recebedor</th>
                <th className="border px-2 py-1">Parcelamento</th>
                <th className="border px-2 py-1">Parcela</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.length > 0 ? (
                lancamentos.map(l => (
                  <tr key={l.id}>
                    <td className="border px-2 py-1">{l.data_prevista ? format(new Date(l.data_prevista), 'dd/MM/yyyy') : '-'}</td>
                    <td className="border px-2 py-1">{l.descricao}</td>
                    <td className="border px-2 py-1">{l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                    <td className="border px-2 py-1">{l.valor !== undefined ? Number(l.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</td>
                    <td className="border px-2 py-1">{categories.find(c => c.id === l.categoria_id)?.descricao || ''}</td>
                    <td className="border px-2 py-1">{l.status}</td>
                    <td className="border px-2 py-1">{l.pagador_recebedor}</td>
                    <td className="border px-2 py-1">{l.parcelamento ? 'Sim' : 'Não'}</td>
                    <td className="border px-2 py-1">{l.parcela_atual && l.numero_parcelas ? `${l.parcela_atual}/${l.numero_parcelas}` : ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4">Nenhum lançamento futuro encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UpcomingPage; 