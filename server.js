const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل: ' + socket.id);

    // استقبال وإرسال الرسائل
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data); 
    });

    // إشارات الفيديو (WebRTC Signaling)
    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));

    socket.on('disconnect', () => {
        console.log('مستخدم فصل الاتصال');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`السيرفر شغال على منفذ ${PORT}`));
