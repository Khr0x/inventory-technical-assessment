# Sistema de Gestión de Inventario

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen?style=flat&logo=jest&logoColor=white)](coverage/lcov-report/index.html)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/features/actions)

API REST para gestión de inventario multi-tienda construida con Node.js, TypeScript, Express y PostgreSQL, siguiendo principios de arquitectura hexagonal y clean architecture.

## Tabla de Contenidos

- [Instrucciones de Instalación](#instrucciones-de-instalación)
- [Documentación de API](#documentación-de-api)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Diagrama de Arquitectura](#diagrama-de-arquitectura)

---

## Instrucciones de Instalación

### Requisitos Previos

- Node.js 18+ o superior
- Docker y Docker Compose
- PostgreSQL 17 (opcional, si no usas Docker)

### 1. Uso Local

#### Opción A: Con Docker Compose (Recomendado)

```bash
# Clonar el repositorio
git clone <repository-url>
cd inventory-technical-assessment

# Iniciar servicios
docker-compose up -d

# La API estará disponible en http://localhost:3000
```

#### Opción B: Instalación Manual

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos

# Iniciar base de datos PostgreSQL localmente
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

### 2. Generación de Imagen Docker

```bash
# Construir imagen
docker build -t inventory-api:latest .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/inventory_db" \
  inventory-api:latest

# Publicar imagen a registro
docker tag inventory-api:latest <registry>/inventory-api:v1.0.0
docker push <registry>/inventory-api:v1.0.0
```

### 3. Despliegue en Servidor On-Premise

#### Usando Docker Compose

```bash
# En el servidor, crear docker-compose.prod.yml
version: '3.8'
services:
  api:
    image: <registry>/inventory-api:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://user:pass@db-host:5432/inventory_db"
      NODE_ENV: production
    networks:
      - inventory-network

networks:
  inventory-network:
    driver: bridge

# Desplegar
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose logs -f api
```

### 4. Despliegue en GCP con GitHub Actions

#### Configuración de GCP

```bash
# 1. Crear proyecto en GCP
gcloud projects create inventory-api-prod

# 2. Habilitar servicios necesarios
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. Crear base de datos Cloud SQL
gcloud sql instances create inventory-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# 4. Crear service account para GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# 5. Asignar permisos
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"
  
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 6. Generar clave JSON
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

#### Configuración de GitHub Secrets

En tu repositorio de GitHub, agregar los siguientes secrets:

**Secrets obligatorios:**

- `GCP_SA_KEY`: JSON del Service Account con permisos para Cloud Run + Artifact Registry (si vas a usar Artifact Registry)
- `GCP_PROJECT`: ID del proyecto GCP
- `GCP_REGION`: Región para Cloud Run (ej. `us-central1`)
- `CLOUD_RUN_SERVICE`: Nombre del servicio en Cloud Run (ej. `inventory-api`)
- `REGISTRY_PROVIDER`: Define el destino del registro de imágenes: `artifact` o `dockerhub`

**Si `REGISTRY_PROVIDER = artifact`:**

- `ARTIFACT_REGISTRY_LOCATION`: Ubicación del registro (ej. `us-central1`)
- `ARTIFACT_REGISTRY_REPOSITORY`: Nombre del repositorio en Artifact Registry

**Si `REGISTRY_PROVIDER = dockerhub`:**

- `DOCKERHUB_USERNAME`: Usuario de Docker Hub
- `DOCKERHUB_TOKEN`: Token de acceso personal de Docker Hub

**Configuración de Base de Datos(opcional):**

- `DATABASE_URL`: URL de conexión a Cloud SQL PostgreSQL (ej. `postgresql://user:password@/dbname?host=/cloudsql/project:region:instance`)
  - Para Cloud SQL, usar el formato de conexión con Unix socket
  - También puedes usar IP pública con SSL si prefieres

#### Archivo de GitHub Actions

Crear `.github/workflows/deploy-gcp.yml`:

```yaml
name: CI & Deploy to Google Cloud Run

on:
  push:
    branches: [ main ]

env:
  NODE_VERSION: 18
  IMAGE_TAG: ${{ github.sha }}

jobs:
  test:
    name: Run tests and coverage
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: inventory_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/inventory_test
      NODE_ENV: test

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:unit -- --coverage --runInBand

  build-and-deploy:
    name: Build image, push to registry and deploy to Cloud Run
    needs: test
    runs-on: ubuntu-latest
    env:
      PROJECT_ID: ${{ secrets.GCP_PROJECT }}
      REGION: ${{ secrets.GCP_REGION }}
      SERVICE: ${{ secrets.CLOUD_RUN_SERVICE }}
      PROVIDER: ${{ secrets.REGISTRY_PROVIDER }}
      IMAGE_TAG: ${{ github.sha }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud CLI
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker auth for Artifact Registry (if used)
        if: env.PROVIDER == 'artifact'
        run: |
          # Habilita auth para el host de Artifact Registry (ej: us-central1-docker.pkg.dev)
          gcloud auth configure-docker ${{ secrets.ARTIFACT_REGISTRY_LOCATION }}-docker.pkg.dev --quiet

      - name: Docker login to Docker Hub (if used)
        if: env.PROVIDER == 'dockerhub'
        run: |
          echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Prepare image name
        run: |
          if [ "${PROVIDER}" = "artifact" ]; then
            # ARTIFACT_REGISTRY_LOCATION: ej. us-central1
            # ARTIFACT_REGISTRY_REPOSITORY: nombre del repositorio en Artifact Registry
            IMAGE="${{ secrets.ARTIFACT_REGISTRY_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ secrets.ARTIFACT_REGISTRY_REPOSITORY }}/${{ env.SERVICE }}:${IMAGE_TAG}"
          else
            IMAGE="docker.io/${{ secrets.DOCKERHUB_USERNAME }}/${{ env.SERVICE }}:${IMAGE_TAG}"
          fi
          echo "IMAGE=${IMAGE}" >> $GITHUB_ENV
          echo "Using image: $IMAGE"

      - name: Build and push Docker image
        run: |
          docker build -t "$IMAGE" .
          docker push "$IMAGE"

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy "${SERVICE}" \
            --image="$IMAGE" \
            --region="${REGION}" \
            --platform=managed \
            --allow-unauthenticated \
            --set-env-vars="DATABASE_URL=${{ secrets.DATABASE_URL }}" \
            --set-env-vars="NODE_ENV=production"
```

---

## 📚 Documentación de API

### Base URL

```
Local: http://localhost:3000/api
Producción: https://your-domain.com/api
```

### Endpoints

#### Tiendas (Stores)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/stores` | Crear nueva tienda |
| GET | `/stores` | Obtener todas las tiendas |
| GET | `/stores/:id` | Obtener tienda por ID |

**Ejemplo - Crear Tienda:**
```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tienda Centro",
    "location": "Av. Principal #123"
  }'
```

**Respuesta:**
```json
{
  "id": "uuid",
  "name": "Tienda Centro",
  "location": "Av. Principal #123",
  "createdAt": "2024-11-14T10:00:00.000Z"
}
```

#### Productos (Products)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/products` | Crear nuevo producto |
| GET | `/products` | Obtener todos los productos (con paginación) |
| GET | `/products/:id` | Obtener producto por ID |
| PUT | `/products/:id` | Actualizar producto |
| DELETE | `/products/:id` | Eliminar producto |

**Ejemplo - Crear Producto:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop HP",
    "sku": "LPT-HP-001",
    "price": 899.99,
    "minStock": 5
  }'
```

**Ejemplo - Listar Productos (Paginado):**
```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
```

**Respuesta:**
```json
{
    "rows": [
        {
            "id": "f815350c-2342-416a-a7a2-1c9c95304f4d",
            "name": "Camiseta básica unisex",
            "description": "Camiseta de algodón 100% con corte clásico y disponible en varios colores.",
            "category": "Ropa",
            "price": 199.99,
            "sku": "CAM-001",
            "createdAt": "2025-11-13T19:55:20.329Z",
            "updatedAt": "2025-11-13T19:55:20.329Z"
        }
    ],
    "count": 8
}
```

#### Inventario (Inventory)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/stores/:id/inventory` | Obtener inventario de una tienda |
| POST | `/inventory/transfer` | Transferir stock entre tiendas |
| GET | `/inventory/alerts` | Obtener alertas de stock bajo |

**Ejemplo - Consultar Inventario:**
```bash
curl http://localhost:3000/api/stores/{storeId}/inventory
```

**Respuesta:**
```json
[
    {
        "id": "ac8555a6-3488-40c4-9700-2ce026c92c02",
        "productId": "746aac22-e09e-4a72-b63f-e00c5869e628",
        "storeId": "1cba4693-c7dc-40c4-ad29-ba18184df77c",
        "quantity": 80,
        "updatedAt": "2025-11-13T21:19:08.363Z",
        "createdAt": "2025-11-13T21:19:08.363Z",
        "minStock": 15,
        "store": {
            "id": "1cba4693-c7dc-40c4-ad29-ba18184df77c",
            "name": "Store numero 1",
            "location": "Av. Central No. 456",
            "createdAt": "2025-11-13T15:54:32.347Z",
            "updatedAt": "2025-11-13T15:54:32.347Z"
        }
    }
]
```

**Ejemplo - Transferir Inventario:**
```bash
curl -X POST http://localhost:3000/api/inventory/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid",
    "fromStoreId": "uuid",
    "toStoreId": "uuid",
    "quantity": 10
  }'
```

**Ejemplo - Alertas de Stock Bajo:**
```bash
curl http://localhost:3000/api/inventory/alerts
```

**Respuesta:**
```json
[
    {
        "id": "4a6caddb-64b9-497d-8165-2702cbe690ec",
        "productId": "aab06bd8-6fdc-406e-b344-f9fbab3ce957",
        "storeId": "1cba4693-c7dc-40c4-ad29-ba18184df77c",
        "quantity": 9,
        "updatedAt": "2025-11-13T21:15:14.383Z",
        "createdAt": "2025-11-13T21:15:14.383Z",
        "minStock": 10,
        "store": {
            "id": "1cba4693-c7dc-40c4-ad29-ba18184df77c",
            "name": "Store numero 1",
            "location": "Av. Central No. 456",
            "createdAt": "2025-11-13T15:54:32.347Z",
            "updatedAt": "2025-11-13T15:54:32.347Z"
        }
    }
]
```

#### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verificar estado del servicio |

```bash
curl http://localhost:3000/health
```

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error de validación en la solicitud |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: SKU duplicado) |
| 500 | Error interno del servidor |

