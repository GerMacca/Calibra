import { useState, useCallback, useEffect } from 'react';
import type { GameMode, Puzzle, SavedState } from './types/game';
import { loadPuzzle, getToday } from './utils/puzzle';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header/Header';
import { ModeSelector } from './components/ModeSelector/ModeSelector';
import { GameBoard } from './components/GameBoard/GameBoard';
import { ResultScreen } from './components/ResultScreen/ResultScreen';
import './App.css';

const TODAY = getToday();
const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];

function readCompletedModes(): Set<GameMode> {
  const done = new Set<GameMode>();
  ALL_MODES.forEach(mode => {
    try {
      const raw = localStorage.getItem(`calibra_${mode}_${TODAY}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.done) done.add(mode);
      }
    } catch {
      // ignore
    }
  });
  return done;
}

function readSavedStates(): Partial<Record<GameMode, SavedState>> {
  const states: Partial<Record<GameMode, SavedState>> = {};
  ALL_MODES.forEach(mode => {
    try {
      const raw = localStorage.getItem(`calibra_${mode}_${TODAY}`);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (saved?.done) states[mode] = saved;
      }
    } catch {
      // ignore
    }
  });
  return states;
}

interface PuzzleLoadState {
  puzzle: Puzzle | null;
  error: string | null;
}

function GameScreen({
  mode,
  onBack,
  onDone,
}: {
  mode: GameMode;
  onBack: () => void;
  onDone: () => void;
}) {
  const [loadState, setLoadState] = useState<PuzzleLoadState>({ puzzle: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadPuzzle(mode, TODAY)
      .then(puzzle => { if (!cancelled) setLoadState({ puzzle, error: null }); })
      .catch(() => { if (!cancelled) setLoadState({ puzzle: null, error: 'Puzzle não encontrado para hoje.' }); });
    return () => { cancelled = true; };
  }, [mode]);

  const { puzzle, error } = loadState;

  const {
    items,
    gameState,
    livesLeft,
    attemptGrid,
    correctOrder,
    isShaking,
    confirm,
    reorder,
  } = useGame(puzzle);

  const solved =
    attemptGrid.length > 0 && attemptGrid[attemptGrid.length - 1].every(Boolean);

  if (error) {
    return (
      <>
        <Header mode={mode} onBack={onBack} />
        <div className="app__error">
          <p>{error}</p>
          <button className="app__error-btn" onClick={onBack}>Voltar</button>
        </div>
      </>
    );
  }

  if (!puzzle) {
    return (
      <>
        <Header mode={mode} onBack={onBack} />
        <div className="app__loading">
          <div className="app__spinner" />
        </div>
      </>
    );
  }

  if (gameState === 'RESULT') {
    return (
      <>
        <Header mode={mode} onBack={onBack} />
        <ResultScreen
          puzzle={puzzle}
          solved={solved}
          attemptGrid={attemptGrid}
          correctOrder={correctOrder}
          mode={mode}
          onPlayNext={onDone}
        />
      </>
    );
  }

  return (
    <>
      <Header mode={mode} onBack={onBack} />
      <GameBoard
        mode={mode}
        items={items}
        gameState={gameState}
        livesLeft={livesLeft}
        isShaking={isShaking}
        correctOrder={correctOrder}
        attemptGrid={attemptGrid}
        onReorder={reorder}
        onConfirm={confirm}
      />
    </>
  );
}

export default function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [completedModes, setCompletedModes] = useState<Set<GameMode>>(readCompletedModes);
  const [savedStates, setSavedStates] = useState<Partial<Record<GameMode, SavedState>>>(readSavedStates);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedMode(null);
    setCompletedModes(readCompletedModes());
    setSavedStates(readSavedStates());
  }, []);

  const handleDone = useCallback(() => {
    setSelectedMode(null);
    setCompletedModes(readCompletedModes());
    setSavedStates(readSavedStates());
  }, []);

  if (selectedMode) {
    return (
      <div className="app">
        <GameScreen
          key={selectedMode}
          mode={selectedMode}
          onBack={handleBack}
          onDone={handleDone}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <ModeSelector
        onSelect={handleModeSelect}
        completedModes={completedModes}
        savedStates={savedStates}
      />
    </div>
  );
}
