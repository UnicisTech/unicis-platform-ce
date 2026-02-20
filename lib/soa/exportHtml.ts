import { format } from 'date-fns';
import type { SoaPayload } from './types';
import { CSC_STATUSES, CSC_STATUS_TO_VALUE } from '@/lib/csc/csc-statuses';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  'unknown':                   { bg: '#E2E8F0', fg: '#475569' },
  'not-applicable':            { bg: '#B2B2B2', fg: '#FFFFFF' },
  'not-performed':             { bg: '#FF0000', fg: '#FFFFFF' },
  'performed-informally':      { bg: '#CA003F', fg: '#FFFFFF' },
  'planned':                   { bg: '#666666', fg: '#FFFFFF' },
  'well-defined':              { bg: '#FFBE00', fg: '#1a1a1a' },
  'quantitatively-controlled': { bg: '#6AD900', fg: '#1a1a1a' },
  'continuously-improving':    { bg: '#2F8F00', fg: '#FFFFFF' },
};

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSoaHtml(payload: SoaPayload): void {
  const { meta, rows } = payload;

  const summaryBars = CSC_STATUSES.map((s) => {
    const c   = STATUS_COLORS[s] ?? { bg: '#eee', fg: '#333' };
    const cnt = rows.filter((r) => r.status === s).length;
    return `<div class="bar-item" style="background:${c.bg};color:${c.fg};flex:${Math.max(cnt, 0.3)}">
      <strong>${cnt}</strong><br/><span>${esc(s)}</span></div>`;
  }).join('');

  const legendItems = CSC_STATUSES.map((s) => {
    const c = STATUS_COLORS[s] ?? { bg: '#eee', fg: '#333' };
    return `<div class="leg-item" style="background:${c.bg};color:${c.fg}">
      <span class="leg-lv">Level ${CSC_STATUS_TO_VALUE[s]}</span>
      <strong>${esc(s)}</strong>
    </div>`;
  }).join('');

  const tableRows = rows.map((row, i) => {
    const c = STATUS_COLORS[row.status] ?? { bg: '#eee', fg: '#333' };
    return `<tr class="${i % 2 ? 'alt' : ''}">
      <td class="mono">${esc(row.code)}</td>
      <td>${esc(row.section)}</td>
      <td>${esc(row.control)}</td>
      <td class="req">${esc(row.requirements)}</td>
      <td><span class="badge" style="background:${c.bg};color:${c.fg}">${esc(row.status)}</span></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SoA — ${esc(meta.framework)}</title>
<style>
  :root{--brand:#0052cc;--mid:#0046ad;--text:#1a1a2e;--bdr:#D0D7DE;--alt:#F5F8FA;--meta:#EBF2FA}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:var(--text);padding:24px}
  .hdr{background:var(--brand);color:#fff;padding:14px 20px;border-radius:6px 6px 0 0}
  .hdr h1{font-size:17px}
  .meta{background:var(--meta);border:1px solid var(--bdr);border-top:none;padding:8px 20px;
        display:flex;justify-content:space-between;font-size:11px;margin-bottom:16px;
        border-radius:0 0 6px 6px}
  .bar-wrap{display:flex;border-radius:6px;overflow:hidden;margin-bottom:14px;
            font-size:10px;min-height:44px}
  .bar-item{padding:6px 4px;text-align:center;overflow:hidden;white-space:nowrap;
            text-overflow:ellipsis;min-width:0}
  details{margin-bottom:16px}
  summary{cursor:pointer;font-weight:bold;color:var(--brand);padding:4px 0;user-select:none}
  .leg-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .leg-item{padding:6px 10px;border-radius:6px;font-size:10px;min-width:120px;flex:1}
  .leg-lv{display:block;font-size:9px;opacity:.7;margin-bottom:2px}
  table{width:100%;border-collapse:collapse;font-size:11px;margin-top:4px}
  th{background:var(--mid);color:#fff;padding:9px 10px;text-align:left;
     position:sticky;top:0;z-index:1;white-space:nowrap}
  td{padding:8px 10px;border-bottom:1px solid var(--bdr);vertical-align:top}
  tr.alt td{background:var(--alt)}
  td.mono{font-family:monospace;white-space:nowrap}
  td.req{max-width:300px;white-space:pre-line}
  .badge{display:inline-block;padding:3px 8px;border-radius:12px;
         font-size:10px;font-weight:bold;white-space:nowrap}
  .footer{margin-top:20px;font-size:10px;color:#888;text-align:center}
  @media print{
    .bar-wrap{display:none}
    body{padding:8px;font-size:9px}
    th,td{padding:4px 6px;font-size:8px}
    .badge{font-size:8px;padding:2px 5px}
  }
</style>
</head>
<body>
<div class="hdr"><h1>Statement of Applicability — ${esc(meta.framework)}</h1></div>
<div class="meta">
  <div><strong>Organisation:</strong> ${esc(meta.teamName)}</div>
  <div><strong>Date of Export:</strong> ${format(meta.dateOfExport, 'dd MMM yyyy HH:mm')}</div>
</div>
<div class="bar-wrap">${summaryBars}</div>
<details open>
  <summary>▸ Status Legend</summary>
  <div class="leg-wrap">${legendItems}</div>
</details>
<table>
  <thead>
    <tr>
      <th>Code</th><th>Section</th><th>Control</th>
      <th>Requirements</th><th>Status</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">
  Generated by <strong>Unicis Platform</strong> &nbsp;•&nbsp;
  ${format(meta.dateOfExport, 'dd MMM yyyy HH:mm')} &nbsp;•&nbsp;
  ${rows.length} controls
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `SoA_${meta.iso}_${format(meta.dateOfExport, 'yyyy-MM-dd')}.html`);
}