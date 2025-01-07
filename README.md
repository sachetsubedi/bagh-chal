# Bagh-Chal Game

Bagh-Chal, which translates to "Tiger Movement," is a traditional strategy board game originating from Nepal. It is a two-player game where one player controls four tigers, and the other controls twenty goats. The objective is for the tigers to "hunt" goats, while the goats aim to trap the tigers, making them unable to move.

## Features

- **Interactive Gameplay**: Play as either the tigers or the goats.
- **Dynamic Rules Implementation**: Enforces all rules of Bagh-Chal, including valid moves and captures.
- **Responsive Design**: Playable on desktop and mobile devices.
- **Multiplayer Support** : Play with friends online or offline.
- **Customizable Theme**: Enjoy traditional or modern visuals for the board and pieces.

## How to Play

### Objective

- **Tigers**: Capture at least 5 goats by jumping over them.
- **Goats**: Block all tigers so they cannot move.

### Rules

1. The game begins with all four tigers placed on the board and no goats.
2. The goat player places one goat per turn until all 20 goats are on the board.
3. Tigers can move to adjacent points or jump over a goat to capture it (similar to checkers).
4. Goats can only move to adjacent points and cannot jump over tigers.
5. The game ends when either the tigers capture 5 goats or all tigers are blocked from moving.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/sachetsubedi/bagh-chal.git
   cd bagh-chal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` to play the game.

## Technologies Used

- **Frontend**: React, Next.js, Tailwind CSS, konva.js
- **Backend**: Node.js with Express (optional for multiplayer)
- **Database**: Prisma with MySQL
- **Hosting**: Vercel

## Contributing

Contributions are welcome (if you can understand this mess :) ) ! If you'd like to contribute, please fork the repository and submit a pull request. Ensure your code follows the existing style.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Inspired by the traditional Nepali board game Bagh-Chal.

## Contact

If you have any questions or suggestions, feel free to reach out:

- **Developer**: Sachet Subedi
- **Email**: mail@sachetsubedi001.com.np
- **GitHub**: [github.sachetsubedi001.com.np](https://github.com/sachetsubedi)

---

Enjoy playing Bagh-Chal!
