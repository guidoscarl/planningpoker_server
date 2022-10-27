const express = require('express');
const socket = require('socket.io');
const colors = require('colors');
const cors = require('cors');
const {createRoom, joinRoom, sendVote, resetRoom, handleSocketDisconnection, getSocketRoom} = require("./models/Rooms");
const { all } = require('express/lib/application');

var app = express()

var server = app.listen(5000, ()=>{console.log("server started")});

const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials:true
      }
});
io.on("connection", (socket)=>{

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
        else if (result === "RoomFull"){
            io.to(socket.id).emit("RoomFull")
        }
        else if (result === "UserNameAlreadyExist"){
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