import { createServer } from "net";
import { userInfo } from "os";

const fs = require("fs");

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
          fs.readFile(`${__dirname}/user.json`, 'utf8', (err, data) => {
            if (err) {
                console.log(`Error reading file from disk: ${err}`);
            } else {
                let response = ""; 
                const commands = JSON.parse(data);
                commands.forEach(cm => {
                  if(args == `${cm.user}`){
                    response += "User recognized, please enter your password now";
                  }
                  else
                    response += "User unrecognized, please try again";
                });
                socket.write(response);
            }
        });
          break;

        case "PASS": 
          socket.write("331 User name ok, need pass. \r\n");
          break;

        case "LIST":
          socket.write("125 Data connection already open; transfer starting. \r\n");
          let files = fs.readdirSync(process.cwd());
          let answer = "";
          answer += "\r\n-- Files in the current directory --\r\n"
          files.forEach(file => {
            answer += `•${file}\r\n`;
          });
          socket.write(answer);
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
          fs.readFile(`${__dirname}/commands.json`, 'utf8', (err, data) => {
              if (err) {
                  console.log(`Error reading file from disk: ${err}`);
              } else {
                  let response = ""; 
                  response += "\r\n-- Commands --\r\n"
                  const commands = JSON.parse(data);
                  commands.forEach(cm => {
                    response += `•${cm.command}: ${cm.desc}\r\n`;
                  });
                  socket.write(response);
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
