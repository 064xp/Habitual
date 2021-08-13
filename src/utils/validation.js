const Joi = require("joi");

module.exports.validateUser = user => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .required(),
    email: Joi.string()
      .min(5)
      .required()
      .email(),
    password: Joi.string()
      .min(6)
      .max(35)
      .required(),
    repeat_password: Joi.ref("password")
  });

  return schema.validate(user);
};

module.exports.validateHabit = habit => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(200)
      .required(),
    frequency: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(0)
          .max(6)
      )
      .required(),
    reminder: Joi.array()
      .items(Joi.number().integer())
      .length(2)
      .allow(null),
    type: Joi.number()
      .integer()
      .required(),
    startDate: Joi.date()
  });

  return schema.validate(habit);
};
