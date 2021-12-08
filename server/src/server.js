import { createServer } from "net";

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
          let help = "USER <username>: check if the user exist\n" + 
                     "PASS <password>: authenticate the user with a password\n" +
                     "LIST: list the current directory of the server\n" +
                     "CWD <directory>: change the current directory of the server\n" +
                     "RETR <filename>: transfer a copy of the file FILE from the server to the client\n" +
                     "STOR <filename>: transfer a copy of the file FILE from the client to the server\n" + 
                     "PWD: display the name of the current directory of the server\n" +
                     "HELP: send helpful information to the client\n" + 
                     "QUIT: close the connection and stop the program\n"; 
          socket.write(help);
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
