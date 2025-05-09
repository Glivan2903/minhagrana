
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Category {
  id?: number;
  descricao: string;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Category) => void;
  category: Category | null;
}

// Schema for form validation
const categorySchema = z.object({
  id: z.number().optional(),
  descricao: z.string().min(1, { message: "A descrição é obrigatória" }),
});

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  category
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Category>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      descricao: '',
    }
  });

  // Set form values if editing a category
  useEffect(() => {
    if (category) {
      reset({
        id: category.id,
        descricao: category.descricao,
      });
    } else {
      reset({
        descricao: '',
      });
    }
  }, [category, reset]);

  const handleFormSubmit = (data: Category) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
          {category?.id && (
            <input type="hidden" {...register('id')} value={category.id} />
          )}
          
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-minhagrana-primary">
              {category ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
