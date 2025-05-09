
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

interface Category {
  id: number;
  descricao: string;
}

interface Transaction {
  id?: number;
  data: string;
  descricao: string;
  categoria_id: number;
  tipo: 'receita' | 'despesa';
  valor: number;
  mes: string;
  pagador?: string;
  recebedor?: string;
}

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Transaction) => void;
  categories: Category[];
  transaction: Transaction | null;
}

// Schema for form validation
const transactionSchema = z.object({
  id: z.number().optional(),
  data: z.string().min(1, { message: "A data é obrigatória" }),
  descricao: z.string().min(1, { message: "A descrição é obrigatória" }),
  categoria_id: z.number({ required_error: "A categoria é obrigatória" }),
  tipo: z.enum(['receita', 'despesa'], { required_error: "O tipo é obrigatório" }),
  valor: z.preprocess(
    (val) => (typeof val === 'string' && val !== '') 
      ? parseFloat(val) 
      : val,
    z.number().min(0.01, { message: "O valor deve ser maior que zero" })
  ),
  mes: z.string().min(1, { message: "O mês é obrigatório" }),
  pagador: z.string().optional(),
  recebedor: z.string().optional(),
});

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  categories,
  transaction
}) => {
  const { register, handleSubmit, setValue, control, reset, formState: { errors } } = useForm<Transaction>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      mes: format(new Date(), 'yyyy-MM'),
      tipo: 'despesa',
      valor: 0,
    }
  });

  // Set form values if editing a transaction
  useEffect(() => {
    if (transaction) {
      reset({
        id: transaction.id,
        data: transaction.data,
        descricao: transaction.descricao,
        categoria_id: transaction.categoria_id,
        tipo: transaction.tipo,
        valor: transaction.valor,
        mes: transaction.mes,
        pagador: transaction.pagador,
        recebedor: transaction.recebedor,
      });
    } else {
      reset({
        data: format(new Date(), 'yyyy-MM-dd'),
        mes: format(new Date(), 'yyyy-MM'),
        descricao: '',
        categoria_id: categories[0]?.id,
        tipo: 'despesa',
        valor: 0,
        pagador: '',
        recebedor: '',
      });
    }
  }, [transaction, categories, reset]);

  const handleFormSubmit = (data: Transaction) => {
    // Format date and ensure valor is a number
    const formattedData = {
      ...data,
      valor: Number(data.valor),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          {transaction?.id && (
            <input type="hidden" {...register('id')} value={transaction.id} />
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                {...register('data')}
                className={errors.data ? 'border-red-500' : ''}
              />
              {errors.data && (
                <p className="text-red-500 text-xs">{errors.data.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Input
                id="mes"
                type="month"
                {...register('mes')}
                className={errors.mes ? 'border-red-500' : ''}
              />
              {errors.mes && (
                <p className="text-red-500 text-xs">{errors.mes.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              {...register('descricao')}
              className={errors.descricao ? 'border-red-500' : ''}
            />
            {errors.descricao && (
              <p className="text-red-500 text-xs">{errors.descricao.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="tipo"
                      className={errors.tipo ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tipo && (
                <p className="text-red-500 text-xs">{errors.tipo.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                {...register('valor')}
                className={errors.valor ? 'border-red-500' : ''}
              />
              {errors.valor && (
                <p className="text-red-500 text-xs">{errors.valor.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria_id">Categoria</Label>
            <Controller
              control={control}
              name="categoria_id"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <SelectTrigger
                    id="categoria_id"
                    className={errors.categoria_id ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoria_id && (
              <p className="text-red-500 text-xs">{errors.categoria_id.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pagador">Pagador</Label>
              <Input id="pagador" {...register('pagador')} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recebedor">Recebedor</Label>
              <Input id="recebedor" {...register('recebedor')} />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-minhagrana-primary">
              {transaction ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionFormDialog;