---

## Decisiones Técnicas

### Arquitectura

**Arquitectura Hexagonal (Puertos y Adaptadores)**

Se eligió esta arquitectura para garantizar:

- **Separación de responsabilidades**: El dominio está aislado de detalles de infraestructura
- **Testabilidad**: Cada capa puede probarse de forma independiente
- **Flexibilidad**: Facilita el cambio de tecnologías (BD, frameworks) sin afectar la lógica de negocio
- **Mantenibilidad**: Código organizado y fácil de entender

**Capas principales:**

1. **Domain**: Entidades de negocio y reglas (Product, Store, Inventory)
2. **Application**: Casos de uso y controladores
3. **Infrastructure**: Implementaciones concretas (Sequelize, Express)
4. **Adapters**: Interfaces con el mundo exterior (DB, HTTP)

### Stack Tecnológico

| Tecnología | Justificación |
|------------|---------------|
| **TypeScript** | Tipado estático para prevenir errores, mejor DX y mantenibilidad |
| **Express 5** | Framework minimalista y rápido, ampliamente adoptado |
| **Sequelize** | ORM maduro con soporte completo para PostgreSQL y TypeScript |
| **PostgreSQL 17** | Base de datos relacional robusta, ACID compliant, ideal para inventarios |
| **Zod** | Validación de esquemas type-safe, genera tipos automáticamente |
| **Jest** | Framework de testing completo con excelente soporte para TypeScript |
| **Docker** | Contenerización para consistencia entre entornos |

