import joi from "joi";

const newCustomerSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().pattern(/^[0-9]{10,11}$/).required(),
  cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
  birthday: joi.string().min(10).max(24).required()
});

export default newCustomerSchema;