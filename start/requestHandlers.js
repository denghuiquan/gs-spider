// 对于每一个请求处理程序，添加一个占位用函数，
// 随后将这些函数作为模块的方法导出
// 
// 把请求处理程序和路由模块连接起来，让路由“有路可寻”。
// 
// 	  现在这个情况下，使用依赖注入可以让路由和请求处理
// 程序之间的耦合更加松散，也因此能让路由的重用性更高。
// 
// 	但是解决路由的复杂传送问题，似乎关联数组（associative array）能完美胜任。
// 	在JavaScript中，真正能提供此类功能的是它的对象。
// 	在JavaScript中，对象就是一个键/值对的集合 
// 	-- 你可以把JavaScript的对象想象成一个键为字符串类型的字典。
	
// 请求处理程序能够向浏览器返回一些有意义的信息，“处理请求”说白了就是“对请求作出响应”
// 不好的实现方式：让请求处理程序通过onRequest函数直接返回（return()）他们要展示给用户的信息。


// start()包含了阻塞操作。形象的说就是“它阻塞了所有其他的处理工作”
/*
	Node.js可以在不新增额外线程的情况下，依然可以对任务进行并行处理 —— Node.js是单线程的。

	它通过事件轮询（event loop）来实现并行操作，对此，我们应该要充分利用这一点 
—— 尽可能的避免阻塞操作，取而代之，多使用非阻塞操作。

	要用非阻塞操作，我们需要使用回调，通过将函数作为参数传递给其他需要花时间做处理的函数
（比方说，休眠10秒，或者查询数据库，又或者是进行大量的计算）。
 
 	就好比：“嘿，probablyExpensiveFunction()（译者注：这里指的就是需要花时间处理的函数），
 你继续处理你的事情，我（Node.js线程）先不等你了，我继续去处理你后面的代码，请你提供一个callbackFunction()，等你处理完之后我会去调用该回调函数的，谢谢！”
 */
/* 引入子线程模块 */
// 用它是问题演示需要，为了实现一个既简单又实用的非阻塞操作：exec()
var exec = require("child_process").exec;

// 因exec耗时操作的非阻塞执行，立即返回内容为“empty”，针对浏览器显示的结果来看，我们并不满意我们的非阻塞操作
function oldStart() {
  console.log("Request handler 'start' was called.");
  /*
  // 演示包括非阻塞操作，实际场景中，这样的阻塞操作有很多
  function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
  }
  // 当函数start()被调用的时候，Node.js会先等待10秒，之后才会返回“Hello Start”。
  sleep(10000);
  */


  var content = "empty";
  // 执行一个shell命令。获取当前目录下所有的文件（“ls -lah”）
  exec("ls -lah", function (error, stdout, stderr) {
    content = stdout;
  });

  // 代码是同步执行的，这就意味着在调用exec()之后，Node.js会立即执行 return content ；
  // 在这个时候，content仍然是“empty”，因为传递给exec()的回调函数还未执行到——因为exec()的操作是异步的
  // 回调函数也会很快的执行到---不过，不管怎么说它还是异步的。
  return content+"Hello Start!";
}

// 正确的打开方式： 以非阻塞操作进行请求响应
// 用Node.js就有这样一种实现方案： 函数传递。
/*
实现方式：相对采用将内容传递给服务器的方式，我们这次采用将服务器“传递”给内容的方式。

	就是将response对象（从服务器的回调函数onRequest()获取）通过请求路由传递给请求处理程序。
 随后，处理程序就可以采用该对象上的函数来对请求作出响应。
 */


/*function upload() {
  console.log("Request handler 'upload' was called.");
  return "Hello Upload!";
}*/


/*改进后的处理程序函数需要接收response参数，为了对请求作出直接的响应。*/
function start(response) {
  console.log("Request handler 'start' was called.");

  exec("ls -lah", function (error, stdout, stderr) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(stdout);
    response.end();
  });
}

function upload(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello Upload");
  response.end();
}

exports.start = start;
exports.upload = upload;