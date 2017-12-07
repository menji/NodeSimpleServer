"use strict"

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

var server = http.createServer(function(req, res){
  var args = url.parse(req.url); 
  var pathname = '.' + args.pathname;
  fs.lstat(pathname, (err, stats) =>{
    if(err){
      return err;
    }
    if(stats.isFile()){
      if(path.extname(pathname) === '.mp3'){
        res.writeHead(200, {'content-type': 'audio/mpeg'});
        fs.createReadStream(pathname)
          .pipe(res)
      }else{
        res.writeHead(200, {'Content-Disposition': `attachment; filename= ${path.basename(pathname)}`});
        fs.createReadStream(pathname)
          .pipe(res)
      }
    }else if(stats.isDirectory()){
      fs.readdir(pathname, (err, files)=>{
        if(err){
          return err;
        }
        res.writeHead(200, {'content-type': 'text/html'});
        var hostname = args.hostname;
        var urls = [];
        for(var i in files){
          var link = path.join(req.url, files[i]) 
          link = `<a href='${link}'>${files[i]}</a>`
          urls.push(link)
        }
        res.write(urls.join('</br>')) 
        res.end()

      })
    }else{
      res.writeHead(200, {'content-type': 'text/html'});
      res.wrtite('unknow err')
      res.end()
    }
  });
});

server.listen(8080, ()=>{
  console.log('server started on localhost port 8080')
});
