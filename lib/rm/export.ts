import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { TaskWithRmRisk } from 'types';
import {
  calculateRiskRating,
  calculateCurrentRiskRating,
} from '@/lib/rm/helpers';
import { riskValueToLabelKey } from '@/lib/common';
import {
  triggerDownload,
  datestamp,
  timestamp,
  escHtml,
  csvEsc,
  fill,
  buildXlsxHeader,
  buildXlsxFooter,
  type RGB,
} from '@/lib/modules/exportHelpers';

type TFunc = (key: string, opts?: any) => string;

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_BG_HEX: Record<string, string> = {
  low: '00FF00',
  medium: 'FFFF00',
  high: 'FFA500',
  extreme: 'FF0000',
};

const RISK_BG_RGB: Record<string, RGB> = {
  low: [144, 238, 144],
  medium: [255, 255, 100],
  high: [255, 165, 0],
  extreme: [239, 68, 68],
};

function getRiskLevel(value: number): string {
  if (value <= 1) return 'low';
  if (value <= 40) return 'low';
  if (value <= 60) return 'medium';
  if (value <= 80) return 'high';
  return 'extreme';
}

function rmRow(task: TaskWithRmRisk, t: TFunc) {
  const risk = task.properties.rm_risk;
  const rawRating = calculateRiskRating(
    risk[0].RawProbability,
    risk[0].RawImpact
  );
  const targetRating = calculateRiskRating(
    risk[1].TreatedProbability,
    risk[1].TreatedImpact
  );
  const currentRating = calculateCurrentRiskRating(
    rawRating,
    targetRating,
    risk[1].TreatmentStatus
  );
  return {
    id: String(task.taskNumber),
    risk: risk[0].Risk,
    assetOwner: risk[0].AssetOwner,
    impact: risk[0].Impact,
    rawProbability: t(riskValueToLabelKey(risk[0].RawProbability)),
    rawImpact: t(riskValueToLabelKey(risk[0].RawImpact)),
    rawRating: t(riskValueToLabelKey(rawRating)),
    rawRatingLevel: getRiskLevel(rawRating),
    treatment: risk[1].RiskTreatment,
    treatmentCost: risk[1].TreatmentCost,
    treatmentStatus: t(riskValueToLabelKey(risk[1].TreatmentStatus)),
    treatedProbability: t(riskValueToLabelKey(risk[1].TreatedProbability)),
    treatedImpact: t(riskValueToLabelKey(risk[1].TreatedImpact)),
    targetRating: t(riskValueToLabelKey(targetRating)),
    targetRatingLevel: getRiskLevel(targetRating),
    currentRating: t(riskValueToLabelKey(currentRating)),
    currentRatingLevel: getRiskLevel(currentRating),
  };
}

const HEADERS = (t: TFunc) => [
  t('task-id'),
  t('rm:fields.Risk'),
  t('rm:fields.AssetOwner'),
  t('rm:fields.Impact'),
  t('rm:fields.RawProbability'),
  t('rm:fields.RawImpact'),
  t('rm:headers.raw-risk-rating'),
  t('rm:headers.treatment'),
  t('rm:fields.TreatmentCost'),
  t('rm:fields.TreatmentStatus'),
  t('rm:fields.TreatedProbability'),
  t('rm:fields.TreatedImpact'),
  t('rm:headers.target-risk-rating'),
  t('rm:headers.current-risk-rating'),
];

const COL_WIDTHS = [10, 28, 18, 18, 16, 16, 16, 28, 16, 16, 16, 16, 16, 16];

// Risk-colored column indices (0-based): 6 = raw rating, 12 = target rating, 13 = current rating
const RISK_COL_INDICES = [6, 12, 13];

// ── XLSX ─────────────────────────────────────────────────────────────────────

