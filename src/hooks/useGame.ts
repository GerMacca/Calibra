import { useReducer, useCallback, useEffect } from 'react';
import type { Lang, Puzzle, GameState, AttemptGrid } from '../types/game';
import { getCorrectOrder, shuffle } from '../utils/puzzle';
import { usePersistence } from './usePersistence';

const MAX_LIVES = 3;

interface GameSlice {
  items: string[];
  gameState: GameState;
  livesLeft: number;
  attemptGrid: AttemptGrid;
  correctOrder: string[];
  isShaking: boolean;
}

type Action =
  | { type: 'INIT'; payload: GameSlice }
  | { type: 'REORDER'; payload: string[] }
  | { type: 'CONFIRM_WRONG'; newLives: number; grid: AttemptGrid }
  | { type: 'CONFIRM_WRONG_FINAL'; grid: AttemptGrid }
  | { type: 'CONFIRM_WIN'; grid: AttemptGrid }
  | { type: 'STOP_SHAKING'; reshuffled: string[] }
  | { type: 'GO_RESULT' };

const initialSlice: GameSlice = {
  items: [],
  gameState: 'IDLE',
  livesLeft: MAX_LIVES,
  attemptGrid: [],
  correctOrder: [],
  isShaking: false,
};

function reducer(state: GameSlice, action: Action): GameSlice {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'REORDER':
      return { ...state, items: action.payload };
    case 'CONFIRM_WRONG':
      return { ...state, gameState: 'WRONG', livesLeft: action.newLives, attemptGrid: action.grid, isShaking: true };
    case 'CONFIRM_WRONG_FINAL':
      return { ...state, gameState: 'GAME_OVER', livesLeft: 0, attemptGrid: action.grid, isShaking: true };
    case 'CONFIRM_WIN':
      return { ...state, gameState: 'WIN', attemptGrid: action.grid };
    case 'STOP_SHAKING':
      return { ...state, gameState: 'IDLE', isShaking: false, items: action.reshuffled };
    case 'GO_RESULT':
      return { ...state, gameState: 'RESULT' };
    default:
      return state;
  }
}

export interface UseGameReturn {
  items: string[];
  gameState: GameState;
  livesLeft: number;
  attemptGrid: AttemptGrid;
  correctOrder: string[];
  isShaking: boolean;
  confirm: () => void;
  reorder: (newOrder: string[]) => void;
  goToResult: () => void;
}

export function useGame(puzzle: Puzzle | null, lang: Lang = 'pt'): UseGameReturn {
  const { load, save } = usePersistence();
  const [state, dispatch] = useReducer(reducer, initialSlice);

  // Init when puzzle changes
  useEffect(() => {
    if (!puzzle) return;
    const order = getCorrectOrder(puzzle, lang);
    const saved = load(puzzle.mode, puzzle.date);

    let payload: GameSlice;
    if (saved?.done) {
      payload = { items: order, gameState: 'RESULT', livesLeft: saved.livesLeft, attemptGrid: saved.grid, correctOrder: order, isShaking: false };
    } else if (saved) {
      payload = { items: saved.items, gameState: 'IDLE', livesLeft: saved.livesLeft, attemptGrid: saved.grid, correctOrder: order, isShaking: false };
    } else {
      payload = { items: shuffle(puzzle.items.map(i => typeof i.label === 'string' ? i.label : i.label[lang] ?? i.label.pt)), gameState: 'IDLE', livesLeft: MAX_LIVES, attemptGrid: [], correctOrder: order, isShaking: false };
    }
    dispatch({ type: 'INIT', payload });
  }, [puzzle, load]);

  // Persist whenever meaningful state changes
  useEffect(() => {
    if (!puzzle || state.correctOrder.length === 0) return;
    const isDone = state.gameState === 'RESULT' || state.gameState === 'WIN' || state.gameState === 'GAME_OVER';
    const solved = state.attemptGrid.length > 0 && state.attemptGrid[state.attemptGrid.length - 1].every(Boolean);
    save({
      date: puzzle.date,
      mode: puzzle.mode,
      attempts: state.attemptGrid.length,
      solved,
      done: isDone,
      grid: state.attemptGrid,
      livesLeft: state.livesLeft,
      items: state.items,
    });
  }, [puzzle, state.gameState, state.attemptGrid, state.livesLeft, state.items, state.correctOrder, save]);

  const confirm = useCallback(() => {
    if (state.gameState !== 'IDLE') return;

    const rowResult = state.items.map((item, i) => item === state.correctOrder[i]);
    const isCorrect = rowResult.every(Boolean);
    const newGrid = [...state.attemptGrid, rowResult];

    if (isCorrect) {
      dispatch({ type: 'CONFIRM_WIN', grid: newGrid });
      setTimeout(() => dispatch({ type: 'GO_RESULT' }), 1400);
    } else {
      const newLives = state.livesLeft - 1;
      if (newLives === 0) {
        dispatch({ type: 'CONFIRM_WRONG_FINAL', grid: newGrid });
        setTimeout(() => dispatch({ type: 'GO_RESULT' }), 1400);
      } else {
        dispatch({ type: 'CONFIRM_WRONG', newLives, grid: newGrid });
        setTimeout(() => dispatch({ type: 'STOP_SHAKING', reshuffled: state.items }), 950);
      }
    }
  }, [state]);

  const reorder = useCallback((newOrder: string[]) => {
    if (state.gameState === 'IDLE') dispatch({ type: 'REORDER', payload: newOrder });
  }, [state.gameState]);

  const goToResult = useCallback(() => dispatch({ type: 'GO_RESULT' }), []);

  return {
    items: state.items,
    gameState: state.gameState,
    livesLeft: state.livesLeft,
    attemptGrid: state.attemptGrid,
    correctOrder: state.correctOrder,
    isShaking: state.isShaking,
    confirm,
    reorder,
    goToResult,
  };
}
