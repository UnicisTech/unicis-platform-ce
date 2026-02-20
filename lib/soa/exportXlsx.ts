import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import type { SoaPayload } from './types';
import { CSC_STATUSES, CSC_STATUS_TO_VALUE } from '@/lib/csc/csc-statuses';

// Colours match CSC_STATUS_TO_CSS exactly
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  'unknown':                   { bg: 'E2E8F0', fg: '475569' },
  'not-applicable':            { bg: 'B2B2B2', fg: 'FFFFFF' },
  'not-performed':             { bg: 'FF0000', fg: 'FFFFFF' },
  'performed-informally':      { bg: 'CA003F', fg: 'FFFFFF' },
  'planned':                   { bg: '666666', fg: 'FFFFFF' },
  'well-defined':              { bg: 'FFBE00', fg: '1a1a1a' },
  'quantitatively-controlled': { bg: '6AD900', fg: '1a1a1a' },
  'continuously-improving':    { bg: '2F8F00', fg: 'FFFFFF' },
};

function argb(hex: string) { return `FF${hex.toUpperCase()}`; }
function fill(hex: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(hex) } };
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const MEANINGS: Record<string, string> = {
  'unknown':                   'Has not even been checked yet',
  'not-applicable':            'Management can ignore this control',
  'not-performed':             'Complete lack of recognizable policy, procedure, or control',
  'performed-informally':      'Barely started; significant work still required',
  'planned':                   'Progressing nicely but not yet complete',
  'well-defined':              'More or less complete; not yet enforced by management',
  'quantitatively-controlled': 'Complete, implemented and recently started operating',
  'continuously-improving':    'Fully satisfied, monitored, with substantial audit evidence',
};

export async function downloadSoaXlsx(payload: SoaPayload): Promise<void> {
  const { meta, rows } = payload;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Unicis Platform';

  // ── Sheet 1: SoA ──────────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Statement of Applicability', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
  });

  // Column widths: Code, Section, Control, Requirements, Status
  [12, 30, 40, 60, 28].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

  // Title
  ws.mergeCells('A1:E1');
  const t1 = ws.getCell('A1');
  t1.value     = `Statement of Applicability — ${meta.framework}`;
  t1.font      = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  t1.fill      = fill('0052cc');
  t1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(1).height = 34;

  // Metadata
  ws.mergeCells('A2:B2');
  ws.getCell('A2').value = `Organisation: ${meta.teamName}`;
  ws.getCell('A2').fill  = fill('EBF2FA');
  ws.getCell('A2').font  = { bold: true, size: 10 };
  ws.mergeCells('C2:E2');
  ws.getCell('C2').value     = `Date of Export: ${format(meta.dateOfExport, 'dd MMM yyyy HH:mm')}`;
  ws.getCell('C2').fill      = fill('EBF2FA');
  ws.getCell('C2').font      = { size: 9, italic: true };
  ws.getCell('C2').alignment = { horizontal: 'right' };
  ws.mergeCells('A3:B3');
  ws.getCell('A3').value = `Framework: ${meta.framework}`;
  ws.getCell('A3').fill  = fill('EBF2FA');
  ws.getCell('A3').font  = { size: 9, italic: true };
  ws.getRow(4).height = 5;

  // Column headers
  ['Code', 'Section', 'Control', 'Requirements', 'Status'].forEach((label, i) => {
    const cell     = ws.getCell(5, i + 1);
    cell.value     = label;
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill      = fill('00398f');
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FF1A3C5E' } } };
  });
  ws.getRow(5).height = 24;

  // Data rows
  rows.forEach((row, idx) => {
    const r     = idx + 6;
    const style = STATUS_STYLE[row.status] ?? STATUS_STYLE['unknown'];
    const alt   = idx % 2 === 1;

    [row.code, row.section, row.control, row.requirements, row.status].forEach((v, ci) => {
      const cell     = ws.getCell(r, ci + 1);
      cell.value     = v;
      cell.alignment = { wrapText: true, vertical: 'top' };
      cell.border    = {
        bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
        right:  { style: 'thin', color: { argb: 'FFD0D7DE' } },
      };
      if (ci === 4) {
        cell.fill      = fill(style.bg);
        cell.font      = { bold: true, color: { argb: argb(style.fg) }, size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.fill = fill(alt ? 'F5F8FA' : 'FFFFFF');
        cell.font = { size: 9 };
      }
    });
    ws.getRow(r).height = 40;
  });

  // Summary
  const sumR = rows.length + 6;
  ws.mergeCells(`A${sumR}:E${sumR}`);
  const counts = CSC_STATUSES
    .map((s) => `${s}: ${rows.filter((r) => r.status === s).length}`)
    .join('   |   ');
  ws.getCell(`A${sumR}`).value  = `Total: ${rows.length}   |   ${counts}`;
  ws.getCell(`A${sumR}`).font   = { italic: true, size: 8 };
  ws.getCell(`A${sumR}`).fill   = fill('E8EFF5');
  ws.getRow(sumR).height        = 16;

  ws.views      = [{ state: 'frozen', ySplit: 5 }];
  ws.autoFilter = { from: 'A5', to: 'E5' };

  // ── Sheet 2: Legend ────────────────────────────────────────────────────────
  const leg = wb.addWorksheet('Status Legend');
  [8, 30, 65].forEach((w, i) => { leg.getColumn(i + 1).width = w; });

  leg.mergeCells('A1:C1');
  leg.getCell('A1').value     = 'Unicis Control Status Maturity Scale';
  leg.getCell('A1').font      = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  leg.getCell('A1').fill      = fill('0052cc');
  leg.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  leg.getRow(1).height        = 28;

  ['Level', 'Status', 'Meaning'].forEach((h, i) => {
    const c = leg.getCell(2, i + 1);
    c.value     = h;
    c.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill      = fill('2C6E9B');
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  CSC_STATUSES.forEach((s, i) => {
    const style = STATUS_STYLE[s] ?? { bg: 'FFFFFF', fg: '000000' };
    const r     = i + 3;
    [CSC_STATUS_TO_VALUE[s], s, MEANINGS[s] ?? ''].forEach((v, ci) => {
      const c     = leg.getCell(r, ci + 1);
      c.value     = v;
      c.fill      = fill(style.bg);
      c.font      = { color: { argb: argb(style.fg) }, bold: ci === 1, size: 10 };
      c.alignment = { vertical: 'middle', horizontal: ci === 0 ? 'center' : 'left' };
      c.border    = { bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } } };
    });
    leg.getRow(r).height = 22;
  });

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, `SoA_${meta.iso}_${format(meta.dateOfExport, 'yyyy-MM-dd')}.xlsx`);
}