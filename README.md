# Yatch Dice Game

침착맨이 한 야추 게임입니다. <br>
다른 게임들은 클릭을 하면 `random()` 함수로 반환되는 값에 주사위만 쓰운 값 같아서 마음에 들지 않았습니다. <br>
그래서 평소 배우고 싶었던 <img src="https://img.shields.io/badge/three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white"/> 를 사용하여 만들어보았습니다. <br>
이제는 실제 Dice 가 던져지는 느낌을 받을 수 있는 [야추 다이스 by.JW](https://yatch-dice.kangjeongwoo.com/) 에서 야추 다이스를 즐기세요!

---

## Features

- **Interactive Dice Rolling**: Roll up to 5 dice with physics-based animations.
- **Click to Select**: Choose which dice to keep for scoring.
- **Scoreboard Highlighting**: Easily see where your scores can be applied.

---

## How to Play

1. **Start the Game**:
    - Press the `Space` key to roll all five dice.

2. **Select Dice**:
    - Double-click on dice to select or deselect them.
    - Selected dice will move to a designated area.

3. **Score Points**:
    - After selecting dice, check the scoreboard for valid scoring options.
    - Points will be automatically calculated and updated.

4. **End the Round**:
    - After all five dice are selected and scored, press `Space` to roll again.

5. **Win the Game**:
    - Keep rolling and scoring until all categories on the scoreboard are filled. The player with the highest score wins!

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/yahtzee-game.git
   ```

2. Navigate to the project directory:
   ```bash
   cd yahtzee-game
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## Technologies Used

- **Three.js**: For 3D rendering and dice physics.
- **TypeScript**: For type-safe development.

---

## Project Structure

```plaintext
src/
├── components/       # Reusable components
    ├── Dice.ts           # Dice logic and interactions
    ├── Cup.ts           # Cup logic and interactions
    └── Board.ts           # Game Board logic
├── game/       # Reusable components
    ├── Game.ts           # Game logic and component create section
    └── Rule.ts           # Rule logic that how game's going
├── UI/       # Reusable components
    ├── Environment.ts           # Game logic and component create section
    └── UI.ts           # UI compoents
├── util/            # Utility functions
├── styles/           # CSS and stylesheets
└── main.ts          # Entry point

styles/           # CSS and stylesheets
```

---

## Screenshots

### Gameplay
![](https://velog.velcdn.com/images/jeong_woo/post/bace7c21-0b54-4b0b-b244-c9676772a5f8/image.png)

---

## Future Enhancements

- fix bugs
- Responsive UI
- Multiplayer mode