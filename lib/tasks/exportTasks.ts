import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Task } from '@prisma/client';
import { getTaskModules } from '@/lib/tasks';

// Module label map (matches ModuleBadge labelMap)
const MODULE_LABELS: Record<string, string> = {
  rpa_procedure: 'RPA',
  tia_procedure: 'TIA',
  pia_risk: 'PIA',
  rm_risk: 'RM',
  csc_controls: 'CSC',
};

// Status colors from tailwind.config.js task palette
type RGB = [number, number, number];
const STATUS_BG_HEX: Record<string, string> = {
  todo: 'E8E8E8',
  inprogress: '7B92B2',
  inreview: '4D6EFF',
  feedback: '00B5FF',
  done: '00A96E',
  failed: 'EF4444',
};
const STATUS_FG_HEX: Record<string, string> = {
  todo: '1a1a1a',
};
const STATUS_BG_RGB: Record<string, RGB> = {
  todo: [232, 232, 232],
  inprogress: [123, 146, 178],
  inreview: [77, 110, 255],
  feedback: [0, 181, 255],
  done: [0, 169, 110],
  failed: [239, 68, 68],
};
const STATUS_FG_RGB: Record<string, RGB> = {
  todo: [26, 26, 26],
};
const DEFAULT_FG_HEX = 'FFFFFF';
const DEFAULT_FG_RGB: RGB = [255, 255, 255];

// Valid statuses for import validation
export const VALID_STATUSES = ['todo', 'inprogress', 'inreview', 'feedback', 'done', 'failed'];

// Import row shape
export interface TaskImportRow {
  title: string;
  status: string;
  duedate: string;
  error?: string;
}

function getBgHex(status: string) { return STATUS_BG_HEX[status] ?? 'E2E8F0'; }
function getFgHex(status: string) { return STATUS_FG_HEX[status] ?? DEFAULT_FG_HEX; }
function getBgRgb(status: string): RGB { return STATUS_BG_RGB[status] ?? [226, 232, 240]; }
function getFgRgb(status: string): RGB { return STATUS_FG_RGB[status] ?? DEFAULT_FG_RGB; }

function argb(hex: string) { return `FF${hex.toUpperCase()}`; }
function fill(hex: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(hex) } };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getModulesLabel(properties: unknown): string {
  if (typeof properties !== 'object' || !properties) return '';
  return getTaskModules(properties as Record<string, unknown>)
    .map((k) => MODULE_LABELS[k] || k.toUpperCase())
    .join(', ');
}

function formatDueDate(duedate: string | null | undefined): string {
  if (!duedate) return '';
  try {
    return new Date(duedate).toLocaleDateString();
  } catch {
    return duedate;
  }
}

// ── XLSX Export ────────────────────────────────────────────────────────────────

