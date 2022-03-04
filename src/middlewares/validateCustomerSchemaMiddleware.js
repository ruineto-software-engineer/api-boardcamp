import customerSchema from "../schemas/customerSchema.js";

export default function validateCustomerSchemaMiddleware(req, res, next) {
  const validate = customerSchema.validate(req.body, { abortEarly: true });
  if(validate.error){
    res.sendStatus(422);
    return;
  }

  next();
}