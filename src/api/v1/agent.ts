import { Router } from "express";
import {Agent} from "../../controller/agent.js"
const routes=Router();

routes.get("/calls",Agent.fetch);
routes.post("/syncCalls",Agent.syncCalls);
routes.post("/upsertHoldings",Agent.upsertFromHoldings);

export default routes;