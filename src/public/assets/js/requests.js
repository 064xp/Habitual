const requests = {
  post: function (url, body = {}, headers = {}) {
    return makeRequest(url, "POST", body, headers);
  },
  get: function (url, headers = {}) {
    return makeRequest(url, "GET", headers);
  },
  put: function (url, body = {}, headers = {}) {
    return makeRequest(url, "PUT", body, headers);
  },
  resHandlers: {},
  customHeaders: {},
};

function makeRequest(url, method, body, headers) {
  let resObj = {};
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      ...requests.customHeaders,
    },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      resObj.status = res.status;
      resObj.ok = res.ok;

      if (res.status == 401 && typeof requests.resHandlers.on401 == "function")
        requests.resHandlers.on401();

      return res.json();
    })
    .then(function (json) {
      resObj.body = json;
      return resObj;
    });
}
