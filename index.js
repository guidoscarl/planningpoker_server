const express = require('express');
const socket = require('socket.io');
const colors = require('colors');
const cors = require('cors');
const { createRoom, joinRoom, sendVote, resetRoom, handleSocketDisconnection, getSocketRoom } = require("./models/Rooms");
const { all } = require('express/lib/application');

var app = express()
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', ["https://planningpoker-c.herokuapp.com/", "http://planningpoker-c.herokuapp.com/"]);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
}
);
var server = app.listen(process.env.PORT || 5000, () => { console.log("server started") });

const io = socket(server, {
    cors: {
        origin: ["https://planningpoker-c.herokuapp.com", "http://planningpoker-c.herokuapp.com/"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.on("connection", (socket) => {

    socket.on("createRoom", (username, votingSystem) => {
        var roomId = createRoom(username, votingSystem, socket.id);
        console.log(votingSystem)
        socket.join(roomId)
        socket.emit('roomCreated', roomId)
    }),

    socket.on("joinRoom", (data) => {
        var result = joinRoom(data.userName, data.roomId, socket.id)
        if (result === "RoomNotExist") {
            io.to(socket.id).emit("RoomNotExist")
        }
        else if (result === "RoomFull") {
            io.to(socket.id).emit("RoomFull")
        }
        else if (result === "UserNameAlreadyExist") {
            io.to(socket.id).emit("UserNameAlreadyExist")
        }
        else {
            socket.join(data.roomId)
            io.to(data.roomId).emit('userJoined', (result))
        }
    });

    socket.on("sendVote", (data) => {
        var allUsers = sendVote(data.userName, data.roomId, data.vote)
        io.to(data.roomId).emit("sendedVote", allUsers)
    })

    socket.on("revealCard", (roomId) => {
        io.to(roomId).emit("cardRevealed")
    })

    socket.on("newVote", (roomId) => {
        var allUsers = resetRoom(roomId)
        io.to(roomId).emit("newVoteRequested", allUsers)
    })

    socket.on("disconnect", (data) => {
        roomId = getSocketRoom(socket.id)
        allUsers = handleSocketDisconnection(socket.id)
        io.to(roomId).emit("userDisconnected", allUsers)
    })
})