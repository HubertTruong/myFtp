import { createServer } from "net";

const fs = require("fs");

export function launch(port) {

  const server = createServer((socket) => {
    console.log("New connection.");
    socket.on("data", (data) => {
      const message = data.toString();
      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      switch(command) {

        //USER <username>: check if the user exist
        case "USER": 
          fs.readFile(`${__dirname}/user.json`, 'utf8', (err, data) => {
            if (err) {
              console.log(`Error reading file from disk: ${err}`);
            } 
            else {
              if (args[0] == undefined) {
                socket.write("501 Syntax error in parameters or arguments. \r\n")
              } else {
                socket.user = args[0];
                let response = ""; 
                const commands = JSON.parse(data);
                commands.forEach(cm => {
                  if(socket.user == cm.user) {
                    socket.pass = cm.pass;
                    response += "\n230 Username recognized: Use the PASS command to enter your password\n";
                  }
                  else
                    response += "\n530 Not logged in: Username unrecognized, please try again\n";
                });
                socket.write(response);
              }
            }
          });
          break;

        //PASS <password>: authenticate the user with a password
        case "PASS": 
          if(args[0] != socket.pass) {
            socket.write("331 Username recognized but wrong password, please retry. \r\n");
          } 
          else if(args[0] == socket.pass) {
            socket.write("230 Username and Password valid, successful connection! \r\n");
          } 
          else if(args[0] == undefined) {
            socket.write("501 Syntax error in parameters or arguments. \r\n");
          }
          break;

        //LIST: list the current directory of the server
        case "LIST":
          socket.write("125 Data connection already open; transfer starting. \r\n");
          let files = fs.readdirSync(process.cwd());
          let response = "";
          response += "\r\n-- Files in the current directory --\r\n"
          files.forEach(file => {
            response += `•${file}\r\n`;
          });
          socket.write(response);
          break;

        //CWD <directory>: change the current directory of the server
        case "CWD":
          if (args[0] == undefined) {
            socket.write("501 Syntax error in parameters or arguments. \r\n");
          } 
          else {
            try {
              process.chdir(args[0]);
              socket.write(`257 Requested file action okay, completed. \r\n New directory : ${process.cwd()} \r\n`);
            } catch(err) {
              socket.write("550 Directory not found, please retry\n");
            }
          } 
          break;
          
        //RETR <filename>: transfer a copy of the file FILE from the server to the client
        case "RETR": 
          socket.write("125 \r\n");
          break;

        //STOR <filename>: transfer a copy of the file FILE from the client to the server
        case "STOR": 
          socket.write("125 \r\n");
          break;

        //PWD: display the name of the current directory of the server
        case "PWD": 
          socket.write(`257 Requested file action okay, completed. \r\n ${process.cwd()} \r\n`);
          break;

        //HELP: send helpful information to the client
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

        //QUIT: close the connection and stop the program
        case "QUIT": 
          socket.write(`221 Service closing control connection. \r\n ${socket.destroy()} \r\n`);
          break;
          
        default:
          socket.write("500 Command not supported, please try again.\n");
      }
    });
    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
