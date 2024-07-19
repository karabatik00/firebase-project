const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const usernameInput = document.getElementById('usernameInput');
  const lobby = document.getElementById('lobby');
  const game = document.getElementById('game');
  const displayUsername = document.getElementById('displayUsername');
  const usernameField = document.getElementById('username');
  const confirmUsername = document.getElementById('confirmUsername');
  const openCreateRoomModal = document.getElementById('openCreateRoomModal');
  const openJoinRoomModal = document.getElementById('openJoinRoomModal');
  const createRoomModal = document.getElementById('createRoomModal');
  const joinRoomModal = document.getElementById('joinRoomModal');
  const closeCreateRoomModal = document.getElementById('closeCreateRoomModal');
  const closeJoinRoomModal = document.getElementById('closeJoinRoomModal');
  const confirmRoomCreation = document.getElementById('confirmRoomCreation');
  const confirmRoomJoin = document.getElementById('confirmRoomJoin');
  const roomNameField = document.getElementById('roomName');
  const roomCodeField = document.getElementById('roomCode');
  const gameInfo = document.getElementById('gameInfo');
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');
  const waitingMessage = document.getElementById('waitingMessage');
  const startGame = document.getElementById('startGame');
  const playerX = document.getElementById('playerX');
  const playerO = document.getElementById('playerO');
  const gameBoard = document.getElementById('gameBoard');
  const statusElement = document.getElementById('status');
  const openRestartGameModal = document.getElementById('openRestartGameModal');
  const openCloseRoomModal = document.getElementById('openCloseRoomModal');
  const closeRoomModal = document.getElementById('closeRoomModal');
  const restartGameModal = document.getElementById('restartGameModal');
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  const confirmCloseRoom = document.getElementById('confirmCloseRoom');
  const closeCloseRoomModal = document.getElementById('closeCloseRoomModal');
  const cancelRestartGame = document.getElementById('cancelRestartGame');
  const closeErrorModal = document.getElementById('closeErrorModal');

  let username = '';
  let roomCode = '';
  let currentPlayer = 'X';
  let board = ['', '', '', '', '', '', '', '', ''];
  let isGameOver = false;
  let isRoomOwner = false;
  let gameStarted = false;
  let restartVotes = 0;
  let restartRequested = false;

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
    setTimeout(() => {
      errorModal.classList.add('hidden');
    }, 3000);
  }

  confirmUsername.addEventListener('click', () => {
    username = usernameField.value.trim();
    if (username) {
      displayUsername.textContent = username;
      usernameInput.classList.add('hidden');
      lobby.classList.remove('hidden');
    } else {
      showError("Kullanıcı adı boş olamaz!");
    }
  });

  openCreateRoomModal.addEventListener('click', () => {
    createRoomModal.classList.remove('hidden');
    setTimeout(() => {
      createRoomModal.classList.add('fade-in');
    }, 10);
  });

  openJoinRoomModal.addEventListener('click', () => {
    joinRoomModal.classList.remove('hidden');
    setTimeout(() => {
      joinRoomModal.classList.add('fade-in');
    }, 10);
  });

  closeCreateRoomModal.addEventListener('click', () => {
    createRoomModal.classList.remove('fade-in');
    setTimeout(() => {
      createRoomModal.classList.add('hidden');
    }, 300);
  });

  closeJoinRoomModal.addEventListener('click', () => {
    joinRoomModal.classList.remove('fade-in');
    setTimeout(() => {
      joinRoomModal.classList.add('hidden');
    }, 300);
  });

  confirmRoomCreation.addEventListener('click', () => {
    const roomName = roomNameField.value.trim();
    if (roomName) {
      roomCode = generateRoomCode();
      firebase.database().ref(`rooms/${roomCode}`).set({
        roomName,
        players: {
          X: username
        },
        board: JSON.stringify(board),
        currentPlayer,
        isGameOver,
        owner: username,
        gameStarted: false,
        restartVotes: 0
      });
      isRoomOwner = true;
      lobby.classList.add('hidden');
      game.classList.remove('hidden');
      roomCodeDisplay.textContent = roomCode;
      waitingMessage.textContent = "Başka bir oyuncu bekleniyor...";
      updatePlayerList();
      listenToRoomChanges(roomCode);
      openCloseRoomModal.classList.remove('hidden');
      createRoomModal.classList.remove('fade-in');
      setTimeout(() => {
        createRoomModal.classList.add('hidden');
      }, 300);
    } else {
      showError("Oda adı boş olamaz!");
    }
  });

  confirmRoomJoin.addEventListener('click', () => {
    roomCode = roomCodeField.value.trim();
    if (roomCode) {
      const roomRef = firebase.database().ref(`rooms/${roomCode}`);
      roomRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          if (Object.keys(roomData.players).length < 2) {
            roomRef.child('players').update({
              O: username
            });
            lobby.classList.add('hidden');
            game.classList.remove('hidden');
            roomCodeDisplay.textContent = roomCode;
            updatePlayerList();
            listenToRoomChanges(roomCode);
            joinRoomModal.classList.remove('fade-in');
            setTimeout(() => {
              joinRoomModal.classList.add('hidden');
            }, 300);
          } else {
            showError("Oda dolu!");
          }
        } else {
          showError("Oda bulunamadı!");
        }
      });
    } else {
      showError("Oda kodu boş olamaz!");
    }
  });

  startGame.addEventListener('click', () => {
    if (isRoomOwner) {
      firebase.database().ref(`rooms/${roomCode}`).update({
        gameStarted: true
      });
      startGame.classList.add('hidden');
      waitingMessage.textContent = '';
      gameStarted = true;
      statusElement.textContent = `Oyuncu ${currentPlayer}'in sırası`;
    } else {
      showError("Sadece oda sahibi oyunu başlatabilir.");
    }
  });

  openRestartGameModal.addEventListener('click', () => {
    restartRequested = true;
    restartGameModal.classList.remove('hidden');
    setTimeout(() => {
      restartGameModal.classList.add('fade-in');
    }, 10);
    const roomRef = firebase.database().ref(`rooms/${roomCode}`);
    roomRef.update({
      restartVotes: restartVotes + 1
    });
  });

  cancelRestartGame.addEventListener('click', () => {
    restartRequested = false;
    restartGameModal.classList.remove('fade-in');
    setTimeout(() => {
      restartGameModal.classList.add('hidden');
    }, 300);
    const roomRef = firebase.database().ref(`rooms/${roomCode}`);
    roomRef.update({
      restartVotes: restartVotes - 1
    });
  });

  function createBoard() {
    gameBoard.innerHTML = '';
    board.forEach((cell, index) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('w-20', 'h-20', 'flex', 'items-center', 'justify-center', 'bg-gray-100', 'text-3xl', 'font-bold', 'cursor-pointer');
      cellElement.dataset.index = index;
      cellElement.textContent = cell;
      cellElement.addEventListener('click', handleCellClick);
      gameBoard.appendChild(cellElement);
    });
  }

  function handleCellClick(event) {
    const index = event.target.dataset.index;
    if (!gameStarted || board[index] !== '' || isGameOver || currentPlayer !== (username === playerX.textContent.split(": ")[1] ? 'X' : 'O')) return;
    board[index] = currentPlayer;
    updateBoard();
  }

  function updateBoard() {
    const winner = checkWinner();
    firebase.database().ref(`rooms/${roomCode}`).update({
      board: JSON.stringify(board),
      currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
      isGameOver: winner ? true : false
    }).then(() => {
      if (winner) {
        statusElement.textContent = `${winner} kazandı!`;
        isGameOver = true;
        openRestartGameModal.classList.remove('hidden');
      } else if (board.every(cell => cell !== '')) {
        statusElement.textContent = 'Beraberlik!';
        isGameOver = true;
        openRestartGameModal.classList.remove('hidden');
      } else {
        statusElement.textContent = `Oyuncu ${currentPlayer}'in sırası`;
      }
    });
  }

  function checkWinner() {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  function listenToRoomChanges(roomCode) {
    firebase.database().ref(`rooms/${roomCode}`).on('value', (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) {
        resetToWelcomeScreen();
        return;
      }
      board = JSON.parse(roomData.board);
      currentPlayer = roomData.currentPlayer;
      isGameOver = roomData.isGameOver;
      gameStarted = roomData.gameStarted;
      restartVotes = roomData.restartVotes;
      createBoard();
      updatePlayerList();

      if (Object.keys(roomData.players).length === 2 && !roomData.gameStarted) {
        waitingMessage.textContent = '';
        if (roomData.owner === username) {
          startGame.classList.remove('hidden');
          openCloseRoomModal.classList.remove('hidden');
        } else {
          startGame.classList.add('hidden');
          openCloseRoomModal.classList.add('hidden');
        }
      } else if (Object.keys(roomData.players).length < 2) {
        waitingMessage.textContent = 'Başka bir oyuncu bekleniyor...';
        startGame.classList.add('hidden');
        openCloseRoomModal.classList.add('hidden');
      }

      if (roomData.gameStarted) {
        startGame.classList.add('hidden');
        statusElement.textContent = `Oyuncu ${currentPlayer}'in sırası`;
      }

      if (isGameOver) {
        const winner = checkWinner();
        statusElement.textContent = winner ? `${winner} kazandı!` : 'Beraberlik!';
        openRestartGameModal.classList.remove('hidden');
      }

      if (restartVotes >= 2) {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        isGameOver = false;
        gameStarted = true;
        restartVotes = 0;
        firebase.database().ref(`rooms/${roomCode}`).update({
          board: JSON.stringify(board),
          currentPlayer: currentPlayer,
          isGameOver: isGameOver,
          gameStarted: gameStarted,
          restartVotes: restartVotes
        }).then(() => {
          statusElement.textContent = `Oyuncu ${currentPlayer}'in sırası`;
          restartGameModal.classList.remove('fade-in');
          setTimeout(() => {
            restartGameModal.classList.add('hidden');
          }, 300);
        });
      }

      if (roomData.players.X) {
        playerX.textContent = `Oyuncu X: ${roomData.players.X}`;
      } else {
        playerX.textContent = '';
      }
      if (roomData.players.O) {
        playerO.textContent = `Oyuncu O: ${roomData.players.O}`;
      } else {
        playerO.textContent = '';
      }
    });
  }

  function generateRoomCode() {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  function updatePlayerList() {
    const roomRef = firebase.database().ref(`rooms/${roomCode}/players`);
    roomRef.once('value', (snapshot) => {
      const players = snapshot.val();
      const playerNames = Object.values(players);
      playerList.innerHTML = playerNames.length > 0 ? `Oyuncular: ${playerNames.join(', ')}` : '';
    });
  }

  openCloseRoomModal.addEventListener('click', () => {
    if (isRoomOwner) {
      closeRoomModal.classList.remove('hidden');
      setTimeout(() => {
        closeRoomModal.classList.add('fade-in');
      }, 10);
    } else {
      showError("Sadece oda sahibi odayı kapatabilir.");
    }
  });

  confirmCloseRoom.addEventListener('click', () => {
    if (isRoomOwner) {
      firebase.database().ref(`rooms/${roomCode}`).remove().then(() => {
        closeRoomModal.classList.remove('fade-in');
        setTimeout(() => {
          closeRoomModal.classList.add('hidden');
        }, 300);
        resetToWelcomeScreen();
      });
    } else {
      showError("Sadece oda sahibi odayı kapatabilir.");
    }
  });

  closeCloseRoomModal.addEventListener('click', () => {
    closeRoomModal.classList.remove('fade-in');
    setTimeout(() => {
      closeRoomModal.classList.add('hidden');
    }, 300);
  });

  closeErrorModal.addEventListener('click', () => {
    errorModal.classList.remove('fade-in');
    setTimeout(() => {
      errorModal.classList.add('hidden');
    }, 300);
  });

  function resetToWelcomeScreen() {
    roomCode = '';
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    isGameOver = false;
    isRoomOwner = false;
    gameStarted = false;
    restartVotes = 0;
    restartRequested = false;

    usernameInput.classList.remove('hidden');
    lobby.classList.add('hidden');
    game.classList.add('hidden');
    displayUsername.textContent = '';
    roomCodeDisplay.textContent = '';
    playerX.textContent = '';
    playerO.textContent = '';
    waitingMessage.textContent = 'Başka bir oyuncu bekleniyor...';
    statusElement.textContent = '';
    openCloseRoomModal.classList.add('hidden');
    openRestartGameModal.classList.add('hidden');
    startGame.classList.add('hidden');
    gameBoard.innerHTML = '';
  }
});
