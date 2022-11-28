
//Key: Room id Value: List of users
var rooms = {}

var socketToRooms = {}

var roomsVotingSystem = {}

const createRoom = (userName, votingSystem, socketId) => {
    var roomId = makeid(5)
    rooms[roomId] = [{userName:userName, socketId:socketId, vote:-1}];
    roomsVotingSystem[roomId] = votingSystem 
    socketToRooms[socketId] = roomId
    var createdRoomId = roomId;
    return createdRoomId;
}

const joinRoom = (userName, roomId, socketId, isVisitor) => {
    
    if(typeof rooms[roomId] === "undefined"){
        return "RoomNotExist"
    }

    if(!isVisitor && rooms[roomId].length == 12){
        return "RoomFull"
    }

    usersSameName = rooms[roomId].filter(item => { return item.userName == userName})
    if(usersSameName.length !== 0){
        return "UserNameAlreadyExist"
    }

    rooms[roomId] = [...rooms[roomId], {userName:userName, socketId:socketId, vote:-1, isVisitor: isVisitor}]


    socketToRooms[socketId] = roomId

    return {users: rooms[roomId], votingSystem: roomsVotingSystem[roomId]}
}

const sendVote = (userName, roomId, vote) => {
    rooms[roomId].find( value => {
        return value.userName == userName 
    }).vote = vote

    return rooms[roomId]
}

const resetRoom = (roomId) => {
    rooms[roomId].forEach(element => {
        element.vote = -1
    });

    return rooms[roomId]
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function getSocketRoom (socketId) {

    roomId = socketToRooms[socketId];

    return roomId;
}

function handleSocketDisconnection (socketId) {

    if (socketToRooms.hasOwnProperty(socketId)) {
        roomId = socketToRooms[socketId];
        delete (socketToRooms[socketId]);

        roomSockets = rooms[roomId];

        var roomResult = roomSockets.filter(obj => {
            return obj.socketId !== socketId;
        })

        rooms[roomId] = roomResult

        if (rooms[roomId].length != 0) {
            return rooms[roomId];
        }

        delete (rooms[roomId]);
        delete roomsVotingSystem[roomId]
        return []
    }

    return []
}

module.exports={createRoom, joinRoom, sendVote, resetRoom, handleSocketDisconnection, getSocketRoom}