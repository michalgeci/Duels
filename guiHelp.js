import {assets} from './data.js'

export class GuiHelp {

  /**
   * @param {HTMLElement[]} rows 
   */
  constructor (rows) {
    this.rows = rows
    this.assignScene(assets.background)
  }


  /**
   * Assign full scene
   * @param {string[]} scene 
   */
  assignScene = (scene) => {
    var i = 0
    for (const r of scene) {
      this.rows[i].innerHTML = r
      i++
    }
  }


  /**
   * Add element to scene at coordinates
   * @param {string[]} addedElement 
   * @param {Number} x 
   * @param {Number} y 
   */
  addToScene = (addedElement, x, y) => {
    for (let rowIdx = 0; rowIdx < addedElement.length; rowIdx++) {
      this.rows[rowIdx+y].innerHTML = this.replaceAt(this.rows[rowIdx + y].innerHTML, x, addedElement[rowIdx])
    }
  }


  /**
   * Add element to scene at coordinates
   * @param {string[]} origin 
   * @param {string[]} addedElement 
   * @param {Number} x 
   * @param {Number} y 
   */
   addToSceneOrigin = (origin, addedElement, x, y) => {
    for (let rowIdx = 0; rowIdx < addedElement.length; rowIdx++) {
      this.rows[rowIdx+y].innerHTML = this.replaceAt(origin[rowIdx + y], x, addedElement[rowIdx])
    }
  }


  /**
   * Replace part of string from given index, dont change length of original string
   * @param {strig} text 
   * @param {Number} index 
   * @param {string} replacement 
   */
  replaceAt = (text, index, replacement) => {
    var idx
    var repl
    if (index < 0) {
      idx = 1
      repl = replacement.substr(index * -1, replacement.length)
    } else {
      idx = index
      repl = replacement
    }
  
    return (text.substr(0, idx) + repl + text.substr(idx + repl.length)).substr(0, text.length - 0);
  }


  executeInIntervals = (interval, repeats, callback) => {
    callback(0)
    var i = 1
    let toExecute = () => setTimeout(() => {
      callback(i)
      if (i<repeats) {
        toExecute()
        i++
      }
    }, interval)

    toExecute()
  }


  // ANIMATION METHODS

  animateReady = () => {
    let textTength = assets.ready[0].length
    this.executeInIntervals(40, 12, (step) => {
      this.addToSceneOrigin(assets.background, assets.ready, step * 6 - textTength - 5, 3)
    })
  }


  animateSteady = () => {
    let textTength = assets.steady[0].length
    this.executeInIntervals(40, 12, (step) => {
      this.addToSceneOrigin(assets.background, assets.steady, step * 6 - textTength - 1, 3)
    })
  }


  animateFire = () => {
    let x = 16
    let y = 3
    
    this.addToSceneOrigin(assets.background, assets.fire1, x, y)
    let t0 = performance.now();

    setTimeout(()=>{
      this.addToSceneOrigin(assets.background, assets.fire2, x, y)
      setTimeout(()=>{
        this.addToSceneOrigin(assets.background, assets.fire1, x, y)
      }, 100)
    }, 100)
    
    return t0
  }

  showDefeat = () => {
    this.addToSceneOrigin(assets.background, assets.defeat, 15, 3)
  }

  showVictory = () => {
    this.addToSceneOrigin(assets.background, assets.victory, 18, 3)
  }

  showDraw = () => {
    this.addToSceneOrigin(assets.background, assets.draw, 16, 3)
  }

  removeText = () => {
    this.addToSceneOrigin(assets.background, [" ", " ", " ", " ", " ", " "], 3, 3)
  }

  removeGuy1 = () => {
    this.addToScene(["     ", "     ", "     "], 2, 26)
  }

  removeGuy2 = () => {
    this.addToScene(["     ", "     ", "     "], 70, 26)
  }

  standbyGuy1 = () => {
    this.addToScene(assets.guy1_standby, 2, 26)
  }

  standbyGuy2 = () => {
    this.addToScene(assets.guy2_standby, 70, 26)
  }

  prepareGuy1 = () => {
    this.addToScene(assets.guy1_shoot[0], 2, 26)
  }

  prepareGuy2 = () => {
    this.addToScene(assets.guy2_shoot[0], 70, 26)
  }

  missGuy1 = () => {
    this.addToScene(assets.guy1_missed, 2, 26)
  }

  missGuy2 = () => {
    this.addToScene(assets.guy2_missed, 70, 26)
  }

  animateWin1 = () => {
    this.executeInIntervals(80, 6, (i) => {
      this.addToScene(assets.guy1_shoot[i], 2, 26)
      this.addToScene(assets.guy2_dead[i], 70, 26)
    })
  }

  animateWin2 = () => {
    this.executeInIntervals(80, 6, (i) => {
      this.addToScene(assets.guy1_dead[i], 2, 26)
      this.addToScene(assets.guy2_shoot[i], 70, 26)
    })
  }

  showMyReactionTime = (myTime) => {
    this.addToScene(["My reaction time: " + myTime + " ms"], 27, 27)
  }

  showOpponentReactionTime = (opponentTime) => {
    this.addToScene(["Opponent reaction time: " + opponentTime + " ms"], 21, 28)
  }

  removeReactionTimes = () => {
    this.addToScene(["                                 ", "                                 "], 21, 27)
  }
}
