import { ProductUseCase } from '../../../application/use-cases/ProductUseCase';
import { ProductRepository } from '../../../infraestructure/repositories/ProductRepository';
import { InventoryRepository } from '../../../infraestructure/repositories/InventoryRepository';
import { StoreRepository } from '../../../infraestructure/repositories/StoreRepository';
import { CreateProductDTO, UpdateProductDTO } from '../../../domain/product/dto/ProductDTO';
import { DuplicateProductError, StoreNotFoundError, ProductNotFoundError } from '../../../errors';
import { sequelize } from '../../../infraestructure/db/sequalize';


jest.mock('../../../infraestructure/db/sequalize', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));


jest.mock('../../../infraestructure/repositories/ProductRepository');
jest.mock('../../../infraestructure/repositories/InventoryRepository');
jest.mock('../../../infraestructure/repositories/StoreRepository');

describe('ProductUseCase', () => {
  let productUseCase: ProductUseCase;
  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockInventoryRepository: jest.Mocked<InventoryRepository>;
  let mockStoreRepository: jest.Mocked<StoreRepository>;
  let mockTransaction: any;

  beforeEach(() => {

    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    mockInventoryRepository = new InventoryRepository() as jest.Mocked<InventoryRepository>;
    mockStoreRepository = new StoreRepository() as jest.Mocked<StoreRepository>;


    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    productUseCase = new ProductUseCase(
      mockProductRepository,
      mockInventoryRepository,
      mockStoreRepository
    );

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const mockCreateProductDTO: CreateProductDTO = {
      name: 'Producto de Prueba',
      description: 'Descripción del producto',
      price: 99.99,
      sku: 'PROD-001',
      category: 'Electrónica',
      inventory: {
        storeId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 100,
        minStock: 10,
      },
    };

    const mockStore = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Tienda Principal',
      location: 'Centro',
    };

    const mockProduct = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Producto de Prueba',
      description: 'Descripción del producto',
      price: 99.99,
      sku: 'PROD-001',
      category: 'Electrónica',
      isActive: true,
    };

    it('debería crear un producto exitosamente', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(mockProduct as any);
      mockInventoryRepository.create.mockResolvedValue({} as any);

      const result = await productUseCase.createProduct(mockCreateProductDTO);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(mockCreateProductDTO.inventory.storeId);
      expect(mockProductRepository.findBySku).toHaveBeenCalledWith(mockCreateProductDTO.sku);
      expect(mockProductRepository.create).toHaveBeenCalledWith(mockCreateProductDTO, mockTransaction);
      expect(mockInventoryRepository.create).toHaveBeenCalledWith(
        {
          productId: mockProduct.id,
          storeId: mockCreateProductDTO.inventory.storeId,
          quantity: mockCreateProductDTO.inventory.quantity,
          minStock: mockCreateProductDTO.inventory.minStock,
        },
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar StoreNotFoundError cuando la tienda no existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(null);

      await expect(productUseCase.createProduct(mockCreateProductDTO)).rejects.toThrow(
        StoreNotFoundError
      );

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(mockCreateProductDTO.inventory.storeId);
      expect(mockProductRepository.findBySku).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería lanzar DuplicateProductError cuando el SKU ya existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findBySku.mockResolvedValue(mockProduct as any);

      await expect(productUseCase.createProduct(mockCreateProductDTO)).rejects.toThrow(
        DuplicateProductError
      );

      expect(mockStoreRepository.findById).toHaveBeenCalled();
      expect(mockProductRepository.findBySku).toHaveBeenCalledWith(mockCreateProductDTO.sku);
      expect(mockProductRepository.create).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('debería hacer rollback cuando falla la creación del producto', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);
      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockRejectedValue(error);

      await expect(productUseCase.createProduct(mockCreateProductDTO)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    const productId = '550e8400-e29b-41d4-a716-446655440001';
    const mockUpdateDTO: UpdateProductDTO = {
      name: 'Producto Actualizado',
      price: 149.99,
    };

    const mockUpdatedProduct = {
      id: productId,
      name: 'Producto Actualizado',
      price: 149.99,
      sku: 'PROD-001',
      category: 'Electrónica',
      isActive: true,
    };

    it('debería actualizar un producto exitosamente', async () => {
      mockProductRepository.update.mockResolvedValue(mockUpdatedProduct as any);

      const result = await productUseCase.updateProduct(productId, mockUpdateDTO);

      expect(mockProductRepository.update).toHaveBeenCalledWith(productId, mockUpdateDTO, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('debería retornar null cuando el producto no existe', async () => {
      mockProductRepository.update.mockResolvedValue(null);

      const result = await productUseCase.updateProduct(productId, mockUpdateDTO);

      expect(mockProductRepository.update).toHaveBeenCalledWith(productId, mockUpdateDTO, mockTransaction);
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('debería hacer rollback cuando falla la actualización', async () => {
      const error = new Error('Error en la base de datos');
      mockProductRepository.update.mockRejectedValue(error);

      await expect(productUseCase.updateProduct(productId, mockUpdateDTO)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    const productId = '550e8400-e29b-41d4-a716-446655440001';
    const mockProduct = {
      id: productId,
      name: 'Producto de Prueba',
      price: 99.99,
      sku: 'PROD-001',
      category: 'Electrónica',
      isActive: true,
    };

    it('debería obtener un producto por ID exitosamente', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as any);

      const result = await productUseCase.getProductById(productId);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('debería retornar null cuando el producto no existe', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await productUseCase.getProductById(productId);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toBeNull();
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockProductRepository.findById.mockRejectedValue(error);

      await expect(productUseCase.getProductById(productId)).rejects.toThrow(error);
    });
  });

  describe('getProducts', () => {
    const mockProducts = {
      products: [
        {
          id: '1',
          name: 'Producto 1',
          price: 99.99,
          sku: 'PROD-001',
          category: 'Electrónica',
          isActive: true,
        },
        {
          id: '2',
          name: 'Producto 2',
          price: 149.99,
          sku: 'PROD-002',
          category: 'Electrónica',
          isActive: true,
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    it('debería obtener todos los productos sin filtros', async () => {
      mockProductRepository.findAll.mockResolvedValue(mockProducts as any);

      const result = await productUseCase.getProducts();

      expect(mockProductRepository.findAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockProducts);
    });

    it('debería obtener productos con filtros y paginación', async () => {
      const filter = { category: 'Electrónica' };
      const pagination = { page: 1, limit: 10 };

      mockProductRepository.findAll.mockResolvedValue(mockProducts as any);

      const result = await productUseCase.getProducts(filter, pagination);

      expect(mockProductRepository.findAll).toHaveBeenCalledWith(filter, pagination);
      expect(result).toEqual(mockProducts);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockProductRepository.findAll.mockRejectedValue(error);

      await expect(productUseCase.getProducts()).rejects.toThrow(error);
    });
  });

  describe('deleteProduct', () => {
    const productId = '550e8400-e29b-41d4-a716-446655440001';

    it('debería eliminar un producto exitosamente', async () => {
      mockProductRepository.delete.mockResolvedValue(true);

      const result = await productUseCase.deleteProduct(productId);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(productId, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('debería retornar false cuando el producto no existe', async () => {
      mockProductRepository.delete.mockResolvedValue(false);

      const result = await productUseCase.deleteProduct(productId);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(productId, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('debería hacer rollback cuando falla la eliminación', async () => {
      const error = new Error('Error en la base de datos');
      mockProductRepository.delete.mockRejectedValue(error);

      await expect(productUseCase.deleteProduct(productId)).rejects.toThrow(error);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });
});
