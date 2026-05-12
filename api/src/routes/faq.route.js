import express from 'express';
import FaqController from '../controllers/faq.controller.js';
import { ensureAuth } from '../middlewares/auth.js';

const faqRouter = express.Router();

export default faqRouter;