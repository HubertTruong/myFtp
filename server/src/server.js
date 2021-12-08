import { createServer } from "net";
import { fs } from "fs";

export function launch(port) {

  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      switch(command) {
        case "USER": 
          socket.write("230 User logged in, proceed. \r\n");
          break;
        case "PASS": 
          socket.write("331 User name ok, need pass. \r\n");
          break;
        case "LIST":
          socket.write("125 Data connection already open; transfer starting. \r\n");
          /*let files = fs.readdirSync(__dirname);
          files.forEach(file => {
            console.log(file);
          });*/
          break;
        case "CWD": 
          socket.write(`250 Requested file action okay, completed. ${process.chdir()} \r\n`);
          break;
        case "RETR": 
          socket.write("125 \r\n");
          break;
        case "STOR": 
          socket.write("125 \r\n");
          break;
        case "PWD": 
          socket.write(`257 Requested file action okay, completed. \r\n ${process.cwd()} \r\n`);
          break;
        case "HELP":   
          socket.write(`211 System status, or system help reply. \r\n`);
          const fs = require('fs');
          fs.readFile(`${__dirname}/commands.json`, 'utf8', (err, data) => {
              if (err) {
                  console.log(`Error reading file from disk: ${err}`);
              } else {
                  let resp = ""; 
                  resp += "\r\n-- Commands --\r\n"
                  const commands = JSON.parse(data);
                  commands.forEach(cm => {
                      resp += `•${cm.command}: ${cm.desc}\r\n`
                  });
                  socket.write(resp);
              }
          });
          break;
        case "QUIT": 
          socket.write(`221 Service closing control connection. \r\n ${process.exit()} \r\n`);
          break;
        default:
          console.log("Command not supported");
      }

    });
    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
