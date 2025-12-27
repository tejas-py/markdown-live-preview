// Export utilities for HTML, PDF (via browser print), DOCX, and Markdown
// Keeps everything client-side and uses the already-sanitized preview HTML

export function getDocumentTitleFromMarkdown(markdown) {
  try {
    const m = markdown.match(/^#\s+(.+)$/m);
    let title = m && m[1] ? m[1].trim() : 'document';
    // sanitize filename
    title = title.replace(/[\\/:*?"<>|\n\r\t]/g, ' ').trim();
    if (!title) title = 'document';
    return title;
  } catch (_) {
    return 'document';
  }
}

export function buildExportHTML({ bodyHtml, title, isDarkMode = false }) {
  // Wrap sanitized HTML in a standalone document
  // Use GitHub Markdown CSS via CDN for portability
  const cssCdn = isDarkMode
    ? 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-dark.min.css'
    : 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-light.min.css';

  const hljsCdn = isDarkMode
    ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.min.css'
    : 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css';

  const katexCdn = 'https://cdn.jsdelivr.net/npm/katex@0.16.15/dist/katex.min.css';

  const bgColor = isDarkMode ? '#0d1117' : '#fff';
  const textColor = isDarkMode ? '#c9d1d9' : '#24292f';

  const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssCdn}" />
  <link rel="stylesheet" href="${hljsCdn}" />
  <link rel="stylesheet" href="${katexCdn}" />
  <style>
    body {
      margin: 0;
      padding: 24px;
      background-color: ${bgColor};
      color: ${textColor};
    }
    .markdown-body {
      box-sizing: border-box;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }
    .table-of-contents {
      background: ${isDarkMode ? '#161b22' : '#f6f8fa'};
      border: 1px solid ${isDarkMode ? '#30363d' : '#d0d7de'};
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .table-of-contents h4 {
      margin: 0 0 8px 0;
    }
    .table-of-contents ul {
      margin: 0;
      padding-left: 20px;
    }
    .table-of-contents li {
      margin: 4px 0;
    }
    .mermaid {
      text-align: center;
      margin: 16px 0;
    }
    .task-list-item {
      list-style-type: none;
    }
    .task-list-item input[type="checkbox"] {
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <article class="markdown-body">${bodyHtml}</article>
</body>
</html>`;
  return doc;
}

export function downloadBlob({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportAsHTML({ bodyHtml, title, isDarkMode = false }) {
  const html = buildExportHTML({ bodyHtml, title, isDarkMode });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob({ blob, filename: `${title}.html` });
}

export function exportAsMarkdown({ markdown, title }) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  downloadBlob({ blob, filename: `${title}.md` });
}

export function exportAsDOC({ bodyHtml, title }) {
  const docContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
    pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; margin: 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
    th { background-color: #f6f8fa; }
    img { max-width: 100%; }
    .task-list-item { list-style-type: none; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;

  const blob = new Blob([docContent], { type: 'application/msword' });
  downloadBlob({ blob, filename: `${title}.doc` });
}

export function exportAsPDF({ bodyHtml, title, isDarkMode = false }) {
  const cssCdn = isDarkMode
    ? 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-dark.min.css'
    : 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-light.min.css';

  const hljsCdn = isDarkMode
    ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.min.css'
    : 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css';

  const katexCdn = 'https://cdn.jsdelivr.net/npm/katex@0.16.15/dist/katex.min.css';

  const bgColor = isDarkMode ? '#0d1117' : '#fff';
  const textColor = isDarkMode ? '#c9d1d9' : '#24292f';

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssCdn}" />
  <link rel="stylesheet" href="${hljsCdn}" />
  <link rel="stylesheet" href="${katexCdn}" />
  <style>
    @page {
      margin: 15mm;
    }
    html, body {
      background: ${bgColor} !important;
      color: ${textColor} !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    article.markdown-body {
      padding: 20px;
      max-width: 100%;
      background: ${bgColor};
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid ${isDarkMode ? '#30363d' : '#ddd'};
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: ${isDarkMode ? '#161b22' : '#f2f2f2'};
    }
    .mermaid svg {
      max-width: 100%;
    }
    .table-of-contents {
      background: ${isDarkMode ? '#161b22' : '#f6f8fa'};
      border: 1px solid ${isDarkMode ? '#30363d' : '#d0d7de'};
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .task-list-item {
      list-style-type: none;
    }
    h1, h2, h3 {
      page-break-after: avoid;
    }
    pre, blockquote, table, img {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <article class="markdown-body">${bodyHtml}</article>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const newWindow = window.open(url, '_blank');
  if (!newWindow) {
    alert('Popup blocked. Please allow popups to export as PDF.');
    URL.revokeObjectURL(url);
    return;
  }

  newWindow.addEventListener('load', () => {
    newWindow.print();
    URL.revokeObjectURL(url);
  });

  newWindow.addEventListener('afterprint', () => {
    newWindow.close();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
