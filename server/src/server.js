import { createServer } from "net";

export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);
    
      const directives = {
        USER: (socket) => { 
          socket.write("230 User logged in, proceed. \r\n") 
        },
        PASS:(socket) => { 
          socket.write("230 User logged in, proceed. \r\n") 
        },
        LIST:(socket) => { 
          socket.write("125 Data connection already open; transfer starting. \r\n") 
        },
        CWD: (socket) => { 
          socket.write("250 Requested file action okay, completed. \r\n") 
        },
        RETR: (socket) => { 
          socket.write(" \r\n") 
        },
        STOR: (socket) => { 
          socket.write(" \r\n") 
        },
        PWD: (socket) => { 
          socket.write("257 /users/hubert \r\n") 
        },
        HELP: (socket) => { 
          socket.write("214 Help message. \r\n") 
        },
        QUIT: (socket) => { 
          socket.write("221 Service closing control connection. \r\n")
          socket.end(); 
        }
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
