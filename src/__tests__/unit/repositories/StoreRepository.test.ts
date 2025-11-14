import { StoreRepository } from '../../../infraestructure/repositories/StoreRepository';
import { StoreModel } from '../../../infraestructure/db/models/StoreModel';
import { StoreMapper } from '../../../infraestructure/mappers/StoreMapper';

jest.mock('../../../infraestructure/db/models/StoreModel');
jest.mock('../../../infraestructure/mappers/StoreMapper');

describe('StoreRepository', () => {
  let storeRepository: StoreRepository;
  let mockTransaction: any;

  beforeEach(() => {
    storeRepository = new StoreRepository();
    mockTransaction = {};
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una tienda exitosamente', async () => {
      const storeData = {
        name: 'Tienda Central',
        location: 'Calle Principal 123',
      };

      const mockStoreModel = {
        id: 'store-123',
        name: storeData.name,
        location: storeData.location,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const expectedStore = {
        id: 'store-123',
        name: storeData.name,
        location: storeData.location,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (StoreModel.create as jest.Mock).mockResolvedValue(mockStoreModel);
      (StoreMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedStore);

      const result = await storeRepository.create(storeData, mockTransaction);

      expect(StoreModel.create).toHaveBeenCalledWith(
        {
          name: storeData.name,
          location: storeData.location,
        },
        { transaction: mockTransaction }
      );
      expect(StoreMapper.mapModelToEntity).toHaveBeenCalledWith(mockStoreModel);
      expect(result).toEqual(expectedStore);
    });

    it('debería lanzar un error si falla la creación', async () => {
      const storeData = {
        name: 'Tienda Central',
        location: 'Calle Principal 123',
      };

      const error = new Error('Error de base de datos');
      (StoreModel.create as jest.Mock).mockRejectedValue(error);

      await expect(storeRepository.create(storeData)).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('debería encontrar una tienda por ID', async () => {
      const storeId = 'store-123';
      const mockStore = {
        id: storeId,
        name: 'Tienda Central',
        location: 'Calle Principal 123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const expectedStore = {
        id: storeId,
        name: 'Tienda Central',
        location: 'Calle Principal 123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (StoreModel.findByPk as jest.Mock).mockResolvedValue(mockStore);
      (StoreMapper.mapModelToEntity as jest.Mock).mockReturnValue(expectedStore);

      const result = await storeRepository.findById(storeId);

      expect(StoreModel.findByPk).toHaveBeenCalledWith(storeId);
      expect(StoreMapper.mapModelToEntity).toHaveBeenCalledWith(mockStore);
      expect(result).toEqual(expectedStore);
    });

    it('debería retornar null cuando no existe la tienda', async () => {
      const storeId = 'store-999';

      (StoreModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await storeRepository.findById(storeId);

      expect(StoreModel.findByPk).toHaveBeenCalledWith(storeId);
      expect(result).toBeNull();
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const storeId = 'store-123';
      const error = new Error('Error de base de datos');

      (StoreModel.findByPk as jest.Mock).mockRejectedValue(error);

      await expect(storeRepository.findById(storeId)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('debería obtener todas las tiendas', async () => {
      const mockStores = [
        {
          id: 'store-1',
          name: 'Tienda 1',
          location: 'Ubicación 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'store-2',
          name: 'Tienda 2',
          location: 'Ubicación 2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      const expectedStores = [
        {
          id: 'store-1',
          name: 'Tienda 1',
          location: 'Ubicación 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'store-2',
          name: 'Tienda 2',
          location: 'Ubicación 2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      (StoreModel.findAll as jest.Mock).mockResolvedValue(mockStores);
      (StoreMapper.mapModelToEntity as jest.Mock)
        .mockReturnValueOnce(expectedStores[0])
        .mockReturnValueOnce(expectedStores[1]);

      const result = await storeRepository.findAll();

      expect(StoreModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedStores);
      expect(result).toHaveLength(2);
    });

    it('debería retornar un array vacío cuando no hay tiendas', async () => {
      (StoreModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await storeRepository.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debería lanzar un error si falla la búsqueda', async () => {
      const error = new Error('Error de base de datos');

      (StoreModel.findAll as jest.Mock).mockRejectedValue(error);

      await expect(storeRepository.findAll()).rejects.toThrow(error);
    });
  });

  describe('existsAll', () => {
    it('debería retornar true cuando todas las tiendas existen', async () => {
      const storeIds = ['store-1', 'store-2', 'store-3'];

      (StoreModel.count as jest.Mock).mockResolvedValue(3);

      const result = await storeRepository.existsAll(storeIds);

      expect(StoreModel.count).toHaveBeenCalledWith({
        where: {
          id: storeIds,
        },
      });
      expect(result).toBe(true);
    });

    it('debería retornar false cuando faltan tiendas', async () => {
      const storeIds = ['store-1', 'store-2', 'store-3'];

      (StoreModel.count as jest.Mock).mockResolvedValue(2);

      const result = await storeRepository.existsAll(storeIds);

      expect(result).toBe(false);
    });

    it('debería retornar true cuando la lista está vacía', async () => {
      const storeIds: string[] = [];

      const result = await storeRepository.existsAll(storeIds);

      expect(StoreModel.count).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('debería lanzar un error si falla la verificación', async () => {
      const storeIds = ['store-1', 'store-2'];
      const error = new Error('Error de base de datos');

      (StoreModel.count as jest.Mock).mockRejectedValue(error);

      await expect(storeRepository.existsAll(storeIds)).rejects.toThrow(error);
    });
  });
});
