import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fill, triggerDownload } from './exportHelpers';

// ── Shared import types ─────────────────────────────────────────────────────

export interface ImportRow {
  title: string;
  [key: string]: string | number | boolean | undefined;
  error?: string;
}

// ── Shared CSV parsing ──────────────────────────────────────────────────────

export function parseCsvLine(line: string): string[] {
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

// ── Generic file parsers ────────────────────────────────────────────────────

export async function parseCsvRows(file: File): Promise<string[][]> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'));
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => parseCsvLine(line));
}

export async function parseXlsxRows(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) return [];

  const rows: string[][] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (cell.value instanceof Date) {
        cells.push(format(cell.value, 'yyyy-MM-dd'));
      } else {
        cells.push(String(cell.value ?? '').trim());
      }
    });
    if (cells.some((c) => c)) rows.push(cells);
  });
  return rows;
}

export async function parseOdsRows(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];

  const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  if (data.length < 2) return [];
  return data.slice(1).filter((row) => row.some((c) => String(c ?? '').trim()));
}

export async function parseRows(file: File): Promise<string[][]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || file.type === 'text/csv') return parseCsvRows(file);
  if (ext === 'xlsx' || file.type.includes('spreadsheetml')) return parseXlsxRows(file);
  if (ext === 'ods' || file.type === 'application/vnd.oasis.opendocument.spreadsheet') return parseOdsRows(file);
  throw new Error('Unsupported file type. Please upload a .xlsx, .ods, or .csv file.');
}

// ── Template builders ───────────────────────────────────────────────────────

export async function downloadTemplateXlsx(
  headers: string[],
  examples: string[],
  notes: Record<number, string>,
  colWidths: number[],
  filename: string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';
  const ws = wb.addWorksheet('Import Template');

  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  headers.forEach((label, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = label;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = fill('00398F');
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  ws.getRow(1).height = 24;

  examples.forEach((val, i) => {
    const cell = ws.getCell(2, i + 1);
    cell.value = val;
    cell.font = { italic: true, color: { argb: 'FF888888' } };
    if (notes[i]) {
      cell.note = { texts: [{ text: notes[i] }] };
    }
  });
  ws.getRow(2).height = 18;

  const buf = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename
  );
}

export function downloadTemplateCsv(
  headers: string[],
  examples: string[],
  noteText: string,
  filename: string
): void {
  const csv = `${headers.join(',')}\r\n# ${noteText}\r\n${examples.map((e) => `"${e}"`).join(',')}`;
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}

export function downloadTemplateOds(
  headers: string[],
  examples: string[],
  colWidths: number[],
  filename: string
): void {
  const wsData = [headers, examples];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Import Template');
  const buf = XLSX.write(wb, { bookType: 'ods', type: 'array' });
  triggerDownload(
    new Blob([buf], { type: 'application/vnd.oasis.opendocument.spreadsheet' }),
    filename
  );
}
