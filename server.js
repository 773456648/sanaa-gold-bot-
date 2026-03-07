const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تشغيل الملفات من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // دخول المستخدم لغرفة خاصة
    socket.on('join-room', (data) => {
        socket.join(data.roomID);
        socket.roomID = data.roomID;
        console.log(`مستخدم دخل الغرفة: ${data.roomID}`);
        socket.to(data.roomID).emit('chat-message', { user: 'النظام', text: 'دخل مستخدم جديد للغرفة' });
    });

    // تبادل رسائل الشات
    socket.on('chat-message', (data) => {
        io.to(data.roomID).emit('chat-message', data);
    });

    // إشارات الفيديو WebRTC
    socket.on('offer', (data) => {
        socket.to(data.roomID).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomID).emit('answer', data.answer);
    });

    socket.on('candidate', (data) => {
        socket.to(data.roomID).emit('candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log('مستخدم غادر');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`السيرفر شغال تمام على منفذ ${PORT}`));