import { useState, useCallback, useEffect } from 'react';
import type { GameMode, Puzzle, SavedState } from './types/game';
import { loadPuzzle, getToday } from './utils/puzzle';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header/Header';
import { ModeSelector } from './components/ModeSelector/ModeSelector';
import { GameBoard } from './components/GameBoard/GameBoard';
import { ResultScreen } from './components/ResultScreen/ResultScreen';
import { TutorialModal } from './components/TutorialModal/TutorialModal';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { type AppSettings, DEFAULT_SETTINGS } from './types/settings';
import './App.css';

function readSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('calibra_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function applySettings(s: AppSettings) {
  const el = document.documentElement;
  el.dataset.dyslexic = String(s.dyslexicFont);
  el.dataset.colorblind = String(s.colorblindMode);
  el.dataset.reduceMotion = String(s.reduceMotion);
}

const TODAY = getToday();
const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];
const NEXT_MODE: Partial<Record<GameMode, GameMode>> = {
  calibra: 'recalibra',
  recalibra: 'excalibra',
};

function readCompletedModes(date: string): Set<GameMode> {
  const done = new Set<GameMode>();
  ALL_MODES.forEach(mode => {
    try {
      const raw = localStorage.getItem(`calibra_${mode}_${date}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.done) done.add(mode);
      }
    } catch { /* ignore */ }
  });
  return done;
}

function readSavedStates(date: string): Partial<Record<GameMode, SavedState>> {
  const states: Partial<Record<GameMode, SavedState>> = {};
  ALL_MODES.forEach(mode => {
    try {
      const raw = localStorage.getItem(`calibra_${mode}_${date}`);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (saved?.done) states[mode] = saved;
      }
    } catch { /* ignore */ }
  });
  return states;
}

interface PuzzleLoadState {
  puzzle: Puzzle | null;
  error: string | null;
}

function GameScreen({
  mode,
  date,
  hardMode,
  onBack,
  onDone,
  onHelp,
  onSettings,
}: {
  mode: GameMode;
  date: string;
  hardMode: boolean;
  onBack: () => void;
  onDone: () => void;
  onHelp: () => void;
  onSettings: () => void;
}) {
  const [loadState, setLoadState] = useState<PuzzleLoadState>({ puzzle: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadPuzzle(mode, date)
      .then(puzzle => { if (!cancelled) setLoadState({ puzzle, error: null }); })
      .catch(() => { if (!cancelled) setLoadState({ puzzle: null, error: 'Puzzle não encontrado para essa data.' }); });
    return () => { cancelled = true; };
  }, [mode, date]);

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
        <Header mode={mode} onBack={onBack} onHelp={onHelp} onSettings={onSettings} />
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
        <Header mode={mode} onBack={onBack} onHelp={onHelp} onSettings={onSettings} />
        <div className="app__loading">
          <div className="app__spinner" />
        </div>
      </>
    );
  }

  if (gameState === 'RESULT') {
    return (
      <>
        <Header mode={mode} onBack={onBack} onHelp={onHelp} onSettings={onSettings} />
        <ResultScreen
          puzzle={puzzle}
          solved={solved}
          attemptGrid={attemptGrid}
          correctOrder={correctOrder}
          mode={mode}
          onPlayNext={mode !== 'excalibra' ? onDone : undefined}
        />
      </>
    );
  }

  return (
    <>
      <Header mode={mode} onBack={onBack} onHelp={onHelp} onSettings={onSettings} />
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
        criteria={hardMode ? undefined : puzzle.criteria}
      />
    </>
  );
}

export default function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [completedModes, setCompletedModes] = useState(() => readCompletedModes(TODAY));
  const [savedStates, setSavedStates] = useState(() => readSavedStates(TODAY));
  const [showTutorial, setShowTutorial] = useState(
    () => localStorage.getItem('calibra_tutorial_seen') !== TODAY
  );
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const s = readSettings();
    applySettings(s);
    return s;
  });

  const handleSettingsChange = useCallback((next: AppSettings) => {
    applySettings(next);
    localStorage.setItem('calibra_settings', JSON.stringify(next));
    setSettings(next);
  }, []);

  const refreshStats = useCallback((date: string) => {
    setCompletedModes(readCompletedModes(date));
    setSavedStates(readSavedStates(date));
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    refreshStats(date);
  }, [refreshStats]);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedMode(null);
    refreshStats(selectedDate);
  }, [selectedDate, refreshStats]);

  const handleDone = useCallback(() => {
    refreshStats(selectedDate);
    setSelectedMode(prev => (prev ? (NEXT_MODE[prev] ?? null) : null));
  }, [selectedDate, refreshStats]);

  const closeTutorial = useCallback(() => {
    localStorage.setItem('calibra_tutorial_seen', TODAY);
    setShowTutorial(false);
  }, []);
  const handleHelp = useCallback(() => setShowTutorial(true), []);
  const handleSettings = useCallback(() => setShowSettings(true), []);

  if (selectedMode) {
    return (
      <div className="app">
        <GameScreen
          key={`${selectedMode}-${selectedDate}`}
          mode={selectedMode}
          date={selectedDate}
          hardMode={settings.hardMode}
          onBack={handleBack}
          onDone={handleDone}
          onHelp={handleHelp}
          onSettings={handleSettings}
        />
        {showTutorial && <TutorialModal onClose={closeTutorial} />}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onChange={handleSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Header onHelp={handleHelp} onSettings={handleSettings} />
      <ModeSelector
        onSelect={handleModeSelect}
        completedModes={completedModes}
        savedStates={savedStates}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      {showTutorial && <TutorialModal onClose={closeTutorial} />}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
