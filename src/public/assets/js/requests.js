const requests = {
  post: function (url, body = {}) {
    return makeRequest(url, "POST", body);
  },
  get: function (url) {
    return makeRequest(url, "GET");
  },
};

function makeRequest(url, method, body) {
  let resObj = {};
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      resObj.status = res.status;
      resObj.ok = res.ok;
      return res.json();
    })
    .then(function (json) {
      resObj.body = json;
      return resObj;
    });
}