export async function exportRmXlsx(
  tasks: TaskWithRmRisk[],
  teamName: string,
  t: TFunc
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';
  const ws = wb.addWorksheet('RM', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });
  const headers = HEADERS(t);
  buildXlsxHeader(
    ws,
    `${t('rm-dashboard')} — ${teamName}`,
    headers,
    COL_WIDTHS
  );

  tasks.forEach((task, idx) => {
    const r = idx + 5;
    const d = rmRow(task, t);
    const alt = idx % 2 === 1;
    const vals = [
      d.id,
      d.risk,
      d.assetOwner,
      d.impact,
      d.rawProbability,
      d.rawImpact,
      d.rawRating,
      d.treatment,
      d.treatmentCost,
      d.treatmentStatus,
      d.treatedProbability,
      d.treatedImpact,
      d.targetRating,
      d.currentRating,
    ];
    const levels = [
      null,
      null,
      null,
      null,
      null,
      null,
      d.rawRatingLevel,
      null,
      null,
      null,
      null,
      null,
      d.targetRatingLevel,
      d.currentRatingLevel,
    ];
    vals.forEach((v, ci) => {
      const cell = ws.getCell(r, ci + 1);
      cell.value = v;
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
      };
      if (RISK_COL_INDICES.includes(ci) && levels[ci]) {
        cell.fill = fill(RISK_BG_HEX[levels[ci]!] ?? 'FFFFFF');
        cell.font = { bold: true, size: 9 };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
      } else {
        cell.fill = fill(alt ? 'F5F8FA' : 'FFFFFF');
        cell.font = { size: 9 };
      }
    });
    ws.getRow(r).height = 22;
  });

  buildXlsxFooter(ws, tasks.length, headers.length, t('record-count'));

  const buf = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `RM_${teamName}_${datestamp()}.xlsx`
  );
}

// ── CSV ──────────────────────────────────────────────────────────────────────

