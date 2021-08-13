module.exports.generateCode = (digits = 4) => {
  let code = "";

  for (let i = 0; i < digits; i++) {
    let num = Math.floor(Math.random() * 10);
    code += num.toString();
  }

  return code;
};
