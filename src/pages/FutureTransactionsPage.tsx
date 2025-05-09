import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

const periodicidades = [
  'Diário',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Bimestral',
  'Trimestral',
  'Semestral',
  'Anual',
];

const FutureTransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: number, descricao: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'receita' | 'despesa'>('receita');
  const [form, setForm] = useState({
    valor: '',
    data_prevista: '',
    descricao: '',
    categoria_id: '',
    pagador_recebedor: '',
    recorrente: false,
    periodicidade: '',
    parcelamento: false,
    numero_parcelas: '',
    parcela_atual: '',
    status: 'pendente',
    nao_pago: false,
  });
  const [editId, setEditId] = useState<string | number | null>(null);
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let usuarioId = null;
        if (user?.email) {
          const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', user.email)
            .single();
          if (usuarioError) throw usuarioError;
          usuarioId = usuario?.id;
        }
        let transData: any[] = [];
        if (usuarioId) {
          const { data, error: transError } = await supabase
            .from('lancamentos_futuros')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_prevista', { ascending: true });
          if (transError) throw transError;
          transData = data || [];
        }
        setTransactions(transData);
        const { data: catData, error: catError } = await supabase
          .from('categoria_trasacoes')
          .select('id, descricao');
        if (catError) throw catError;
        setCategories(catData || []);
      } catch (err: any) {
        setError('Erro ao carregar dados.');
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.email]);

  const openModal = (type: 'receita' | 'despesa', lancamento?: any) => {
    setModalType(type);
    if (lancamento) {
      setEditId(lancamento.id);
      setForm({
        valor: lancamento.valor?.toString() || '',
        data_prevista: lancamento.data_prevista || '',
        descricao: lancamento.descricao || '',
        categoria_id: lancamento.categoria_id ? lancamento.categoria_id.toString() : '',
        pagador_recebedor: lancamento.pagador_recebedor || '',
        recorrente: !!lancamento.recorrente,
        periodicidade: lancamento.periodicidade || '',
        parcelamento: !!lancamento.parcelamento,
        numero_parcelas: lancamento.numero_parcelas ? lancamento.numero_parcelas.toString() : '',
        parcela_atual: lancamento.parcela_atual ? lancamento.parcela_atual.toString() : '',
        status: lancamento.status || 'pendente',
        nao_pago: !!lancamento.nao_pago,
      });
    } else {
      setEditId(null);
      setForm({
        valor: '',
        data_prevista: '',
        descricao: '',
        categoria_id: '',
        pagador_recebedor: '',
        recorrente: false,
        periodicidade: '',
        parcelamento: false,
        numero_parcelas: '',
        parcela_atual: '',
        status: 'pendente',
        nao_pago: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleTab = (type: 'receita' | 'despesa') => {
    setModalType(type);
    setEditId(null);
    setForm(f => ({ ...f, valor: '', descricao: '', categoria_id: '', pagador_recebedor: '', status: 'pendente', nao_pago: false }));
  };

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
      toast.error('Você precisa estar logado para adicionar lançamentos futuros');
      return;
    }
    try {
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();
      if (usuarioError || !usuario) throw usuarioError || new Error('Usuário não encontrado');
      if (editId) {
        // Editar lançamento existente
        await supabase.from('lancamentos_futuros').update({
          tipo: modalType === 'receita' ? 'entrada' : 'saida',
          valor: Number(form.valor),
          descricao: form.descricao,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
          data_prevista: form.data_prevista,
          recorrente: !!form.recorrente,
          periodicidade: form.recorrente ? form.periodicidade : null,
          status: form.status,
          pagador_recebedor: form.pagador_recebedor,
          parcelamento: !!form.parcelamento,
          numero_parcelas: form.parcelamento ? Number(form.numero_parcelas) : null,
          parcela_atual: form.parcelamento ? Number(form.parcela_atual) : null,
          nao_pago: !!form.nao_pago,
        }).eq('id', editId);
        toast.success('Lançamento futuro atualizado com sucesso!');
      } else {
        // Novo lançamento
        await supabase.from('lancamentos_futuros').insert({
          usuario_id: usuario.id,
          tipo: modalType === 'receita' ? 'entrada' : 'saida',
          valor: Number(form.valor),
          descricao: form.descricao,
          categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
          data_prevista: form.data_prevista,
          recorrente: !!form.recorrente,
          periodicidade: form.recorrente ? form.periodicidade : null,
          status: form.status,
          pagador_recebedor: form.pagador_recebedor,
          parcelamento: !!form.parcelamento,
          numero_parcelas: form.parcelamento ? Number(form.numero_parcelas) : null,
          parcela_atual: form.parcelamento ? Number(form.parcela_atual) : null,
          nao_pago: !!form.nao_pago,
        });
        toast.success(`${modalType === 'receita' ? 'Receita' : 'Despesa'} futura adicionada com sucesso!`);
      }
      closeModal();
      // Recarregar lançamentos
      const { data } = await supabase
        .from('lancamentos_futuros')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('data_prevista', { ascending: true });
      setTransactions(data || []);
    } catch (err: any) {
      setError('Erro ao salvar lançamento futuro.');
      toast.error('Erro ao salvar lançamento futuro');
    }
  };

  const handleDelete = async (id: string | number) => {
    const idNum = typeof id === 'string' ? Number(id) : id;
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await supabase.from('lancamentos_futuros').delete().eq('id', idNum);
      toast.success('Lançamento excluído com sucesso!');
      // Atualizar lista
      setTransactions(transactions.filter(t => t.id !== idNum));
    } catch (err) {
      toast.error('Erro ao excluir lançamento.');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pendente') return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pendente</span>;
    if (status === 'efetivado') return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Efetivado</span>;
    if (status === 'cancelado') return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-semibold">Cancelado</span>;
    return status;
  };

  const getCategoriaBadge = (categoria: string) => (
    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> {categoria}
    </span>
  );

  const getRecorrenteBadge = (recorrente: boolean, periodicidade: string) => (
    recorrente && periodicidade ? (
      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span> {periodicidade.toLowerCase()}
      </span>
    ) : null
  );

  const getValor = (valor: number, tipo: string) => (
    <span className={tipo === 'saida' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
      {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </span>
  );

  const getTotalDespesas = (trans: any[]) => {
    return trans.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
  };

  // Filtro aplicado aos lançamentos
  const filteredTransactions = transactions.filter(t => {
    const matchNome = t.descricao?.toLowerCase().includes(search.toLowerCase());
    const matchData = searchDate ? t.data_prevista === searchDate : true;
    return matchNome && matchData;
  });

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-minhagrana-primary">Lançamentos Futuros</h1>
          {transactions.length > 0 && (
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openModal('receita')}>+ Nova Receita</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => openModal('despesa')}>+ Nova Despesa</Button>
            </div>
          )}
        </div>
        {/* Filtros de busca */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Buscar por descrição</label>
            <Input
              type="text"
              placeholder="Digite o nome ou descrição"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Filtrar por data prevista</label>
            <Input
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>
        )}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando lançamentos...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="uppercase text-xs font-bold text-gray-500 tracking-widest">Despesas</div>
              <div className="text-right text-base font-semibold text-red-600">
                Total de Despesas Futuras: {getTotalDespesas(filteredTransactions).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <table className="min-w-full border mt-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Data</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Data Prevista</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Descrição</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Categoria</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Valor</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Recorrente</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Status</th>
                  <th className="border px-2 py-2 font-bold text-gray-700 uppercase text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-2">{t.created_at ? format(new Date(t.created_at), 'dd/MM/yyyy') : '-'}</td>
                    <td className="border px-2 py-2">{t.data_prevista ? format(new Date(t.data_prevista), 'dd/MM/yyyy') : '-'}</td>
                    <td className="border px-2 py-2">{t.descricao}</td>
                    <td className="border px-2 py-2">{getCategoriaBadge(categories.find(c => c.id === t.categoria_id)?.descricao || '')}</td>
                    <td className="border px-2 py-2">{getValor(Number(t.valor), t.tipo)}</td>
                    <td className="border px-2 py-2">{getRecorrenteBadge(t.recorrente, t.periodicidade)}</td>
                    <td className="border px-2 py-2">{getStatusBadge(t.status)}</td>
                    <td className="border px-2 py-2 text-center">
                      <button className="inline-flex items-center p-1 text-gray-500 hover:text-blue-600 mr-2" title="Editar" onClick={() => openModal(t.tipo === 'entrada' ? 'receita' : 'despesa', t)}><Pencil size={16} /></button>
                      <button className="inline-flex items-center p-1 text-gray-500 hover:text-red-600" title="Excluir" onClick={() => handleDelete(Number(t.id))}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex gap-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3" onClick={() => openModal('receita')}>+ Nova Receita</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3" onClick={() => openModal('despesa')}>+ Nova Despesa</Button>
            </div>
          </div>
        )}
        {/* Modal de novo lançamento */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={closeModal}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Novo Lançamento Futuro</h2>
              <div className="flex mb-6">
                <button
                  className={`flex-1 py-2 rounded-l-lg font-semibold ${modalType === 'receita' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  onClick={() => handleTab('receita')}
                  type="button"
                >
                  Receita
                </button>
                <button
                  className={`flex-1 py-2 rounded-r-lg font-semibold ${modalType === 'despesa' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                  onClick={() => handleTab('despesa')}
                  type="button"
                >
                  Despesa
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Valor</label>
                    <Input
                      name="valor"
                      type="number"
                      min="0"
                      value={form.valor}
                      onChange={handleChange}
                      className={`w-full font-bold text-lg ${modalType === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Data Prevista</label>
                    <Input
                      name="data_prevista"
                      type="date"
                      value={form.data_prevista}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
                <Input
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Descrição"
                />
                <select
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-2 text-gray-700"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.descricao}</option>
                  ))}
                </select>
                <Input
                  name="pagador_recebedor"
                  value={form.pagador_recebedor}
                  onChange={handleChange}
                  className="w-full"
                  placeholder={modalType === 'receita' ? 'Pagador' : 'Recebedor'}
                />
                <div className="flex items-center gap-2">
                  <input
                    name="recorrente"
                    type="checkbox"
                    checked={!!form.recorrente}
                    onChange={handleChange}
                    className="accent-minhagrana-primary"
                    id="recorrente"
                  />
                  <label htmlFor="recorrente" className="text-sm font-medium">Lançamento Recorrente</label>
                </div>
                {form.recorrente && (
                  <select
                    name="periodicidade"
                    value={form.periodicidade}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-2 text-gray-700"
                  >
                    <option value="">Selecione a periodicidade</option>
                    {periodicidades.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-2">
                  <input
                    name="parcelamento"
                    type="checkbox"
                    checked={!!form.parcelamento}
                    onChange={handleChange}
                    className="accent-minhagrana-primary"
                    id="parcelamento"
                  />
                  <label htmlFor="parcelamento" className="text-sm font-medium">Compra Parcelada</label>
                </div>
                {form.parcelamento && (
                  <div className="flex gap-2">
                    <Input
                      name="numero_parcelas"
                      type="number"
                      min="1"
                      value={form.numero_parcelas}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Nº Parcelas"
                    />
                    <Input
                      name="parcela_atual"
                      type="number"
                      min="1"
                      value={form.parcela_atual}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Parcela Atual"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    name="nao_pago"
                    type="checkbox"
                    checked={!!form.nao_pago}
                    onChange={handleChange}
                    className="accent-minhagrana-primary"
                    id="nao_pago"
                  />
                  <label htmlFor="nao_pago" className="text-sm font-medium">Não pago</label>
                </div>
                <Button
                  type="submit"
                  className={`w-full mt-4 text-base font-semibold ${modalType === 'receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {editId
                    ? 'Salvar Alterações'
                    : modalType === 'receita'
                    ? 'Adicionar Receita Futura'
                    : 'Adicionar Despesa Futura'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureTransactionsPage; 