// 路由给真正的请求处理程序
// 要针对不同的URL有不同的处理方式。
/*
	路由过程会在路由模块中“结束”，并且路由模块并不是真正针对请求“采取行动”的模块，
否则当我们的应用程序变得更为复杂时，将无法很好地扩展。
	
	但注意：不要急着来开发路由模块，因为如果请求处理程序没有就绪的话，
再怎么完善路由模块也没有多大意义。
*/

/*function route(pathname) {
  console.log("About to route a request for " + pathname);
}*/

// 改良后，接收来自调用者传递路径配置的参数，
// “嗨，请帮我处理了这个路径”。
/*function route(handle, pathname) {
  console.log("About to route a request for " + pathname);
  // 可以用从关联数组中获取元素一样的方式从传递的对象中获取请求处理函数，
  if (typeof handle[pathname] === 'function') {
    return handle[pathname]();
  } else {
    console.log("No request handler found for " + pathname);
    return "404 Not Found..."
  }
}*/


// 相对此前从请求处理程序中获取返回值，这次取而代之的是直接传递response对象。
// 没有对应的请求处理器处理，我们就直接返回“404”错误。
function route(handle, pathname, response) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response);
  } else {
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;