export async function exportTasksXlsx(tasks: Task[], teamName: string): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';

  const ws = wb.addWorksheet('Tasks', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });

  // Column widths: Task ID, Title, Modules, Status, Due Date
  [10, 50, 25, 20, 18].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // Title row
  ws.mergeCells('A1:E1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `Tasks — ${teamName}`;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = fill('0052CC');
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(1).height = 34;

  // Metadata row
  ws.mergeCells('A2:C2');
  ws.getCell('A2').value = `Organisation: ${teamName}`;
  ws.getCell('A2').fill = fill('EBF2FA');
  ws.getCell('A2').font = { bold: true, size: 10 };
  ws.mergeCells('D2:E2');
  ws.getCell('D2').value = `Date of Export: ${format(new Date(), 'dd MMM yyyy HH:mm')}`;
  ws.getCell('D2').fill = fill('EBF2FA');
  ws.getCell('D2').font = { size: 9, italic: true };
  ws.getCell('D2').alignment = { horizontal: 'right' };
  ws.getRow(3).height = 5;

  // Header row
  ['Task ID', 'Title', 'Modules', 'Status', 'Due Date'].forEach((label, i) => {
    const cell = ws.getCell(4, i + 1);
    cell.value = label;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = fill('00398F');
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF1A3C5E' } } };
  });
  ws.getRow(4).height = 24;

  // Data rows
  tasks.forEach((task, idx) => {
    const r = idx + 5;
    const alt = idx % 2 === 1;
    const status = task.status.toLowerCase();
    const modules = getModulesLabel(task.properties);
    const dueDate = formatDueDate(task.duedate);

    [String(task.taskNumber), task.title, modules, task.status, dueDate].forEach((v, ci) => {
      const cell = ws.getCell(r, ci + 1);
      cell.value = v;
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
      };
      if (ci === 3) {
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

  // Summary row
  const sumR = tasks.length + 5;
  ws.mergeCells(`A${sumR}:E${sumR}`);
  ws.getCell(`A${sumR}`).value = `Total: ${tasks.length} task(s)  |  Generated by Unicis Platform  |  ${format(new Date(), 'dd MMM yyyy HH:mm')}`;
  ws.getCell(`A${sumR}`).font = { italic: true, size: 8 };
  ws.getCell(`A${sumR}`).fill = fill('E8EFF5');
  ws.getRow(sumR).height = 16;

  ws.views = [{ state: 'frozen', ySplit: 4 }];
  ws.autoFilter = { from: 'A4', to: 'E4' };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, `Tasks_${teamName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ── CSV Export ─────────────────────────────────────────────────────────────────

export function exportTasksCsv(tasks: Task[], teamName: string): void {
  const csvEsc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const headers = ['Task ID', 'Title', 'Modules', 'Status', 'Due Date'];
  const rows = tasks.map((task) => [
    task.taskNumber,
    csvEsc(task.title),
    csvEsc(getModulesLabel(task.properties)),
    task.status,
    csvEsc(formatDueDate(task.duedate)),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `Tasks_${teamName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

// ── HTML Export ────────────────────────────────────────────────────────────────

export function exportTasksHtml(tasks: Task[], teamName: string): void {
  function esc(s: string) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const tableRows = tasks.map((task, i) => {
    const status = task.status.toLowerCase();
    const bgHex = `#${getBgHex(status)}`;
    const fgHex = `#${getFgHex(status)}`;
    const modules = getModulesLabel(task.properties);
    const dueDate = formatDueDate(task.duedate) || '—';
    return `<tr class="${i % 2 ? 'alt' : ''}">
      <td class="mono">${esc(String(task.taskNumber))}</td>
      <td>${esc(task.title)}</td>
      <td>${esc(modules)}</td>
      <td><span class="badge" style="background:${esc(bgHex)};color:${esc(fgHex)}">${esc(task.status)}</span></td>
      <td>${esc(dueDate)}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Tasks — ${esc(teamName)}</title>
<style>
  :root{--brand:#0052cc;--mid:#0046ad;--text:#1a1a2e;--bdr:#D0D7DE;--alt:#F5F8FA;--meta:#EBF2FA}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:var(--text);padding:24px}
  .hdr{background:var(--brand);color:#fff;padding:14px 20px;border-radius:6px 6px 0 0}
  .hdr h1{font-size:17px}
  .meta{background:var(--meta);border:1px solid var(--bdr);border-top:none;padding:8px 20px;
        display:flex;justify-content:space-between;font-size:11px;margin-bottom:16px;
        border-radius:0 0 6px 6px}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:4px}
  th{background:var(--mid);color:#fff;padding:9px 10px;text-align:left;
     position:sticky;top:0;z-index:1;white-space:nowrap}
  td{padding:8px 10px;border-bottom:1px solid var(--bdr);vertical-align:top}
  tr.alt td{background:var(--alt)}
  td.mono{font-family:monospace;white-space:nowrap}
  .badge{display:inline-block;padding:3px 8px;border-radius:12px;
         font-size:10px;font-weight:bold;white-space:nowrap}
  .footer{margin-top:20px;font-size:10px;color:#888;text-align:center}
  @media print{
    body{padding:8px;font-size:9px}
    th,td{padding:4px 6px;font-size:8px}
    .badge{font-size:8px;padding:2px 5px}
  }
</style>
</head>
<body>
<div class="hdr"><h1>Tasks — ${esc(teamName)}</h1></div>
<div class="meta">
  <div><strong>Organisation:</strong> ${esc(teamName)}</div>
  <div><strong>Date of Export:</strong> ${format(new Date(), 'dd MMM yyyy HH:mm')}</div>
</div>
<table>
  <thead>
    <tr>
      <th>Task ID</th>
      <th>Title</th>
      <th>Modules</th>
      <th>Status</th>
      <th>Due Date</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">
  Generated by Unicis Platform &nbsp;•&nbsp;
  ${format(new Date(), 'dd MMM yyyy HH:mm')} &nbsp;•&nbsp;
  ${tasks.length} task(s)
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `Tasks_${teamName}_${format(new Date(), 'yyyy-MM-dd')}.html`);
}

// ── PDF Export ─────────────────────────────────────────────────────────────────

export function exportTasksPdf(tasks: Task[], teamName: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 30;
  let y = margin;

  // Title bar
  doc.setFillColor(0, 82, 204);
  doc.rect(margin, y, pageW - margin * 2, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Tasks — ${teamName}`, margin + 8, y + 18);
  y += 48;

  // Meta line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 50);
  doc.text(`Organisation: ${teamName}`, margin, y);
  doc.text(
    `Date of Export: ${format(new Date(), 'dd MMM yyyy HH:mm')}`,
    pageW - margin,
    y,
    { align: 'right' }
  );
  y += 14;

  // Data table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Task ID', 'Title', 'Modules', 'Status', 'Due Date']],
    body: tasks.map((task) => [
      String(task.taskNumber),
      task.title,
      getModulesLabel(task.properties),
      task.status,
      formatDueDate(task.duedate) || '—',
    ]),
    styles: { fontSize: 7, cellPadding: 4, valign: 'top', overflow: 'linebreak' },
    headStyles: { fillColor: [17, 47, 117], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 80 },
      3: { cellWidth: 75, halign: 'center' },
      4: { cellWidth: 65, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [245, 248, 250] },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 3) {
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
      doc.text(
        `Generated by Unicis Platform  •  ${format(new Date(), 'dd MMM yyyy HH:mm')}`,
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
  doc.text(`Total: ${tasks.length} task(s)`, margin, finalY);

  const blob = doc.output('blob');
  triggerDownload(blob, `Tasks_${teamName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ── Import Templates ───────────────────────────────────────────────────────────

export async function downloadTaskTemplateXlsx(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';

  const ws = wb.addWorksheet('Tasks Template');
  [50, 20, 20].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // Header row
  ['Title', 'Status', 'Due Date'].forEach((label, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = label;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = fill('00398F');
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  ws.getRow(1).height = 24;

  // Instructions / example row
  const notes = ws.getCell('A2');
  notes.value = 'Example Task Title';
  notes.font = { italic: true, color: { argb: 'FF888888' } };

  const statusNote = ws.getCell('B2');
  statusNote.value = 'todo';
  statusNote.font = { italic: true, color: { argb: 'FF888888' } };
  statusNote.note = {
    texts: [{ text: `Valid values:\n${VALID_STATUSES.join('\n')}` }],
  };

  const dateNote = ws.getCell('C2');
  dateNote.value = format(new Date(), 'yyyy-MM-dd');
  dateNote.font = { italic: true, color: { argb: 'FF888888' } };
  dateNote.note = { texts: [{ text: 'Format: YYYY-MM-DD (optional)' }] };

  ws.getRow(2).height = 18;

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, 'Tasks_Import_Template.xlsx');
}

export function downloadTaskTemplateCsv(): void {
  const example = `"Example Task Title",todo,${format(new Date(), 'yyyy-MM-dd')}`;
  const note = `# Status values: ${VALID_STATUSES.join(' | ')}  |  Due Date format: YYYY-MM-DD (optional)`;
  const csv = `Title,Status,Due Date\r\n${note}\r\n${example}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, 'Tasks_Import_Template.csv');
}

// ── Parse Import File (client-side) ───────────────────────────────────────────

export async function parseImportFile(file: File): Promise<TaskImportRow[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv' || file.type === 'text/csv') {
    return parseCsvImport(file);
  } else if (ext === 'xlsx' || file.type.includes('spreadsheetml')) {
    return parseXlsxImport(file);
  }
  throw new Error('Unsupported file type. Please upload a .xlsx or .csv file.');
}

async function parseCsvImport(file: File): Promise<TaskImportRow[]> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));

  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1);
  return dataLines.map((line) => {
    const cols = parseCsvLine(line);
    const title = cols[0]?.trim() ?? '';
    const status = cols[1]?.trim().toLowerCase() ?? '';
    const duedate = cols[2]?.trim() ?? '';
    return validateImportRow({ title, status, duedate });
  });
}

async function parseXlsxImport(file: File): Promise<TaskImportRow[]> {
  const buf = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const ws = wb.worksheets[0];
  if (!ws) return [];

  const rows: TaskImportRow[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const title = String(row.getCell(1).value ?? '').trim();
    const status = String(row.getCell(2).value ?? '').trim().toLowerCase();
    const rawDate = row.getCell(3).value;
    let duedate = '';
    if (rawDate instanceof Date) {
      duedate = format(rawDate, 'yyyy-MM-dd');
    } else if (rawDate) {
      duedate = String(rawDate).trim();
    }
    if (!title && !status) return; // skip truly empty rows
    rows.push(validateImportRow({ title, status, duedate }));
  });

  return rows;
}

function validateImportRow(row: { title: string; status: string; duedate: string }): TaskImportRow {
  const errors: string[] = [];
  if (!row.title) errors.push('Title is required');
  if (!VALID_STATUSES.includes(row.status)) {
    errors.push(`Invalid status "${row.status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (row.duedate && isNaN(Date.parse(row.duedate))) {
    errors.push(`Invalid date "${row.duedate}"`);
  }
  return {
    title: row.title,
    status: row.status,
    duedate: row.duedate,
    ...(errors.length ? { error: errors.join('; ') } : {}),
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
