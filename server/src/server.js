import { createServer, SocketAddress } from "net";

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
          fs.readFile(`${__dirname}/user.json`, 'utf8', (err, data) => {
            if (err) {
              console.log(`Error reading file from disk: ${err}`);
            } 
            else {
              socket.user = args[0];
              let response = ""; 
              const commands = JSON.parse(data);
              commands.forEach(cm => {
                if(socket.user == cm.user) {
                  socket.pass = cm.pass
                  response += "\n230 Username recognized: use the PASS command to enter your password now\n";
                }
                else
                  response += "\n530 Not logged in: Username unrecognized, please try again\n";
              });
              socket.write(response);
            }
          });
          break;

        case "PASS": 
          if(args[0] != socket.pass) {
            socket.write("331 Username recognized but wrong password, please retry. \r\n");
          } 
          else if(args[0] == socket.pass) {
            socket.write("230 Username and Password valid, logging in \r\n");
          } 
          else if(args[0] == undefined) {
            socket.write("501 Syntax error in parameters or arguments. \r\n");
          }
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
          try{
            process.chdir(args[0]);
            socket.write(`257 Requested file action okay, completed. \r\n New directory : ${process.cwd()} \r\n`);
          }catch(err) {
            socket.write("550 Directory not found, please retry\n");
          }
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
              } 
              else {
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
          socket.write(`221 Service closing control connection. \r\n ${socket.destroy()} \r\n`);
          break;
          
        default:
          console.log("500 Command not supported");
      }
    });
    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
