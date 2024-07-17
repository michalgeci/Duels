import { GuiHelp } from "./guiHelp.js";
import { Game } from "./game.js";
import { Communication } from "./communication.js";
import { startAt } from "./utils.js";

// Load rows from document
let rows = [];
for (let i = 0; i < 30; i++) {
  rows.push(document.getElementById("row" + i));
}

// Get element with url
let urlElement = document.getElementById("urlHelp");
let additionalInfo = document.getElementById("additional-info");

let hostScore = 0;
let clientScore = 0;

// Gui help class
let guiHelp = new GuiHelp(rows);
let game = new Game();
/** @type {Communication} */
var communication;
var guestUrl = "";

// TODO: remove later
window.game = game;
window.guiHelp = guiHelp;

// Restart game variables
let restartGame = () => {
  game.setMyState(game.states.RESTART);
  game.t0 = null;
  game.t1 = null;
  game.myReactionTime = null;
  game.opponentReactionTime = null;
  game.timer1 = null;
  game.timer2 = null;

  guiHelp.removeReactionTimes();
  guiHelp.removeText();
  if (game.iAmPlayer1) {
    guiHelp.standbyGuy1();
  } else {
    guiHelp.standbyGuy2();
  }

  guiHelp.setScore(hostScore, clientScore);
};

// #region - On loaded
let onPageLoad = () => {
  communication = new Communication();

  guiHelp.setScore(0, 0);

  // Determine which player I am
  if (communication.getPeerId()) {
    guiHelp.standbyGuy2();
    game.iAmPlayer1 = false;
  } else {
    guiHelp.standbyGuy1();
    game.iAmPlayer1 = true;
  }

  game.setMyState(game.states.RESTART);

  communication.onCreatedServer = (url) => {
    console.log(url);
    guestUrl = url;
    urlElement.innerHTML = url;
  };

  communication.onGuestConnected = () => {
    console.log("Guest connected");
    guiHelp.removeText();
    guiHelp.standbyGuy1();
    guiHelp.standbyGuy2();
    game.player1_state = game.states.RESTART;
    game.player2_state = game.states.RESTART;
    urlElement.innerHTML = "";
    clientScore = 0;
    hostScore = 0;
    guiHelp.setScore(hostScore, clientScore);
    guiHelp.removeReactionTimes();
    additionalInfo.innerHTML = "Press SPACE to START";
  };

  communication.onConnectToHost = () => {
    console.log("Connected to host");
    guiHelp.standbyGuy1();
    game.player1_state = game.states.RESTART;
    additionalInfo.innerHTML = "Press SPACE to START";
  };

  communication.onGoodbye = () => {
    game.setOpponentState(game.states.MISSING);
    if (game.iAmPlayer1) {
      // Player 1 is always a host
      guiHelp.removeGuy2();
      urlElement.innerHTML = guestUrl;
    } else {
      guiHelp.removeGuy1();
      additionalInfo.innerHTML =
        "Host left. :( ... <a href=" +
        location.origin +
        location.pathname +
        ">Wanna be the host? :)</a>";
    }
  };

  communication.onRestart = () => {
    game.setOpponentState(game.states.RESTART);
    if (game.iAmPlayer1) {
      guiHelp.standbyGuy2();
    } else {
      guiHelp.standbyGuy1();
    }
  };

  communication.onReady = () => {
    game.setOpponentState(game.states.READY);
    onBothReady();
    if (game.iAmPlayer1) {
      guiHelp.prepareGuy2();
    } else {
      guiHelp.prepareGuy1();
    }
  };

  communication.onReceiveEarly = () => {
    game.setOpponentState(game.states.EARLY);
    guiHelp.showOpponentReactionTime("n/a");
    if (game.iAmPlayer1) {
      guiHelp.missGuy2();
    } else {
      guiHelp.missGuy1();
    }
    onReactionTime();
  };

  communication.onPrepareGame = (prepareGameData) => {
    handleGameCountdown(prepareGameData);
  };

  communication.onOpponentReactionTime = (time) => {
    game.opponentReactionTime = time;
    guiHelp.showOpponentReactionTime(time);
    onReactionTime();
  };

  communication.peer.on("error", (err) => {
    if (err.type === "peer-unavailable") {
      additionalInfo.innerHTML =
        "Host is unavailable. :( ... <a href=" +
        location.origin +
        ">Wanna be the host? :)</a>";
    }
  });
};
// #endregion

