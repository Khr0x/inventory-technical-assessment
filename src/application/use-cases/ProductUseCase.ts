import { CreateProductDTO, UpdateProductDTO } from "../../domain/product/dto/ProductDTO";
import { Pagination, ProductFilter } from "../../domain/product/ports/ProductRepositoryPort";
import { Product } from "../../domain/product/Product";
import { ProductPagination } from "../../domain/product/ProductPagination";
import { DuplicateProductError, StoreNotFoundError } from "../../errors";
import { sequelize } from "../../infraestructure/db/sequalize";
import { InventoryRepository } from "../../infraestructure/repositories/InventoryRepository";
import { ProductRepository } from "../../infraestructure/repositories/ProductRepository";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";

export class ProductUseCase {

 constructor(
  private productRepository: ProductRepository,
  private inventoryRepository: InventoryRepository,
  private storeRepository: StoreRepository
) {}
  

/**   Funcion para crear un nuevo producto
   * @param product Datos del producto a crear
   * @returns Producto creado
   */
 async createProduct(product: CreateProductDTO): Promise<Product> {
    const tx = await sequelize.transaction();
    try {
      const store = await this.storeRepository.findById(product.inventory.storeId);
        if (!store) {
            throw new StoreNotFoundError(product.inventory.storeId);
        }
        const skuExists = await this.productRepository.findBySku(product.sku);
        if (skuExists) {
            throw new DuplicateProductError(product.sku);
        }
        const raw = await this.productRepository.create(product, tx);
        const inventoryData = product.inventory;
        await this.inventoryRepository.create(
            {
                productId: raw.id,
                storeId: inventoryData.storeId,
                quantity: inventoryData.quantity,
                minStock: inventoryData.minStock,
            },
            tx
        );
        await tx.commit();
        return raw;
    } catch (error) {
        await tx.rollback();
        throw error;
    }
  }

  /**   Funcion para actualizar un producto existente
   * @param id ID del producto a actualizar
   * @param data Datos para actualizar el producto
   * @returns Producto actualizado o null si no existe
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product | null> {
    const tx = await sequelize.transaction();
    try {
        const raw = await this.productRepository.update(id, data, tx);
        if (!raw) {
            await tx.rollback();
            return null;
        }
        await tx.commit();
        return raw;
    } catch (error) {
        await tx.rollback();
        throw error;
    }
  }

  /**   Funcion para obtener un producto por su ID
   * @param id ID del producto a obtener
   * @returns Producto encontrado o null si no existe
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
        const result = await this.productRepository.findById(id);
        return result;
    } catch (error) {
        throw error;
    }
  }


  /**   Funcion para obtener una lista de productos con filtros y paginacion
   * @param filter Filtros para la busqueda de productos
   * @param pagination Parametros de paginacion
   * @returns Objeto con la lista de productos y el conteo total
   */
  async getProducts(filter?: ProductFilter, pagination?: Pagination): Promise<ProductPagination> {
    try {
        const result = await this.productRepository.findAll(filter, pagination);
        return result;
    } catch (error) {
        throw error;
    }
  }

  /**   Funcion para eliminar un producto por su ID
   * @param id ID del producto a eliminar
   * @returns Booleano que indica si la eliminacion fue exitosa
   */
  async deleteProduct(id: string): Promise<boolean> {
    const tx = await sequelize.transaction();
   try {
        const result = await this.productRepository.delete(id, tx);
        await tx.commit();
        return result;
   } catch (error) {
        await tx.rollback();
        throw error;
   }
  }

  /**
   * Funcion para obtener los movimientos de inventario de un producto
   * @param productId ID del producto para obtener sus movimientos
   * @returns Lista de movimientos de inventario del producto
   */
  async getProductMovements(productId: string): Promise<any[]> {
    try {
        const movements = await this.productRepository.getProductMovements(productId);
        return movements;
    } catch (error) {
        throw error;
    }
  }
}