import { Router } from "express";
import { deleteRental, getRentals, metricsRentals, registerRental, returnRental } from "../controllers/rentalsController.js";
import validateRentalsSchemaMiddleware from "../middlewares/validateRentalsSchemaMiddleware.js";

const rentalsRouter = Router();

rentalsRouter.post('/rentals', validateRentalsSchemaMiddleware, registerRental);
rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals/:id/return', returnRental);
rentalsRouter.delete('/rentals/:id', deleteRental);
rentalsRouter.get('/rentals/metrics', metricsRentals);

export default rentalsRouter;