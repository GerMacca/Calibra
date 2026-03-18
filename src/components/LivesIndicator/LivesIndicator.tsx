import './LivesIndicator.css';

interface LivesIndicatorProps {
  total: number;
  remaining: number;
}

export function LivesIndicator({ total, remaining }: LivesIndicatorProps) {
  return (
    <div className="lives" aria-label={`${remaining} de ${total} tentativas restantes`}>
      {Array.from({ length: total }).map((_, i) => (
        <svg
          key={i}
          className={`lives__dot ${i < remaining ? 'lives__dot--active' : 'lives__dot--lost'}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="var(--color-primary)"
          aria-hidden
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
