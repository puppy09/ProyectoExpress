import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { changePsw } from "../controllers/profile";
const router = Router();

router.put('/cambiarPsw', checkJwt, changePsw);

export{router};