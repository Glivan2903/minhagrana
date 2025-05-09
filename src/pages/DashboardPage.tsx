import React, { useState, useEffect } from 'react';
import { CircleChart } from '@/components/CircleChart';
import { MonthSelector } from '@/components/MonthSelector';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("month");
  const [loading, setLoading] = useState(false);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: number, descricao: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        // Buscar o id do usuário na tabela usuarios
        const { data: usuario, error: usuarioError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .single();
        if (usuarioError || !usuario) return;

        // Buscar transações do mês/ano atual
        const mesAtual = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        const { data: transacoesData, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('usuario_id', usuario.id)
          .eq('mes', mesAtual);
        if (error) return;
        setTransacoes(transacoesData || []);

        // Buscar categorias reais
        const { data: categoriasData } = await supabase
          .from('categoria_trasacoes')
          .select('id, descricao');
        setCategories(categoriasData || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.email, currentMonth, currentYear]);

  // Cálculos
  const receitas = transacoes.filter(t => t.tipo === 'receita');
  const despesas = transacoes.filter(t => t.tipo === 'despesa');
  const totalReceitas = receitas.reduce((acc, t) => acc + Number(t.valor), 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + Number(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const ratio = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;

  // Gráfico de categorias de despesas
  const categoriasMap: Record<number, { name: string, value: number, color: string }> = {};
  despesas.forEach(t => {
    const categoria = categories.find(c => c.id === t.categoria_id);
    const name = categoria ? categoria.descricao : `Categoria ${t.categoria_id}`;
    if (!categoriasMap[t.categoria_id]) {
      categoriasMap[t.categoria_id] = { name, value: 0, color: '#EB5757' };
    }
    categoriasMap[t.categoria_id].value += Number(t.valor);
  });
  const categoryChartData = Object.values(categoriasMap);

  // Últimos registros (ordenar por data desc)
  const ultimasTransacoes = [...transacoes]
    .filter(t => t.data)
    .sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime())
    .slice(0, 5);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Redirecionamento para a página de transações com tipo predefinido
  const handleNewTransaction = (type: 'receita' | 'despesa') => {
    navigate(`/transactions?new=${type}`);
  };

  return (
    <div className="space-y-8">
      {/* Título e saudação */}
      <div className="mb-2">
        <h1 className="text-4xl font-bold mb-0">Dashboard</h1>
      </div>
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Receitas do Mês"
          amount={`R$ ${totalReceitas.toFixed(2)}`}
          subtitle="Total de receitas do Mês"
          icon={<TrendingUp className="w-6 h-6" />}
          variant="income"
        />
        <SummaryCard
          title="Despesas do Mês"
          amount={`R$ ${totalDespesas.toFixed(2)}`}
          subtitle="Total de despesas do Mês"
          icon={<TrendingDown className="w-6 h-6" />}
          variant="expense"
        />
        <SummaryCard
          title="Saldo do Mês"
          amount={`R$ ${saldo.toFixed(2)}`}
          subtitle={`${format(new Date(currentYear, currentMonth), 'MMMM yyyy')}`}
          icon={<Wallet className="w-6 h-6" />}
          variant="balance"
        />
        <SummaryCard
          title="Despesas/Receitas"
          amount={`${ratio.toFixed(0)}%`}
          subtitle="Despesas menores que receitas"
          icon={<TrendingDown className="w-6 h-6" />}
          variant="ratio"
        />
      </div>
      {/* Gráfico e últimos registros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-md shadow-sm p-6">
          <h2 className="font-semibold mb-2">Receitas x Despesas</h2>
          <p className="text-sm text-gray-500 mb-4">1 de maio - 31 de maio</p>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Gráfico à esquerda */}
            <div className="flex-1 flex justify-center items-center min-w-[220px]">
              <CircleChart
                data={[
                  { name: 'Receitas', value: totalReceitas, color: '#27ae60' },
                  { name: 'Despesas', value: totalDespesas, color: '#EB5757' }
                ]}
                centerLabel={`Saldo`}
                centerValue={`R$ ${saldo.toFixed(2)}`}
              />
            </div>
            {/* Barras e totais à direita */}
            <div className="flex-1 flex flex-col justify-center gap-2 min-w-[260px]">
              <div className="flex items-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-medium text-green-700">Receitas</span>
                <span className="ml-auto font-semibold text-green-600">R$ {totalReceitas.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${totalReceitas + totalDespesas > 0 ? (totalReceitas / (totalReceitas + totalDespesas)) * 100 : 0}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{totalReceitas + totalDespesas > 0 ? '100% do total' : '0% do total'}</span>
                <span>{receitas.length} transações</span>
              </div>
              <div className="flex items-center mb-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="font-medium text-red-600">Despesas</span>
                <span className="ml-auto font-semibold text-red-600">R$ {totalDespesas.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalReceitas + totalDespesas > 0 ? (totalDespesas / (totalReceitas + totalDespesas)) * 100 : 0}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{totalReceitas + totalDespesas > 0 ? `${((totalDespesas / (totalReceitas + totalDespesas)) * 100).toFixed(0)}% do total` : '0% do total'}</span>
                <span>{despesas.length} transações</span>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold">Saldo do período</span>
                <span className="font-bold text-green-600">R$ {saldo.toFixed(2)}</span>
              </div>
              <span className="text-xs text-gray-500">Suas receitas superaram as despesas em R$ {saldo.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Últimos Registros</h2>
          </div>
          <div className="flex mb-4">
            <Input placeholder="Buscar..." className="mr-2" />
            <Button variant="outline">Todas</Button>
          </div>
          <div className="mt-2 max-h-[320px] overflow-y-auto">
            {ultimasTransacoes.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.descricao}
                amount={Number(transaction.valor)}
                date={transaction.data}
                type={transaction.tipo}
                category={transaction.categoria_id}
              />
            ))}
            {ultimasTransacoes.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Nenhuma transação registrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
