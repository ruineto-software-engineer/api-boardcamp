import newCustomerSchema from "../schemas/newCustomerSchema.js";

export default function validateNewCustomerSchemaMiddleware(req, res, next) {
  const validate = newCustomerSchema.validate(req.body, { abortEarly: true });
  if(validate.error){
    res.sendStatus(422);
    return;
  }

  next();
}