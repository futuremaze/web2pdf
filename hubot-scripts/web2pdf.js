req = require('request')

module.exports = function (robot) {
  robot.respond(/(https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+).*/i, function(msg) {
    var headers, options, url;
    url = msg.match[1];
    msg.send(`${url} をPDFにしてやろう、ちょっと待っておれ`);
    headers = {
      'Content-Type': 'application/json'
    };
    options = {
      url: 'http://web2pdf:8080/web2pdf',
      method: 'POST',
      headers: headers,
      json: {
        'url': `${url}`
      }
    };
    return req(options, function(err, res, body) {
      if (err) {
        throw err;
      }
      if (res.statusCode === 200) {
        return msg.send("保存したぞ");
      } else {
        return msg.send("取得に失敗したようだ、すまん");
      }
    });
  });
}
