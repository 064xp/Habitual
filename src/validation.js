const Joi = require("joi");

module.exports.validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(5).required().email(),
    password: Joi.string().min(6).required(),
    repeat_password: Joi.ref("password"),
  });

  return schema.validate(user);
};
