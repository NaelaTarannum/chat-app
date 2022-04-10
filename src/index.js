const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app)
const io = socketio(server) //socket io expects to be called with raw http server
const Filter = require('bad-words');
const path = require('path');
const {generateMessage} = require('../utils/messages')
const {addUser,getUser,getUsersInRoom,removeUser} = require('../utils/users')
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname,'../public')));//customise your server

io.on('connection',(socket)=>{
    console.log('new connection in page')
    

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        if(user) {
            const filter = new Filter()
            if(filter.isProfane(message))
            {
                return callback("Profanity is not allowed")
            }
            io.to(user.room).emit('message',generateMessage(user.username,message))
            callback("Delivered")
        }

    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`))
        io.to(user.room).emit('rooms',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })

        }
    })
    socket.on('sendLocation',(cords)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("message",generateMessage(user.username,cords))
    })
    socket.on('join',({username,room},callback)=>{
        console.log("here");
        const {error,user}=addUser({id:socket.id,username,room});
        console.log(error)
        if(error){
            return callback(error)
        }
        console.log(user)
        socket.join(user.room)

        socket.emit('message',generateMessage("Admin",'Hi There'));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} has joined`))
        io.to(user.room).emit('rooms',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback();
    })

})


app.get('',(req,res)=>{
    res.render('index')
});

server.listen(PORT,()=>{
    console.log(`App listening on PORT ${PORT}`)
})