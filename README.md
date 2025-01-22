# Yatch Dice Game

The game played by 침착맨!<br>
I didn't enjoy other Yatch-game in web.<br> 
Cuz It seemes to just overlay a dice on the values returned by the `random()` fn when I was clicked.<br>
So I make it using <img src="https://img.shields.io/badge/three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white"/> Which I want to learn.<br>
Now U can play Yatch Dice at [야추 다이스 by.JW](https://yatch-dice.kangjeongwoo.com/), Where u can feel the real dice being thrown!<br>

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
   git clone https://github.com/Kang-Jeong-Woo/Yatch_dice_jw
   ```

2. Navigate to the project directory:
   ```bash
   cd Yatch_dice_jw
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
   http://localhost:5173
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
- Multiplayer mode