"use client";

import { useEffect, useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;
type Mode = "menu" | "computer" | "multiplayer" | "rules";
type Scores = { X: number; O: number; draws: number };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(board: Cell[]): { player: Player; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a] as Player, line };
    }
  }
  return null;
}

function findBestMove(board: Cell[], computer: Player, human: Player): number {
  // Minimax makes the computer play optimally and never lose.
  function minimax(state: Cell[], isMax: boolean): number {
    const result = winnerOf(state);
    if (result?.player === computer) return 10;
    if (result?.player === human) return -10;
    if (state.every(Boolean)) return 0;

    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < state.length; i++) {
      if (state[i]) continue;
      state[i] = isMax ? computer : human;
      const score = minimax(state, !isMax);
      state[i] = null;
      best = isMax ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < board.length; i++) {
    if (board[i]) continue;
    board[i] = computer;
    const score = minimax(board, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("menu");
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [computerThinking, setComputerThinking] = useState(false);

  const result = winnerOf(board);
  const draw = !result && board.every(Boolean);
  const finished = Boolean(result) || draw;

  
useEffect(() => {
  if (mode !== "computer" || turn !== "O" || finished) return;

  setComputerThinking(true);

  const timer = window.setTimeout(() => {
    setBoard((current) => {
      if (winnerOf(current) || current.every(Boolean)) {
        setComputerThinking(false);
        return current;
      }

      const copy = [...current];
      const move = findBestMove(copy, "O", "X");

      if (move >= 0) {
        copy[move] = "O";
      }

      const win = winnerOf(copy);

      if (win) {
        setScores((s) => ({ ...s, O: s.O + 1 }));
      } else if (copy.every(Boolean)) {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }

      setComputerThinking(false);
      return copy;
    });

    setTurn("X");
  }, 150);

  return () => window.clearTimeout(timer);
}, [mode, turn, finished]);


  function chooseMode(next: "computer" | "multiplayer") {
    setMode(next);
    setBoard(Array(9).fill(null));
    setTurn("X");
    setScores({ X: 0, O: 0, draws: 0 });
    setRound(1);
    setComputerThinking(false);
  }

  function play(index: number) {
    if (board[index] || finished || computerThinking || (mode === "computer" && turn === "O")) return;
    const copy = [...board];
    copy[index] = turn;
    const win = winnerOf(copy);
    setBoard(copy);
    if (win) setScores((s) => ({ ...s, [turn]: s[turn] + 1 }));
    else if (copy.every(Boolean)) setScores((s) => ({ ...s, draws: s.draws + 1 }));
    else setTurn(turn === "X" ? "O" : "X");
  }

  function newRound() {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setRound((n) => n + 1);
    setComputerThinking(false);
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
    newRound();
  }

  function goHome() {
    setMode("menu");
    setBoard(Array(9).fill(null));
    setTurn("X");
    setComputerThinking(false);
  }

  const status = result
    ? mode === "computer"
      ? (result.player === "X" ? "You win this round!" : "Computer wins this round!")
      : `${result.player === "X" ? "Player X" : "Player O"} wins this round!`
    : draw
      ? "It's a draw!"
      : mode === "computer"
        ? computerThinking || turn === "O" ? "Computer is thinking…" : "Your turn"
        : `${turn === "X" ? "Player X" : "Player O"}'s turn`;

  return (
    <main className="app-shell">
      <div className="glow glow-blue" />
      <div className="glow glow-pink" />
      <div className="app-wrap">
        <header className="nav">
          <button className="logo" onClick={goHome} aria-label="Go to home">
            <span className="logo-x">×</span><span className="logo-o">○</span><span className="logo-text">Tic Tac Toe</span>
          </button>
          <div className="nav-right">
            {mode !== "menu" && mode !== "rules" && <span className="mode-chip">{mode === "computer" ? "⌘　vs Computer" : "♟　Multiplayer"}</span>}
            {mode !== "menu" && <button className="nav-button" onClick={goHome}>Home</button>}
          </div>
        </header>

        {mode === "menu" ? (
          <section className="home-view">
            <div className="hero-badge"><span className="badge-dot" /> READY WHEN YOU ARE</div>
            <h1>Tic Tac Toe<span className="hero-period">.</span></h1>
            <p className="hero-subtitle">One tiny board. Endless rematches.</p>
            <div className="mode-grid">
              <button className="mode-card mode-card-blue" onClick={() => chooseMode("computer")}>
                <span className="mode-icon">♟</span>
                <span className="mode-title">vs Computer</span>
                <span className="mode-description">Challenge the AI</span>
                <span className="mode-arrow">↗</span>
              </button>
              <button className="mode-card mode-card-purple" onClick={() => chooseMode("multiplayer")}>
                <span className="mode-icon">♟♟</span>
                <span className="mode-title">Multiplayer</span>
                <span className="mode-description">Play with a friend</span>
                <span className="mode-arrow">↗</span>
              </button>
            </div>
            <button className="rules-link" onClick={() => setMode("rules")}>How to play <span>→</span></button>
            <div className="home-foot"><span>×</span><span>○</span><i /> SIMPLE. CLASSIC. FUN.</div>
          </section>
        ) : mode === "rules" ? (
          <section className="rules-view">
            <p className="kicker">THE RULES ARE SIMPLE</p>
            <h1>Three in a row.<br /><span>That’s the goal.</span></h1>
            <div className="rules-card">
              <p><b>01</b><span>Choose a mode: play against the computer or share the device with a friend.</span></p>
              <p><b>02</b><span>Players take turns placing X or O in an empty square.</span></p>
              <p><b>03</b><span>Get three marks in a row, column, or diagonal to win.</span></p>
              <p><b>04</b><span>If all nine squares are filled and nobody wins, it’s a draw.</span></p>
            </div>
            <button className="primary-button wide-button" onClick={goHome}>Back to menu <span>↗</span></button>
          </section>
        ) : (
          <section className="play-view">
            <div className="page-heading">
              <div>
                <p className="kicker">ROUND {String(round).padStart(2, "0")}</p>
                <h1>{mode === "computer" ? "Your move." : "Take turns."}</h1>
                <p className="subheading">{mode === "computer" ? "Can you outsmart the computer?" : "Same screen, friendly rivalry."}</p>
              </div>
              <button className="outline-button" onClick={newRound}>↻ <span>New game</span></button>
            </div>

            <div className="game-layout">
              <section className="board-panel">
                <div className={`status-banner ${finished ? "status-finished" : ""}`}>
                  <span className={`status-mark ${(result?.player ?? turn) === "O" ? "mark-o" : "mark-x"}`}>
                    {result ? result.player : draw ? "=" : (computerThinking ? "…" : turn)}
                  </span>
                  <div><strong>{status}</strong><small>{finished ? "Ready for a rematch?" : mode === "computer" ? (turn === "O" ? "Wait just a moment" : "You are playing as X") : `Playing as ${turn}`}</small></div>
                  {finished && <span className="sparkle">✦</span>}
                </div>
                <div className="board" role="group" aria-label="Tic Tac Toe board">
                  {board.map((cell, i) => {
                    const winning = result?.line.includes(i) ?? false;
                    return <button
                      key={i}
                      className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ""} ${winning ? "winning-cell" : ""}`}
                      onClick={() => play(i)}
                      disabled={Boolean(cell) || finished || computerThinking || (mode === "computer" && turn === "O")}
                      aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}${cell ? `, ${cell}` : ", empty"}`}
                    >
                      {cell && <span>{cell === "X" ? "×" : "○"}</span>}
                      {!cell && <span className="cell-hint" aria-hidden="true">{turn === "X" ? "×" : "○"}</span>}
                    </button>;
                  })}
                </div>
                <p className="board-hint"><span /> Tap an empty square to make your move</p>
              </section>

              <aside className="side-panel">
                <div className="side-card">
                  <p className="card-kicker">CURRENT MATCH</p>
                  <div className="player-status">
                    <span className={`big-token ${(result?.player ?? turn) === "O" ? "token-o" : "token-x"}`}>{result ? result.player : draw ? "=" : turn === "X" ? "×" : "○"}</span>
                    <div><strong>{finished ? "Round complete" : mode === "computer" ? (turn === "O" ? "Computer's turn" : "Your turn") : `${turn === "X" ? "Player X" : "Player O"}'s turn`}</strong><small>{finished ? "Well played!" : mode === "computer" ? (turn === "O" ? "Thinking…" : "You are X") : "Pass the device after each turn"}</small></div>
                  </div>
                  <div className="score-list">
                    <div className="score-row"><span className="mini-token token-x">×</span><span>{mode === "computer" ? "You (X)" : "Player X"}</span><b>{scores.X}</b></div>
                    <div className="score-row"><span className="mini-token token-o">○</span><span>{mode === "computer" ? "Computer (O)" : "Player O"}</span><b>{scores.O}</b></div>
                    <div className="score-row"><span className="mini-token token-draw">○</span><span>Draws</span><b>{scores.draws}</b></div>
                  </div>
                  <button className="primary-button" onClick={newRound}><span>{finished ? "Play again" : "New game"}</span><span>↗</span></button>
                  <button className="text-button" onClick={resetScores}>Reset scores</button>
                </div>
                <div className="tip-card"><span className="tip-icon">✦</span><div><strong>Quick tip</strong><p>{mode === "computer" ? "Try to make two-in-a-row while blocking the computer’s chances." : "Keep an eye on rows, columns, and diagonals to spot a winning move."}</p></div></div>
              </aside>
            </div>
          </section>
        )}
        <footer className="footer"><span>MADE FOR FRIENDLY RIVALRIES</span><span>× <i /> ○</span></footer>
      </div>
    </main>
  );
}
