-- Criar tabela de lançamentos futuros
CREATE TABLE IF NOT EXISTS lancamentos_futuros (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id BIGINT REFERENCES categoria_trasacoes(id),
    data_prevista DATE NOT NULL,
    recorrente BOOLEAN DEFAULT false,
    periodicidade VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'efetivado', 'cancelado')),
    pagador_recebedor VARCHAR(255),
    mes_previsto VARCHAR(7),
    parcelamento BOOLEAN DEFAULT false,
    numero_parcelas INTEGER,
    parcela_atual INTEGER,
    transacao_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_lancamentos_futuros_usuario_id ON lancamentos_futuros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_futuros_data_prevista ON lancamentos_futuros(data_prevista);
CREATE INDEX IF NOT EXISTS idx_lancamentos_futuros_status ON lancamentos_futuros(status);

-- Habilitar RLS
ALTER TABLE lancamentos_futuros ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios lançamentos futuros"
    ON lancamentos_futuros FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios lançamentos futuros"
    ON lancamentos_futuros FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios lançamentos futuros"
    ON lancamentos_futuros FOR UPDATE
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar apenas seus próprios lançamentos futuros"
    ON lancamentos_futuros FOR DELETE
    USING (auth.uid() = usuario_id);

-- Criar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lancamentos_futuros_updated_at
    BEFORE UPDATE ON lancamentos_futuros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 