### Patrones Implementados

- **Repository Pattern**: Abstracción de acceso a datos
- **Use Cases**: Encapsulación de lógica de negocio
- **DTO (Data Transfer Objects)**: Separación entre modelos de dominio y respuestas API, facilitando la integración con clientes externos
- **Dependency Injection**: Facilita testing y desacoplamiento
- **Mapper Pattern**: Conversión entre modelos de dominio e infraestructura
- **ORM (Sequelize)**: Abstracción de base de datos para fácil integración y portabilidad entre diferentes sistemas

### Decisiones de Diseño

**Gestión de Tiendas (Stores)**

Se implementó un módulo completo de gestión de tiendas que incluye:
- APIs RESTful para CRUD de tiendas
- Schemas de validación con Zod
- Tablas relacionales en PostgreSQL
- Esto permite el alta y gestión de productos asociados a múltiples ubicaciones

**Transferencia de Inventario**

Para la transferencia de productos entre tiendas se decidió:
- **Creación automática de inventario**: Si una tienda destino no tiene inventario de un producto específico, se crea automáticamente durante la transferencia
- **Validación de stock**: Se verifica que la tienda origen tenga suficiente stock antes de realizar la transferencia
- **Atomicidad**: Las operaciones de transferencia son transaccionales para garantizar consistencia de datos

