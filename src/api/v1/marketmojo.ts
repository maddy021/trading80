import { Router } from "express";
import {marketMojo} from "../../controller/marketmojo.js"
const routes=Router();

routes.post("/login",marketMojo.login);
routes.get("/turnaround",marketMojo.getTurnarounds);

export default routes;