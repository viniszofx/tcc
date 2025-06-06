# Sistema KDÊ - Gestão Patrimonial

## 📋 Sobre o Projeto

KDÊ é um sistema de gestão patrimonial desenvolvido como Trabalho de Conclusão de Curso (TCC) para o Instituto Federal de Mato Grosso do Sul - Campus Corumbá. O projeto visa modernizar e otimizar o processo de inventário e controle de bens patrimoniais na rede IFMS através de uma interface moderna, intuitiva e responsiva.

### 🎓 Contexto Acadêmico

- **Instituição**: IFMS - Campus Corumbá
- **Curso**: Tecnologia em Análise e Desenvolvimento de Sistemas
- **Ano**: 2025
- **Orientador**: Paulo Cesar

## 🚀 Funcionalidades Principais

### Autenticação e Controle de Acesso

- Login com email institucional
- Recuperação de senha
- Registro de novos usuários
- Configuração inicial do sistema
- Diferentes níveis de acesso (admin, presidente, operador)

### Gestão Administrativa

- Gerenciamento de organizações
- Controle de campus
- Gestão de comissões
- Administração de usuários

### Gestão de Inventário

- Upload e processamento de arquivos CSV/Excel
- Visualização e edição de itens
- Filtros e busca avançada
- Histórico de alterações
- Exportação de dados (CSV, JSON, PDF)

### Recursos Adicionais

- Scanner QR Code integrado
- Aceleração de hardware para processamento
- Interface responsiva
- Tema claro/escuro

## 🎯 Objetivos do Projeto

- Otimizar o processo de gestão patrimonial no IFMS
- Reduzir o tempo gasto em inventários físicos
- Minimizar erros em registros patrimoniais
- Melhorar a rastreabilidade dos bens
- Facilitar a comunicação entre comissões e setores

## 📊 Resultados Esperados

- Aumento na eficiência do processo de inventário
- Redução de inconsistências nos registros patrimoniais
- Melhor controle e transparência na gestão de bens
- Interface amigável para usuários de diferentes níveis técnicos
- Integração com os processos existentes no IFMS

## 🛠️ Tecnologias Utilizadas

- Next.js 13+
- React
- TypeScript
- Tailwind CSS
- Supabase (Autenticação)
- Resend (Email)

## 📁 Estrutura do Projeto

```
app/
├── (auth)/           # Rotas de autenticação
├── (protected)/      # Rotas protegidas
├── api/             # API endpoints
└── ...
```

## 🚦 Endpoints da API

### Autenticação

- `POST /api/v1/auth/callback` - Callback de autenticação
- `GET /api/v1/setup/status` - Status da configuração inicial
- `POST /api/v1/setup` - Configuração inicial do sistema

### Sistema

- `POST /api/v1/send` - Envio de emails
- Outras rotas relacionadas ao gerenciamento do sistema

## 🔧 Configuração

### Requisitos

- Node.js 18+
- NPM ou PNPM

### Variáveis de Ambiente

```env
RESEND_API_KEY=sua_chave_api
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/viniszofx/kde.git

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

## 👥 Equipe

### Desenvolvedores

- **Osiris Vinicius** - Desenvolvedor Full Stack
- **Pedro Ernesto** - Desenvolvedor Frontend
- **Bruno Wagler** - Documentação

### Orientação

- Paulo Cesar - Professor Orientador

## 📄 Licença

Este projeto está sob a licença MIT.

## 📚 Documentação Completa

A documentação completa do projeto, incluindo a monografia, diagramas e especificações técnicas, está disponível em: [link para documentação]

## 🤝 Agradecimentos

- IFMS Campus Corumbá
- Professores e orientadores
- Setor de Patrimônio do IFMS
- Demais colaboradores que contribuíram com o projeto
