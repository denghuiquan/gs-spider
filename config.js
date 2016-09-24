/*======== 缓存机制配置文件 =========*/
exports.Expires = {

    fileMatch: /^(gif|png|jpg|js|css)$/ig,

    maxAge: 606024365

};

/*=================  GZip启用配置： 对于图片一类的文件，不需要进行gzip压缩，  ===================*/
exports.Compress = {

    match: /css|js|html/ig

};


/*============  利用配置去除欢迎及错误页面的硬编码问题   =========*/
exports.Welcome = {

    file: "index.html"

};

exports.Error = {

    file: "error.html"
    
};