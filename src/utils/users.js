const users = []

const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for user if exists
    const existUser = users.find((user) => { //gets an item array back
        return user.room === room && user.username === username
    })

    if(existUser){
        return {
            error: 'This username is already taken. Choose another one'
        }
    }

    //store the user
    const user = {id, username, room}
    users.push(user)
    return {user}
}
const removeUser = (id) => { //get back the position of the array item
    const index = users.findIndex((user) => {
        return user.id  === id
    })
    if(index !== -1){
        return users.splice(index, 1)[0] //remove the item and get back an array. [0] to get back an object
    }
} 

const getUser = (id) => {
    return users.find((user) => user.id === id) // shorthand syntax
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room) // shorthand syntax
}

addUser({
    id: 223,
    username: 'Andi',
    room: 'Kola'
})

addUser({
    id: 224,
    username: 'Loku',
    room: 'Kola'
})

addUser({
    id: 225,
    username: 'Andi',
    room: 'Pepsi'
})

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom

}