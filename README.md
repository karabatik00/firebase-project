# Multiplayer Tic Tac Toe

This is a multiplayer Tic Tac Toe game. Users can create rooms, join rooms, and play Tic Tac Toe with each other online.

## Features

- Username setup
- Room creation and joining
- Real-time game updates
- Option to restart the game at the end
- Room closure

## Requirements

- Python 3.6+
- Firebase account and project configuration

## Setup

1. Clone this repository:
    ```bash
    git clone https://github.com/karabatik00/multiplayer-tic-tac-toe.git
    cd multiplayer-tic-tac-toe
    ```

2. Install the requirements:
    ```bash
    pip install -r requirements.txt
    ```

3. Add your Firebase configuration to the `scripts.js` file:
    ```javascript
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
    ```

4. Start the web server:
    - Open the HTML file in a browser to start the game.

## Usage

1. Enter your username and confirm it.
2. Create a room or join an existing room.
3. Wait for another player to join and start the game.
4. At the end of the game, you can restart the game or close the room.

## License

This project is licensed under the MIT License. For more information, see the [LICENSE](LICENSE) file.

## Contributing

If you would like to contribute, please create a pull request or file an issue.

