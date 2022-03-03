import categorySchema from "../schemas/categorySchema.js";

export default function validateCategorySchemaMiddleware(req, res, next) {
  const validate = categorySchema.validate(req.body, { abortEarly: true });
  if(validate.error){
    res.sendStatus(422);
    return;
  }

  next();
}