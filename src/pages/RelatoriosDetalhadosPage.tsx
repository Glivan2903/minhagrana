import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart2, PieChart, LineChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line
} from 'recharts';

const RelatoriosDetalhadosPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0
  });
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<{ id: number, descricao: string }[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, celular')
        .eq('email', user.email)
        .single();
      if (!error && data) setProfile(data);
      if (!error && data) {
        // Buscar transações do usuário
        const { data: trans, error: errTrans } = await supabase
          .from('transacoes')
          .select('*')
          .eq('usuario_id', data.id);
        if (!errTrans && trans) setTransacoes(trans);
        // Buscar categorias
        const { data: cats } = await supabase
          .from('categoria_trasacoes')
          .select('id, descricao');
        setCategorias(cats || []);
      }
    };
    fetchProfile();
  }, [user?.email]);

  useEffect(() => {
    // Cálculo dos totais e dados para gráficos
    if (!transacoes.length) return;
    let receitas = 0;
    let despesas = 0;
    let saldo = 0;
    const porCategoria: Record<string, { receita: number, despesa: number }> = {};
    const evolucao: { data: string, saldo: number }[] = [];
    let saldoAcumulado = 0;
    // Ordenar por data
    const transOrd = [...transacoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    transOrd.forEach(t => {
      const valor = Number(t.valor || 0);
      if (t.tipo === 'receita') {
        receitas += valor;
        saldoAcumulado += valor;
      } else if (t.tipo === 'despesa') {
        despesas += valor;
        saldoAcumulado -= valor;
      }
      // Por categoria
      const cat = categorias.find(c => c.id === t.categoria_id)?.descricao || 'Outros';
      if (!porCategoria[cat]) porCategoria[cat] = { receita: 0, despesa: 0 };
      if (t.tipo === 'receita') porCategoria[cat].receita += valor;
      if (t.tipo === 'despesa') porCategoria[cat].despesa += valor;
      // Evolução
      evolucao.push({ data: t.data, saldo: saldoAcumulado });
    });
    saldo = receitas - despesas;
    setResumo({ totalReceitas: receitas, totalDespesas: despesas, saldo });
    // Para gráficos (por enquanto, só log)
    console.log('Por categoria:', porCategoria);
    console.log('Evolução:', evolucao);
  }, [transacoes, categorias]);

  const handleFiltrar = () => {
    // Implemente a lógica para filtrar os dados com base nos valores de dataInicio e dataFim
  };

  // Preparar dados para os gráficos
  const dataBarras = Object.entries(
    transacoes.length && categorias.length
      ? transacoes.reduce((acc, t) => {
          const cat = categorias.find(c => c.id === t.categoria_id)?.descricao || 'Outros';
          if (!acc[cat]) acc[cat] = { categoria: cat, Receita: 0, Despesa: 0 };
          if (t.tipo === 'receita') acc[cat].Receita += Number(t.valor || 0);
          if (t.tipo === 'despesa') acc[cat].Despesa += Number(t.valor || 0);
          return acc;
        }, {} as Record<string, { categoria: string; Receita: number; Despesa: number }>)
      : {}
  ).map(([, v]) => v);

  const dataPizza = Object.entries(
    transacoes.length && categorias.length
      ? transacoes.reduce((acc, t) => {
          if (t.tipo !== 'despesa') return acc;
          const cat = categorias.find(c => c.id === t.categoria_id)?.descricao || 'Outros';
          if (!acc[cat]) acc[cat] = 0;
          acc[cat] += Number(t.valor || 0);
          return acc;
        }, {} as Record<string, number>)
      : {}
  ).map(([categoria, value]) => ({ categoria, value }));

  const dataLinha = (() => {
    if (!transacoes.length) return [];
    let saldoAcumulado = 0;
    return [...transacoes]
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map(t => {
        const valor = Number(t.valor || 0);
        if (t.tipo === 'receita') saldoAcumulado += valor;
        if (t.tipo === 'despesa') saldoAcumulado -= valor;
        return { data: t.data, saldo: saldoAcumulado };
      });
  })();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  return (
    <div className="w-full min-h-screen pl-2 pr-4 py-8 flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Relatórios Detalhados</h1>
      <p className="text-muted-foreground mb-8">Visualize gráficos completos e detalhados das suas finanças, com filtros e comparativos.</p>

      {/* Filtros (pode ser expandido depois) */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-xs font-medium mb-1">Data Inicial</label>
          <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-44" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Data Final</label>
          <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-44" />
        </div>
        <Button onClick={handleFiltrar} className="bg-minhagrana-primary text-white px-4 py-2 rounded font-semibold self-end">Filtrar</Button>
      </div>

      {/* Gráficos Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Barras - Receitas/Despesas por Categoria */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="text-blue-600" />
            <span className="font-semibold text-lg">Receitas/Despesas por Categoria</span>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={dataBarras} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <RechartsTooltip formatter={(v: any) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
                <Bar dataKey="Receita" fill="#22c55e" name="Receita" />
                <Bar dataKey="Despesa" fill="#ef4444" name="Despesa" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Gráfico de Pizza - Proporção de Gastos */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-amber-500" />
            <span className="font-semibold text-lg">Proporção de Gastos por Categoria</span>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={dataPizza} dataKey="value" nameKey="categoria" cx="50%" cy="50%" outerRadius={80} label>
                  {dataPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: any) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Gráfico de Linha - Evolução do Saldo */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="text-green-600" />
            <span className="font-semibold text-lg">Evolução do Saldo ao Longo do Tempo</span>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={dataLinha} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="data" tickFormatter={d => new Date(d).toLocaleDateString('pt-BR')} />
                <YAxis />
                <RechartsTooltip formatter={(v: any) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                <Legend />
                <Line type="monotone" dataKey="saldo" stroke="#2563eb" name="Saldo" dot={false} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resumos Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Total de Receitas</span>
          <span className="text-2xl font-bold text-green-600">{resumo.totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Total de Despesas</span>
          <span className="text-2xl font-bold text-red-600">{resumo.totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Saldo do Período</span>
          <span className="text-2xl font-bold text-blue-700">{resumo.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>

      {/* Outros detalhes e comparativos podem ser adicionados aqui */}
    </div>
  );
};

export default RelatoriosDetalhadosPage; 