import { StoreUseCase } from '../../../application/use-cases/StoreUseCase';
import { StoreRepository } from '../../../infraestructure/repositories/StoreRepository';
import { CreateStoreDTO } from '../../../domain/store/dto/StoreDTO';
import { sequelize } from '../../../infraestructure/db/sequalize';

jest.mock('../../../infraestructure/db/sequalize', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock('../../../infraestructure/repositories/StoreRepository');

describe('StoreUseCase', () => {
  let storeUseCase: StoreUseCase;
  let mockStoreRepository: jest.Mocked<StoreRepository>;
  let mockTransaction: any;

  beforeEach(() => {
    mockStoreRepository = new StoreRepository() as jest.Mocked<StoreRepository>;

    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    storeUseCase = new StoreUseCase(mockStoreRepository);

    jest.clearAllMocks();
  });

  describe('createStore', () => {
    const mockCreateStoreDTO: CreateStoreDTO = {
      name: 'Tienda Principal',
      location: 'Centro Comercial',
    };

    const mockStore = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Tienda Principal',
      location: 'Centro Comercial',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería crear una tienda exitosamente', async () => {
      mockStoreRepository.create.mockResolvedValue(mockStore as any);

      const result = await storeUseCase.createStore(mockCreateStoreDTO);

      expect(mockStoreRepository.create).toHaveBeenCalledWith(mockCreateStoreDTO, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toEqual(mockStore);
    });

    it('debería crear una tienda con ubicación específica', async () => {
      const storeDTO: CreateStoreDTO = {
        name: 'Tienda Norte',
        location: 'Zona Norte, Local 123',
      };

      const store = {
        ...mockStore,
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Tienda Norte',
        location: 'Zona Norte, Local 123',
      };

      mockStoreRepository.create.mockResolvedValue(store as any);

      const result = await storeUseCase.createStore(storeDTO);

      expect(mockStoreRepository.create).toHaveBeenCalledWith(storeDTO, mockTransaction);
      expect(result.name).toBe('Tienda Norte');
      expect(result.location).toBe('Zona Norte, Local 123');
    });

    it('debería hacer rollback cuando falla la creación', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.create.mockRejectedValue(error);

      await expect(storeUseCase.createStore(mockCreateStoreDTO)).rejects.toThrow(error);

      expect(mockStoreRepository.create).toHaveBeenCalledWith(mockCreateStoreDTO, mockTransaction);
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('debería manejar errores de validación', async () => {
      const validationError = new Error('Datos de tienda inválidos');
      mockStoreRepository.create.mockRejectedValue(validationError);

      await expect(storeUseCase.createStore(mockCreateStoreDTO)).rejects.toThrow(
        'Datos de tienda inválidos'
      );

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getStoreById', () => {
    const storeId = '550e8400-e29b-41d4-a716-446655440001';
    const mockStore = {
      id: storeId,
      name: 'Tienda Principal',
      location: 'Centro Comercial',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería obtener una tienda por ID exitosamente', async () => {
      mockStoreRepository.findById.mockResolvedValue(mockStore as any);

      const result = await storeUseCase.getStoreById(storeId);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockStore);
    });

    it('debería retornar null cuando la tienda no existe', async () => {
      mockStoreRepository.findById.mockResolvedValue(null);

      const result = await storeUseCase.getStoreById(storeId);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(storeId);
      expect(result).toBeNull();
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.findById.mockRejectedValue(error);

      await expect(storeUseCase.getStoreById(storeId)).rejects.toThrow(error);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(storeId);
    });

    it('debería obtener una tienda con ID diferente', async () => {
      const differentStoreId = '550e8400-e29b-41d4-a716-446655440002';
      const differentStore = {
        ...mockStore,
        id: differentStoreId,
        name: 'Tienda Secundaria',
      };

      mockStoreRepository.findById.mockResolvedValue(differentStore as any);

      const result = await storeUseCase.getStoreById(differentStoreId);

      expect(mockStoreRepository.findById).toHaveBeenCalledWith(differentStoreId);
      expect(result?.id).toBe(differentStoreId);
      expect(result?.name).toBe('Tienda Secundaria');
    });
  });

  describe('getAllStores', () => {
    const mockStores = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Principal',
        location: 'Centro',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Tienda Norte',
        location: 'Zona Norte',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Tienda Sur',
        location: 'Zona Sur',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener todas las tiendas exitosamente', async () => {
      mockStoreRepository.findAll.mockResolvedValue(mockStores as any);

      const result = await storeUseCase.getAllStores();

      expect(mockStoreRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockStores);
      expect(result).toHaveLength(3);
    });

    it('debería retornar un array vacío cuando no hay tiendas', async () => {
      mockStoreRepository.findAll.mockResolvedValue([]);

      const result = await storeUseCase.getAllStores();

      expect(mockStoreRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error en la base de datos');
      mockStoreRepository.findAll.mockRejectedValue(error);

      await expect(storeUseCase.getAllStores()).rejects.toThrow(error);

      expect(mockStoreRepository.findAll).toHaveBeenCalled();
    });

    it('debería obtener múltiples tiendas con diferentes ubicaciones', async () => {
      mockStoreRepository.findAll.mockResolvedValue(mockStores as any);

      const result = await storeUseCase.getAllStores();

      expect(result[0].location).toBe('Centro');
      expect(result[1].location).toBe('Zona Norte');
      expect(result[2].location).toBe('Zona Sur');
    });
  });
});
