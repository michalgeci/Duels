// import './peerjs.min.js'

export class Communication {
  constructor() {

    // Observe methods (SHARED)
    this.onRestart = () => {}
    this.onReady = () => {}
    this.onReceiveEarly = () => {}
    this.onOpponentReactionTime = () => {}
    this.onGoodbye = () => {}

    // (HOST)
    this.onCreatedServer = () => {}
    this.onGuestConnected = () => {}

    // (GUEST)
    this.onConnectToHost = () => {}
    this.onPrepareGame = () => {}

    // Check query
    let queryPeerId = this.getPeerId()
    if (queryPeerId) {
      this.isHost = false
    } else {
      this.isHost = true
    }

    // Create peer + peer connection
    this.peer = new Peer()
    this.peer.on('open', (myId) => {
      if (this.isHost) {
        this.urlForShare = document.location.href + "?peer=" + myId
        this.onCreatedServer(this.urlForShare)

        this.peer.on('connection', (connection) => {
          this.connection = connection
          this.onGuestConnected()
          this.setCallbacks()
        })
      } else {
        this.connection = this.peer.connect(queryPeerId)
        this.connection.on('open', ()=>{
          this.onConnectToHost()
          this.setCallbacks()
        })
      }
    })
  }

  getPeerId = () => {
    let params = (new URL(document.location)).searchParams;
    return params.get("peer")
  }

  setCallbacks = () => {
    this.connection.on('data', (data) => {
      if (data === "ready") {
        this.onReady()
      }

      if (data === "restart") {
        this.onRestart()
      }

      if (data === "early") {
        this.onReceiveEarly()
      }

      if (data === "goodbye") {
        this.onGoodbye()
      }

      if (data.hasOwnProperty('steadyTime')) {
        this.onPrepareGame(data)
      }

      if (data.hasOwnProperty('reactionTime')) {
        this.onOpponentReactionTime(data.reactionTime)
      }
    })
  }

  sendReady = () => {
    this.connection.send("ready")
  }

  sendRestart = () => {
    this.connection.send("restart")
  }

  sendGameInitInfo = (steadyTime, fireTime) => {
    this.connection.send({"steadyTime": steadyTime, "fireTime": fireTime})
  }

  sendReactionTime = (reactionTime) => {
    this.connection.send({"reactionTime": reactionTime})
  }

  sendEarly = () => {
    this.connection.send("early")
  }

  sendGoodbye = () => {
    this.connection.send("goodbye")
  }

}