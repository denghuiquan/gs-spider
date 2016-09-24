/*======== 线上部署：heroku   =========*/

/*
heroku 的免费额度还是足够的，对于 demo 应用来说，放上去是绰绰有余的。
各位搞 web 开发的大学生朋友，一定要试着让你开发的项目尽可能早地去线上跑，
这样你的项目可以被其他人看到，能够促使你更有热情地进行进一步开发。
这回我们放的是 cnode 社区的爬虫上去，你其实可以试着为你们学院或者学校的新闻站点写个爬虫，
提供 json api，然后去申请个微信公共平台，每天推送学院网站的新闻。
这东西辅导员是有需求的，可以做个给他们用。
 */


/*================================ 网络爬虫App ==========================*/

/*  注意：有 rate limit 的限制的网站不行*/
/*当在浏览器中访问 http://localhost:3000/ 时，
输出 CNode(https://cnodejs.org/ ) 社区首页的所有
帖子标题和链接，以 json 的形式。*/
/*
	1)学习使用 superagent 抓取网页
	2)学习使用 cheerio 分析网页
 */

/*需要用到三个依赖，分别是 express，superagent 和 cheerio */
// 引入依赖
var express = require('express');
// var utility = require('utility');
var superagent=require('superagent');
var cheerio=require('cheerio');

// 建立 express 实例
var app = express();
app.get('/', function (req, res, next) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('http://cnodejs.org/')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element);
        var $user_avatar=$(this.parent.parent).find(".user_avatar");
        var $author_img=$user_avatar.find("img");
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href'),
          author: $author_img.attr('title')
        });
      });
      var doc="<!DOCTYPE html><head><meta charset='utf-8'><title>Node.js 制作的网络爬虫案例</title></head><body style='background-color:#ccc'><div style='margin-left:10%;width:80%'><h1 style='margin-bottom:20px'>从<a href='https://cnodejs.org'><strong><em>cnodejs</em></strong></a>论坛首页爬回来的文章</h1>";
      for (var i =0; i <= items.length - 1; i++) {
      	doc+="<div  style='margin-top:20px'><strong>" +(i+1)+" ：</strong><a style='text-decoration:none' href='https://cnodejs.org"+items[i].href+"'>"+ items[i].title+"</a><span style='margin-left:20px'>作者："+ items[i].author+"</span></div>";
      };
      doc+="</div></body>";
      res.send(doc);
    });
});


app.get('/next', function(req, res) {
  superagent.get('https://cnodejs.org/?tab=all&page=2')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        console.log("-!-Error:"+err);
      }
      
       // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element);
        var $user_avatar=$(this.parent.parent).find(".user_avatar");
        var $author_img=$user_avatar.find("img");
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href'),
          author: $author_img.attr('title')
        });
      });
      var doc="<!DOCTYPE html><head><meta charset='utf-8'><title>Node.js 制作的网络爬虫案例</title></head><body style='background-color:#ccc'><div style='margin-left:10%;width:80%'><h1 style='margin-bottom:20px'>从<a href='https://cnodejs.org'><strong><em>cnodejs</em></strong></a>论坛首页爬回来的文章</h1>";
      for (var i =0; i <= items.length - 1; i++) {
        doc+="<div  style='margin-top:20px'><strong>" +(i+1)+" ：</strong><a style='text-decoration:none' href='https://cnodejs.org"+items[i].href+"'>"+ items[i].title+"</a><span style='margin-left:20px'>作者："+ items[i].author+"</span></div>";
      };
      doc+="</div></body>";
      res.send(doc);
    });
});



app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});


// 为了部署而修改的监听端口
// app.listen(process.env.PORT || 5000);


/*==================   代码中有两个特殊的地方，===============================*/
/*
一个是一个叫 Procfile 的文件，内容是：
web: node app_name.js

一个是 app_name.js 里面，
app.listen(process.env.PORT || 5000);
*/
// 这两者都是为了部署 heroku 所做的。
/*
当部署一个应用上 paas 平台以后，paas 要为我们干些什么？

首先，平台要有我们语言的运行时；

然后，对于 node.js 来说，它要帮我们安装 package.json 里面的依赖；

然后呢？然后需要启动我们的项目；

然后把外界的流量导入我们的项目，让我们的项目提供服务。

上面那两处特殊的地方，一个是启动项目的，一个是导流量的。
*/

/*
===== 
heroku 虽然能推测出你的应用是 node.js 应用，但它不懂你的主程序是哪个，
所以我们提供了 Procfile 来指导它启动我们的程序。

而我们的程序，本来是监听 5000 端口的，但是 heroku 并不知道。
当然，你也可以在 Procfile 中告诉 heroku，可如果大家都监听 5000 端口，这时候不就有冲突了吗？
所以这个地方，heroku 使用了主动的策略，主动提供一个环境变量 process.env.PORT 来供我们监听。
=====
*/


/*
在命令行里面
	heroku login
执行
	heroku create
heroku 会为我们随机取一个应用名字，并提供一个 git 仓库给我们
往 heroku 这个远端地址推送我们的 master 分支
heroku 会自动检测出我们是 node.js 程序，并安装依赖，然后按照 Procfile 进行启动。

push 完成后，在命令键入 heroku open，则 heroku 会自动打开浏览器带我们去到相应的网址
 */
