import { z } from 'zod';
import { createProductSchema, updateProductSchema } from '../../../schemas/product.schema';

describe('Product Schemas', () => {
  describe('createProductSchema', () => {
    describe('validación exitosa', () => {
      it('debería validar un producto válido con todos los campos', () => {
        const validProduct = {
          name: 'Laptop HP',
          description: 'Laptop de alta gama con 16GB RAM',
          category: 'Electrónica',
          price: 1299.99,
          sku: 'LAP-HP-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(validProduct);
        expect(result.success).toBe(true);
      });

      it('debería validar con precio entero', () => {
        const validProduct = {
          name: 'Mouse',
          description: 'Mouse inalámbrico',
          category: 'Accesorios',
          price: 25,
          sku: 'MOU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 50,
            minStock: 10,
          },
        };

        const result = createProductSchema.safeParse(validProduct);
        expect(result.success).toBe(true);
      });

      it('debería validar con cantidad cero en inventario', () => {
        const validProduct = {
          name: 'Teclado',
          description: 'Teclado mecánico',
          category: 'Accesorios',
          price: 89.99,
          sku: 'KEY-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 0,
            minStock: 0,
          },
        };

        const result = createProductSchema.safeParse(validProduct);
        expect(result.success).toBe(true);
      });

      it('debería validar con nombres y descripciones largos', () => {
        const validProduct = {
          name: 'A'.repeat(255),
          description: 'Descripción muy larga del producto',
          category: 'A'.repeat(100),
          price: 99.99,
          sku: 'A'.repeat(100),
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 100,
            minStock: 20,
          },
        };

        const result = createProductSchema.safeParse(validProduct);
        expect(result.success).toBe(true);
      });
    });

    describe('errores de validación - campo name', () => {
      it('debería rechazar cuando falta el campo name', () => {
        const invalidProduct = {
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
        }
      });

      it('debería rechazar cuando name está vacío', () => {
        const invalidProduct = {
          name: '',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('name is required and cannot be empty');
        }
      });

      it('debería rechazar cuando name excede 255 caracteres', () => {
        const invalidProduct = {
          name: 'A'.repeat(256),
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - campo description', () => {
      it('debería rechazar cuando falta description', () => {
        const invalidProduct = {
          name: 'Producto',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('description');
        }
      });

      it('debería rechazar cuando description está vacía', () => {
        const invalidProduct = {
          name: 'Producto',
          description: '',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('description is required and cannot be empty');
        }
      });
    });

    describe('errores de validación - campo category', () => {
      it('debería rechazar cuando falta category', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('category');
        }
      });

      it('debería rechazar cuando category está vacía', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: '',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('category is required and cannot be empty');
        }
      });

      it('debería rechazar cuando category excede 100 caracteres', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'A'.repeat(101),
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - campo price', () => {
      it('debería rechazar cuando falta price', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('price');
        }
      });

      it('debería rechazar cuando price es cero', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 0,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('price must be a positive number');
        }
      });

      it('debería rechazar cuando price es negativo', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: -10,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('price must be a positive number');
        }
      });

      it('debería rechazar cuando price no es un número', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 'cien pesos',
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - campo sku', () => {
      it('debería rechazar cuando falta sku', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('sku');
        }
      });

      it('debería rechazar cuando sku está vacío', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: '',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('sku is required and cannot be empty');
        }
      });

      it('debería rechazar cuando sku excede 100 caracteres', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'A'.repeat(101),
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - inventory.storeId', () => {
      it('debería rechazar cuando falta inventory', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando storeId no es un UUID válido', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: 'invalid-uuid',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('storeId must be a valid UUID');
        }
      });

      it('debería rechazar cuando storeId está vacío', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '',
            quantity: 10,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - inventory.quantity', () => {
      it('debería rechazar cuando quantity es negativa', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: -5,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('quantity must be a non-negative integer');
        }
      });

      it('debería rechazar cuando quantity es decimal', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10.5,
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando falta quantity', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            minStock: 5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - inventory.minStock', () => {
      it('debería rechazar cuando minStock es negativo', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: -5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('minStock must be a non-negative integer');
        }
      });

      it('debería rechazar cuando minStock es decimal', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
            minStock: 5.5,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando falta minStock', () => {
        const invalidProduct = {
          name: 'Producto',
          description: 'Descripción',
          category: 'Categoría',
          price: 100,
          sku: 'SKU-001',
          inventory: {
            storeId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 10,
          },
        };

        const result = createProductSchema.safeParse(invalidProduct);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updateProductSchema', () => {
    describe('validación exitosa', () => {
      it('debería validar cuando se actualiza solo el nombre', () => {
        const validUpdate = {
          name: 'Nuevo nombre',
        };

        const result = updateProductSchema.safeParse(validUpdate);
        expect(result.success).toBe(true);
      });

      it('debería validar cuando se actualizan todos los campos', () => {
        const validUpdate = {
          name: 'Nuevo nombre',
          description: 'Nueva descripción',
          category: 'Nueva categoría',
          price: 199.99,
          sku: 'NEW-SKU-001',
        };

        const result = updateProductSchema.safeParse(validUpdate);
        expect(result.success).toBe(true);
      });

      it('debería validar cuando no se proporciona ningún campo (objeto vacío)', () => {
        const validUpdate = {};

        const result = updateProductSchema.safeParse(validUpdate);
        expect(result.success).toBe(true);
      });

      it('debería validar cuando se actualiza solo el precio', () => {
        const validUpdate = {
          price: 299.99,
        };

        const result = updateProductSchema.safeParse(validUpdate);
        expect(result.success).toBe(true);
      });

      it('debería validar con valores en los límites permitidos', () => {
        const validUpdate = {
          name: 'A'.repeat(255),
          category: 'B'.repeat(100),
          sku: 'C'.repeat(100),
          price: 0.01,
        };

        const result = updateProductSchema.safeParse(validUpdate);
        expect(result.success).toBe(true);
      });
    });

    describe('errores de validación', () => {
      it('debería rechazar cuando name está vacío', () => {
        const invalidUpdate = {
          name: '',
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando name excede 255 caracteres', () => {
        const invalidUpdate = {
          name: 'A'.repeat(256),
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando description está vacía', () => {
        const invalidUpdate = {
          description: '',
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando category está vacía', () => {
        const invalidUpdate = {
          category: '',
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando category excede 100 caracteres', () => {
        const invalidUpdate = {
          category: 'A'.repeat(101),
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando price es cero', () => {
        const invalidUpdate = {
          price: 0,
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando price es negativo', () => {
        const invalidUpdate = {
          price: -10,
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando sku está vacío', () => {
        const invalidUpdate = {
          sku: '',
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando sku excede 100 caracteres', () => {
        const invalidUpdate = {
          sku: 'A'.repeat(101),
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
      });

      it('debería rechazar múltiples campos inválidos simultáneamente', () => {
        const invalidUpdate = {
          name: '',
          price: -50,
          category: 'A'.repeat(101),
        };

        const result = updateProductSchema.safeParse(invalidUpdate);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
        }
      });
    });
  });
});
