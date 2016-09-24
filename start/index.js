// 服务器首页

// 那么问题来了：当未来有请求处理程序需要进行非阻塞的操作的时候，我们的应用就“挂”了。

// 引入服务模块
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

/*
	将不同的URL映射到相同的请求处理程序上是很容易的：
只要在对象中添加一个键为"/"的属性，对应requestHandlers.start即可，
 */
var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
/* 其实这路可以通过编制一个：config.js中 url:{} 来作为配置文件传递 */


// 把它（handle）作为额外的参数传递给服务器
server.start(router.route, handle);
// server.start(router.route);
// server.start();