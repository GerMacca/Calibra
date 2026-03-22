import { useMemo, useCallback } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
  type ClientRect,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  type SortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import type { GameMode, GameState, AttemptGrid } from '../../types/game';
import { modeStyle } from '../../utils/modes';
import { LivesIndicator } from '../LivesIndicator/LivesIndicator';
import { SortableItem } from '../SortableItem/SortableItem';
import './GameBoard.css';

interface GameBoardProps {
  mode: GameMode;
  items: string[];
  gameState: GameState;
  livesLeft: number;
  isShaking: boolean;
  correctOrder: string[];
  attemptGrid: AttemptGrid;
  onReorder: (newOrder: string[]) => void;
  onConfirm: () => void;
  criteria?: string;
}

const MAX_LIVES = 3;

const WIN_MESSAGES: Record<1 | 2 | 3, string[]> = {
  1: [
    '🤯 UAU! Acertou de primeira!',
    '🔥 INCRÍVEL! Na primeira tentativa!',
    '🎯 PERFEITO! Direto na primeira!',
    '⚡ MONSTRO! Nem precisou errar!',
    '🏆 ABSURDO! Acertou sem hesitar!',
  ],
  2: [
    '🎉 BOA! Acertou na segunda!',
    '👏 CONSEGUIU! Muito bem!',
    '✨ SHOW! Quase perfeito!',
    '💪 ÓTIMO! Na segunda tentativa!',
    '🌟 MUITO BOM! Só precisou de duas!',
  ],
  3: [
    '😅 UFA! Por pouco!',
    '😤 NA ÚLTIMA! Que sufoco!',
    '😰 NOSSA! Por um fio!',
    '🫠 QUASE NÃO DÁ! Mas deu!',
    '🎲 NO LIMITE! Na última tentativa!',
  ],
};

function pickWinMessage(attempt: number): string {
  const pool = WIN_MESSAGES[(Math.min(attempt, 3) as 1 | 2 | 3)] ?? WIN_MESSAGES[3];
  return pool[Math.floor(Math.random() * pool.length)];
}

const WRONG_MESSAGES = [
  'Não foi dessa vez... tente de novo',
  'Quase! Reorganize e tente de novo',
  'Hmm, não exatamente... tente outra vez',
  'Não está certo, mas você chega lá!',
  'Errou! Pense melhor e tente de novo',
];

function pickWrongMessage(): string {
  return WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
}

/**
 * Collision detection that skips locked (confirmed-correct) items entirely.
 * When the drag pointer is over a locked card, the nearest FREE card is returned instead.
 */
function makeCollision(lockedIds: Set<string>): CollisionDetection {
  return args => {
    const filtered = {
      ...args,
      droppableContainers: args.droppableContainers.filter(
        c => !lockedIds.has(String(c.id))
      ),
    };
    return closestCenter(filtered);
  };
}

/**
 * Sorting strategy that only moves FREE items.
 * Locked items always return null (no transform).
 * Free items jump directly to the target free-slot position using actual DOM rects,
 * so they never visually "pass through" a locked card.
 */
function makeStrategy(lockedIds: Set<string>, allItems: string[]): SortingStrategy {
  return ({ rects, activeIndex, overIndex, index }: { rects: ClientRect[]; activeIndex: number; overIndex: number; index: number }) => {
    if (lockedIds.has(allItems[index])) return null;

    const freeIdx = allItems.reduce<number[]>((acc, item, i) => {
      if (!lockedIds.has(item)) acc.push(i);
      return acc;
    }, []);

    const activeFree = freeIdx.indexOf(activeIndex);
    const overFree = freeIdx.indexOf(overIndex);
    if (activeFree === -1 || overFree === -1) return null;

    const newFreeOrder = arrayMove(freeIdx, activeFree, overFree);

    // Find which free slot this item occupies in the new order, then map back to full-array index
    const newFreePos = newFreeOrder.indexOf(index);
    if (newFreePos === -1) return null;

    const newFullIdx = freeIdx[newFreePos];
    if (newFullIdx === index) return null;

    // Use actual DOM rects so the target position is always a real free slot
    const dy = (rects[newFullIdx]?.top ?? 0) - (rects[index]?.top ?? 0);
    return { x: 0, y: dy, scaleX: 1, scaleY: 1 };
  };
}

