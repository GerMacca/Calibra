import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { GameState } from '../../types/game';
import './SortableItem.css';

interface SortableItemProps {
  id: string;
  label: string;
  index: number;
  gameState: GameState;
  isShaking: boolean;
  wasCorrect?: boolean;
  isConfirmedCorrect?: boolean;
}

export function SortableItem({
  id,
  label,
  index,
  gameState,
  isShaking,
  wasCorrect,
  isConfirmedCorrect,
}: SortableItemProps) {
  const { t } = useTranslation();
  const isLocked = isConfirmedCorrect === true;
  const playBadgeAnim = isConfirmedCorrect === true;

  const { active: dndActive } = useDndContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isLocked });

  const style = {
    transform: isLocked ? undefined : CSS.Transform.toString(transform),
    // Apply transition only while a drag is in progress (smooth displacement and return).
    // When the drag ends, dndActive becomes null at the same time transforms are cleared,
    // so no snap-back animation fires before React re-orders the DOM.
    transition: !isLocked && dndActive ? transition : undefined,
  };

  const isWin = gameState === 'WIN';
  const isWrong = gameState === 'WRONG';
  const isGameOver = gameState === 'GAME_OVER';
  const isDisabled = gameState !== 'IDLE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'sortable-item',
        isDragging ? 'sortable-item--dragging' : '',
        isShaking && isWrong && wasCorrect !== true ? 'sortable-item--shake' : '',
        isWin ? 'sortable-item--win' : '',
        isGameOver ? 'sortable-item--gameover' : '',
        isWrong && wasCorrect === true ? 'sortable-item--result-correct' : '',
        isWrong && wasCorrect === false ? 'sortable-item--result-wrong' : '',
        isConfirmedCorrect ? 'sortable-item--confirmed' : '',
        isLocked ? 'sortable-item--locked' : '',
        isDisabled ? 'sortable-item--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...attributes}
      {...listeners}
    >
      <span className="sortable-item__index">{index + 1}</span>
      <span className="sortable-item__label">{label}</span>

      <span className="sortable-item__right">
        {isConfirmedCorrect ? (
          <span className={`sortable-item__confirmed-badge${playBadgeAnim ? ' sortable-item__confirmed-badge--pop' : ''}`} aria-label={t('game.confirmedPosition')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        ) : isWrong && wasCorrect !== undefined ? (
          <span
            className={`sortable-item__result-dot ${wasCorrect ? 'sortable-item__result-dot--correct' : 'sortable-item__result-dot--wrong'}`}
            aria-hidden
          />
        ) : (
          <span className="sortable-item__drag-handle" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </span>
        )}
      </span>
    </div>
  );
}
