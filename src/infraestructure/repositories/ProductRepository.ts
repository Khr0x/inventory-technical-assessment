import { Op } from "sequelize";
import { CreateProductDTO, UpdateProductDTO } from "../../domain/product/dto/ProductDTO";
import { Pagination, ProductFilter, ProductRepositoryPort } from "../../domain/product/ports/ProductRepositoryPort";
import { Product } from "../../domain/product/Product";
import { ProductModel } from "../db/models/ProductModel";
import { ProductMapper } from "../mappers/ProductMapper";
import { ProductPagination } from "../../domain/product/ProductPagination";
import { InventoryModel } from "../db/models/InventoryModel";
import { DuplicateProductError, ProductNotFoundError } from "../../errors";
import { InactiveProductError } from "../../errors/ProductErrors";

export class ProductRepository implements ProductRepositoryPort {
    

    /**
     * Funcion para crear un producto
     * @param data Datos del producto a crear
     * @param tx Transaccion opcional
     * @returns Producto creado
     */
    async create(data: CreateProductDTO, tx?: any): Promise<Product> {
        try {
            const raw = await ProductModel.create(
                {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    price: data.price,
                    sku: data.sku,
                } as any,
                { transaction: tx }
            );
            return ProductMapper.mapModelToEntity(raw);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para actualizar un producto
     * @param id ID del producto a actualizar
     * @param data Datos para actualizar el producto
     * @param tx Transaccion opcional
     * @returns Producto actualizado o null si no existe
     */
    async update(id: string, data: UpdateProductDTO, tx?: any): Promise<Product | null> {
        try {
            const raw = await ProductModel.findByPk(id);
            if (!raw) {
                throw new ProductNotFoundError(id);
            }

            if (data.sku && data.sku !== raw.sku) {
                const existsInOther = await this.skuExistsInOtherProduct(data.sku, id);
                if (existsInOther) {
                    throw new DuplicateProductError(data.sku);
                }
            }

            if(raw.active === false) {
                throw new InactiveProductError(id);
            }

            await raw.update(
                {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    price: data.price,
                    sku: data.sku,
                } as any,
                { transaction: tx }
            );
            return ProductMapper.mapModelToEntity(raw);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para buscar productos con filtros y paginación
     * @param filter Filtros para la búsqueda de productos
     * @param pagination Opciones de paginación
     * @returns Resultado paginado de productos
     */
    async findAll(filter?: ProductFilter, pagination?: Pagination): Promise<ProductPagination> {
        try {
            const whereClause: any = {};

            if (filter) {
                if (filter.category) {
                    whereClause.category = filter.category;
                }
                if (filter.minPrice !== undefined) {
                    whereClause.price = { ...whereClause.price, [Op.gte]: filter.minPrice };
                }
                if (filter.maxPrice !== undefined) {
                    whereClause.price = { ...whereClause.price, [Op.lte]: filter.maxPrice };
                }
            }

            const include = this.buildInventoryInclude(filter);

            const { rows, count } = await ProductModel.findAndCountAll({
                where: {...whereClause, active: true },
                include: include,
                limit: pagination?.limit,
                offset: pagination?.offset,
                distinct: true,
            });

            return {
                rows: rows.map(row => {
                    const product = ProductMapper.mapModelToEntity(row);
                    if(filter?.includeInventory && row.inventories) {
                        return {
                            ...product,
                            inventories: row.inventories.map(inv => ({
                               id: inv.id,
                               storeId: inv.storeId,
                               quantity: inv.quantity,
                               minStock: inv.minStock,
                               isLowStock: inv.quantity <= inv.minStock
                            })),
                            totalStock: row.inventories.reduce((sum, inv) => sum + inv.quantity, 0)
                        }
                    }
                    return product;
                }),
                count,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para buscar un producto por su ID
     * @param id ID del producto a buscar
     * @returns Producto encontrado o null si no existe
     */
    async findById(id: string): Promise<Product | null> {
        try {
            const raw = await ProductModel.findByPk(id);
            if(!raw) {
                throw new ProductNotFoundError(id);
            }
            return ProductMapper.mapModelToEntityFind(raw);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para eliminar (desactivar) un producto
     * @param id ID del producto a eliminar
     * @param tx Transaccion opcional
     * @returns Booleano indicando si se elimino el producto
     */
    async delete(id: string, tx?: any): Promise<boolean> {
        try {
            const raw = await ProductModel.findByPk(id);
            if(!raw) {
                throw new ProductNotFoundError(id);
            }
            await raw.update({ active: false } as any, { transaction: tx });
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verifica si un SKU ya existe en otro producto (excluyendo el ID dado)
     * @param sku SKU a verificar
     * @param excludeId ID del producto actual a excluir de la búsqueda
     * @returns true si el SKU existe en OTRO producto, false si no existe o es del mismo producto
     */
    private async skuExistsInOtherProduct(sku: string, excludeId: string): Promise<boolean> {
        try {
            const count = await ProductModel.count({
                where: {
                    sku: sku,
                    id: { [Op.ne]: excludeId }
                }
            });
            return count > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Funcion para construir el include de inventario basado en el filtro
     * @param filter Filtro de productos
     * @returns Array de includes para Sequelize
     */
    private buildInventoryInclude(filter?: ProductFilter): any[] {
        if (!filter?.includeInventory && !filter?.minStock) return [];

        const inventoryWhere: any = {};
        if (filter.minStock !== undefined) {
            inventoryWhere.quantity = { [Op.gte]: filter.minStock };
        }
        if (filter.storeId) {
            inventoryWhere.storeId = filter.storeId;
        }

        const filterWhere = [{
            model: InventoryModel,
            as: 'inventories',
            attributes: filter.includeInventory ? ['id', 'quantity', 'minStock', 'storeId'] : [],
            ...(Object.keys(inventoryWhere).length > 0 && { where: inventoryWhere }),
            required: filter.minStock !== undefined
        }];
        return filterWhere;
    }

    /**
     * Funcion para buscar un producto por su SKU
     * @param sku SKU del producto a buscar
     * @returns Producto encontrado o null si no existe
     */
    async findBySku(sku: string): Promise<Product | null> {
        try {
            const raw = await ProductModel.findOne({ where: { sku } });
            return ProductMapper.mapModelToEntityFind(raw);
        } catch (error) {
            throw error;
        }
    }

 
}