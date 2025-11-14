import { Request, Response } from 'express';
import { ProductController } from '../../../application/controllers/ProductController';
import { ProductUseCase } from '../../../application/use-cases/ProductUseCase';
import { HttpStatus } from '../../../enums/HttpStatus';
import { AppError, ProductNotFoundError, DuplicateProductError } from '../../../errors';

jest.mock('../../../application/use-cases/ProductUseCase');

describe('ProductController', () => {
  let productController: ProductController;
  let mockProductUseCase: jest.Mocked<ProductUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockProductUseCase = {
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      getProductById: jest.fn(),
      getProducts: jest.fn(),
      deleteProduct: jest.fn(),
    } as any;

    productController = new ProductController();
    (productController as any).productUseCase = mockProductUseCase;

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('debería crear un producto exitosamente', async () => {
      const productData = {
        name: 'Producto de Prueba',
        description: 'Descripción de Prueba',
        sku: 'TEST123',
        category: 'Electrónica',
        price: 99.99,
        storeId: 'store-123',
        initialStock: 50,
      };

      const expectedResult = {
        id: 'prod-123',
        ...productData,
      };

      mockRequest.body = productData;
      mockProductUseCase.createProduct.mockResolvedValue(expectedResult);

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.createProduct).toHaveBeenCalledWith(productData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('debería manejar AppError al crear un producto', async () => {
      const productData = {
        name: 'Producto de Prueba',
        sku: 'TEST123',
      };

      const error = new DuplicateProductError(productData.sku);
      mockRequest.body = productData;
      mockProductUseCase.createProduct.mockRejectedValue(error);

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });

    it('debería manejar errores inesperados al crear un producto', async () => {
      const productData = {
        name: 'Producto de Prueba',
      };

      mockRequest.body = productData;
      mockProductUseCase.createProduct.mockRejectedValue(new Error('Unexpected error'));

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('updateProduct', () => {
    it('debería actualizar un producto exitosamente', async () => {
      const productId = 'prod-123';
      const updateData = {
        name: 'Producto Actualizado',
        price: 149.99,
      };

      const expectedResult = {
        id: productId,
        name: updateData.name,
        description: 'Descripción de Prueba',
        category: 'Electrónica',
        sku: 'TEST123',
        price: updateData.price,
      };

      mockRequest.params = { id: productId };
      mockRequest.body = updateData;
      mockProductUseCase.updateProduct.mockResolvedValue(expectedResult);

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.updateProduct).toHaveBeenCalledWith(productId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('debería retornar 404 cuando no se encuentra el producto', async () => {
      const productId = 'prod-999';
      const updateData = {
        name: 'Producto Actualizado',
      };

      mockRequest.params = { id: productId };
      mockRequest.body = updateData;
      mockProductUseCase.updateProduct.mockResolvedValue(null);

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found',
      });
    });

    it('debería manejar AppError al actualizar un producto', async () => {
      const productId = 'prod-123';
      const updateData = {
        sku: 'TEST456',
      };

      const error = new DuplicateProductError(updateData.sku);
      mockRequest.params = { id: productId };
      mockRequest.body = updateData;
      mockProductUseCase.updateProduct.mockRejectedValue(error);

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });

    it('debería manejar errores inesperados al actualizar un producto', async () => {
      const productId = 'prod-123';
      mockRequest.params = { id: productId };
      mockRequest.body = {};
      mockProductUseCase.updateProduct.mockRejectedValue(new Error('Error inesperado'));

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        message: 'Ha ocurrido un error interno del servidor',
      });
    });
  });

  describe('getProductById', () => {
    it('debería obtener un producto por id exitosamente', async () => {
      const productId = 'prod-123';
      const expectedProduct = {
        id: productId,
        name: 'Producto de Prueba',
        description: 'Descripción de Prueba',
        category: 'Electrónica',
        sku: 'TEST123',
        price: 99.99,
      };

      mockRequest.params = { id: productId };
      mockProductUseCase.getProductById.mockResolvedValue(expectedProduct);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.getProductById).toHaveBeenCalledWith(productId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedProduct);
    });

    it('debería retornar 404 cuando no se encuentra el producto', async () => {
      const productId = 'prod-999';

      mockRequest.params = { id: productId };
      mockProductUseCase.getProductById.mockResolvedValue(null);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Producto no encontrado',
      });
    });

    it('debería manejar AppError al obtener un producto', async () => {
      const productId = 'prod-123';
      const error = new ProductNotFoundError(productId);

      mockRequest.params = { id: productId };
      mockProductUseCase.getProductById.mockRejectedValue(error);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });
  });

  describe('getAllProducts', () => {
    it('debería obtener todos los productos sin filtros', async () => {
      const expectedProducts = {
        rows: [
          {
            id: 'prod-1',
            name: 'Producto 1',
            description: 'Descripción 1',
            category: 'Electrónica',
            sku: 'PROD1',
            price: 99.99,
          },
        ],
        count: 1,
      };

      mockRequest.query = {};
      mockProductUseCase.getProducts.mockResolvedValue(expectedProducts);

      await productController.getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ includeInventory: false }),
        expect.objectContaining({})
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedProducts);
    });

    it('debería obtener productos con filtros y paginación', async () => {
      const expectedProducts = {
        rows: [],
        count: 0,
      };

      mockRequest.query = {
        page: '1',
        limit: '10',
        category: 'Electrónica',
        minPrice: '100',
        maxPrice: '500',
        minStock: '5',
        includeInventory: 'true',
        storeId: 'store-123',
      };

      mockProductUseCase.getProducts.mockResolvedValue(expectedProducts);

      await productController.getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.getProducts).toHaveBeenCalledWith(
        {
          category: 'Electrónica',
          minPrice: 100,
          maxPrice: 500,
          minStock: 5,
          includeInventory: true,
          storeId: 'store-123',
        },
        {
          limit: 10,
          offset: 0,
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('debería manejar AppError al obtener productos', async () => {
      const error = new AppError(
        'DatabaseError',
        'Error al obtener productos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );

      mockRequest.query = {};
      mockProductUseCase.getProducts.mockRejectedValue(error);

      await productController.getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto exitosamente', async () => {
      const productId = 'prod-123';

      mockRequest.params = { id: productId };
      mockProductUseCase.deleteProduct.mockResolvedValue(true);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductUseCase.deleteProduct).toHaveBeenCalledWith(productId);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('debería retornar 404 cuando no se encuentra el producto', async () => {
      const productId = 'prod-999';

      mockRequest.params = { id: productId };
      mockProductUseCase.deleteProduct.mockResolvedValue(false);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product not found',
      });
    });

    it('debería manejar AppError al eliminar un producto', async () => {
      const productId = 'prod-123';
      const error = new ProductNotFoundError(productId);

      mockRequest.params = { id: productId };
      mockProductUseCase.deleteProduct.mockRejectedValue(error);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith(error.toJSON());
    });
  });
});
