import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CategoryFormDialog from '@/components/transactions/CategoryFormDialog';
import DeleteConfirmationDialog from '@/components/transactions/DeleteConfirmationDialog';

interface Category {
  id: number;
  descricao: string;
}

const CategoriesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [user?.id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Buscar o id interno do usuário na tabela usuarios
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuario) {
        throw new Error("Usuário não encontrado na tabela interna.");
      }

      // Buscar categorias do usuário autenticado
      const { data, error } = await supabase
        .from('categoria_trasacoes')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('descricao');

      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user?.email) {
      toast({
        title: "Erro ao adicionar categoria",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar o id interno do usuário na tabela usuarios
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      if (usuarioError || !usuario) {
        throw new Error("Usuário não encontrado na tabela interna.");
      }

      // Criar a categoria com o id correto
      const { data, error } = await supabase
        .from('categoria_trasacoes')
        .insert({
          descricao: categoryData.descricao,
          usuario_id: usuario.id,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Categoria adicionada",
        description: "A categoria foi adicionada com sucesso.",
      });

      fetchCategories();
      setFormDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (categoryData: Category) => {
    try {
      const { data, error } = await supabase
        .from('categoria_trasacoes')
        .update({
          descricao: categoryData.descricao,
        })
        .eq('id', categoryData.id)
        .select();

      if (error) throw error;

      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });

      fetchCategories();
      setFormDialogOpen(false);
      setCurrentCategory(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      // Check if category is used in any transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transacoes')
        .select('id')
        .eq('categoria_id', id)
        .limit(1);
        
      if (transactionError) throw transactionError;
      
      if (transactionData && transactionData.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Esta categoria está sendo usada em transações. Remova as transações primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('categoria_trasacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });

      fetchCategories();
      setDeleteDialogOpen(false);
      setCurrentCategory(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCurrentCategory(category);
    setDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Button 
            onClick={() => {
              setCurrentCategory(null);
              setFormDialogOpen(true);
            }}
            className="bg-minhagrana-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>

          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar categorias..."
                className="pl-10 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Carregando categorias...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhuma categoria encontrada</p>
            <Button
              onClick={() => {
                setCurrentCategory(null);
                setFormDialogOpen(true);
              }}
              className="mt-4 bg-minhagrana-primary"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.descricao}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          title="Editar"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
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
      </div>

      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={currentCategory ? handleUpdateCategory : handleAddCategory}
        category={currentCategory}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => currentCategory && handleDeleteCategory(currentCategory.id)}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default CategoriesPage;
