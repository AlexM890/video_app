let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
let client = {}
//get stream
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject = stream
        video.play()

        // used to initialize a peer
        function InitPeer(type){
            let peer = new Peer({initiator:(tpye == 'init')?true: false, stream:stream, trickle:false})
            peer.on('stream', function(stream){
                CreateVideo(stream)
            })
            peer.on('close', function(){
                document.getElementById('peerVideo').remove()
                peer.destroy()
            })
            return peer
        }

        //for peer of type init..sends a request for a peer
        function MakePeer(){
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function(data){
                if(!client.gotAnswer){
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }

        //for peer type not init..when we get an offer from a client we send an answer
        function FrontAnswer(offer){
            let peer = InitPeer('notInit')
            peer.on('signal', (data)=>{
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        function SignalAnswer(answer){
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function CreateVideo(stream){
            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.class = 'embed-responsive-item col-12'
            document.getElementById('peerDiv').appendChild(video)
            video.play()
        }

        function SessionActive(){
            document.write('session Active. Please come back later')
        }

        socket.on('backOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)

    })
    .catch(eer => document.write(err))