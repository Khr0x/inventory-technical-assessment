import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { ProductRoutes } from "../../enums/ProductRoutes";
import { validateSchema } from "../../middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "../../schemas/product.schema";

const router = Router();

const controller = new ProductController();

router.post(ProductRoutes.BASE, validateSchema(createProductSchema), (req, res) => controller.createProduct(req, res));

router.get(ProductRoutes.ID, (req, res) => controller.getProductById(req, res));

router.get(ProductRoutes.ALL, (req, res) => controller.getAllProducts(req, res));

router.put(ProductRoutes.UPDATE, validateSchema(updateProductSchema), (req, res) => controller.updateProduct(req, res));

router.delete(ProductRoutes.DELETE, (req, res) => controller.deleteProduct(req, res));

router.get(ProductRoutes.MOVEMENTS, (req, res) => controller.getProductMovements(req, res));

export default router;