export function GameBoard({
  mode,
  items,
  gameState,
  livesLeft,
  isShaking,
  correctOrder,
  attemptGrid,
  onReorder,
  onConfirm,
  criteria,
}: GameBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Labels confirmed correct in any previous attempt — these are frozen
  const confirmedCorrect = useMemo(() => {
    const set = new Set<string>();
    attemptGrid.forEach(row =>
      row.forEach((correct, i) => { if (correct) set.add(correctOrder[i]); })
    );
    return set;
  }, [attemptGrid, correctOrder]);

  const collisionDetection = useMemo(
    () => makeCollision(confirmedCorrect),
    [confirmedCorrect]
  );

  const sortingStrategy = useMemo(
    () => makeStrategy(confirmedCorrect, items),
    [confirmedCorrect, items]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    // Move free items only; locked slots are always restored to their owners
    const lockedAt = new Map<number, string>();
    items.forEach((item, i) => {
      if (confirmedCorrect.has(item)) lockedAt.set(i, item);
    });

    const moved = arrayMove(items, from, to);
    const free = moved.filter(item => !confirmedCorrect.has(item));
    let fi = 0;
    const result = items.map((_, i) =>
      lockedAt.has(i) ? lockedAt.get(i)! : free[fi++]
    );

    onReorder(result);
  }, [items, confirmedCorrect, onReorder]);

  const feedback = useMemo((): { text: string; className: string } | null => {
    if (gameState === 'WIN') return { text: pickWinMessage(attemptGrid.length), className: 'gameboard__feedback--win' };
    if (gameState === 'WRONG') return { text: pickWrongMessage(), className: 'gameboard__feedback--wrong' };
    if (gameState === 'GAME_OVER') return { text: '💀 Sem mais tentativas', className: 'gameboard__feedback--gameover' };
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]); // re-pick message only when state changes, not on every render

  const isConfirmable = gameState === 'IDLE';
  const isDraggable = gameState === 'IDLE';

  // Per-item result during WRONG state
  const lastRow = attemptGrid.length > 0 ? attemptGrid[attemptGrid.length - 1] : null;
  const wrongStateResult = gameState === 'WRONG' ? lastRow : null;

  return (
    <div className="gameboard" style={modeStyle(mode)}>
      <div className="gameboard__topbar">
        <div className="gameboard__instruction-wrap">
          <div className="gameboard__instruction-row">
            <p className="gameboard__instruction">
              Ordene do <strong>menor</strong> para o <strong>maior</strong>
            </p>
            <div className="gameboard__tooltip-wrap">
              <button className="gameboard__tooltip-btn" aria-label="Exemplo">?</button>
              <div className="gameboard__tooltip">
                <p className="gameboard__tooltip-title">Como funciona</p>
                <div className="gameboard__tooltip-example">
                  <div className="gameboard__tooltip-item gameboard__tooltip-item--marked">
                    <span className="gameboard__tooltip-number">1</span>
                    <span>Formiga</span>
                    <span className="gameboard__tooltip-tag">menor</span>
                  </div>
                  <div className="gameboard__tooltip-item">
                    <span className="gameboard__tooltip-number gameboard__tooltip-number--mid">2</span>
                    <span>Gato</span>
                  </div>
                  <div className="gameboard__tooltip-item gameboard__tooltip-item--marked">
                    <span className="gameboard__tooltip-number">3</span>
                    <span>Elefante</span>
                    <span className="gameboard__tooltip-tag gameboard__tooltip-tag">maior</span>
                  </div>
                </div>
                <p className="gameboard__tooltip-criteria">
                  Ex: Por <strong>tamanho</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <LivesIndicator total={MAX_LIVES} remaining={livesLeft} />
      </div>

      {criteria && (
        <p className="gameboard__criteria">
          Por: <strong>{criteria}</strong>
        </p>
      )}

      {feedback && (
        <div className={`gameboard__feedback ${feedback.className}`}>
          {feedback.text}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={items} strategy={sortingStrategy}>
          <div className={`gameboard__list ${!isDraggable ? 'gameboard__list--locked' : ''}`}>
            {items.map((label, i) => (
              <SortableItem
                key={label}
                id={label}
                label={label}
                index={i}
                gameState={gameState}
                isShaking={isShaking}
                wasCorrect={wrongStateResult ? wrongStateResult[i] : undefined}
                isConfirmedCorrect={confirmedCorrect.has(label)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="gameboard__footer">
        <button
          className="gameboard__confirm"
          onClick={onConfirm}
          disabled={!isConfirmable}
        >
          {isConfirmable ? 'Confirmar' : '...'}
        </button>
      </div>
    </div>
  );
}
