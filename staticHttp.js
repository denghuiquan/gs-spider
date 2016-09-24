/*=============  静态文件服务器   ==============*/

// 预先设置应用监听的端口
var App_PORT = 8000;

// 引入内容MIME类型map文件
var mime = require('./mime').types;

// 引入config.js文件
var config = require('./config');

// 引入utils.js文件
var utils = require('./utils');

// 加入文件服务模块倚赖---涉及到了文件读取的这部分，自然不能避开fs(file system)这个模块
var fs = require('fs');

// 涉及到了路径处理，path模块也是需要的。 
var path = require('path');

// 加入http网络协议服务依赖
var http = require('http');

// 添加url模块是必要的。然后解析pathname。 
var url = require('url');

// 要用到gzip，就需要zlib模块
var zlib = require('zlib');


// 创建http服务器对象
var server = http.createServer(function(request, response) {

// TODO things what we wan to do
	var pathname = url.parse(request.url).pathname;	
	
	response.setHeader("Server", "Node/V5 by Mark Deng");
	/*
	// 设置服务器默认首页
	var flag = pathname=='/';
	if (flag) {
		pathname=pathname+"index.html"
	}
	*/
	// 为/结尾的请求，自动添加上”index.html”。
	if (pathname.slice(-1) === '/') {
	    pathname = pathname + config.Welcome.file;
	}



	/*
	//设置真实路径
	var realPath= "assets"+pathname;
	// realPath = path.normalize(realPath);
	*/
	/*	暴力点的解决方案就是禁止父路径。 
	首先替换掉所有的…，然后调用path.normalize方法来处理掉不正常的/。 */	
	var realPath = path.join("assets", path.normalize(pathname.replace(/\.\.\./g, "")));
	/*
	这个时候通过curl -i http://localhost:8000/…/app.js 访问，/…/app.js会被替换掉为//app.js。
	normalize方法会将//app.js返回为/app.js。再加上真实的assets，就被实际映射为assets/app.js。
	 */

	 /*=========================  对函数进行优化重构 ====================*/
	 // fs.stat方法具有比fs.exsits方法更多的功能。我们直接替代掉它。
	 var pathHandle = function (realPath){
        fs.stat(realPath, function (err, stats) {

            if (err) {
                realPath=path.join("assets","/",config.Error.file);
				fs.readFile(realPath,"binary",function(err, file){
					if (err) {
						response.writeHead(500,{"Content-Type":"text/plain"});
						response.end(err);
					} else{
						response.writeHead(404,{"Content-Type":"text/html"});
						response.write(file, "binary");
	                    response.end();
					}
				});
            } else {
            	// 如果请求了一个目录路径，并且没有以/结尾。那么我们需要做判断。
				// 如果当前读取的路径是目录，就需要添加上/和index.html 		
                if (stats.isDirectory()) {
                    realPath = path.join(realPath, "/", config.Welcome.file);
                    pathHandle(realPath);
                } else {

                    var ext = path.extname(realPath);
                    ext = ext ? ext.slice(1) : 'unknown';
                    var contentType = mime[ext] || "text/plain";
                    response.setHeader("Content-Type", contentType);

                    var lastModified = stats.mtime.toUTCString();
                    var ifModifiedSince = "If-Modified-Since".toLowerCase();
                    response.setHeader("Last-Modified", lastModified);                    


                    if (ext.match(config.Expires.fileMatch)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
                        response.setHeader("Expires", expires.toUTCString());
                        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
                    }
                    if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
                        response.writeHead(304, 'Not Modified');
                        response.end();
                    } else {


/*===========================  add Range进行重构 Start ================================*/
						//由于选取Range之后，依然还是需要经过GZip的
						var compressHandle = function (raw, statusCode, reasonPhrase) {

					        var stream = raw;
					        var acceptEncoding = request.headers['accept-encoding'] || "";
					        var matched = ext.match(config.Compress.match);

					        if (matched && acceptEncoding.match(/\bgzip\b/)) {
					            response.setHeader("Content-Encoding", 'gzip');
					            stream = raw.pipe(zlib.createGzip());
					        } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
					            response.setHeader("Content-Encoding", "deflate");
					            stream = raw.pipe(zlib.createDeflate());
					        }

					        response.writeHead(statusCode, reasonPhrase);
					        stream.pipe(response);
					    };

						if (request.headers["range"]) {
						    var range = utils.parseRange(request.headers["range"], stats.size);

						    if (range) {
						    	//如果满足Range的条件，则为响应添加上Content-Range和修改掉Content-Lenth。
						        response.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
						        response.setHeader("Content-Length", (range.end - range.start + 1));
						        var raw = fs.createReadStream(realPath, {"start": range.start, "end": range.end});
						        compressHandle(raw, 206, "Partial Content");

						    } else {
						        response.removeHeader("Content-Length");
						        response.writeHead(416, "Request Range Not Satisfiable");
						        response.end();
						    }
						} else {
						    var raw = fs.createReadStream(realPath);
						    compressHandle(raw, 200, "Ok");
						}
/*==============================  重构END  ===============================*/


/*-----------------------  历史的分隔线 start 2 -------------------------*/
                /*
                        var raw = fs.createReadStream(realPath);
                        var acceptEncoding = request.headers['accept-encoding'] || "";
                        var matched = ext.match(config.Compress.match);

                        if (matched && acceptEncoding.match(/\bgzip\b/)) {
                            response.writeHead(200, "Ok", {'Content-Encoding': 'gzip'});
                            raw.pipe(zlib.createGzip()).pipe(response);
                        } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                            response.writeHead(200, "Ok", {'Content-Encoding': 'deflate'});
                            raw.pipe(zlib.createDeflate()).pipe(response);
                        } else {
                            response.writeHead(200, 'Ok');
                            raw.pipe(response);
                        }
				*/
/*-----------------------  历史的分隔线 end 2 -------------------------*/


                    }

                }
            }
        });
	 };

	 pathHandle(realPath);



	
