import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { TaskWithRpaProcedure } from 'types';
import {
  triggerDownload,
  datestamp,
  timestamp,
  escHtml,
  csvEsc,
  fill,
  argb,
  getBgHex,
  getFgHex,
  getBgRgb,
  getFgRgb,
  buildXlsxHeader,
  buildXlsxFooter,
} from '@/lib/modules/exportHelpers';

type TFunc = (key: string, opts?: any) => string;

// ── Helpers ──────────────────────────────────────────────────────────────────

function rpaRow(task: TaskWithRpaProcedure, t: TFunc) {
  const p = task.properties.rpa_procedure;
  return {
    id: String(task.taskNumber),
    title: task.title,
    status: task.status,
    controller: p[0]?.controller ?? '',
    reviewDate: p[0]?.reviewDate ?? '',
    dataTransfer: p[3]?.datatransfer ? t('enabled') : t('disabled'),
    specialCategories: (p[1]?.specialcategory ?? [])
      .map((c: string) => t(`rpa:special-category.${c}`))
      .join(', '),
  };
}

const HEADERS = (t: TFunc) => [
  t('task-id'),
  t('title'),
  t('status'),
  t('rpa-controller'),
  t('rpa-review'),
  t('rpa-data-tranfer'),
  t('rpa-category'),
];

const COL_WIDTHS = [10, 40, 14, 25, 16, 16, 35];

// ── XLSX ─────────────────────────────────────────────────────────────────────

