import {Router} from "express";
import userRoute from "./user.route";
import contractRoute from "./contract.route";

const appRouter: Router = Router();

appRouter.use("/users", userRoute);
appRouter.use("/contracts", contractRoute);

export default appRouter;
