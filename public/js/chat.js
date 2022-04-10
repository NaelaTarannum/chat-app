const socket = io()
const $message = document.querySelector('#message')
const $messageButton = document.querySelector('#submit')
const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix: true}) //makes sure the question goes away
const autoscroll =()=>{
    // New message
    const $newMessage = $messages.lastElementChild
    //get the height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMesasageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMesasageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of messages container
    const contentHeight = $messages.scrollHeight
    //how far have I scrolled
    const scrollOffset = $messages.scrollTop +visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message',(message)=>{
  
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username:message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('rooms',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,users
    })
    document.getElementById('sidebar').innerHTML = html
})
// document.querySelector('#count').addEventListener('click',()=>{
//     console.log('CLicked')
//     socket.emit('increment')
// })
document.querySelector('#submit').addEventListener('click',()=>{
    $messageButton.setAttribute('disabled','disabled');
    const message = document.getElementById('message').value;
    socket.emit('sendMessage',message,(acknoledgment)=>{
        $messageButton.removeAttribute('disabled',false)
        $message.value = ''
        $message.focus()
        console.log(acknoledgment)
    });
})
document.querySelector('#location').addEventListener('click',()=>{
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation',`latitude : ${position.coords.latitude},longitude:${position.coords.longitude}`)
    })
})
socket.emit('join',{username,room},(error)=>{
if(error)
{
    alert(error)
    location.href = '/'
}
})