// #region - Copy link to clipboard
let copyLinkToClipboard = () => {
  try {
    navigator.clipboard.writeText(urlElement.innerHTML);
    console.log("URL copied");

    var snackbar = document.getElementById("snackbar");
    snackbar.className = "show";
    setTimeout(function () {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
window.copyLinkToClipboard = copyLinkToClipboard;
// #endregion

// #region - On space pressed
let onSpacePressed = () => {
  console.log("hey ");
  if (additionalInfo.innerHTML == "Press SPACE to START") {
    additionalInfo.innerHTML = "";
  }

  // Guard if second player is present
  if (game.getOpponentState() === game.states.MISSING) {
    return;
  }

  // Set READY player
  if (
    game.getMyState() === game.states.RESTART &&
    (game.getOpponentState() === game.states.RESTART ||
      game.getOpponentState() === game.states.READY)
  ) {
    game.setMyState(game.states.READY);
    communication.sendReady();
    onBothReady();
    if (game.iAmPlayer1) {
      guiHelp.prepareGuy1();
    } else {
      guiHelp.prepareGuy2();
    }
    return;
  }

  // Fired early
  if (
    game.getMyState() === game.states.READY &&
    (game.getOpponentState() === game.states.READY ||
      game.getOpponentState() === game.states.EARLY)
  ) {
    communication.sendEarly();
    guiHelp.showMyReactionTime("n/a");
    game.setMyState(game.states.EARLY);
    if (game.iAmPlayer1) {
      guiHelp.missGuy1();
    } else {
      guiHelp.missGuy2();
    }
    onReactionTime();
    return;
  }

  // Fired normally
  if (game.getMyState() === game.states.PLAYING) {
    let reactionTime = Math.round(game.t1 - game.t0);
    communication.sendReactionTime(reactionTime);
    game.myReactionTime = reactionTime;
    guiHelp.showMyReactionTime(reactionTime);
    onReactionTime();
    return;
  }

  // After results
  if (
    game.getMyState() === game.states.WIN ||
    game.getMyState() === game.states.LOST
  ) {
    communication.sendRestart();
    restartGame();
  }
};
// #endregion

// #region - Handle ready animation + server countdown setup
let onBothReady = () => {
  if (
    game.player1_state === game.states.READY &&
    game.player2_state === game.states.READY
  ) {
    guiHelp.animateReady();
    if (game.iAmPlayer1) {
      let steadyTime = Date.now() + 1500;
      let fireTime = steadyTime + 500 + Math.round(Math.random() * 6000);
      communication.sendGameInitInfo(steadyTime, fireTime);
      console.log("sendFightData");
      handleGameCountdown({ steadyTime: steadyTime, fireTime: fireTime });
    }
  }
};
// #endregion

// #region - HANDLE GAME END
let onWin = () => {
  game.setMyState(game.states.WIN);
  game.setOpponentState(game.states.LOST);
  guiHelp.showVictory();
  if (game.iAmPlayer1) {
    guiHelp.animateWin1();
    hostScore += 1;
  } else {
    guiHelp.animateWin2();
    clientScore += 1;
  }
};

let onLose = () => {
  game.setMyState(game.states.LOST);
  game.setOpponentState(game.states.WIN);
  guiHelp.showDefeat();
  if (game.iAmPlayer1) {
    guiHelp.animateWin2();
    clientScore += 1;
  } else {
    guiHelp.animateWin1();
    hostScore += 1;
  }
};

let onDraw = () => {
  game.setMyState(game.states.LOST);
  game.setOpponentState(game.states.LOST);
  clearTimeout(game.timer1);
  clearTimeout(game.timer2);
  guiHelp.showDraw();
};
// #endregion

// #region - Comparing reaction times
let onReactionTime = () => {
  if (game.myReactionTime && game.opponentReactionTime) {
    if (game.myReactionTime < game.opponentReactionTime) {
      console.log("I win");
      onWin();
    } else if (game.myReactionTime > game.opponentReactionTime) {
      console.log("I lose");
      onLose();
    } else {
      console.log("DRAW");
      onDraw();
    }
  }

  if (game.getOpponentState() === game.states.EARLY && game.myReactionTime) {
    console.log("I win");
    onWin();
  }

  if (game.getMyState() === game.states.EARLY && game.opponentReactionTime) {
    console.log("I lose");
    onLose();
  }

  if (
    game.getMyState() === game.states.EARLY &&
    game.getOpponentState() === game.states.EARLY
  ) {
    console.log("Both EARLY");
    onDraw();
  }

  guiHelp.setScore(hostScore, clientScore);
};
// #endregion

// #region - Handle countdown
let handleGameCountdown = (prepareGameData) => {
  let steadyTime = prepareGameData.steadyTime;
  let fireTime = prepareGameData.fireTime;

  // At steady
  game.timer1 = startAt(steadyTime, () => {
    guiHelp.animateSteady();
  });

  // At fire
  game.timer2 = startAt(fireTime, () => {
    if (game.player1_state !== game.states.EARLY) {
      game.player1_state = game.states.PLAYING;
    }

    if (game.player2_state !== game.states.EARLY) {
      game.player2_state = game.states.PLAYING;
    }

    game.t0 = guiHelp.animateFire();
  });
};
// #endregion

// #region SET LISTENERS
// Listener space
document.body.onkeydown = (e) => {
  if (e.repeat) {
    return;
  }
  if (e.keyCode == 32) {
    game.t1 = performance.now();
    e.preventDefault();
    onSpacePressed();
  }
};

document.body.ontouchstart = (e) => {
  game.t1 = performance.now();
  onSpacePressed();
};

// Listener page load
document.addEventListener("DOMContentLoaded", onPageLoad, false);

// Listener to send peer disconnection
window.addEventListener("beforeunload", () => {
  communication.sendGoodbye();
  game.setOpponentState(game.states.MISSING);
});
// #endregion
