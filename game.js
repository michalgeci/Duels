export class Game {
  constructor() {
    this.player1_state = this.states.MISSING
    this.player2_state = this.states.MISSING
    this.iAmPlayer1 = null
    this.t0 = null
    this.t1 = null
    this.myReactionTime = null
    this.opponentReactionTime = null
    this.timer1 = null
    this.timer2 = null
  }

  getMyState = () => {
    return this.iAmPlayer1 ? this.player1_state : this.player2_state
  }

  getOpponentState = () => {
    return this.iAmPlayer1 ? this.player2_state : this.player1_state
  }

  setOpponentState = (state) => {
    if (this.iAmPlayer1) {
      this.player2_state = state
    } else {
      this.player1_state = state
    }
  }

  setMyState = (state) => {
    if (this.iAmPlayer1) {
      this.player1_state = state
    } else {
      this.player2_state = state
    }
  }

  states = {
    "MISSING": 0,
    "RESTART": 1,
    "READY": 2,
    "PLAYING": 3,
    "EARLY": 4,
    "FIRED": 5,
    "WIN": 6,
    "LOST": 7
  }
}