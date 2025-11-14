import { StoreMapper } from '../../../infraestructure/mappers/StoreMapper';
import { StoreModel } from '../../../infraestructure/db/models/StoreModel';

describe('StoreMapper', () => {
  describe('mapModelToEntity', () => {
    it('debería mapear un StoreModel a Store correctamente', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Principal',
        location: 'Centro Comercial Plaza',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Principal',
        location: 'Centro Comercial Plaza',
        createdAt: mockStoreModel.createdAt,
        updatedAt: mockStoreModel.updatedAt,
      });
    });

    it('debería manejar location null convirtiéndolo a string vacío', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Sin Ubicación',
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.location).toBe('');
    });

    it('debería manejar location undefined convirtiéndolo a string vacío', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Sin Ubicación',
        location: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.location).toBe('');
    });

    it('debería preservar las fechas createdAt y updatedAt', () => {
      const createdDate = new Date('2024-01-10T08:30:00Z');
      const updatedDate = new Date('2024-01-20T15:45:00Z');

      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Norte',
        location: 'Zona Norte, Local 45',
        createdAt: createdDate,
        updatedAt: updatedDate,
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.createdAt).toBe(createdDate);
      expect(result.updatedAt).toBe(updatedDate);
    });

    it('debería mapear todos los campos obligatorios', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Sur',
        location: 'Zona Sur',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('debería mapear tienda con ubicación larga', () => {
      const longLocation = 'Avenida Principal 123, Torre Empresarial, Piso 5, Local 502, Ciudad Capital';
      
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Corporativa',
        location: longLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.location).toBe(longLocation);
      expect(result.location.length).toBeGreaterThan(0);
    });

    it('debería mapear tienda con nombre largo', () => {
      const longName = 'Tienda de Electrodomésticos y Tecnología Avanzada Internacional';
      
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: longName,
        location: 'Centro',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.name).toBe(longName);
    });

    it('debería mapear múltiples tiendas correctamente', () => {
      const stores = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Tienda 1',
          location: 'Ubicación 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Tienda 2',
          location: 'Ubicación 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = stores.map((store) => StoreMapper.mapModelToEntity(store as any));

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Tienda 1');
      expect(results[1].name).toBe('Tienda 2');
    });

    it('debería manejar location con espacios en blanco', () => {
      const mockStoreModel = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Tienda Centro',
        location: '   ',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.location).toBe('   ');
    });

    it('debería preservar el ID exacto sin modificaciones', () => {
      const specificId = '550e8400-e29b-41d4-a716-446655440999';
      
      const mockStoreModel = {
        id: specificId,
        name: 'Tienda Test',
        location: 'Test Location',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const result = StoreMapper.mapModelToEntity(mockStoreModel);

      expect(result.id).toBe(specificId);
    });
  });
});