**Uso de DTOs y ORM**

- **DTOs**: Se utilizan para transformar datos entre capas, asegurando que solo se expone la información necesaria en cada contexto
- **ORM (Sequelize)**: Facilita la integración con diferentes bases de datos y simplifica las operaciones CRUD, reduciendo el código boilerplate

### Validaciones

Se utiliza **Zod** para validación de schemas con middleware dedicado:

- Validación automática en capa de entrada
- Mensajes de error descriptivos
- Type-safety garantizado

### Testing

Estrategia de testing multicapa:

- **Tests Unitarios**: Lógica de negocio, mappers, validaciones
- **Tests de Integración**: Flujos completos de API
- **Tests de Carga**: Artillery para pruebas de rendimiento

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Solo tests unitarios
npm run test:unit

# Tests de carga
npm run test:load:products
```

### Gestión de Errores

Sistema centralizado de manejo de errores:

- Clase `AppError` personalizada
- Errores específicos por dominio (ProductErrors, InventoryErrors)
- Códigos HTTP semánticos
- Mensajes de error descriptivos

### Consideraciones de Rendimiento

- Paginación en listados de productos
- Índices en base de datos para consultas frecuentes
- Pooling de conexiones a DB
- Imagen Docker multi-stage para reducir tamaño

---

## Diagrama de Arquitectura

### Arquitectura Hexagonal - Capas

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │  Express   │  │  Routes    │  │   Middlewares       │   │
│  │  Server    │  │            │  │  (Validation)       │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────┐
│                   APPLICATION LAYER                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Controllers                             │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │  Store  │  │ Product  │  │   Inventory      │  │    │
│  │  └─────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Use Cases                               │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐  │    │
│  │  │  Store  │  │ Product  │  │   Inventory      │  │    │
│  │  │UseCase  │  │ UseCase  │  │   UseCase        │  │    │
│  │  └─────────┘  └──────────┘  └──────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────┐
│                      DOMAIN LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Entities & Business Rules                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  Store  │  │ Product  │  │   Inventory      │   │   │
│  │  └─────────┘  └──────────┘  └──────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │          Domain Interfaces (Ports)           │   │   │
│  │  │  IStoreRepo, IProductRepo, IInventoryRepo   │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Repositories                           │   │
│  │  ┌────────────┐  ┌───────────┐  ┌───────────────┐  │   │
│  │  │   Store    │  │  Product  │  │  Inventory    │  │   │
│  │  │ Repository │  │Repository │  │  Repository   │  │   │
│  │  └────────────┘  └───────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Mappers & Models                         │   │
│  │         (Sequelize Models & Mappers)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database Adapter                         │   │
│  │              (PostgreSQL)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de Datos - Ejemplo: Crear Producto

```
1. Cliente
     │
     │ POST /api/products
     ▼
