const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages') 
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express() // call the express function to generate an new application
const server = http.createServer(app) // create the server outside of the express library and configuring it using express app
const io = socketio(server) // create socket. io instance which expects to be called with a http server

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public') // returns the public path
app.use(express.static(publicDirectoryPath)) // configure our express application on the public folder

io.on('connection', (socket) => { // socket is an object and contains information about the new connection
    console.log('New Websocket connection')

    socket.on('join', ({username, room}, callback) => { //allows us to joing a given chatroom , we emit event to just that room
        const {error, user} = addUser({id:socket.id, username, room}) // emit.id -> every single connection have an unique id associated with it
        if(error){
            return callback(error)
        }

        socket.join(room)
        
        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(room).emit('message', generateMessage('System', `${username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback() //let the client know that they were able to join
    }) 
    
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })
    socket.on('sendLocation', (coords , callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) // send the geolocation information
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('System', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

