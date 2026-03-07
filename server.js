const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let usersInRooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        socket.join(data.roomID);
        socket.roomID = data.roomID;
        socket.userName = data.user;

        if (!usersInRooms[data.roomID]) usersInRooms[data.roomID] = [];
        usersInRooms[data.roomID].push({ id: socket.id, name: data.user });

        io.to(data.roomID).emit('update-users', usersInRooms[data.roomID]);
    });

    socket.on('chat-message', (data) => {
        io.to(data.roomID).emit('chat-message', data);
    });

    socket.on('request-call', (data) => {
        io.to(data.to).emit('incoming-call', { fromName: socket.userName, fromId: socket.id });
    });

    socket.on('disconnect', () => {
        if (socket.roomID && usersInRooms[socket.roomID]) {
            usersInRooms[socket.roomID] = usersInRooms[socket.roomID].filter(u => u.id !== socket.id);
            io.to(socket.roomID).emit('update-users', usersInRooms[socket.roomID]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));