2. Express Routes
     │
     │ validateSchema(createProductSchema)
     ▼
3. ProductController
     │
     │ controller.createProduct()
     ▼
4. ProductUseCase
     │
     │ useCase.createProduct()
     ▼
5. ProductRepository (Port)
     │
     │ repository.create()
     ▼
6. ProductRepository (Adapter)
     │
     │ Sequelize ORM
     ▼
7. PostgreSQL Database
     │
     │ INSERT INTO products...
     ▼
8. Respuesta
     │
     │ Mapper: DB Model → Domain Entity → DTO
     ▼
     Cliente (JSON Response)
```

### Diagrama de Despliegue - GCP

```
┌──────────────────────────────────────────────────────────────┐
│                        GITHUB                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Repository                                         │     │
│  │  └─ .github/workflows/deploy-gcp.yml               │     │
│  └──────────────────┬─────────────────────────────────┘     │
└─────────────────────┼────────────────────────────────────────┘
                      │ Push to main
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                   GITHUB ACTIONS                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  1. Build Docker Image                            │       │
│  │  2. Push to GCR (Container Registry)              │       │
│  │  3. Deploy to Cloud Run                           │       │
│  └──────────────────┬───────────────────────────────┘       │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                 GOOGLE CLOUD PLATFORM                         │
│                                                                │
│  ┌──────────────────────┐     ┌──────────────────────────┐  │
│  │  Container Registry  │     │     Cloud Run            │  │
│  │  (GCR)               │────▶│  ┌────────────────────┐  │  │
│  │                      │     │  │  inventory-api     │  │  │
│  │  inventory-api:tag   │     │  │  (Auto-scaling)    │  │  │
│  └──────────────────────┘     │  │  Instances: 0-10   │  │  │
│                                │  └────────┬───────────┘  │  │
│                                └───────────┼──────────────┘  │
│                                            │                  │
│                                            │                  │
│  ┌─────────────────────────────────────────┼─────────────┐  │
│  │            Cloud SQL (PostgreSQL)       │             │  │
│  │  ┌──────────────────────────────────────▼──────────┐ │  │
│  │  │  inventory_db                                    │ │  │
│  │  │  - Auto backups                                  │ │  │
│  │  │  - High availability                             │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Cloud Monitoring & Logging                 │  │
│  │  - Application logs                                   │  │
│  │  - Metrics & Alerts                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Modelo de Datos

```
┌─────────────────────┐
│      STORES         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ location            │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐         ┌─────────────────────┐
│   INVENTORIES       │    N:1  │      PRODUCTS       │
├─────────────────────┤◀────────├─────────────────────┤
│ id (PK)             │         │ id (PK)             │
│ storeId (FK)        │         │ name                │
│ productId (FK)      │         │ sku (UNIQUE)        │
│ quantity            │         │ price               │
│ createdAt           │         │ minStock            │
│ updatedAt           │         │ createdAt           │
└─────────────────────┘         │ updatedAt           │
           │                    └─────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│ INVENTORY_MOVEMENTS │
├─────────────────────┤
│ id (PK)             │
│ inventoryId (FK)    │
│ type (IN/OUT/TRANS) │
│ quantity            │
│ fromStoreId         │
│ toStoreId           │
│ createdAt           │
└─────────────────────┘
```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Modo desarrollo con hot-reload

# Build
npm run build           # Compilar TypeScript a JavaScript

# Producción
npm start               # Ejecutar versión compilada

# Testing
npm test                # Ejecutar todos los tests
npm run test:unit       # Solo tests unitarios
npm run test:integration # Solo tests de integración
npm run test:coverage   # Tests con reporte de cobertura
npm run test:watch      # Tests en modo watch

# Load Testing
npm run test:load:products   # Pruebas de carga - Productos
npm run test:load:stores     # Pruebas de carga - Tiendas
npm run test:load:inventory  # Pruebas de carga - Inventario

# Calidad de Código
npm run lint            # Ejecutar ESLint
npm run format          # Formatear código con Prettier
```

---
