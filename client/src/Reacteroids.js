import React, { Component } from 'react'
import Ship from './Ship';
import { randomNumBetweenExcluding } from './helpers'
import newPlayer from './newPlayer'
//import updatePlayers from './updatePlayers'
import playerMovement from './playerMovement'
import openSocket from 'socket.io-client'


const socket = openSocket('http://localhost:8000')
let otherPlayers = {}

const KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP: 38,
    A: 65,
    D: 68,
    W: 87,
    SPACE: 32
  };


export class Reacteroids extends Component {
    constructor() {
        super();
        this.state = {
          screen: {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1,
          },
          context: null,
          keys : {
            left  : 0,
            right : 0,
            up    : 0,
            down  : 0,
            space : 0,
          },
          asteroidCount: 3,
          currentScore: 0,
          topScore: localStorage['topscore'] || 0,
          inGame: false
        }
        this.ship = [];
        //this.asteroids = [];
        //this.bullets = [];
        this.particles = [];
        this.otherShip = [];
    }
    
    handleResize(value, e){
        this.setState({
          screen : {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1,
          }
        });
    }

    handleKeys(value, e){
        let keys = this.state.keys;
        if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
        if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
        if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
        if(e.keyCode === KEY.SPACE) keys.space = value;
        this.setState({
          keys : keys
        });
    }

    componentDidMount() {
        window.addEventListener('keyup',   this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
        window.addEventListener('resize',  this.handleResize.bind(this, false));
    
        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context });
        this.startGame();
        requestAnimationFrame(() => {this.update()});
    }
    
    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKeys);
        window.removeEventListener('keydown', this.handleKeys);
        window.removeEventListener('resize', this.handleResize);
    }

    updatePlayers(socket, otherPlayers){
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
                      create: this.createObject.bind(this),
                      onDie: this.gameOver.bind(this)
                    });
                    this.createObject(othership, 'ship');
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
                  otherPlayers[id].destroy();
              }
          }
      })
  }


    emitPlayerData() {
        //console.log("emitting move", this.ship[0])
        socket.emit('move-player', this.ship[0])
    }

    //game loop
    update() {
        const context = this.state.context;
        const keys = this.state.keys;
        const ship = this.ship[0];
        if((ship.velocity.x > 0.1 || ship.velocity.x < -0.1) || (ship.velocity.y > 0.1 || ship.velocity.y < -0.1)){
        this.emitPlayerData()
        }
        playerMovement(otherPlayers)

        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
    
        // Motion trail
        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;
    
        // Next set of asteroids
        // if(!this.asteroids.length){
        //   let count = this.state.asteroidCount + 1;
        //   this.setState({ asteroidCount: count });
        //   this.generateAsteroids(count)
        // }
    
        // Check for colisions
        // this.checkCollisionsWith(this.bullets, this.asteroids);
        // this.checkCollisionsWith(this.ship, this.asteroids);
    
        // Remove or render
        this.updateObjects(this.particles, 'particles')
        // this.updateObjects(this.asteroids, 'asteroids')
        // this.updateObjects(this.bullets, 'bullets')
        this.updateObjects(this.ship, 'ship')
    
        context.restore();
    
        // Next frame
        requestAnimationFrame(() => {this.update()});
    }
    

    //runs once when game starts
    startGame(){
        this.setState({
          inGame: true,
          currentScore: 0,
        });
        
    
        // Make ship
        let ship = new Ship({
          position: {
            x: this.state.screen.width/2,
            y: this.state.screen.height/2
          },
          create: this.createObject.bind(this),
          onDie: this.gameOver.bind(this)
        });
        this.createObject(ship, 'ship');
        newPlayer(socket, ship)
        this.updatePlayers(socket, otherPlayers)
        
    
        // Make asteroids
        //this.asteroids = [];
        //this.generateAsteroids(this.state.asteroidCount)
    }
      
    gameOver(){
      this.setState({
        inGame: false,
      });
  
      // Replace top score
      if(this.state.currentScore > this.state.topScore){
        this.setState({
          topScore: this.state.currentScore,
        });
        localStorage['topscore'] = this.state.currentScore;
      }
    }

    createObject(item, group){
        this[group].push(item);
    }
    
    updateObjects(items, group){
        let index = 0;
        for (let item of items) {
          if (item.delete) {
            this[group].splice(index, 1);
          }else{
            items[index].render(this.state);
          }
          index++;
        }
    }
    
    checkCollisionsWith(items1, items2) {
        var a = items1.length - 1;
        var b;
        for(a; a > -1; --a){
          b = items2.length - 1;
          for(b; b > -1; --b){
            var item1 = items1[a];
            var item2 = items2[b];
            if(this.checkCollision(item1, item2)){
              item1.destroy();
              item2.destroy();
            }
          }
        }
    }
    
    checkCollision(obj1, obj2){
        var vx = obj1.position.x - obj2.position.x;
        var vy = obj1.position.y - obj2.position.y;
        var length = Math.sqrt(vx * vx + vy * vy);
        if(length < obj1.radius + obj2.radius){
          return true;
        }
        return false;
    }

    render() {
        return (
            <div>
                <canvas ref="canvas"
                    width={this.state.screen.width * this.state.screen.ratio}
                    height={this.state.screen.height * this.state.screen.ratio}
                />
            </div>
        )
    }
}