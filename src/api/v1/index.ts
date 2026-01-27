import { Router } from "express";
import agentRoutes from "./agent.js"
const routes=Router();

routes.use("/trading80",agentRoutes);

export default routes;