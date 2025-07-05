import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
const GAME_DURATION = 15; // 15 seconds

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targetColor, setTargetColor] = useState('');
  const [colorOptions, setColorOptions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('colorMatchHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const generateNewRound = useCallback(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target);
    
    // Generate 4 color options including the target
    const options = [target];
    while (options.length < 4) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (!options.includes(randomColor)) {
        options.push(randomColor);
      }
    }
    
    // Shuffle the options
    setColorOptions(options.sort(() => Math.random() - 0.5));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setIsPaused(false);
    generateNewRound();
  };

  const handleColorClick = (clickedColor) => {
    if (isPaused) return;

    if (clickedColor === targetColor) {
      // Correct answer
      const points = Math.floor(10 * (1 + streak * 0.2) * difficulty);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      
      // Visual feedback
      document.body.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    } else {
      // Wrong answer
      setStreak(0);
      document.body.style.backgroundColor = '#f44336';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 200);
    }

    generateNewRound();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const quitGame = () => {
    setGameState('menu');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setIsPaused(false);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, isPaused]);

  const endGame = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('colorMatchHighScore', score.toString());
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyMultiplier = () => {
    return Math.floor(1 + (GAME_DURATION - timeLeft) / 10);
  };

  if (gameState === 'menu') {
    return (
      <div className="App">
        <div className="game-container">
          <div className="title-section">
            <h1 className="game-title">🎨 Color Match Challenge</h1>
            <p className="game-subtitle">Match the colors as fast as you can!</p>
          </div>
          
          <div className="stats-section">
            <div className="stat-card">
              <h3>🏆 High Score</h3>
              <p className="stat-value">{highScore}</p>
            </div>
          </div>

          <div className="instructions">
            <h3>How to Play:</h3>
                         <ul>
               <li>Click the color that matches the target</li>
               <li>Build streaks for bonus points</li>
               <li>You have 15 seconds!</li>
               <li>Higher difficulty = more points</li>
             </ul>
          </div>

          <button className="start-button" onClick={startGame}>
            🚀 Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="App">
        <div className="game-container">
          <div className="game-header">
            <div className="score-section">
              <h2>Score: {score}</h2>
              <p className="streak">🔥 Streak: {streak}</p>
            </div>
            
            <div className="time-section">
              <div className="timer">
                <span className="time-display">{formatTime(timeLeft)}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(timeLeft / GAME_DURATION) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>

            <div className="game-controls">
              <button className="pause-button" onClick={togglePause}>
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <button className="quit-button" onClick={quitGame}>
                🚪
              </button>
            </div>
          </div>

          {isPaused && (
            <div className="pause-overlay">
              <h2>Game Paused</h2>
              <p>Choose an option to continue</p>
              <div className="pause-actions">
                <button className="resume-button" onClick={togglePause}>
                  ▶️ Resume Game
                </button>
                <button className="quit-button-overlay" onClick={quitGame}>
                  🚪 Quit Game
                </button>
              </div>
            </div>
          )}

          <div className="game-area">
            <div className="target-section">
              <h3>Match this color:</h3>
              <div 
                className="target-color" 
                style={{backgroundColor: targetColor}}
              ></div>
            </div>

            <div className="color-options">
              {colorOptions.map((color, index) => (
                <button
                  key={index}
                  className="color-option"
                  style={{backgroundColor: color}}
                  onClick={() => handleColorClick(color)}
                  disabled={isPaused}
                ></button>
              ))}
            </div>
          </div>

          <div className="difficulty-info">
            <p>Difficulty: {getDifficultyMultiplier()}x</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="App">
        <div className="game-container">
          <div className="game-over-section">
            <h1 className="game-over-title">🎮 Game Over!</h1>
            
            <div className="final-stats">
              <div className="stat-item">
                <h3>Final Score</h3>
                <p className="final-score">{score}</p>
              </div>
              
              <div className="stat-item">
                <h3>High Score</h3>
                <p className="high-score">{highScore}</p>
              </div>
            </div>

            {score === highScore && score > 0 && (
              <div className="new-record">
                🎉 New High Score! 🎉
              </div>
            )}

            <div className="game-over-actions">
              <button className="play-again-button" onClick={startGame}>
                🎯 Play Again
              </button>
              <button className="menu-button" onClick={quitGame}>
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
