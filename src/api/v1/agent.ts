import { Router } from "express";
import {Agent} from "../../controller/agent.js"
const routes=Router();

routes.post("/login",Agent.login);
routes.get("/calls",Agent.fetch);
routes.post("/syncCalls",Agent.syncCalls)

export default routes;