import { getAll } from "../controllers/main";
import { checkJwt } from "../middleware/session";
import {Router} from "express";

const router = Router();
router.get("/", checkJwt, getAll);

export{router};