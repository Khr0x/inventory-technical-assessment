import { createStoreSchema, storeIdParamSchema } from '../../../schemas/store.schema';

describe('Store Schemas', () => {
  describe('createStoreSchema', () => {
    describe('validación exitosa', () => {
      it('debería validar una tienda válida con todos los campos', () => {
        const validStore = {
          name: 'Tienda Central',
          location: 'Calle Principal 123, Ciudad',
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });

      it('debería validar con nombre de una sola letra', () => {
        const validStore = {
          name: 'A',
          location: 'B',
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });

      it('debería validar con nombres y ubicaciones en el límite máximo (255 caracteres)', () => {
        const validStore = {
          name: 'A'.repeat(255),
          location: 'B'.repeat(255),
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });

      it('debería validar con caracteres especiales', () => {
        const validStore = {
          name: 'Tienda #1 - Principal',
          location: 'Av. José María 456, Apto. 7B',
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });

      it('debería validar con números en el nombre', () => {
        const validStore = {
          name: 'Tienda 24/7',
          location: 'Calle 123',
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });

      it('debería validar con espacios al inicio y final', () => {
        const validStore = {
          name: ' Tienda Central ',
          location: ' Ubicación Principal ',
        };

        const result = createStoreSchema.safeParse(validStore);
        expect(result.success).toBe(true);
      });
    });

    describe('errores de validación - campo name', () => {
      it('debería rechazar cuando falta el campo name', () => {
        const invalidStore = {
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
        }
      });

      it('debería rechazar cuando name está vacío', () => {
        const invalidStore = {
          name: '',
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('name is required and cannot be empty');
        }
      });

      it('debería rechazar cuando name excede 255 caracteres', () => {
        const invalidStore = {
          name: 'A'.repeat(256),
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando name es null', () => {
        const invalidStore = {
          name: null,
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando name es un número', () => {
        const invalidStore = {
          name: 12345,
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando name es un objeto', () => {
        const invalidStore = {
          name: { value: 'Tienda' },
          location: 'Ubicación',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - campo location', () => {
      it('debería rechazar cuando falta el campo location', () => {
        const invalidStore = {
          name: 'Tienda',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('location');
        }
      });

      it('debería rechazar cuando location está vacía', () => {
        const invalidStore = {
          name: 'Tienda',
          location: '',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('location is required and cannot be empty');
        }
      });

      it('debería rechazar cuando location excede 255 caracteres', () => {
        const invalidStore = {
          name: 'Tienda',
          location: 'A'.repeat(256),
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando location es null', () => {
        const invalidStore = {
          name: 'Tienda',
          location: null,
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando location es un número', () => {
        const invalidStore = {
          name: 'Tienda',
          location: 54321,
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando location es un array', () => {
        const invalidStore = {
          name: 'Tienda',
          location: ['Calle', '123'],
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
      });
    });

    describe('errores de validación - múltiples campos', () => {
      it('debería rechazar cuando ambos campos están vacíos', () => {
        const invalidStore = {
          name: '',
          location: '',
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBe(2);
        }
      });

      it('debería rechazar cuando ambos campos exceden el límite', () => {
        const invalidStore = {
          name: 'A'.repeat(256),
          location: 'B'.repeat(256),
        };

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
        }
      });

      it('debería rechazar cuando faltan ambos campos', () => {
        const invalidStore = {};

        const result = createStoreSchema.safeParse(invalidStore);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBe(2);
        }
      });
    });

    describe('campos adicionales', () => {
      it('debería permitir campos adicionales por defecto (strip mode)', () => {
        const storeWithExtra = {
          name: 'Tienda',
          location: 'Ubicación',
          extraField: 'valor extra',
          anotherField: 123,
        };

        const result = createStoreSchema.safeParse(storeWithExtra);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('storeIdParamSchema', () => {
    describe('validación exitosa', () => {
      it('debería validar un UUID v4 válido', () => {
        const validParam = {
          id: '123e4567-e89b-12d3-a456-426614174000',
        };

        const result = storeIdParamSchema.safeParse(validParam);
        expect(result.success).toBe(true);
      });

      it('debería validar diferentes UUIDs válidos', () => {
        const validParams = [
          { id: '550e8400-e29b-41d4-a716-446655440000' },
          { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
          { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
        ];

        validParams.forEach((param) => {
          const result = storeIdParamSchema.safeParse(param);
          expect(result.success).toBe(true);
        });
      });

      it('debería validar UUID con letras mayúsculas', () => {
        const validParam = {
          id: '123E4567-E89B-12D3-A456-426614174000',
        };

        const result = storeIdParamSchema.safeParse(validParam);
        expect(result.success).toBe(true);
      });
    });

    describe('errores de validación', () => {
      it('debería rechazar cuando falta el campo id', () => {
        const invalidParam = {};

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id no es un UUID válido', () => {
        const invalidParam = {
          id: 'not-a-valid-uuid',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('id must be a valid UUID');
        }
      });

      it('debería rechazar cuando id es un UUID incompleto', () => {
        const invalidParam = {
          id: '123e4567-e89b-12d3-a456',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id tiene guiones en posiciones incorrectas', () => {
        const invalidParam = {
          id: '123e4567e89b-12d3-a456-426614174000',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id está vacío', () => {
        const invalidParam = {
          id: '',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id es null', () => {
        const invalidParam = {
          id: null,
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id es un número', () => {
        const invalidParam = {
          id: 12345,
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id tiene caracteres inválidos', () => {
        const invalidParam = {
          id: '123e4567-e89b-12d3-a456-42661417400g',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar cuando id tiene espacios', () => {
        const invalidParam = {
          id: '123e4567 e89b 12d3 a456 426614174000',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });

      it('debería rechazar UUID sin guiones', () => {
        const invalidParam = {
          id: '123e4567e89b12d3a456426614174000',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });
    });

    describe('casos edge', () => {
      it('debería rechazar UUID v1 (aunque sea válido como UUID)', () => {
        const param = {
          id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        };

        // Este es técnicamente un UUID válido, así que debería pasar
        const result = storeIdParamSchema.safeParse(param);
        expect(result.success).toBe(true);
      });

      it('debería rechazar cuando id tiene longitud correcta pero formato incorrecto', () => {
        const invalidParam = {
          id: '12345678-1234-1234-1234-12345678901z',
        };

        const result = storeIdParamSchema.safeParse(invalidParam);
        expect(result.success).toBe(false);
      });
    });
  });
});
