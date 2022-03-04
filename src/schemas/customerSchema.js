import joi from "joi";

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().pattern(/^[0-9]{10,11}$/).required(),
  cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
  birthday: joi.string().pattern(/^\d{4}\-\d{2}\-\d{2}$/).required()
});

export default customerSchema;