import { Router } from "express";
import { getCustomer, getCustomers, registerCustomer, updateCustomer } from "../controllers/customersController.js";
import validateCustomerSchemaMiddleware from "../middlewares/validateCustomerSchemaMiddleware.js";
import validateNewCustomerSchemaMiddleware from "../middlewares/validateNewCustomerSchemaMiddleware.js";

const customersRouter = Router();

customersRouter.post('/customers', validateCustomerSchemaMiddleware, registerCustomer);
customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomer);
customersRouter.put('/customers/:id', validateNewCustomerSchemaMiddleware, updateCustomer);

export default customersRouter;