import { Router } from "express";
import { getCustomer, getCustomers, registerCustomer, updateCustomer } from "../controllers/customersController.js";
import validateCustomerSchemaMiddleware from "../middlewares/validateCustomerSchemaMiddleware.js";

const customersRouter = Router();

customersRouter.post('/customers', validateCustomerSchemaMiddleware, registerCustomer);
customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomer);
customersRouter.put('/customers/:id', validateCustomerSchemaMiddleware, updateCustomer);

export default customersRouter;