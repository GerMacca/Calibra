import { useState } from 'react';
import type { Puzzle, AttemptGrid, GameMode } from '../../types/game';
import { buildShareText } from '../../utils/share';
import { modeStyle } from '../../utils/modes';
import './ResultScreen.css';

interface ResultScreenProps {
  puzzle: Puzzle;
  solved: boolean;
  attemptGrid: AttemptGrid;
  correctOrder: string[];
  mode: GameMode;
  onPlayNext?: () => void;
}

const MAX_LIVES = 3;

export function ResultScreen({
  puzzle,
  solved,
  attemptGrid,
  correctOrder,
  mode,
  onPlayNext,
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const labelToValue = new Map(puzzle.items.map(i => [i.label, i.value]));
  const attemptsUsed = attemptGrid.length;
  const resultText = solved
    ? `Acertou em ${attemptsUsed}/${MAX_LIVES}!`
    : 'Não foi dessa vez...';

  function handleShare() {
    const text = buildShareText(mode, puzzle.date, attemptGrid, solved, MAX_LIVES);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="result" style={modeStyle(mode)}>
      <div className="result__header">
        <div className={`result__outcome ${solved ? 'result__outcome--win' : 'result__outcome--lose'}`}>
          <span className="result__outcome-icon">{solved ? '🎉' : '😔'}</span>
          <span className="result__outcome-text">{resultText}</span>
        </div>
      </div>

      <div className="result__grid">
        {attemptGrid.map((row, rowIdx) => (
          <div key={rowIdx} className="result__grid-row">
            {row.map((correct, colIdx) => (
              <span
                key={colIdx}
                className={`result__grid-cell ${correct ? 'result__grid-cell--correct' : 'result__grid-cell--wrong'}`}
                style={{ animationDelay: `${rowIdx * 100 + colIdx * 60}ms` }}
              >
                {correct ? '🟩' : '🟥'}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Criteria reveal */}
      <div className="result__criteria">
        <p className="result__criteria-label">Critério do dia</p>
        <p className="result__criteria-value">{puzzle.criteria}</p>
        {puzzle.criteria_source && (
          <p className="result__criteria-source">{puzzle.criteria_source}</p>
        )}
      </div>

      {/* Correct order with values */}
      <div className="result__items">
        <p className="result__items-label">Ordem correta</p>
        <div className="result__items-list">
          {correctOrder.map((label, i) => (
            <div
              key={label}
              className="result__item"
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <span className="result__item-rank">{i + 1}</span>
              <span className="result__item-label">{label}</span>
              <span className="result__item-value">{labelToValue.get(label)?.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="result__actions">
        <button
          className="result__share"
          onClick={handleShare}
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Compartilhar
            </>
          )}
        </button>

        {onPlayNext && (
          <button className="result__next" onClick={onPlayNext}>
            Próximo modo
          </button>
        )}

        <button className="result__home" onClick={() => window.location.reload()}> {/* UseNavigate talvez seja mais interessante */}
          Início
        </button>
      </div>
    </div>
  );
}
