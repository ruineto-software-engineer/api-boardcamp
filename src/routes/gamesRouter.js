import { Router } from "express";
import { getGames, registerGame } from "../controllers/gamesController.js";
import validateGameSchemaMiddleware from "../middlewares/validateGameSchemaMiddleware.js";

const gamesRouter = Router();

gamesRouter.post('/games', validateGameSchemaMiddleware, registerGame);
gamesRouter.get('/games', getGames);

export default gamesRouter;