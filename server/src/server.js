import { createServer } from "net";

export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      /*switch(command) {
        case "USER":
          socket.write("230 User logged in, proceed.\r\n");
          break;
        case "SYST":
          socket.write("215 \r\n");
          break;
        case "FEAT":
          socket.write("211 \r\n");
          break;
        case "PWD":
          socket.write("257 /users/hubert\r\n");
          break;
        case "TYPE":
          socket.write("200 \r\n");
          break;
        case "EPSV":
          socket.write("229 \r\n");
          break;
        case "EPRT":
          socket.write("200 \r\n");
          break;
        default:
          console.log("command not supported:", command, args);
      }
    }*/
    
    const directives = {
      USER: (socket) => { socket.write("230 User logged in, proceed. \r\n") },
      PASS:(socket) => { socket.write(" \r\n") },
      LIST:(socket) => { socket.write(" \r\n") },
      CWD: (socket) => { socket.write(" \r\n") },
      RETR: (socket) => { socket.write(" \r\n") },
      STOR: (socket) => { socket.write(" \r\n") },
      PWD: (socket) => { socket.write("257 /users/hubert\r\n") },
      HELP: (socket) => { socket.write("214 Help message. \r\n") },
      QUIT: (socket) => { socket.write("221 Service closing control connection. \r\n") }
    }
    
    if(directives[command] === undefined) {
      socket.write("5XX unsupported command \r\n");
    }

  });

    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