/*=================================================== 历史的分隔线 =============================================*/
/*
	fs.exists(realPath, function (exists){
*/
		/*
		通过path模块的path.exists方法来判断静态文件是否存在磁盘上。
		不存在我们直接响应给客户端404错误。 */
/*		if (!exists) {
			realPath="assets"+"/error.html";
			fs.readFile(realPath,"binary",function(err, file){
				if (err) {
					response.writeHead(500,{"Content-Type":"text/plain"});
					response.end(err);
				} else{
					response.writeHead(404,{"Content-Type":"text/html"});
					response.write(file, "binary");
                    response.end();
				}
			});
		}else{
*/			/*
			通过path.extname来获取文件的后缀名。由于extname返回值包含”.”，所以通过slice方法来剔除掉”.”
			 */
/*			var ext = path.extname(realPath);
			ext = ext ? ext.slice(1) : 'unknown';	
			var contentType = mime[ext] || "text/plain";	
			response.setHeader("Content-Type", contentType);

			// 为所有请求的响应都添加Last-Modified头。
			// 读取文件的最后修改时间是通过fs模块的fs.stat()方法来实现的。
			fs.stat(realPath, function (err, stat) {
			    var lastModified = stat.mtime.toUTCString();
			    var ifModifiedSince = "If-Modified-Since".toLowerCase();
			    response.setHeader("Last-Modified", lastModified);
*/

			    // 在相应之前判断后缀名是否符合我们要添加过期时间头的条件。 
				/*	
				设置缓存前的响应头：
				Connection:keep-alive
				Content-Type:text/css
				Date:Mon, 10 Aug 2015 12:54:01 GMT
				Transfer-Encoding:chunked
				-------------------------------------------
				设置缓存后的响应头：
				Cache-Control:max-age=606024365
				Connection:keep-alive
				Content-Type:text/css
				Date:Mon, 10 Aug 2015 12:55:52 GMT
				Expires:Mon, 23 Oct 2034 17:01:57 GMT
				Transfer-Encoding:chunked
				 */
