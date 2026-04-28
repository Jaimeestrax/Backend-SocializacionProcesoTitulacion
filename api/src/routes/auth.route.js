import express from "express";
import AuthController from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);

export default authRouter;