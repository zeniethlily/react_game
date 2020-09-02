import Ship from './Ship'

const updatePlayers = (socket, otherPlayers, game) => {
    socket.on('update-players', playersData => {
        let playersFound = {}

        for(let index in playersData){
            const data = playersData[index]
            if(otherPlayers[index] === undefined && index !== socket.id){
                //create new ship if it isn't already created
                let othership = new Ship({
                    position: {
                      x: data.x,
                      y: data.y
                    },
                    //create: this.createObject.bind(this),
                    //onDie: this.gameOver.bind(this)
                  });
                  //this.createObject(othership, 'othership');
                  otherPlayers[index] = othership
            }
            playersFound[index] = true

            if(index !== socket.id) {
                //update players positions
                otherPlayers[index].x = data.x
                otherPlayers[index].y = data.y
                otherPlayers[index].rotation = data.angle
            }
        }
        for(let id in otherPlayers){
            if(!playersFound[id]){
                //delete missing players here
            }
        }
    })
}

export default updatePlayers