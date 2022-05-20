const { comprobarJWT } = require("../helpers/comprobar-jwt");
const Usuario = require('../models/usuario');
const {registrarAmistad} = require('../controllers/sockets')


class Sockets {
    constructor(io){
        this.io = io;
        this.onlineUsers = [];
        this.socketsEvents();
        this.socketsMiddlewares();
    }

    socketsMiddlewares(){
        this.io.use((socket,next)=>{
          let {token} = socket.handshake.auth;
          let uid = comprobarJWT(token)

          if(uid){
            socket.uid = uid;
            return next();
          }

          console.log("Token rechazado");
          return next(new Error("Error de autenticación"));

;        })
    }

    socketsEvents(){
        this.io.on('connection',async(socket)=>{

        let {password,...user} = await Usuario.findById(socket.uid);
        console.log("Usuario Conectado", user);

        this.onlineUsers.push({...user,socketId:socket.id});        
        this.onlineFriends = [];

        //Notificacion a amigos
        for (const friend of user.friends) {
          let online =this.onlineUsers.find(u=>u.username==friend); 
          if(online){
            console.log(`El amigo de ${user.username}, ${friend} esta conectado`);
              this.io.to(online.socketId).emit('friendOnline',{username:user.username});
              this.onlineFriends.push(online);
          }
          else{
            console.log(`El amigo de ${user.username}, ${friend} NO esta conectado`);
          }
        }
        //Se envian amigos en linea del cliente
        socket.emit("onlineFriends",this.onlineFriends);
        
        socket.on("findMatch",()=>{
            console.log(user.username+" esta buscando partida");
            // Realizar matchmaking... estan solos
            //Incluye cancelar busqueda
        })
      
        socket.on("friendRequest",({username})=>{
              console.log(user.username +" le ha enviado una solicitud de amistad a "+username);

              if(user.friends.some(friendUsername=>friendUsername==username)){
                socket.emit('friendResponse',
                              { ok:false,
                                username,
                                msg:`${username} y tu ya son amigos`});
                return;
              }

              let newFriend = this.onlineUsers.find((u)=>u.username== username);
    
              if(newFriend){
                this.io.to(newFriend.socketId).emit('friendRequest',{username:user.username});
                console.log("Se envio la solicitud de amistad");
              }else{
                socket.emit('friendResponse',
                                { ok:false,
                                  username,
                                  msg:`${username} no esta en linea, intenta mas tarde`});
              }    
              //emit a ese username
          })
        
          socket.on("friendResponse",async(data)=>{
            let {username, response} = data;
            let newFriend = await Usuario.findOne({username});

            if(newFriend){
              registrarAmistad(socket.uid,newFriend._id);

              let friendOnline = this.onlineUsers.find((u)=>u.username== username); 

              this.io.to(friendOnline.socketId).emit('friendResponse',
                                { ok:true,
                                  username,
                                  msg:`${username} acepto tu solicitud de amistad`});

            }

          })
        socket.on("disconnect", () => {
          this.onlineUsers = this.onlineUsers.filter((user)=> user.socketId != socket.id);
          //Notificar a los amigos del cliente cuando se desconecta
          });
    })
  }
    
}

module.exports = {
  Sockets
}