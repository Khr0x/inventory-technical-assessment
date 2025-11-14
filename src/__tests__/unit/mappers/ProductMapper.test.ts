import { ProductMapper } from '../../../infraestructure/mappers/ProductMapper';
import { ProductModel } from '../../../infraestructure/db/models/ProductModel';
import { Product } from '../../../domain/product/Product';

describe('ProductMapper', () => {
  describe('mapModelToEntity', () => {
    it('debería mapear un ProductModel a Product correctamente', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Laptop HP',
        description: 'Laptop de alto rendimiento',
        category: 'Electrónica',
        price: '1299.99',
        sku: 'LAP-HP-001',
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      } as any;

      const result = ProductMapper.mapModelToEntity(mockProductModel);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Laptop HP',
        description: 'Laptop de alto rendimiento',
        category: 'Electrónica',
        price: 1299.99,
        sku: 'LAP-HP-001',
        createdAt: mockProductModel.createdAt,
        updatedAt: mockProductModel.updatedAt,
      });
    });

    it('debería convertir el precio de string a number', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Mouse',
        description: 'Mouse inalámbrico',
        category: 'Accesorios',
        price: '29.99',
        sku: 'MOU-001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = ProductMapper.mapModelToEntity(mockProductModel);

      expect(typeof result.price).toBe('number');
      expect(result.price).toBe(29.99);
    });

    it('debería manejar precios con decimales correctamente', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Teclado',
        description: 'Teclado mecánico',
        category: 'Accesorios',
        price: '149.50',
        sku: 'TEC-001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = ProductMapper.mapModelToEntity(mockProductModel);

      expect(result.price).toBe(149.50);
    });

    it('debería preservar las fechas createdAt y updatedAt', () => {
      const createdDate = new Date('2024-01-10T08:30:00Z');
      const updatedDate = new Date('2024-01-20T15:45:00Z');

      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Monitor',
        description: 'Monitor 27 pulgadas',
        category: 'Electrónica',
        price: '399.99',
        sku: 'MON-001',
        isActive: true,
        createdAt: createdDate,
        updatedAt: updatedDate,
      } as any;

      const result = ProductMapper.mapModelToEntity(mockProductModel);

      expect(result.createdAt).toBe(createdDate);
      expect(result.updatedAt).toBe(updatedDate);
    });

    it('debería mapear todos los campos obligatorios', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Audífonos',
        description: 'Audífonos con cancelación de ruido',
        category: 'Audio',
        price: '199.99',
        sku: 'AUD-001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = ProductMapper.mapModelToEntity(mockProductModel);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('sku');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('mapModelToEntityFind', () => {
    it('debería retornar null cuando el modelo es null', () => {
      const result = ProductMapper.mapModelToEntityFind(null);

      expect(result).toBeNull();
    });

    it('debería mapear un ProductModel a Product correctamente cuando no es null', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tablet',
        description: 'Tablet 10 pulgadas',
        category: 'Electrónica',
        price: '299.99',
        sku: 'TAB-001',
        isActive: true,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      } as any;

      const result = ProductMapper.mapModelToEntityFind(mockProductModel);

      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tablet',
        description: 'Tablet 10 pulgadas',
        category: 'Electrónica',
        price: 299.99,
        sku: 'TAB-001',
        createdAt: mockProductModel.createdAt,
        updatedAt: mockProductModel.updatedAt,
      });
    });

    it('debería convertir el precio a número cuando el modelo no es null', () => {
      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Cámara',
        description: 'Cámara digital',
        category: 'Fotografía',
        price: '599.99',
        sku: 'CAM-001',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = ProductMapper.mapModelToEntityFind(mockProductModel);

      expect(result).not.toBeNull();
      expect(typeof result?.price).toBe('number');
      expect(result?.price).toBe(599.99);
    });

    it('debería manejar undefined de la misma forma que null', () => {
      const result = ProductMapper.mapModelToEntityFind(null);

      expect(result).toBeNull();
    });

    it('debería preservar todos los campos cuando el modelo no es null', () => {
      const createdDate = new Date('2024-01-05T12:00:00Z');
      const updatedDate = new Date('2024-01-25T18:30:00Z');

      const mockProductModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Impresora',
        description: 'Impresora multifuncional',
        category: 'Oficina',
        price: '249.99',
        sku: 'IMP-001',
        isActive: true,
        createdAt: createdDate,
        updatedAt: updatedDate,
      } as any;

      const result = ProductMapper.mapModelToEntityFind(mockProductModel);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result?.name).toBe('Impresora');
      expect(result?.description).toBe('Impresora multifuncional');
      expect(result?.category).toBe('Oficina');
      expect(result?.price).toBe(249.99);
      expect(result?.sku).toBe('IMP-001');
      expect(result?.createdAt).toBe(createdDate);
      expect(result?.updatedAt).toBe(updatedDate);
    });
  });
});
