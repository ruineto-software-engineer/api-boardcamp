import gameSchema from "../schemas/gameSchema.js";

export default function validateGameSchemaMiddleware(req, res, next) {
  const validate = gameSchema.validate(req.body, { abortEarly: true });
  if(validate.error){
    res.sendStatus(422);
    return;
  }

  next();
}