const playerMovement = otherPlayers => {
    for(let id in otherPlayers){
        let player = otherPlayers[id]
        if(player.x !== undefined){
            player.position.x += (player.x - player.position.x) * 0.30
            player.position.y += (player.x - player.position.y) * 0.30

            let angle = player.rotation
        }
    }
}



export default playerMovement