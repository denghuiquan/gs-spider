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


//========= 处理POST请求 ==========
/*
为了使整个过程非阻塞，Node.js会将POST数据拆分成很多小的数据块，
然后通过触发特定的事件，将这些小数据块传递给回调函数。
这里的特定的事件有data事件（表示新的小数据块到达了）以及end事件（表示所有的数据都已经接收完毕）。
 
 获取所有来自请求的数据，然后将这些数据给应用层处理，应该是HTTP服务器要做的事情。
 	因此，建议，我们直接在服务器中处理POST数据，
 然后将最终的数据传递给请求路由和请求处理器，让他们来进行进一步的处理。
 */
/*
实现思路就是： 将data和end事件的回调函数直接放在服务器中，
在data事件回调中收集所有的POST数据，当接收到所有数据，
触发end事件后，其回调函数调用请求路由，并将数据传递给它，
然后，请求路由再将该数据传递给请求处理程序。
 */



// 改进参数传递，以消除臃肿，改良自身
function start(route, handle) {
  function v2onRequest(request, response) {
  	// 保存接收到的request数据
  	var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    /*
    在start()函数里添加了handle参数，
    并且把handle对象作为第一个参数传递给了route()回调函数
     */
    // var content = route(handle, pathname);

    // 改进：解决非阻塞（同步）问题
    // route(handle, pathname, response);

    // 将onRequest()处理程序中所有有关response的函数调都移除，
    // 因为我们希望这部分工作让route()函数来完成
    /*response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(content);
    response.end();*/

    // 设置了接收数据的编码格式为UTF-8
    request.setEncoding("UTF-8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+
      postDataChunk + "'.");
    });

    // 将请求路由的调用移到end事件处理程序中，
    // 以确保它只会当所有数据接收完毕后才触发，并且只触发一次。
    request.addListener("end", function() {
      // 同时还把POST数据传递给请求路由，因为这些数据，请求处理程序会用到
      route(handle, pathname, response, postData);
    });

  }


  // 移除对postData的处理以及request.setEncoding （这部分node-formidable自身会处理），
  // 转而采用将request对象传递给请求路由的方式
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}


// 也可以用querystring模块来解析POST请求体中的参数
















// 向外提供API
exports.start = start;