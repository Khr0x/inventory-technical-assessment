import { Router } from "express";
import { InventoryController } from "../controllers/InventoryController";
import { InventoryRoutes } from "../../enums/InventoryRoutes";

const router = Router();
const controller = new InventoryController();

router.get(InventoryRoutes.FIND_INVENTORY, (req, res) => controller.getInventoriesByStore(req, res));

router.post(InventoryRoutes.TRANSFER, (req, res) => controller.transferInventory (req, res));

router.get(InventoryRoutes.ALERTS, (req, res) => controller.getLowStockInventories(req, res));

export default router;