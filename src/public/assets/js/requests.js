const requests = {
  post: function (url, body) {
    let resObj = {};
    return fetch(url, {
      method: "POST",
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
  },
};