/*				if (ext.match(config.Expires.fileMatch)) {
					// 获取当前时间
				    var expires = new Date();
				    expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
				    response.setHeader("Expires", expires.toUTCString());
				    response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
				}


				// 同时也要检测浏览器是否发送了If-Modified-Since请求头。
				// 如果发送而且跟文件的修改时间相同的话，我们返回304状态。
				if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
				    response.writeHead(304, "Not Modified");
				    response.end();
				}else{					
	*/
					/* 如果文件存在则调用fs.readFile方法读取文件。
					如果发生错误，我们响应给客户端500错误，表明存在内部错误。
					正常状态下则发送读取到的文件给客户端，表明200状态。	
					 */
					/*fs.readFile(realPath,"binary",function(err, file){
						if (err) {
							response.writeHead(500,{"Content-Type":contentType});
							response.end(err);
						} else{
							response.writeHead(200,{"Content-Type":contentType});
							response.write(file, "binary");
		                    response.end();
						}
					});*/


					/*这里为了防止大文件，也为了满足zlib模块的调用模式，将读取文件改为流的形式进行读取。*/
	/*				var raw = fs.createReadStream(realPath);
					var acceptEncoding = request.headers['accept-encoding'] || "";
					var matched = ext.match(config.Compress.match);

					// 对于支持压缩的文件格式以及浏览器端接受gzip或deflate压缩，我们调用压缩。
					// 若不，则管道方式转发给response。
					if (matched && acceptEncoding.match(/\bgzip\b/)) {
						// 判断接受文件格式是否可用
					    response.writeHead(200, "Ok", {'Content-Encoding': 'gzip'});
					    raw.pipe(zlib.createGzip()).pipe(response);
					} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
						// 判断接受文件格式是否可用
					    response.writeHead(200, "Ok", {'Content-Encoding': 'deflate'});
					    raw.pipe(zlib.createDeflate()).pipe(response);
					} else {
						// 都不可用，使用默认设置
					    response.writeHead(200, "Ok");
					    raw.pipe(response);
					}

				}
			});	

		}
	});*/
});

server.listen(App_PORT);

console.log("Server runing at port: " + App_PORT + ".");




/*=====================  华丽的注释说明  ====================*/
/*
MIME类型支持。因为我们的服务器同时要存放html, css, js, png, gif, jpg等等文件。
并非每一种文件的MIME类型都是text/html的。 
 */


/*=============== 添加： 缓存支持/控制 ===============*/
/*
发现用户在每次请求的时候，服务器每次都要调用fs.readFile方法去读取硬盘上的文件的。
当服务器的请求量一上涨，硬盘IO会吃不消的。 
 
为了简化问题，我们只做如下这几件事情： 

1、为指定几种后缀的文件，在响应时添加Expires头和Cache-Control: max-age头。超时日期设置为1年。

2、由于这是静态文件服务器，为所有请求，响应时返回Last-Modified头。

3、为带If-Modified-Since的请求头，做日期检查，如果没有修改，则返回304。若修改，则返回文件。
 */
/*
对于指定后缀文件和过期日期，为了保证可配置。那么建立一个config.js文件是应该的。 
 */

/*
浏览器在发送请求之前由于检测到Cache-Control和Expires
（Cache-Control的优先级高于Expires，但有的浏览器不支持Cache-Control，这时采用Expires），
如果没有过期，则不会发送请求，而直接从缓存中读取文件。
 */

/*
通过Expires和Last-Modified两个方案以及与浏览器之间的通力合作，会节省相当大的一部分网络流量，
同时也会降低部分硬盘IO的请求。如果在这之前还存在CDN的话，整个solution就比较完美了。
 */


/*===============  GZip启用  ===========*/
/*
对于CSS,JS等文件如果不采用gzip的话，还是会浪费掉部分网络带宽。那么接下来把gzip搞起吧。

如果你是前端达人，你应该是知道YUI Compressor或Google Closure Complier这样的压缩工具的。
在这基础上，再进行gzip压缩，则会减少很多的网络流量。 */

/*要用到gzip，就需要zlib模块，该模块在Node的0.5.8版本开始原生支持。*/



/*==========  Range支持，搞定媒体断点支持 =============*/
/*
用户在听一首歌的时候，如果听到一半（网络下载了一半），网络断掉了，
用户需要继续听的时候，文件服务器不支持断点的话，则用户需要重新下载这个文件。

而Range支持的话，客户端应该记录了之前已经读取的文件范围，
网络恢复之后，则向服务器发送读取剩余Range的请求，服务端只需要发送客户端请求的那部分内容，
而不用整个文件发送回客户端，以此节省网络带宽。

1、如果Server支持Range，首先就要告诉客户端，咱支持Range，之后客户端才可能发起带Range的请求。
response.setHeader('Accept-Ranges’, ‘bytes’);

2、Server通过请求头中的Range: bytes=0-xxx来判断是否是做Range请求，
如果这个值存在而且有效，则只发回请求的那部分文件内容，响应的状态码变成206，表示Partial Content，并设置Content-Range。
如果无效，则返回416状态码，表明Request Range Not Satisfiable。
如果不包含Range的请求头，则继续通过常规的方式响应。


首先判断Range请求和检测其是否有效
为保持代码的干净以及可维护性，我们将该功能的代码放在utils.js文件中

如果满足Range的条件，则为响应添加上Content-Range和修改掉Content-Lenth。

Range支持令这个静态文件服务器支持一些流媒体文件，表示没有压力啦
 */