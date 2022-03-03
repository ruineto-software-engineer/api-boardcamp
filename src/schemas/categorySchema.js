import joi from "joi";

const categorySchema = joi.object({
  name: joi.string().required()
});

export default categorySchema;