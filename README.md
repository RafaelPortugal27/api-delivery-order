# 🍔 Snack API — Multi-tenant com WhatsApp

API multi-tenant para pedidos de lanches com autenticação via OTP e notificação por WhatsApp.

---

## 🏗️ Arquitetura

```
src/
├── domain/                    # Camada de domínio (regras de negócio puras)
│   ├── entities/              # Interfaces/tipos das entidades
│   ├── repositories/          # Contratos dos repositórios (interfaces)
│   └── services/              # Contratos de serviços externos (ports)
│
├── application/               # Casos de uso (orquestração)
│   ├── use-cases/
│   │   ├── auth/              # SendOtp, VerifyOtp, LoginStoreUser
│   │   ├── customer/          # RegisterCustomer
│   │   ├── address/           # CreateAddress, ListAddresses
│   │   ├── product/           # CreateProduct
│   │   └── order/             # CreateOrder (+ WhatsApp), UpdateOrderStatus
│   └── helpers/               # formatOrderMessage
│
├── infrastructure/            # Implementações concretas
│   ├── database/              # Prisma client singleton
│   ├── repositories/          # Prisma* (implementações dos contratos)
│   ├── services/              # JWT, Twilio, EvolutionAPI, Nodemailer
│   └── http/
│       ├── app.ts             # Express setup
│       ├── controllers/       # Recebem req/res, delegam aos use-cases
│       ├── middlewares/       # Auth (JWT), TenantGuard, ErrorHandler
│       └── routes/            # Definição das rotas
│
└── shared/
    ├── errors/                # AppError
    └── types/                 # Augmentação do Express Request
```

### Princípios aplicados

| Princípio | Onde |
|-----------|------|
| **SRP** | Cada use-case tem uma única responsabilidade |
| **OCP** | WhatsApp service é injetado — trocar Twilio por Evolution API sem alterar use-case |
| **LSP** | Todas as implementações Prisma substituem seus contratos sem quebrar |
| **ISP** | Interfaces pequenas e focadas (ICustomerRepository, IWhatsappService…) |
| **DIP** | Use-cases dependem de interfaces, não de implementações concretas |

---

## 🚀 Setup

### 1. Pré-requisitos
- Node.js 20+
- Docker & Docker Compose

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 4. Subir banco de dados
```bash
docker-compose up postgres redis -d
```

### 5. Rodar migrations
```bash
npm run db:migrate
```

### 6. Seed (dados de exemplo)
```bash
npm run db:seed
```

### 7. Iniciar em desenvolvimento
```bash
npm run dev
```

---

## 🔑 Autenticação

### Customer (OTP)
```
POST /auth/otp/send    → envia código por EMAIL, SMS ou WHATSAPP
POST /auth/otp/verify  → valida código, retorna JWT
```

O JWT retornado deve ser enviado como `Authorization: Bearer <token>` nas rotas protegidas.

### Usuário da Loja (senha)
```
POST /auth/store/login  → { email, password, storeId } → JWT
```

---

## 📡 Endpoints

### Público
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/customers` | Cadastrar customer |
| POST | `/auth/otp/send` | Solicitar código OTP |
| POST | `/auth/otp/verify` | Validar OTP → JWT |
| POST | `/auth/store/login` | Login usuário da loja |
| POST | `/stores` | Criar nova loja (+ owner) |
| GET | `/stores/:slug` | Info pública da loja |
| GET | `/stores/:slug/menu` | Cardápio disponível |

### Customer (JWT `type=customer`)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/customers/me` | Meus dados |
| GET | `/customers/me/addresses` | Meus endereços |
| POST | `/customers/me/addresses` | Adicionar endereço |
| DELETE | `/customers/me/addresses/:id` | Remover endereço |
| GET | `/customers/me/orders` | Meus pedidos |
| POST | `/orders/:storeSlug` | Fazer pedido |

### Loja (JWT `type=store_user`)
| Método | Rota | Descrição | Role |
|--------|------|-----------|------|
| PUT | `/stores/manage/info` | Editar loja | OWNER, ADMIN |
| GET | `/stores/manage/users` | Listar usuários | OWNER, ADMIN |
| POST | `/stores/manage/users` | Adicionar usuário | OWNER, ADMIN |
| GET | `/stores/manage/products` | Listar produtos | Todos |
| POST | `/stores/manage/products` | Criar produto | OWNER, ADMIN |
| PUT | `/stores/manage/products/:id` | Editar produto | OWNER, ADMIN |
| DELETE | `/stores/manage/products/:id` | Remover produto | OWNER, ADMIN |
| GET | `/stores/manage/orders` | Ver pedidos | Todos |
| PATCH | `/stores/manage/orders/:orderId/status` | Atualizar status | Todos |

---

## 📦 Fluxo de Pedido

```
Customer cadastra → Solicita OTP → Valida OTP (recebe JWT)
  → Cadastra endereço → Faz pedido (POST /orders/:storeSlug)
    → API valida produtos e endereço
    → Calcula total
    → Cria Order no banco
    → Envia mensagem WhatsApp para a loja  ← formatOrderMessage()
    → Retorna pedido criado
```

### Status do Pedido (máquina de estados)
```
PENDING → CONFIRMED → PREPARING → READY → DELIVERING → DELIVERED
        ↘ CANCELLED   ↘ CANCELLED
```

---

## 📱 WhatsApp — Duas opções

### Opção A: Twilio (cloud, mais simples)
Configure no `.env`:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```
No `OrderController`, usa `TwilioWhatsappService`.

### Opção B: Evolution API (self-hosted, gratuito)
```bash
# Adicionar ao docker-compose.yml ou subir separado
docker run -p 8080:8080 atendai/evolution-api
```
Substitua no `OrderController`:
```ts
// Troque TwilioWhatsappService por:
import { EvolutionApiWhatsappService } from '../../services/EvolutionApiWhatsappService'
const whatsappService = new EvolutionApiWhatsappService()
```

---

## 🗃️ Modelo Multi-tenant

Cada `Store` é um tenant isolado:
- **Produtos** pertencem à store (`storeId`)
- **Pedidos** pertencem à store (`storeId`)
- **Usuários da loja** pertencem à store (`storeId`) e só acessam os dados dela
- O JWT de `store_user` carrega o `storeId` — o middleware `storeUserAuth` extrai e injeta em `req.storeId`
- Todas as queries de gerenciamento filtram por `req.storeId` (isolamento de tenant)

**Customers são compartilhados** entre tenants (um mesmo customer pode pedir em várias lojas).

---

## 🐳 Docker Compose completo
```bash
docker-compose up -d        # sobe tudo (app + postgres + redis)
docker-compose logs -f app  # ver logs
```
