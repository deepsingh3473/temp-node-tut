const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,"public")));
const botName = "ChatCord Bot";

io.on("connection", (socket)=>{

    socket.on("joinRoom", ({username, room})=>{
        
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has join the chat.`));

        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })

    socket.on("chatMessage", (msg)=>{

        const user = getCurrentUser(socket.id);
        const message = formatMessage(user.username, msg);
        io.to(user.room).emit("message", message);
    });

    socket.on("disconnect", ()=>{

        const user = userLeave(socket.id);
        if(user){
            socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat.`));

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=>{
    console.log(`Server is running on port : ${PORT}`);
});