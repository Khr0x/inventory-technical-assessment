import { Router } from "express";
import { StoreController } from "../controllers/StoreController";
import { StoreRoutes } from "../../enums/StoreRoutes";
import { validateSchema } from "../../middlewares/validate.middleware";
import { createStoreSchema, storeIdParamSchema } from "../../schemas/store.schema";

const router = Router();
const controller = new StoreController();

router.post(StoreRoutes.BASE, validateSchema(createStoreSchema), (req, res) => controller.createStore(req, res));

router.get(StoreRoutes.ID, (req, res) => controller.getStoreById(req, res));

router.get(StoreRoutes.ALL, (req, res) => controller.getAllStores(req, res));

export default router;