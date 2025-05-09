-- Habilitar RLS na tabela de transações
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Criar política para SELECT (leitura)
CREATE POLICY "Usuários podem ver apenas suas próprias transações"
ON transacoes
FOR SELECT
USING (auth.uid()::text = usuario_id::text);

-- Criar política para INSERT (criação)
CREATE POLICY "Usuários podem criar apenas suas próprias transações"
ON transacoes
FOR INSERT
WITH CHECK (auth.uid()::text = usuario_id::text);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar apenas suas próprias transações"
ON transacoes
FOR UPDATE
USING (auth.uid()::text = usuario_id::text);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Usuários podem excluir apenas suas próprias transações"
ON transacoes
FOR DELETE
USING (auth.uid()::text = usuario_id::text); 