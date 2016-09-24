// http服务模块
var http = require("http");
// 如何来进行请求的“路由”
// 需要的所有数据都会包含在request对象中，
// 该对象作为onRequest()回调函数的第一个参数传递。
// 但是为了解析这些数据，我们需要额外的Node.JS模块，
// 它们分别是url和querystring模块。
var url = require("url");

/*
                               url.parse(string).query
                                           |
           url.parse(string).pathname      |
                       |                   |
                       |                   |
                     ------ -------------------
http://localhost:8888/start?foo=bar&hello=world
                                ---       -----
                                 |          |
                                 |          |
              querystring(string)["foo"]    |
                                            |
                         querystring(string)["hello"]
 */

// 改进参数传递，以消除臃肿，改良自身
function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    /*
    在start()函数里添加了handle参数，
    并且把handle对象作为第一个参数传递给了route()回调函数
     */
    // var content = route(handle, pathname);

    // 改进：解决非阻塞（同步）问题
    route(handle, pathname, response);

    // 将onRequest()处理程序中所有有关response的函数调都移除，
    // 因为我们希望这部分工作让route()函数来完成
    /*response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(content);
    response.end();*/
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}


// 也可以用querystring模块来解析POST请求体中的参数
















// 向外提供API
exports.start = start;