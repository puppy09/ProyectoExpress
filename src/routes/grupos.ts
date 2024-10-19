import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { postGrupos } from "../controllers/grupos";

const router = Router();

router.post('/', checkJwt, postGrupos);

export{router};