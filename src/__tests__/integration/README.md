# Tests de Integración

Tests de integración end-to-end para flujos críticos del sistema de inventario.

## Estructura

```
src/__tests__/integration/
├── product.integration.test.ts        # Tests CRUD de productos
├── store.integration.test.ts          # Tests CRUD de tiendas
└── inventory-flow.integration.test.ts # Tests de flujos de inventario
```

## Flujos Críticos Cubiertos

### 1. Productos
- Crear producto
- Listar productos
- Obtener producto por ID
- Actualizar producto
- Eliminar producto
- Validaciones de datos

### 2. Tiendas
- Crear tienda
- Listar tiendas
- Obtener tienda por ID
- Consultar inventario de tienda
- Actualizar tienda
- Eliminar tienda

### 3. Flujo de Inventario
- Entrada de productos (IN)
- Salida de productos (OUT)
- Transferencia entre tiendas
- Consulta de inventario
- Validación de stock insuficiente
- Historial de movimientos
- Alertas de stock bajo
- Reportes

## Ejecutar Tests

```bash
# Todos los tests de integración
npm run test:integration

# Tests unitarios
npm run test:unit

# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage
```

## Requisitos

- Base de datos PostgreSQL en ejecución
- Variables de entorno configuradas en `.env`
- Dependencias instaladas: `npm install`

## Características

- Tests en español para mejor comprensión
- Setup y cleanup automático
- Validación de casos exitosos y errores
- Pruebas de integridad de datos
- Cobertura de casos límite
