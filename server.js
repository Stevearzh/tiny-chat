const http  = require('http'),
      fs    = require('fs'),
      path  = require('path'),
      mime  = require('mime');
let   cache = {};

const send404 = response => {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
};

const sendFile = (response, filePath, fileContent) => {
  response.writeHead(200, {
    'Content-Type': mime.lookup(path.basename(filePath))
  });
  response.end(fileContent);
};

const serverStatic = (response, cache, absPath) => {
  // check if file already in cache
  if (cache[absPath]) {
    // return file from cache
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, exists => {
      // check if file exists
      if (exists) {
        // read file from disk
        fs.readFile(absPath, (err, data) => {
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
};

const server = http.createServer((request, response) => {
  let filePath = false;

  if (request.url === '/') {
    filePath = 'client/index.html';
  } else {
    filePath = 'client' + request.url;
  }

  const absPath = './' + filePath;
  serverStatic(response, cache, absPath);
});

server.listen(3000, () => console.log('Server listening on port 3000.'));
