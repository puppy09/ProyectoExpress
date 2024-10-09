import { Request, Response, Router } from "express";
import { loginCtrl, registerCtrl } from "../controllers/auth";

const router = Router();
router.post("/login", loginCtrl);
router.post("/register", registerCtrl);

export {router};
