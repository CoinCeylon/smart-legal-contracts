import { Router } from "express";
import ContractController from "../controllers/contract.controller";
import multer from "multer";

const contractRoute: Router = Router();
const controller = new ContractController();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } //10 MB limit
});

contractRoute.post("/verify-user", controller.verifyUser);
contractRoute.post("/", upload.single('document'), controller.create.bind(controller));
contractRoute.get("/users", controller.getByUserId);
contractRoute.get("/:id", controller.getById);
contractRoute.get("/:id/document", controller.getDocumentById);
contractRoute.put("/:id/sign", controller.sign);
contractRoute.delete("/:id", controller.delete);

export default contractRoute;
