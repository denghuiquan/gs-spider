/*
实现一个抓取广东财经大学校园网新闻标题、内容相关的爬虫

通知公告：http://news.gdufe.edu.cn/html/tzgg/1.html
学校要闻：http://news.gdufe.edu.cn/html/xxyw2/1.html
综合新闻：http://news.gdufe.edu.cn/html/zhxw/1.html
招生就业：http://news.gdufe.edu.cn/html/zsjy/1.html
广财论坛：http://news.gdufe.edu.cn/html/gclt/1.html
学子风采：http://news.gdufe.edu.cn/html/xzfc/1.html
 */

/*var http	= require('http');
var url		= require('url');
var fs		= require('fs');
var zlib 	= require('zlib');*/
// response.pipe(zlib.createGunzip()).pipe(fs.createWriteStream("./data/segment_" + index + ".txt"));


/*需要用到三个依赖，分别是 express，superagent 和 cheerio */
// 引入依赖
var express = require('express');
// var utility = require('utility');
var superagent=require('superagent');
var cheerio=require('cheerio');


// 建立 express 实例
var app = express();
app.get('/tzgg', function (req, res, next) {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('http://news.gdufe.edu.cn/html/tzgg/')
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
      $('.list_text ul li').each(function (idx, element) {
        var $li = $(element);
        var $list_top=$li.find(".list_top").find("span");
        var $title=$list_top.children().first();
        var $date=$list_top.children().last();;
        var $list_bot=$li.find(".list_bot");
        
        items.push({
          title: $title.text() ,
          href: $title.attr('href'),
          date: $date.text() ,
          content: $list_bot.text() 
        });
      });
      var doc="<!DOCTYPE html><head><meta charset='utf-8'><title>广东财经大学：通知公告</title></head><body style='background-color:#ccc'><div style='margin-left:10%;width:80%'><h1 style='margin-bottom:20px'><a href='http://news.gdufe.edu.cn/html/tzgg/'><strong><em>通知公告</em></strong></a></h1>";
      for (var i =0; i <= items.length - 1; i++) {
      	doc+="<div  style='margin-top:20px'><strong>" +(i+1)+" ：</strong><a style='text-decoration:none' href='http://news.gdufe.edu.cn"+items[i].href+"'>"+ items[i].title+"</a><span style='margin-left:20px'>发布日期："+ items[i].date+"</span></div>"+"<div><p>"+items[i].content+"</p></div>";
      };
      doc+="</div></body>";
      res.send(doc);
    });
});


app.get('/', function(req, res) {
  superagent.get('https://cnodejs.org/?tab=all&page=1')
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
