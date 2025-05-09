import React, { useState, useEffect } from 'react';
import { Plus, Filter, FileDown, Search, Trash2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog';
import DeleteConfirmationDialog from '@/components/transactions/DeleteConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Transaction {
  id: number;
  data: string;
  descricao: string;
  categoria_id: number;
  categoria_descricao?: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  mes: string;
  pagador?: string | null;
  recebedor?: string | null;
}

const TransactionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{id: number, descricao: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [userStatus, setUserStatus] = useState<string>('');
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    const fetchUserStatus = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from('usuarios')
        .select('status')
        .eq('email', user.email)
        .single();
      if (!error && data) setUserStatus(data.status);
    };
    fetchUserStatus();
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categoria_trasacoes')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuario) {
        throw new Error("Usuário não encontrado na tabela interna.");
      }

      const { data, error } = await supabase
        .from('transacoes')
        .select(`
          *,
          categoria:categoria_id(descricao)
        `)
        .eq('usuario_id', usuario.id)
        .order('data', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => ({
        ...item,
        tipo: item.tipo as 'receita' | 'despesa',
        categoria_descricao: item.categoria?.descricao,
        mes: (item as any).mes ? (item as any).mes : '',
      }));

      setTransactions(formattedData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'categoria_descricao'>) => {
    if (!user?.email) {
      toast({
        title: "Erro ao adicionar transação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    if (userStatus === 'free' && transactions.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "No plano Free você só pode criar até 5 transações. Contrate o plano Premium para adicionar mais.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuario) {
        throw new Error("Usuário não encontrado na tabela interna.");
      }

      const { data, error } = await supabase
        .from('transacoes')
        .insert([
          {
            ...transactionData,
            usuario_id: usuario.id,
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Transação adicionada",
        description: "A transação foi adicionada com sucesso.",
      });

      fetchTransactions();
      setFormDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar transação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateTransaction = async (transactionData: Omit<Transaction, 'categoria_descricao'>) => {
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .update({
          descricao: transactionData.descricao,
          categoria_id: transactionData.categoria_id,
          data: transactionData.data,
          tipo: transactionData.tipo,
          valor: transactionData.valor,
          mes: transactionData.mes,
          pagador: transactionData.pagador,
          recebedor: transactionData.recebedor,
        })
        .eq('id', transactionData.id)
        .select();

      if (error) throw error;

      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });

      fetchTransactions();
      setFormDialogOpen(false);
      setCurrentTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar transação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });

      fetchTransactions();
      setDeleteDialogOpen(false);
      setCurrentTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setFormDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.categoria_descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentPeriod === 'all') return matchesSearch;
    
    return matchesSearch && transaction.tipo === currentPeriod;
  });

  const totalReceitas = filteredTransactions
    .filter(t => t.tipo === 'receita')
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);
  
  const totalDespesas = filteredTransactions
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, transaction) => sum + Number(transaction.valor), 0);

  const saldo = totalReceitas - totalDespesas;

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Mês", "Pagador", "Recebedor"];
    
    const csvData = filteredTransactions.map(t => [
      t.data,
      t.descricao,
      t.categoria_descricao || '',
      t.tipo === 'receita' ? 'Receita' : 'Despesa',
      t.valor.toString(),
      t.mes,
      t.pagador || '',
      t.recebedor || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                if (userStatus === 'free' && transactions.length >= 5) {
                  setLimitDialogOpen(true);
                  return;
                }
                setCurrentTransaction(null);
                setFormDialogOpen(true);
              }}
              className="bg-minhagrana-primary"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar transações..."
                className="pl-10 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setCurrentPeriod} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="receita">Receitas</TabsTrigger>
            <TabsTrigger value="despesa">Despesas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="rounded-md bg-muted p-4 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-green-700">Total de Receitas</h3>
                <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-700">Total de Despesas</h3>
                <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-700">Saldo</h3>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldo.toFixed(2)}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10">Carregando transações...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhuma transação encontrada</p>
                <Button
                  onClick={() => {
                    if (userStatus === 'free' && transactions.length >= 5) {
                      setLimitDialogOpen(true);
                      return;
                    }
                    setCurrentTransaction(null);
                    setFormDialogOpen(true);
                  }}
                  className="mt-4 bg-minhagrana-primary"
                >
                  <Plus className="mr-2 h-4 w-4" /> Nova Transação
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.data ? format(new Date(transaction.data), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{transaction.descricao}</TableCell>
                        <TableCell>{transaction.categoria_descricao}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.tipo === 'receita' ? 'Receita' : 'Despesa'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.tipo === 'receita' ? '+' : '-'} R$ {Number(transaction.valor).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              title="Editar"
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="receita" className="space-y-4">
            {/* Same table structure as "all" but filtered for receitas */}
            {loading ? (
              <div className="text-center py-10">Carregando transações...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhuma receita encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.data ? format(new Date(transaction.data), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{transaction.descricao}</TableCell>
                        <TableCell>{transaction.categoria_descricao}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className="text-green-600">
                            + R$ {Number(transaction.valor).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              title="Editar"
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="despesa" className="space-y-4">
            {/* Same table structure as "all" but filtered for despesas */}
            {loading ? (
              <div className="text-center py-10">Carregando transações...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhuma despesa encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.data ? format(new Date(transaction.data), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{transaction.descricao}</TableCell>
                        <TableCell>{transaction.categoria_descricao}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className="text-red-600">
                            - R$ {Number(transaction.valor).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              title="Editar"
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TransactionFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={currentTransaction ? handleUpdateTransaction : handleAddTransaction}
        categories={categories}
        transaction={currentTransaction}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => currentTransaction && handleDeleteTransaction(currentTransaction.id)}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />

      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limite do Plano Free Atingido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Você atingiu o limite de 5 transações no plano Free. Para adicionar mais transações, contrate o plano Premium.</p>
          </div>
          <DialogFooter>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                window.open('https://wa.me/557199622786?text=Olá, gostaria de contratar o plano Premium do Minha Grana!', '_blank');
              }}
            >
              Falar com o time no WhatsApp
            </Button>
            <Button variant="outline" onClick={() => setLimitDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