export async function exportRpaXlsx(
  tasks: TaskWithRpaProcedure[],
  teamName: string,
  t: TFunc
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';
  const ws = wb.addWorksheet('RPA', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });
  const headers = HEADERS(t);
  buildXlsxHeader(ws, `${t('rpa-dashboard')} — ${teamName}`, headers, COL_WIDTHS);

  tasks.forEach((task, idx) => {
    const r = idx + 5;
    const d = rpaRow(task, t);
    const alt = idx % 2 === 1;
    const status = task.status.toLowerCase();
    const vals = [d.id, d.title, d.status, d.controller, d.reviewDate, d.dataTransfer, d.specialCategories];
    vals.forEach((v, ci) => {
      const cell = ws.getCell(r, ci + 1);
      cell.value = v;
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
      };
      if (ci === 2) {
        cell.fill = fill(getBgHex(status));
        cell.font = { bold: true, color: { argb: argb(getFgHex(status)) }, size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
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
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `RPA_${teamName}_${datestamp()}.xlsx`
  );
}

// ── CSV ──────────────────────────────────────────────────────────────────────

export function exportRpaCsv(tasks: TaskWithRpaProcedure[], teamName: string, t: TFunc) {
  const headers = HEADERS(t);
  const rows = tasks.map((task) => {
    const d = rpaRow(task, t);
    return [d.id, csvEsc(d.title), d.status, csvEsc(d.controller), d.reviewDate, d.dataTransfer, csvEsc(d.specialCategories)].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\r\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `RPA_${teamName}_${datestamp()}.csv`);
}

// ── HTML ─────────────────────────────────────────────────────────────────────

export function exportRpaHtml(tasks: TaskWithRpaProcedure[], teamName: string, t: TFunc) {
  const headers = HEADERS(t);
  const tableRows = tasks
    .map((task, i) => {
      const d = rpaRow(task, t);
      const bgHex = `#${getBgHex(task.status.toLowerCase())}`;
      const fgHex = `#${getFgHex(task.status.toLowerCase())}`;
      return `<tr class="${i % 2 ? 'alt' : ''}">
      <td class="mono">${escHtml(d.id)}</td>
      <td>${escHtml(d.title)}</td>
      <td><span class="badge" style="background:${escHtml(bgHex)};color:${escHtml(fgHex)}">${escHtml(d.status)}</span></td>
      <td>${escHtml(d.controller)}</td>
      <td>${escHtml(d.reviewDate)}</td>
      <td>${escHtml(d.dataTransfer)}</td>
      <td>${escHtml(d.specialCategories)}</td>
    </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escHtml(t('rpa-dashboard'))} — ${escHtml(teamName)}</title>
<style>
:root{--brand:#0052cc;--mid:#0046ad;--text:#1a1a2e;--bdr:#D0D7DE;--alt:#F5F8FA;--meta:#EBF2FA}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:12px;color:var(--text);padding:24px}
.hdr{background:var(--brand);color:#fff;padding:14px 20px;border-radius:6px 6px 0 0}
.hdr h1{font-size:17px}
.meta{background:var(--meta);border:1px solid var(--bdr);border-top:none;padding:8px 20px;display:flex;justify-content:space-between;font-size:11px;margin-bottom:16px;border-radius:0 0 6px 6px}
table{width:100%;border-collapse:collapse;font-size:11px;margin-top:4px}
th{background:var(--mid);color:#fff;padding:9px 10px;text-align:left;position:sticky;top:0;z-index:1;white-space:nowrap}
td{padding:8px 10px;border-bottom:1px solid var(--bdr);vertical-align:top}
tr.alt td{background:var(--alt)}
td.mono{font-family:monospace;white-space:nowrap}
.badge{display:inline-block;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:bold;white-space:nowrap}
.footer{margin-top:20px;font-size:10px;color:#888;text-align:center}
@media print{body{padding:8px;font-size:9px}th,td{padding:4px 6px;font-size:8px}.badge{font-size:8px;padding:2px 5px}}
</style></head><body>
<div class="hdr"><h1>${escHtml(t('rpa-dashboard'))} — ${escHtml(teamName)}</h1></div>
<div class="meta"><div><strong>${escHtml(teamName)}</strong></div><div><strong>Date of Export:</strong> ${timestamp()}</div></div>
<table><thead><tr>${headers.map((h) => `<th>${escHtml(h)}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
<div class="footer">Generated by Unicis Platform &nbsp;•&nbsp; ${timestamp()} &nbsp;•&nbsp; ${tasks.length} record(s)</div>
</body></html>`;

  triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `RPA_${teamName}_${datestamp()}.html`);
}

// ── PDF ──────────────────────────────────────────────────────────────────────

export function exportRpaPdf(tasks: TaskWithRpaProcedure[], teamName: string, t: TFunc) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 30;
  let y = margin;

  doc.setFillColor(0, 82, 204);
  doc.rect(margin, y, pageW - margin * 2, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${t('rpa-dashboard')} — ${teamName}`, margin + 8, y + 18);
  y += 48;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 50);
  doc.text(teamName, margin, y);
  doc.text(`Date of Export: ${timestamp()}`, pageW - margin, y, { align: 'right' });
  y += 14;

  const headers = HEADERS(t);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [headers],
    body: tasks.map((task) => {
      const d = rpaRow(task, t);
      return [d.id, d.title, d.status, d.controller, d.reviewDate, d.dataTransfer, d.specialCategories];
    }),
    styles: { fontSize: 7, cellPadding: 4, valign: 'top', overflow: 'linebreak' },
    headStyles: { fillColor: [17, 47, 117], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: { 0: { cellWidth: 40 }, 2: { cellWidth: 60, halign: 'center' } },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 2) {
        const status = String(data.cell.raw ?? '').toLowerCase();
        data.cell.styles.fillColor = getBgRgb(status);
        data.cell.styles.textColor = getFgRgb(status);
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawPage() {
      doc.setFontSize(6.5);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated by Unicis Platform  •  ${timestamp()}`, pageW / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(`Total: ${tasks.length} record(s)`, margin, finalY);
  triggerDownload(doc.output('blob'), `RPA_${teamName}_${datestamp()}.pdf`);
}

// ── ODS ──────────────────────────────────────────────────────────────────────

export function exportRpaOds(tasks: TaskWithRpaProcedure[], teamName: string, t: TFunc) {
  const headers = HEADERS(t);
  const rows = tasks.map((task) => {
    const d = rpaRow(task, t);
    return [d.id, d.title, d.status, d.controller, d.reviewDate, d.dataTransfer, d.specialCategories];
  });
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = COL_WIDTHS.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RPA');
  const buf = XLSX.write(wb, { bookType: 'ods', type: 'array' });
  triggerDownload(
    new Blob([buf], { type: 'application/vnd.oasis.opendocument.spreadsheet' }),
    `RPA_${teamName}_${datestamp()}.ods`
  );
}
