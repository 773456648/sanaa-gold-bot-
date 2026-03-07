const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// مخزن لبيانات المستخدمين في كل غرفة
let rooms = {};

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل: ' + socket.id);

    socket.on('join-room', (data) => {
        const { roomID, user, pId } = data;
        
        socket.join(roomID);
        socket.roomID = roomID;
        socket.userName = user;
        socket.peerId = pId; // هذا هو المفتاح العالمي للاتصال

        if (!rooms[roomID]) {
            rooms[roomID] = [];
        }

        // إضافة المستخدم مع الـ Peer ID الخاص به
        rooms[roomID].push({
            id: socket.id,
            name: user,
            peerId: pId
        });

        // تحديث القائمة لكل اللي في الغرفة
        io.to(roomID).emit('update-users', rooms[roomID]);
        console.log(`فادي، ${user} دخل الغرفة ${roomID} بمفتاح: ${pId}`);
    });

    socket.on('disconnect', () => {
        if (socket.roomID && rooms[socket.roomID]) {
            rooms[socket.roomID] = rooms[socket.roomID].filter(u => u.id !== socket.id);
            io.to(socket.roomID).emit('update-users', rooms[socket.roomID]);
        }
        console.log('مستخدم غادر المنظومة');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`💎 Fadi Pro System is Live on Port ${PORT}`);
});