export function exportRmCsv(
  tasks: TaskWithRmRisk[],
  teamName: string,
  t: TFunc
) {
  const headers = HEADERS(t);
  const rows = tasks.map((task) => {
    const d = rmRow(task, t);
    return [
      d.id,
      csvEsc(d.risk),
      csvEsc(d.assetOwner),
      csvEsc(d.impact),
      csvEsc(d.rawProbability),
      csvEsc(d.rawImpact),
      csvEsc(d.rawRating),
      csvEsc(d.treatment),
      csvEsc(d.treatmentCost),
      csvEsc(d.treatmentStatus),
      csvEsc(d.treatedProbability),
      csvEsc(d.treatedImpact),
      csvEsc(d.targetRating),
      csvEsc(d.currentRating),
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\r\n');
  triggerDownload(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    `RM_${teamName}_${datestamp()}.csv`
  );
}

// ── HTML ─────────────────────────────────────────────────────────────────────

export function exportRmHtml(
  tasks: TaskWithRmRisk[],
  teamName: string,
  t: TFunc
) {
  const headers = HEADERS(t);
  const riskStyle = (level: string) => {
    const colors: Record<string, string> = {
      low: '#90EE90',
      medium: '#FFFF64',
      high: '#FFA500',
      extreme: '#EF4444',
    };
    const fg: Record<string, string> = {
      low: '#1a1a1a',
      medium: '#1a1a1a',
      high: '#fff',
      extreme: '#fff',
    };
    return `background:${colors[level] ?? '#e2e8f0'};color:${fg[level] ?? '#1a1a1a'}`;
  };

  const tableRows = tasks
    .map((task, i) => {
      const d = rmRow(task, t);
      return `<tr class="${i % 2 ? 'alt' : ''}">
      <td class="mono">${escHtml(d.id)}</td>
      <td>${escHtml(d.risk)}</td>
      <td>${escHtml(d.assetOwner)}</td>
      <td>${escHtml(d.impact)}</td>
      <td>${escHtml(d.rawProbability)}</td>
      <td>${escHtml(d.rawImpact)}</td>
      <td><span class="badge" style="${riskStyle(d.rawRatingLevel)}">${escHtml(d.rawRating)}</span></td>
      <td>${escHtml(d.treatment)}</td>
      <td>${escHtml(d.treatmentCost)}</td>
      <td>${escHtml(d.treatmentStatus)}</td>
      <td>${escHtml(d.treatedProbability)}</td>
      <td>${escHtml(d.treatedImpact)}</td>
      <td><span class="badge" style="${riskStyle(d.targetRatingLevel)}">${escHtml(d.targetRating)}</span></td>
      <td><span class="badge" style="${riskStyle(d.currentRatingLevel)}">${escHtml(d.currentRating)}</span></td>
    </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escHtml(t('rm-dashboard'))} — ${escHtml(teamName)}</title>
<style>
:root{--brand:#0052cc;--mid:#0046ad;--text:#1a1a2e;--bdr:#D0D7DE;--alt:#F5F8FA;--meta:#EBF2FA}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;color:var(--text);padding:24px}
.hdr{background:var(--brand);color:#fff;padding:14px 20px;border-radius:6px 6px 0 0}.hdr h1{font-size:17px}
.meta{background:var(--meta);border:1px solid var(--bdr);border-top:none;padding:8px 20px;display:flex;justify-content:space-between;font-size:11px;margin-bottom:16px;border-radius:0 0 6px 6px}
table{width:100%;border-collapse:collapse;font-size:11px;margin-top:4px}
th{background:var(--mid);color:#fff;padding:9px 10px;text-align:left;position:sticky;top:0;z-index:1;white-space:nowrap;font-size:9px}
td{padding:8px 10px;border-bottom:1px solid var(--bdr);vertical-align:top}tr.alt td{background:var(--alt)}td.mono{font-family:monospace;white-space:nowrap}
.badge{display:inline-block;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:bold;white-space:nowrap}
.footer{margin-top:20px;font-size:10px;color:#888;text-align:center}
@media print{body{padding:8px;font-size:9px}th,td{padding:4px 6px;font-size:8px}.badge{font-size:8px;padding:2px 5px}}
</style></head><body>
<div class="hdr"><h1>${escHtml(t('rm-dashboard'))} — ${escHtml(teamName)}</h1></div>
<div class="meta"><div><strong>${escHtml(teamName)}</strong></div><div><strong>Date of Export:</strong> ${timestamp()}</div></div>
<table><thead><tr>${headers.map((h) => `<th>${escHtml(h)}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
<div class="footer">Generated by Unicis Platform &nbsp;•&nbsp; ${timestamp()} &nbsp;•&nbsp; ${tasks.length} record(s)</div>
</body></html>`;

  triggerDownload(
    new Blob([html], { type: 'text/html;charset=utf-8' }),
    `RM_${teamName}_${datestamp()}.html`
  );
}

// ── PDF ──────────────────────────────────────────────────────────────────────

export function exportRmPdf(
  tasks: TaskWithRmRisk[],
  teamName: string,
  t: TFunc
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 30;
  let y = margin;

  doc.setFillColor(0, 82, 204);
  doc.rect(margin, y, pageW - margin * 2, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${t('rm-dashboard')} — ${teamName}`, margin + 8, y + 18);
  y += 48;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 50);
  doc.text(teamName, margin, y);
  doc.text(`Date of Export: ${timestamp()}`, pageW - margin, y, {
    align: 'right',
  });
  y += 14;

  const headers = HEADERS(t);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [headers],
    body: tasks.map((task) => {
      const d = rmRow(task, t);
      return [
        d.id,
        d.risk,
        d.assetOwner,
        d.impact,
        d.rawProbability,
        d.rawImpact,
        d.rawRating,
        d.treatment,
        d.treatmentCost,
        d.treatmentStatus,
        d.treatedProbability,
        d.treatedImpact,
        d.targetRating,
        d.currentRating,
      ];
    }),
    styles: {
      fontSize: 6,
      cellPadding: 3,
      valign: 'top',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [17, 47, 117],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      6: { halign: 'center' },
      12: { halign: 'center' },
      13: { halign: 'center' },
    },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    didParseCell(data) {
      if (
        data.section === 'body' &&
        RISK_COL_INDICES.includes(data.column.index)
      ) {
        const row = tasks[data.row.index];
        if (row) {
          const d = rmRow(row, t);
          const levelMap: Record<number, string> = {
            6: d.rawRatingLevel,
            12: d.targetRatingLevel,
            13: d.currentRatingLevel,
          };
          const level = levelMap[data.column.index];
          if (level) {
            data.cell.styles.fillColor = RISK_BG_RGB[level] ?? [226, 232, 240];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
    didDrawPage() {
      doc.setFontSize(6.5);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated by Unicis Platform  •  ${timestamp()}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 15,
        { align: 'center' }
      );
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(`Total: ${tasks.length} record(s)`, margin, finalY);
  triggerDownload(doc.output('blob'), `RM_${teamName}_${datestamp()}.pdf`);
}

// ── ODS ──────────────────────────────────────────────────────────────────────

export function exportRmOds(
  tasks: TaskWithRmRisk[],
  teamName: string,
  t: TFunc
) {
  const headers = HEADERS(t);
  const rows = tasks.map((task) => {
    const d = rmRow(task, t);
    return [
      d.id,
      d.risk,
      d.assetOwner,
      d.impact,
      d.rawProbability,
      d.rawImpact,
      d.rawRating,
      d.treatment,
      d.treatmentCost,
      d.treatmentStatus,
      d.treatedProbability,
      d.treatedImpact,
      d.targetRating,
      d.currentRating,
    ];
  });
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = COL_WIDTHS.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RM');
  const buf = XLSX.write(wb, { bookType: 'ods', type: 'array' });
  triggerDownload(
    new Blob([buf], { type: 'application/vnd.oasis.opendocument.spreadsheet' }),
    `RM_${teamName}_${datestamp()}.ods`
  );
}
