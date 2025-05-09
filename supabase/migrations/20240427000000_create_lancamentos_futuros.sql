-- Criar tabela de lançamentos futuros
CREATE TABLE lancamentos_futuros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255),
    categoria_id INTEGER REFERENCES categoria_trasacoes(id),
    data_prevista DATE NOT NULL,
    recorrente BOOLEAN DEFAULT false,
    periodicidade VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pendente',
    pagador_recebedor VARCHAR(255),
    mes_previsto VARCHAR(7),
    parcelamento BOOLEAN DEFAULT false,
    numero_parcelas INTEGER,
    parcela_atual INTEGER,
    transacao_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_lancamentos_futuros_usuario_id ON lancamentos_futuros(usuario_id);
CREATE INDEX idx_lancamentos_futuros_data_prevista ON lancamentos_futuros(data_prevista);

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_lancamentos_futuros_updated_at
    BEFORE UPDATE ON lancamentos_futuros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE lancamentos_futuros ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios lançamentos futuros"
ON lancamentos_futuros FOR SELECT
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem criar apenas seus próprios lançamentos futuros"
ON lancamentos_futuros FOR INSERT
WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem atualizar apenas seus próprios lançamentos futuros"
ON lancamentos_futuros FOR UPDATE
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem excluir apenas seus próprios lançamentos futuros"
ON lancamentos_futuros FOR DELETE
USING (auth.uid()::text = usuario_id::text); 