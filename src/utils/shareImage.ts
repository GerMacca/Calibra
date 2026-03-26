import type { GameMode, AttemptGrid } from '../types/game';

const MODE_COLORS: Record<GameMode, [string, string]> = {
  calibra:   ['#06B6D4', '#0284C7'],
  recalibra: ['#8B5CF6', '#6D28D9'],
  excalibra: ['#F97316', '#DC2626'],
};

const MODE_LABELS: Record<GameMode, string> = {
  calibra:   'Calibra',
  recalibra: 'Recalibra',
  excalibra: 'Excalibra',
};

const PT_MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return `${d.getDate()} de ${PT_MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function shareAsImage(params: {
  mode: GameMode;
  date: string;
  solved: boolean;
  attemptGrid: AttemptGrid;
  criteria: string;
  correctOrder: string[];
  values: Map<string, number>;
}): Promise<'shared' | 'copied'> {
  const { mode, date, solved, attemptGrid, criteria, correctOrder, values } = params;
  const [modeColor, modeColorEnd] = MODE_COLORS[mode];

  const W = 400;
  const PAD = 28;
  const CELL = 28;
  const CELL_GAP = 8;
  const ITEM_H = 32;
  const ITEM_GAP = 6;
  const FONT = 'Inter, system-ui, sans-serif';

  // Pre-measure criteria lines to know height
  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d')!;
  tmpCtx.font = `bold 15px ${FONT}`;
  const criteriaLines = wrapText(tmpCtx, criteria, W - PAD * 2);

  const gridRows = attemptGrid.length;
  const gridH = gridRows * CELL + (gridRows - 1) * CELL_GAP;
  const itemsH = correctOrder.length * (ITEM_H + ITEM_GAP) - ITEM_GAP;
  const criteriaH = criteriaLines.length * 22;

  const H =
    PAD          // top
    + 48         // title + badge
    + 28         // date
    + 16         // divider + gap
    + gridH      // grid
    + 20         // grid bottom gap
    + 28         // result text
    + 20         // gap
    + 1 + 16     // divider + gap
    + 20         // criteria label
    + criteriaH  // criteria text
    + 8          // criteria bottom gap
    + 1 + 16     // divider + gap
    + 20         // items label
    + itemsH     // items
    + 24         // footer gap
    + 18         // footer text
    + PAD;       // bottom

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // ── Background ─────────────────────────────────────────────
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, W, H);

  let y = PAD;

  // ── Title + mode badge ─────────────────────────────────────
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillStyle = '#efefef';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Calibra', PAD, y + 18);

  const modeLabel = MODE_LABELS[mode];
  ctx.font = `bold 12px ${FONT}`;
  const badgePadX = 12;
  const badgeW = ctx.measureText(modeLabel).width + badgePadX * 2;
  const badgeH = 26;
  const badgeX = W - PAD - badgeW;
  const badgeY = y + 5;
  const grad = ctx.createLinearGradient(badgeX, 0, badgeX + badgeW, 0);
  grad.addColorStop(0, modeColor);
  grad.addColorStop(1, modeColorEnd);
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(modeLabel, badgeX + badgeW / 2, badgeY + badgeH / 2);

  y += 48;

  // ── Date ───────────────────────────────────────────────────
  ctx.font = `14px ${FONT}`;
  ctx.fillStyle = '#747474';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatDate(date), PAD, y + 8);
  y += 28;

  // ── Divider ────────────────────────────────────────────────
  ctx.strokeStyle = '#272727';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 16;

  // ── Attempt grid ───────────────────────────────────────────
  const cols = attemptGrid[0]?.length ?? 4;
  const totalGridW = cols * CELL + (cols - 1) * CELL_GAP;
  const gridStartX = (W - totalGridW) / 2;

  for (let row = 0; row < attemptGrid.length; row++) {
    for (let col = 0; col < attemptGrid[row].length; col++) {
      const correct = attemptGrid[row][col];
      const cx = gridStartX + col * (CELL + CELL_GAP);
      const cy = y + row * (CELL + CELL_GAP);
      roundRect(ctx, cx, cy, CELL, CELL, 7);
      ctx.fillStyle = correct ? '#10B981' : '#EF4444';
      ctx.fill();
    }
  }
  y += gridH + 20;

  // ── Result text ────────────────────────────────────────────
  const resultText = solved ? `Resolvido em ${attemptGrid.length}/3!` : 'Não foi dessa vez...';
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillStyle = solved ? '#10B981' : '#747474';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(resultText, W / 2, y + 12);
  y += 28;

  // ── Divider ────────────────────────────────────────────────
  y += 8;
  ctx.strokeStyle = '#272727';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 16;

  // ── Criteria ───────────────────────────────────────────────
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = '#747474';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CRITÉRIO DO DIA', PAD, y + 8);
  y += 20;

  ctx.font = `bold 15px ${FONT}`;
  ctx.fillStyle = '#efefef';
  for (const line of criteriaLines) {
    ctx.fillText(line, PAD, y + 10);
    y += 22;
  }
  y += 8;

  // ── Divider ────────────────────────────────────────────────
  ctx.strokeStyle = '#272727';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 16;

  // ── Correct order ──────────────────────────────────────────
  ctx.font = `600 11px ${FONT}`;
  ctx.fillStyle = '#747474';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ORDEM CORRETA', PAD, y + 8);
  y += 20;

  for (let i = 0; i < correctOrder.length; i++) {
    const label = correctOrder[i];
    const value = values.get(label);
    const iy = y + i * (ITEM_H + ITEM_GAP);

    roundRect(ctx, PAD, iy, W - PAD * 2, ITEM_H, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Rank
    ctx.font = `bold 12px ${FONT}`;
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), PAD + 16, iy + ITEM_H / 2);

    // Label — truncate if too long
    ctx.font = `500 13px ${FONT}`;
    ctx.fillStyle = '#efefef';
    ctx.textAlign = 'left';
    let displayLabel = label;
    const maxLabelW = W - PAD * 2 - 38 - 70;
    while (ctx.measureText(displayLabel).width > maxLabelW && displayLabel.length > 1) {
      displayLabel = displayLabel.slice(0, -1);
    }
    if (displayLabel !== label) displayLabel = displayLabel.trimEnd() + '…';
    ctx.fillText(displayLabel, PAD + 34, iy + ITEM_H / 2);

    // Value
    if (value !== undefined) {
      ctx.font = `bold 12px ${FONT}`;
      ctx.fillStyle = i === 0 ? modeColor : '#555555';
      ctx.textAlign = 'right';
      ctx.fillText(value.toLocaleString('pt-BR'), W - PAD - 8, iy + ITEM_H / 2);
    }
  }

  y += itemsH + 24;

  // ── Footer ─────────────────────────────────────────────────
  ctx.font = `12px ${FONT}`;
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('calibra.app', W / 2, y + 8);

  // ── Share or copy to clipboard ─────────────────────────────
  return new Promise<'shared' | 'copied'>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
      const file = new File([blob], `calibra-${mode}-${date}.png`, { type: 'image/png' });
      try {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        // Mobile: Web Share API (abre compartilhamento nativo)
        if (isMobile && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `Calibra · ${MODE_LABELS[mode]}` });
          resolve('shared');
        } else {
          // Desktop: copia imagem para a área de transferência
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          resolve('copied');
        }
      } catch (e) {
        reject(e);
      }
    }, 'image/png');
  });
}
