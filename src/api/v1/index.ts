import { Router } from "express";
import agentRoutes from "./agent.js"
import marketMojoRoutes from "./marketmojo.js";
const routes=Router();

routes.use("/trading80",agentRoutes);
routes.use("/marketMojo",marketMojoRoutes)

export default routes;