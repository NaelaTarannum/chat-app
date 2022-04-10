const users = []
//add user
const addUser =({id,username,room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //validate the data
    if(!username || !room){
        return {
            error:'Username and room are required'
        }
    }
    //check for existing username
    const existinguser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    //validate user name
    if(existinguser){
        return {
            error:'Username is in use'
        }
    }
    //store user
    const user = {id,username,room}
    users.push(user)
    return {user};
}

const getUser = (id)=>{
return users.find((user)=> user.id === id)
}

const getUsersInRoom = (room)=>{
    if(!room){
        return {
            error:'Please specify a valid room name'
        }
    }
        return users.filter((user)=> user.room == room)
    
}
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
            return user.id == id
        })
        if(index !== -1){
            return users.splice(index,1)[0]
        }
}
module.exports = {addUser,getUser,getUsersInRoom,removeUser}