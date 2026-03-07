const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let usersMap = {}; 

io.on('connection', (socket) => {
    socket.on('join-room', (data) => {
        socket.join(data.roomID);
        socket.roomID = data.roomID;
        socket.userName = data.user;

        if (!usersMap[data.roomID]) usersMap[data.roomID] = [];
        usersMap[data.roomID].push({ id: socket.id, name: data.user });

        io.to(data.roomID).emit('update-users', usersMap[data.roomID]);
    });

    socket.on('chat-message', (data) => {
        io.to(data.roomID).emit('chat-message', data);
    });

    socket.on('call-request', (data) => {
        io.to(data.to).emit('incoming-call', { fromName: socket.userName, fromId: socket.id });
    });

    socket.on('call-accept', (data) => {
        io.to(data.to).emit('call-accepted', { fromId: socket.id });
    });

    socket.on('webrtc-signal', (data) => {
        io.to(data.to).emit('webrtc-signal', { signal: data.signal, fromId: socket.id });
    });

    socket.on('disconnect', () => {
        if (socket.roomID && usersMap[socket.roomID]) {
            usersMap[socket.roomID] = usersMap[socket.roomID].filter(u => u.id !== socket.id);
            io.to(socket.roomID).emit('update-users', usersMap[socket.roomID]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Fadi Pro System is running on ${PORT}`));