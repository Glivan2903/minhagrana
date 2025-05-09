import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

const ReportsPage = () => {
  const { user } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    receitasTransacoes: 0,
    receitasFuturas: 0,
    despesasTransacoes: 0,
    despesasFuturas: 0,
    ultimaDespesa: '',
  });

  useEffect(() => {
    if (user?.email) {
      handleFiltrar();
    }
    // eslint-disable-next-line
  }, [user?.email]);

  const handleFiltrar = async () => {
    if (!user?.email) return;
    setLoading(true);
    // Buscar o id do usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .single();
    if (!usuario) return;
    // Buscar transações
    let transQuery = supabase
      .from('transacoes')
      .select('*')
      .eq('usuario_id', usuario.id);
    if (dataInicio) transQuery = transQuery.gte('data', dataInicio);
    if (dataFim) transQuery = transQuery.lte('data', dataFim);
    const { data: transacoes } = await transQuery;
    // Buscar lançamentos futuros
    let futQuery = supabase
      .from('lancamentos_futuros')
      .select('*')
      .eq('usuario_id', usuario.id);
    if (dataInicio) futQuery = futQuery.gte('data_prevista', dataInicio);
    if (dataFim) futQuery = futQuery.lte('data_prevista', dataFim);
    const { data: futuros } = await futQuery;
    // Calcular totais
    const receitasTransacoes = (transacoes || []).filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor || 0), 0);
    const despesasTransacoes = (transacoes || []).filter(t => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor || 0), 0);
    const receitasFuturas = (futuros || []).filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + Number(t.valor || 0), 0);
    const despesasFuturas = (futuros || []).filter(t => t.tipo === 'saida').reduce((acc, t) => acc + Number(t.valor || 0), 0);
    const totalReceitas = receitasTransacoes + receitasFuturas;
    const totalDespesas = despesasTransacoes + despesasFuturas;
    const saldo = totalReceitas - totalDespesas;
    // Última despesa
    let ultimaDespesa = '';
    const todasDespesas = [
      ...((transacoes || []).filter(t => t.tipo === 'saida').map(t => ({
        data: (t as any).data,
        data_prevista: undefined,
      }))),
      ...((futuros || []).filter(t => t.tipo === 'saida').map(t => ({
        data: undefined,
        data_prevista: (t as any).data_prevista,
      })))
    ];
    if (todasDespesas.length > 0) {
      const ult = todasDespesas.sort((a, b) => {
        const dataA = a.data_prevista || a.data;
        const dataB = b.data_prevista || b.data;
        return new Date(dataB).getTime() - new Date(dataA).getTime();
      })[0];
      ultimaDespesa = ult.data_prevista || ult.data;
    }
    setResumo({
      totalReceitas,
      totalDespesas,
      saldo,
      receitasTransacoes,
      receitasFuturas,
      despesasTransacoes,
      despesasFuturas,
      ultimaDespesa,
    });
    setLoading(false);
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-minhagrana-primary mb-6">Relatórios</h1>
        <div className="mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Data Inicial</label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-44" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data Final</label>
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-44" />
          </div>
          <button onClick={handleFiltrar} className="bg-minhagrana-primary text-white px-4 py-2 rounded font-semibold">Filtrar</button>
        </div>
        {/* Resumo do Período */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Total de Receitas</div>
            <div className="text-green-600 text-2xl font-bold mb-1">{resumo.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-gray-500">Transações: {resumo.receitasTransacoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-gray-500">Lançamentos Futuros: {resumo.receitasFuturas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Total de Despesas</div>
            <div className="text-red-600 text-2xl font-bold mb-1">{resumo.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-gray-500">Transações: {resumo.despesasTransacoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-gray-500">Lançamentos Futuros: {resumo.despesasFuturas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Saldo do Período</div>
            <div className="text-green-700 text-2xl font-bold mb-1">{resumo.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="text-xs text-gray-500">{resumo.ultimaDespesa ? `Nenhuma nova despesa desde ${new Date(resumo.ultimaDespesa).toLocaleDateString('pt-BR')}` : 'Nenhuma despesa registrada.'}</div>
          </div>
        </div>
        {/* Gráficos (placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 min-h-[300px]">
            <div className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block">📊</span> Receitas x Despesas por Mês
            </div>
            <div className="flex items-center justify-center h-48 text-gray-400">[Gráfico de barras aqui]</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 min-h-[300px]">
            <div className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block">📅</span> Despesas por Dia da Semana
            </div>
            <div className="flex items-center justify-center h-48 text-gray-400">[Gráfico de barras aqui]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 