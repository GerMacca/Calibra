import './LivesIndicator.css';

interface LivesIndicatorProps {
  total: number;
  remaining: number;
}

export function LivesIndicator({ total, remaining }: LivesIndicatorProps) {
  return (
    <div className="lives" aria-label={`${remaining} de ${total} tentativas restantes`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`lives__dot ${i < remaining ? 'lives__dot--active' : 'lives__dot--lost'}`}
        />
      ))}
    </div>
  );
}
