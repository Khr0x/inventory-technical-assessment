import { CreateProductDTO, UpdateProductDTO } from "../../domain/product/dto/ProductDTO";
import { Pagination, ProductFilter } from "../../domain/product/ports/ProductRepositoryPort";
import { HttpStatus } from "../../enums/HttpStatus";
import { AppError } from "../../errors";
import { InventoryRepository } from "../../infraestructure/repositories/InventoryRepository";
import { ProductRepository } from "../../infraestructure/repositories/ProductRepository";
import { StoreRepository } from "../../infraestructure/repositories/StoreRepository";
import { ProductUseCase } from "../use-cases/ProductUseCase";
import { Request, Response } from 'express';

export class ProductController {
  private productUseCase: ProductUseCase;

    constructor() {
        const productRepository = new ProductRepository();
        const inventoryRepository = new InventoryRepository();
        const storeRepository = new StoreRepository();
        this.productUseCase = new ProductUseCase(productRepository, inventoryRepository, storeRepository);
    }

    async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const productData = req.body as CreateProductDTO;
            const result = await this.productUseCase.createProduct(productData);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getInventoriesByStore:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const productData = req.body as UpdateProductDTO;
            const result = await this.productUseCase.updateProduct(id, productData);

            if (!result) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: 'Product not found',
                });
                return;
            }

            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in updateProduct:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const product = await this.productUseCase.getProductById(id);

            if (!product) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: 'Producto no encontrado',
                });
                return;
            }

            res.status(HttpStatus.OK).json(product);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getInventoriesByStore:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, category, minPrice, maxPrice, minStock, includeInventory, storeId } = req.query;
            const filters: ProductFilter = {
                category: category as string | undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                minStock: minStock ? Number(minStock) : undefined,
                includeInventory: includeInventory === 'true' ? true : false,
                storeId: storeId as string | undefined
            }
            const pagination: Pagination = {
                limit: limit ? Number(limit) : undefined,
                offset: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
            };
            const result = await this.productUseCase.getProducts(filters, pagination);
            res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getInventoriesByStore:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.productUseCase.deleteProduct(id);

            if (!result) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: 'Product not found',
                });
                return;
            }

            res.status(HttpStatus.OK).json({ success: true });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json(error.toJSON());
            } else {
                console.error('Unexpected error in getInventoriesByStore:', error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal server error',
                    message: 'Ha ocurrido un error interno del servidor'
                });
            }
        }
    }
}