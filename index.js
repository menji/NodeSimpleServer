"use strict"

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mime = require('mime-types');
const tar = require('tar');
const split = require('split');
const through = require('through2');

var currentpath = '';
var server = http.createServer(function(req, res){
  if(req.method === 'POST'){
     res.writeHead(200, {
       'Content-Disposition': 'attachment; filename=packed.tar.gz;'
     });
     var files = []
     req
       .pipe(split('%7C'))
       .pipe(through.obj((buffer, ent, next) => {
         files.push(buffer)
         next()
       }, (done) => {
           //the first file is 'filelist=...', so modify it.
           files[0] = files[0].split('=')[1]
           files = files.map(file => path.join(currentpath, file));
           tar.c(
             {
               gzip: true
             },
             files
           ).pipe(res)
           done()
       }))
     return
  }
  var args = url.parse(req.url); 
  var pathname = '.' + args.pathname;
  fs.lstat(pathname, (err, stats) =>{
    if(err){
      return err;
    }
    if(stats.isFile()){
      var contentType = mime.contentType(path.basename(pathname));
      res.writeHead(200, {'content-type': `${contentType}`});
      fs.createReadStream(pathname)
        .pipe(res)
    }else if(stats.isDirectory()){
      currentpath = pathname;
      fs.readdir(pathname, (err, files)=>{
        if(err){
          return err;
        }
        res.writeHead(200, {'content-type': 'text/html'});
        res.write(fs.readFileSync('list_header.html'))
        for(var i in files){
          var link = path.join(req.url, files[i]) 
          var line = `<span><input type='checkbox'> <a href='${link}'>${files[i]}</a></span><br />`;
          res.write(line);
        }
        res.write(fs.readFileSync('list_footer.html'));
        res.end()

      })
    }else{
      res.writeHead(200, {'content-type': 'text/html'});
      res.wrtite('unknown err')
      res.end()
    }
  });
});

server.listen(8080, ()=>{
  console.log('server started on localhost port 8080')
});
