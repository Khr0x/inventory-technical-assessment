import { ProductRepository } from '../../../infraestructure/repositories/ProductRepository';
import { ProductModel } from '../../../infraestructure/db/models/ProductModel';
import { InventoryModel } from '../../../infraestructure/db/models/InventoryModel';
import { ProductMapper } from '../../../infraestructure/mappers/ProductMapper';
import { DuplicateProductError, ProductNotFoundError } from '../../../errors';
import { InactiveProductError } from '../../../errors/ProductErrors';

jest.mock('../../../infraestructure/db/models/ProductModel');
jest.mock('../../../infraestructure/db/models/InventoryModel');
jest.mock('../../../infraestructure/mappers/ProductMapper');

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let mockTransaction: any;

  beforeEach(() => {
    productRepository = new ProductRepository();
    mockTransaction = {};
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un producto exitosamente', async () => {
      const productData = {
        name: 'Producto de Prueba',
        description: 'Descripción de prueba',
        category: 'Electrónica',
        price: 999.99,
        sku: 'TEST-001',
        inventory: {
          storeId: 'store-123',
          quantity: 10,
          minStock: 5,
        },
      };

      const mockProductModel = {
        id: 'product-123',
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        sku: productData.sku,
      };

      const expectedProduct = {
        id: 'product-123',
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        sku: productData.sku,
      };

      (ProductModel.create as jest.Mock).mockResolvedValue(mockProductModel);
      (ProductMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.create(productData, mockTransaction);

      expect(ProductModel.create).toHaveBeenCalledWith(
        {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          sku: productData.sku,
        },
        { transaction: mockTransaction }
      );
      expect(ProductMapper.mapModelToEntity).toHaveBeenCalledWith(mockProductModel);
      expect(result).toEqual(expectedProduct);
    });

    it('debería lanzar un error si falla la creación', async () => {
      const productData = {
        name: 'Producto de Prueba',
        description: 'Descripción de prueba',
        category: 'Electrónica',
        price: 999.99,
        sku: 'TEST-001',
        inventory: {
          storeId: 'store-123',
          quantity: 10,
          minStock: 5,
        },
      };

      const error = new Error('Error de base de datos');
      (ProductModel.create as jest.Mock).mockRejectedValue(error);

      await expect(productRepository.create(productData)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('debería actualizar un producto exitosamente', async () => {
      const productId = 'product-123';
      const updateData = {
        name: 'Producto Actualizado',
        price: 1299.99,
      };

      const mockProductModel = {
        id: productId,
        sku: 'TEST-001',
        active: true,
        update: jest.fn().mockResolvedValue(true),
      };

      const expectedProduct = {
        id: productId,
        name: updateData.name,
        price: updateData.price,
      };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(mockProductModel);
      (ProductMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.update(productId, updateData, mockTransaction);

      expect(ProductModel.findByPk).toHaveBeenCalledWith(productId);
      expect(mockProductModel.update).toHaveBeenCalledWith(
        {
          name: updateData.name,
          description: undefined,
          category: undefined,
          price: updateData.price,
          sku: undefined,
        },
        { transaction: mockTransaction }
      );
      expect(result).toEqual(expectedProduct);
    });

    it('debería lanzar ProductNotFoundError cuando el producto no existe', async () => {
      const productId = 'product-999';
      const updateData = { name: 'Producto Actualizado' };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(productRepository.update(productId, updateData)).rejects.toThrow(ProductNotFoundError);
    });

    it('debería lanzar DuplicateProductError cuando el SKU ya existe', async () => {
      const productId = 'product-123';
      const updateData = { sku: 'DUPLICATE-SKU' };

      const mockProductModel = {
        id: productId,
        sku: 'OLD-SKU',
        active: true,
        update: jest.fn(),
      };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(mockProductModel);
      (ProductModel.count as jest.Mock).mockResolvedValue(1);

      await expect(productRepository.update(productId, updateData)).rejects.toThrow(DuplicateProductError);
    });

    it('debería lanzar InactiveProductError cuando el producto está inactivo', async () => {
      const productId = 'product-123';
      const updateData = { name: 'Producto Actualizado' };

      const mockProductModel = {
        id: productId,
        sku: 'TEST-001',
        active: false,
        update: jest.fn(),
      };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(mockProductModel);

      await expect(productRepository.update(productId, updateData)).rejects.toThrow(InactiveProductError);
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los productos sin filtros', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Producto 1', active: true },
        { id: 'prod-2', name: 'Producto 2', active: true },
      ];

      const expectedProducts = [
        { id: 'prod-1', name: 'Producto 1' },
        { id: 'prod-2', name: 'Producto 2' },
      ];

      (ProductModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockProducts,
        count: 2,
      });

      (ProductMapper.mapModelToEntity as jest.Mock)
        .mockReturnValueOnce(expectedProducts[0])
        .mockReturnValueOnce(expectedProducts[1]);

      const result = await productRepository.findAll();

      expect(result).toEqual({
        rows: expectedProducts,
        count: 2,
      });
    });

    it('debería filtrar productos por categoría', async () => {
      const filter = { category: 'Electrónica' };
      const mockProducts = [{ id: 'prod-1', name: 'Producto 1', category: 'Electrónica', active: true }];
      const expectedProduct = { id: 'prod-1', name: 'Producto 1', category: 'Electrónica' };

      (ProductModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockProducts,
        count: 1,
      });

      (ProductMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.findAll(filter);

      expect(ProductModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'Electrónica', active: true }),
        })
      );
      expect(result.count).toBe(1);
    });

    it('debería incluir inventarios cuando se solicita', async () => {
      const filter = { includeInventory: true };
      const mockInventories = [
        { id: 'inv-1', storeId: 'store-1', quantity: 10, minStock: 5 },
      ];

      const mockProducts = [
        { 
          id: 'prod-1', 
          name: 'Producto 1', 
          active: true,
          inventories: mockInventories,
        },
      ];

      const expectedProduct = { id: 'prod-1', name: 'Producto 1' };

      (ProductModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockProducts,
        count: 1,
      });

      (ProductMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.findAll(filter);

      expect(result.rows[0]).toHaveProperty('inventories');
      expect(result.rows[0]).toHaveProperty('totalStock');
    });
  });

  describe('findById', () => {
    it('debería encontrar un producto por ID', async () => {
      const productId = 'product-123';
      const mockProduct = {
        id: productId,
        name: 'Producto de Prueba',
        sku: 'TEST-001',
      };

      const expectedProduct = {
        id: productId,
        name: 'Producto de Prueba',
        sku: 'TEST-001',
      };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(mockProduct);
      (ProductMapper.mapModelToEntityFind as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.findById(productId);

      expect(ProductModel.findByPk).toHaveBeenCalledWith(productId);
      expect(result).toEqual(expectedProduct);
    });

    it('debería lanzar ProductNotFoundError cuando no existe el producto', async () => {
      const productId = 'product-999';

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(productRepository.findById(productId)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('delete', () => {
    it('debería desactivar un producto exitosamente', async () => {
      const productId = 'product-123';
      const mockProduct = {
        id: productId,
        active: true,
        update: jest.fn().mockResolvedValue(true),
      };

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productRepository.delete(productId, mockTransaction);

      expect(mockProduct.update).toHaveBeenCalledWith(
        { active: false },
        { transaction: mockTransaction }
      );
      expect(result).toBe(true);
    });

    it('debería lanzar ProductNotFoundError cuando no existe el producto', async () => {
      const productId = 'product-999';

      (ProductModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(productRepository.delete(productId)).rejects.toThrow(ProductNotFoundError);
    });
  });

  describe('findBySku', () => {
    it('debería encontrar un producto por SKU', async () => {
      const sku = 'TEST-001';
      const mockProduct = {
        id: 'product-123',
        name: 'Producto de Prueba',
        sku: sku,
      };

      const expectedProduct = {
        id: 'product-123',
        name: 'Producto de Prueba',
        sku: sku,
      };

      (ProductModel.findOne as jest.Mock).mockResolvedValue(mockProduct);
      (ProductMapper.mapModelToEntityFind as jest.Mock).mockReturnValue(expectedProduct);

      const result = await productRepository.findBySku(sku);

      expect(ProductModel.findOne).toHaveBeenCalledWith({ where: { sku } });
      expect(result).toEqual(expectedProduct);
    });

    it('debería retornar null cuando no existe el SKU', async () => {
      const sku = 'NONEXISTENT-SKU';

      (ProductModel.findOne as jest.Mock).mockResolvedValue(null);
      (ProductMapper.mapModelToEntityFind as jest.Mock).mockReturnValue(null);

      const result = await productRepository.findBySku(sku);

      expect(result).toBeNull();
    });
  });
});
