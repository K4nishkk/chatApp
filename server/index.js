const express = require('express'); // node.js middleware for managing servers and routes
const socketio = require('socket.io'); // websocket functionality
const http = require('http'); // for creating http server that listens to server ports and gives a response back to the client
const cors = require('cors'); // creates CORS header for cross-origin requests

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000; // specify port

const router = require('./router');

const app = express(); // create a express application
const server = http.createServer(app);
const io = socketio(server,  // instance of socketio
    {
        cors:{
            origin:"*"
        }
    });

io.on('connection', (socket) => { // on 'connection' event, 'socket' websocket object is returned
    socket.on('join', ({name, room}, callback) => {
        const { error, user } = addUser({ id:socket.id, name, room });

        if (error) return callback(error);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`}); // welcome message to user
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!`}); // welcome message to other participants

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.`})
        }
    });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`)); // make the server running