//Key: Room id Value: List of users
var rooms = {}
const createRoom = (userName, socketId) => {
    var roomId = makeid(5)
    rooms[roomId] = [{userName:userName, socketId:socketId, vote:-1}];
    var createdRoomId = roomId;
    return createdRoomId;
}

const joinRoom = (userName, roomId, socketId) => {
    rooms[roomId] = [...rooms[roomId], {userName:userName, socketId:socketId, vote:-1}]
    return rooms[roomId]
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

module.exports={createRoom, joinRoom, sendVote, resetRoom}