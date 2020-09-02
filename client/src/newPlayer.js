const newPlayer = (socket, player) => {
    socket.on('connect', () => {
        socket.emit('new-player', {
            x: player.position.x,
            y: player.position.y,
            angle: player.rotation
        })
    })
}

export default newPlayer