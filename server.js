const http = require('http')
const app = require('./config')
const Server = http.Server(app)
const PORT = process.env.PORT || 8000
const io = require('socket.io')(Server)

Server.listen(PORT, () => console.log('Game server running away on: ', PORT))

const players = {}

//on player connection
io.on('connection', socket => {
    socket.on('new-player', state => {
        console.log('New player ' + socket.id +  ' joined with : ', state)
        players[socket.id] = state
        io.emit('update-players', players)
    })

    socket.on('disconnect', state => {
        delete players[socket.id]
        io.emit('update-players', players)
    })
    //when a move is detected
    socket.on('move-player', data => {
        console.log(socket.id + ' move detected: ', data)
        if (players[socket.id] === undefined){
            return
        }
        players[socket.id].x = data.position.x
        players[socket.id].y = data.position.y
        players[socket.id].angle = data.rotation

        io.emit('update-players', players)
    })

})