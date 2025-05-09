-- Criar tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'free',
    aceite_termos BOOLEAN DEFAULT false,
    data_aceite_termos TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de categorias de transações
CREATE TABLE categoria_trasacoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de transações
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria_id INTEGER REFERENCES categoria_trasacoes(id),
    tipo VARCHAR(10) CHECK (tipo IN ('receita', 'despesa')),
    valor DECIMAL(10,2) NOT NULL,
    mes VARCHAR(7) NOT NULL,
    pagador VARCHAR(255),
    recebedor VARCHAR(255),
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de metas
CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_meta DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de logs de acesso
CREATE TABLE logs_acesso (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_evento VARCHAR(50) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45),
    dispositivo VARCHAR(255),
    status VARCHAR(50),
    detalhes JSONB
);

-- Criar tabela de consentimentos
CREATE TABLE consentimentos_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_consentimento VARCHAR(50) NOT NULL,
    versao_politica VARCHAR(20) NOT NULL,
    data_consentimento TIMESTAMP,
    status BOOLEAN DEFAULT true,
    ip_origem VARCHAR(45)
);

-- Criar tabela de solicitações LGPD
CREATE TABLE solicitacoes_lgpd (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_solicitacao VARCHAR(50) NOT NULL,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    status VARCHAR(50),
    justificativa TEXT
);

-- Criar índices para melhor performance
CREATE INDEX idx_transacoes_usuario_id ON transacoes(usuario_id);
CREATE INDEX idx_transacoes_data ON transacoes(data);
CREATE INDEX idx_transacoes_mes ON transacoes(mes);
CREATE INDEX idx_metas_usuario_id ON metas(usuario_id);
CREATE INDEX idx_categoria_trasacoes_usuario_id ON categoria_trasacoes(usuario_id);
CREATE INDEX idx_logs_acesso_usuario_id ON logs_acesso(usuario_id);
CREATE INDEX idx_consentimentos_usuarios_usuario_id ON consentimentos_usuarios(usuario_id);
CREATE INDEX idx_solicitacoes_lgpd_usuario_id ON solicitacoes_lgpd(usuario_id);

-- Criar função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o timestamp
CREATE TRIGGER update_transacoes_updated_at
    BEFORE UPDATE ON transacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_trasacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimentos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_lgpd ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para cada tabela
-- Políticas para transações
CREATE POLICY "Usuários podem ver apenas suas próprias transações"
ON transacoes FOR SELECT
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem criar apenas suas próprias transações"
ON transacoes FOR INSERT
WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem atualizar apenas suas próprias transações"
ON transacoes FOR UPDATE
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem excluir apenas suas próprias transações"
ON transacoes FOR DELETE
USING (auth.uid()::text = usuario_id::text);

-- Políticas para categorias
CREATE POLICY "Usuários podem ver apenas suas próprias categorias"
ON categoria_trasacoes FOR SELECT
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem criar apenas suas próprias categorias"
ON categoria_trasacoes FOR INSERT
WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem atualizar apenas suas próprias categorias"
ON categoria_trasacoes FOR UPDATE
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem excluir apenas suas próprias categorias"
ON categoria_trasacoes FOR DELETE
USING (auth.uid()::text = usuario_id::text);

-- Políticas para metas
CREATE POLICY "Usuários podem ver apenas suas próprias metas"
ON metas FOR SELECT
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem criar apenas suas próprias metas"
ON metas FOR INSERT
WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem atualizar apenas suas próprias metas"
ON metas FOR UPDATE
USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Usuários podem excluir apenas suas próprias metas"
ON metas FOR DELETE
USING (auth.uid()::text = usuario_id::text); 