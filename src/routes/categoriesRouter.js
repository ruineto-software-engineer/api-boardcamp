import { Router } from "express";
import { getCategories, registerCategory } from "../controllers/categoriesController.js";
import validadeCategorySchemaMiddleware from "../middlewares/validateCategorySchemaMiddleware.js";

const categoriesRouter = Router();

categoriesRouter.post('/categories', validadeCategorySchemaMiddleware, registerCategory);
categoriesRouter.get('/categories', getCategories);

export default categoriesRouter;