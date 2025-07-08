import {Router} from "express";
import AuthController from "../controllers/auth.controller";

const authRoute: Router = Router();
const controller = new AuthController()

authRoute.post("/login", controller.login);
authRoute.post("/register", controller.register);

export default authRoute;


