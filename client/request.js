function request(url, data) {
  return new Promise(resolve => {
    var formdata = new FormData();
    for (var key in data) {
      formdata.append(key, data[key]);
    }
    fetch(url, {
      method: 'POST',
      body: formdata
    }).then(result => {
      resolve(result.json());
    })
  });
}
