const Joi = require("joi");

module.exports.validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(5).required().email(),
    password: Joi.string().min(6).max(35).required(),
    repeat_password: Joi.ref("password"),
  });

  return schema.validate(user);
};
