const fetch = require("node-fetch");

module.exports = () => {
  let current = new Date();
  let cTime = current.getHours() + ":" + current.getMinutes();
  fetch("https://habitual-tracker.herokuapp.com/").then((res) => {
    if (res.ok) console.log(`Dyno Wake [${cTime}]`);
  });
};
