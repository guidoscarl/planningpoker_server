const express = require('express');
const socket = require('socket.io');
const colors = require('colors');
const cors = require('cors');
const {createRoom, joinRoom, sendVote, resetRoom} = require("./models/Rooms");
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
    console.log("connected "+socket.id)

    socket.on("createRoom", (username) => {

        console.log("created room for "+ username)
        var roomId = createRoom(username, socket.id);
        socket.join(roomId)
        socket.emit('roomCreated', roomId)
        
    }),
    socket.on("joinRoom", (data) => {
        console.log("joined "+ data.userName + " " + data.roomId)
        socket.join(data.roomId)
        var allUsers = joinRoom(data.userName, data.roomId, socket.id)
        io.to(data.roomId).emit('userJoined', (allUsers))
        console.log("broadcast to "+ data.roomId)
        console.log(allUsers)
    });
   
    socket.on("sendVote", (data) => {
        console.log(data)
        var allUsers = sendVote(data.userName, data.roomId, data.vote)
        console.log(allUsers)
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
        console.log(data.roomName)
    })
})