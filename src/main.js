import Storehouse from 'storehouse-js';
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/+esm';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedFootnote from 'marked-footnote';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { markedEmoji } from 'marked-emoji';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import katex from 'katex';
import mermaid from 'mermaid';
import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-light.css';
import {
  getDocumentTitleFromMarkdown,
  exportAsHTML,
  exportAsPDF,
  exportAsMarkdown,
  exportAsDOC,
} from './export.js';

// Emoji dictionary for marked-emoji
const emojis = {
  smile: '\u{1F604}',
  laughing: '\u{1F606}',
  blush: '\u{1F60A}',
  heart_eyes: '\u{1F60D}',
  sunglasses: '\u{1F60E}',
  thinking: '\u{1F914}',
  thumbsup: '\u{1F44D}',
  thumbsdown: '\u{1F44E}',
  clap: '\u{1F44F}',
  fire: '\u{1F525}',
  rocket: '\u{1F680}',
  star: '\u{2B50}',
  heart: '\u{2764}\u{FE0F}',
  check: '\u{2705}',
  heavy_check_mark: '\u{2705}',
  x: '\u{274C}',
  warning: '\u{26A0}\u{FE0F}',
  bulb: '\u{1F4A1}',
  book: '\u{1F4D6}',
  link: '\u{1F517}',
  sparkles: '\u{2728}',
  zap: '\u{26A1}',
  bug: '\u{1F41B}',
  wrench: '\u{1F527}',
  gear: '\u{2699}\u{FE0F}',
  lock: '\u{1F512}',
  key: '\u{1F511}',
  megaphone: '\u{1F4E3}',
  bell: '\u{1F514}',
  gift: '\u{1F381}',
  calendar: '\u{1F4C5}',
  clock: '\u{1F552}',
  email: '\u{1F4E7}',
  phone: '\u{1F4DE}',
  computer: '\u{1F4BB}',
  folder: '\u{1F4C1}',
  file_folder: '\u{1F4C1}',
  file: '\u{1F4C4}',
  pencil: '\u{270F}\u{FE0F}',
  memo: '\u{1F4DD}',
  clipboard: '\u{1F4CB}',
  chart: '\u{1F4CA}',
  bar_chart: '\u{1F4CA}',
  search: '\u{1F50D}',
  eyes: '\u{1F440}',
  wave: '\u{1F44B}',
  pray: '\u{1F64F}',
  muscle: '\u{1F4AA}',
  tada: '\u{1F389}',
  party: '\u{1F389}',
  balloon: '\u{1F388}',
  crown: '\u{1F451}',
  trophy: '\u{1F3C6}',
  medal: '\u{1F3C5}',
  100: '\u{1F4AF}',
  plus1: '\u{1F44D}',
  minus1: '\u{1F44E}',
  question: '\u{2753}',
  exclamation: '\u{2757}',
  info: '\u{2139}\u{FE0F}',
  arrow_up: '\u{2B06}\u{FE0F}',
  arrow_down: '\u{2B07}\u{FE0F}',
  arrow_left: '\u{2B05}\u{FE0F}',
  arrow_right: '\u{27A1}\u{FE0F}',
  coffee: '\u{2615}',
  pizza: '\u{1F355}',
  beer: '\u{1F37A}',
  cake: '\u{1F370}',
  sun: '\u{2600}\u{FE0F}',
  moon: '\u{1F319}',
  cloud: '\u{2601}\u{FE0F}',
  rain: '\u{1F327}\u{FE0F}',
  snow: '\u{2744}\u{FE0F}',
  dog: '\u{1F436}',
  cat: '\u{1F431}',
  bird: '\u{1F426}',
  tree: '\u{1F333}',
  flower: '\u{1F33B}',
  earth: '\u{1F30D}',
  airplane: '\u{2708}\u{FE0F}',
  car: '\u{1F697}',
  house: '\u{1F3E0}',
  building: '\u{1F3E2}',
  keyboard: '\u{2328}\u{FE0F}',
  bookmark: '\u{1F516}',
  art: '\u{1F3A8}',
  abacus: '\u{1F9EE}',
};

// Utility function
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const init = () => {
  let hasEdited = false;
  let scrollBarSync = false;
  let isDarkMode = false;
  let showLineNumbers = true;
  let isFullscreen = false;

  const localStorageNamespace = 'com.markdownlivepreview';
  const localStorageKey = 'last_state';
  const localStorageScrollBarKey = 'scroll_bar_settings';
  const localStorageDarkModeKey = 'dark_mode';
  const localStorageLineNumbersKey = 'line_numbers';
  const confirmationMessage = 'Are you sure you want to reset? Your changes will be lost.';

  // Default template with enhanced examples
  const defaultInput = `# Markdown Live Preview

Welcome to the enhanced Markdown Live Preview! :rocket:

## Features

- :sparkles: **Syntax highlighting** for code blocks
- :moon: **Dark mode** toggle
- :bar_chart: **Word & character count**
- :file_folder: **Import/Export** markdown files
- :keyboard: **Keyboard shortcuts**
- :bookmark: **Table of Contents** generation
- :heavy_check_mark: **GFM checkboxes** and footnotes
- :smile: **Emoji support** using \`:emoji:\` syntax
- :art: **Mermaid diagrams**
- :abacus: **Math/LaTeX** equations

## Headers

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

## Emphasis

*Italic text* and **bold text** and ***bold italic***

~~Strikethrough text~~

## Lists

### Unordered
- Item 1
- Item 2
  - Nested item
  - Another nested

### Ordered
1. First item
2. Second item
3. Third item

### Task List (GFM)
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Links & Images

[Visit GitHub](https://github.com)

![Sample Image](/image/sample.webp "Sample image")

## Blockquotes

> This is a blockquote.
>
> It can span multiple lines.

## Code

Inline \`code\` looks like this.

\`\`\`javascript
// Syntax highlighted code block
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { greeting: 'Hello', name };
}

greet('World');
\`\`\`

\`\`\`python
# Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|:------:|-------|
| Dark Mode | :heavy_check_mark: | Toggle in header |
| Export | :heavy_check_mark: | HTML, PDF, DOC, MD |
| Diagrams | :heavy_check_mark: | Mermaid support |

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Math (LaTeX)

Inline math: $E = mc^2$

Block math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Preview
    User->>Editor: Type markdown
    Editor->>Preview: Render HTML
    Preview-->>User: Display result
\`\`\`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Download as Markdown |
| Ctrl/Cmd + Shift + E | Export as HTML |
| Ctrl/Cmd + D | Toggle dark mode |
| Ctrl/Cmd + O | Import file |
| F11 | Toggle fullscreen preview |
| Escape | Exit fullscreen |

---

Enjoy writing! :tada:
`;

  // Initialize Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  });

  // Configure marked with extensions
  marked.use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        if (lang === 'mermaid') {
          return code; // Don't highlight mermaid, we'll render it separately
        }
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  marked.use(markedFootnote());
  marked.use(gfmHeadingId());
  marked.use(
    markedEmoji({
      emojis,
      renderer: (token) => token.emoji,
    })
  );

  // Custom renderer for mermaid
  const renderer = new marked.Renderer();
  const originalCode = renderer.code;
  renderer.code = function (codeObj) {
    const codeText = typeof codeObj === 'object' ? codeObj.text : codeObj;
    const codeLang = typeof codeObj === 'object' ? codeObj.lang : arguments[1];

    if (codeLang === 'mermaid') {
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      return `<div class="mermaid" id="${id}">${escapeHtml(codeText)}</div>`;
    }
    return originalCode.apply(this, arguments);
  };

  marked.use({ renderer });

  // Monaco worker setup
  self.MonacoEnvironment = {
    getWorker(_, _label) {
      return new Proxy(
        {},
        {
          get: () => () => {},
        }
      );
    },
  };

  let editor;

  const setupEditor = () => {
    editor = monaco.editor.create(document.querySelector('#editor'), {
      fontSize: 14,
      language: 'markdown',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
      },
      wordWrap: 'on',
      hover: { enabled: false },
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      folding: false,
      lineNumbers: showLineNumbers ? 'on' : 'off',
      theme: isDarkMode ? 'vs-dark' : 'vs',
    });

    editor.onDidChangeModelContent(() => {
      const changed = editor.getValue() !== defaultInput;
      if (changed) {
        hasEdited = true;
      }
      const value = editor.getValue();
      convert(value);
      saveLastContent(value);
      updateWordCount(value);
    });

    editor.onDidScrollChange((e) => {
      if (!scrollBarSync) {
        return;
      }

      const scrollTop = e.scrollTop;
      const scrollHeight = e.scrollHeight;
      const height = editor.getLayoutInfo().height;

      const maxScrollTop = scrollHeight - height;
      const scrollRatio = scrollTop / maxScrollTop;

      const previewElement = document.querySelector('#preview');
      const targetY = (previewElement.scrollHeight - previewElement.clientHeight) * scrollRatio;
      previewElement.scrollTo(0, targetY);
    });

    return editor;
  };

  // KaTeX rendering for math
  const renderMath = (html) => {
    // Block math: $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return `<span class="katex-error">${escapeHtml(tex)}</span>`;
      }
    });

    // Inline math: $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `<span class="katex-error">${escapeHtml(tex)}</span>`;
      }
    });

    return html;
  };

  // Render mermaid diagrams
  const renderMermaidDiagrams = async () => {
    const mermaidDivs = document.querySelectorAll('.mermaid');
    for (const div of mermaidDivs) {
      try {
        const id = div.id;
        const code = div.textContent;
        const { svg } = await mermaid.render(id + '-svg', code);
        div.innerHTML = svg;
      } catch (error) {
        div.innerHTML = `<pre class="mermaid-error">Mermaid error: ${escapeHtml(error.message)}</pre>`;
      }
    }
  };

  // Generate Table of Contents
  const generateTOC = (markdown) => {
    const headings = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ level, text, id });
      }
    }

    if (headings.length === 0) return '';

    let toc = '<nav class="table-of-contents"><h4>Table of Contents</h4><ul>';
    for (const h of headings) {
      const indent = '  '.repeat(h.level - 1);
      toc += `${indent}<li><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`;
    }
    toc += '</ul></nav>';
    return toc;
  };

  // Render markdown to HTML
  const convert = async (markdown) => {
    // Check if TOC should be inserted
    let processedMarkdown = markdown;
    let insertTOC = false;

    if (markdown.includes('[TOC]') || markdown.includes('[[toc]]')) {
      insertTOC = true;
      processedMarkdown = markdown.replace(/\[TOC\]|\[\[toc\]\]/gi, '<!-- TOC_PLACEHOLDER -->');
    }

    // Process math before marked (protect from markdown parsing)
    processedMarkdown = processedMarkdown.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
      return `<!--MATH_BLOCK:${btoa(encodeURIComponent(match))}-->`;
    });
    processedMarkdown = processedMarkdown.replace(/\$([^$\n]+?)\$/g, (match) => {
      return `<!--MATH_INLINE:${btoa(encodeURIComponent(match))}-->`;
    });

    let html = marked.parse(processedMarkdown);

    // Restore math and render with KaTeX
    html = html.replace(/<!--MATH_BLOCK:([^>]+)-->/g, (_, encoded) => {
      const tex = decodeURIComponent(atob(encoded));
      return renderMath(tex);
    });
    html = html.replace(/<!--MATH_INLINE:([^>]+)-->/g, (_, encoded) => {
      const tex = decodeURIComponent(atob(encoded));
      return renderMath(tex);
    });

    // Insert TOC if requested
    if (insertTOC) {
      const toc = generateTOC(markdown);
      html = html.replace(/<!--\s*TOC_PLACEHOLDER\s*-->/g, toc);
    }

    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    });

    document.querySelector('#output').innerHTML = sanitized;

    // Render mermaid diagrams after DOM update
    await renderMermaidDiagrams();
  };

  // Update word and character count
  const updateWordCount = (text) => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const chars = text.length;
    const lines = text.split('\n').length;

    const countElement = document.querySelector('#word-count');
    if (countElement) {
      countElement.textContent = `${words} words | ${chars} chars | ${lines} lines`;
    }
  };

  // Reset input text
  const reset = () => {
    const changed = editor.getValue() !== defaultInput;
    if (hasEdited || changed) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) {
        return;
      }
    }
    presetValue(defaultInput);
    document.querySelectorAll('.column').forEach((element) => {
      element.scrollTo({ top: 0 });
    });
  };

  const presetValue = (value) => {
    editor.setValue(value);
    editor.revealPosition({ lineNumber: 1, column: 1 });
    editor.focus();
    hasEdited = false;
  };

  // ----- Dark Mode -----

  const loadDarkMode = () => {
    const saved = Storehouse.getItem(localStorageNamespace, localStorageDarkModeKey);
    return saved === true || saved === 'true';
  };

  const saveDarkMode = (enabled) => {
    const expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(localStorageNamespace, localStorageDarkModeKey, enabled, expiredAt);
  };

  const toggleDarkMode = () => {
    isDarkMode = !isDarkMode;
    applyDarkMode();
    saveDarkMode(isDarkMode);
  };

  const applyDarkMode = () => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    const darkModeBtn = document.querySelector('#dark-mode-button i');
    if (darkModeBtn) {
      darkModeBtn.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Update Monaco theme
    if (editor) {
      monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
    }

    // Update mermaid theme
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    // Re-render if content exists
    if (editor) {
      convert(editor.getValue());
    }
  };

  // ----- Line Numbers Toggle -----

  const loadLineNumbers = () => {
    const saved = Storehouse.getItem(localStorageNamespace, localStorageLineNumbersKey);
    return saved !== false && saved !== 'false';
  };

  const saveLineNumbers = (enabled) => {
    const expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(localStorageNamespace, localStorageLineNumbersKey, enabled, expiredAt);
  };

  const toggleLineNumbers = () => {
    showLineNumbers = !showLineNumbers;
    if (editor) {
      editor.updateOptions({ lineNumbers: showLineNumbers ? 'on' : 'off' });
    }
    saveLineNumbers(showLineNumbers);

    const checkbox = document.querySelector('#line-numbers-checkbox');
    if (checkbox) {
      checkbox.checked = showLineNumbers;
    }
  };

  // ----- Fullscreen Preview -----

  const toggleFullscreen = () => {
    isFullscreen = !isFullscreen;
    const editPane = document.getElementById('edit');
    const divider = document.getElementById('split-divider');
    const previewPane = document.getElementById('preview');
    const fullscreenBtn = document.querySelector('#fullscreen-button i');

    if (isFullscreen) {
      editPane.style.display = 'none';
      divider.style.display = 'none';
      previewPane.style.width = '100%';
      if (fullscreenBtn) fullscreenBtn.className = 'fas fa-compress';
    } else {
      editPane.style.display = '';
      divider.style.display = '';
      previewPane.style.width = '';
      if (fullscreenBtn) fullscreenBtn.className = 'fas fa-expand';
    }
  };

  // ----- Sync scroll position -----

  const initScrollBarSync = (settings) => {
    const checkbox = document.querySelector('#sync-scroll-checkbox');
    checkbox.checked = settings;
    scrollBarSync = settings;

    checkbox.addEventListener('change', (event) => {
      const checked = event.currentTarget.checked;
      scrollBarSync = checked;
      saveScrollBarSettings(checked);
    });
  };

  // ----- Clipboard utils -----

  const copyToClipboard = (text, successHandler, errorHandler) => {
    navigator.clipboard.writeText(text).then(
      () => {
        successHandler();
      },
      () => {
        errorHandler();
      }
    );
  };

  const notifyCopied = () => {
    const labelElement = document.querySelector('#copy-button a');
    labelElement.innerHTML = 'Copied!';
    setTimeout(() => {
      labelElement.innerHTML = 'Copy';
    }, 1000);
  };

  // ----- File Import -----

  const importFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (hasEdited && editor.getValue() !== defaultInput) {
          const confirmed = window.confirm(
            'You have unsaved changes. Do you want to replace with the imported file?'
          );
          if (!confirmed) return;
        }
        presetValue(content);
      };
      reader.readAsText(file);
    };

    input.click();
  };

  // ----- Image Drag & Drop -----

  const setupImageDragDrop = () => {
    const editorElement = document.querySelector('#editor');

    editorElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editorElement.classList.add('drag-over');
    });

    editorElement.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editorElement.classList.remove('drag-over');
    });

    editorElement.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      editorElement.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target.result;
            const markdown = `![${file.name}](${base64})`;

            // Insert at cursor position
            const position = editor.getPosition();
            editor.executeEdits('', [
              {
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column
                ),
                text: markdown,
              },
            ]);
          };
          reader.readAsDataURL(file);
        } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          // Handle markdown file drop
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target.result;
            if (hasEdited && editor.getValue() !== defaultInput) {
              const confirmed = window.confirm(
                'You have unsaved changes. Do you want to replace with the dropped file?'
              );
              if (!confirmed) return;
            }
            presetValue(content);
          };
          reader.readAsText(file);
        }
      }
    });
  };

  // ----- Keyboard Shortcuts -----

  const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save as Markdown
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        const markdown = editor.getValue();
        const title = getDocumentTitleFromMarkdown(markdown);
        exportAsMarkdown({ markdown, title });
      }

      // Ctrl/Cmd + Shift + E: Export as HTML
      if (ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const outputElement = document.getElementById('output');
        const content = outputElement.innerHTML;
        const title = getDocumentTitleFromMarkdown(editor.getValue());
        exportAsHTML({ bodyHtml: content, title, isDarkMode });
      }

      // Ctrl/Cmd + D: Toggle dark mode
      if (ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }

      // Ctrl/Cmd + O: Import file
      if (ctrlKey && e.key === 'o') {
        e.preventDefault();
        importFile();
      }

      // F11: Toggle fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }

      // Escape: Exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    });
  };

  // ----- Setup functions -----

  const setupResetButton = () => {
    document.querySelector('#reset-button').addEventListener('click', (event) => {
      event.preventDefault();
      reset();
    });
  };

  const setupCopyButton = () => {
    document.querySelector('#copy-button').addEventListener('click', (event) => {
      event.preventDefault();
      const value = editor.getValue();
      copyToClipboard(
        value,
        () => {
          notifyCopied();
        },
        () => {
          // nothing to do
        }
      );
    });
  };

  const setupDarkModeButton = () => {
    const btn = document.querySelector('#dark-mode-button');
    if (btn) {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        toggleDarkMode();
      });
    }
  };

  const setupImportButton = () => {
    const btn = document.querySelector('#import-button');
    if (btn) {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        importFile();
      });
    }
  };

  const setupFullscreenButton = () => {
    const btn = document.querySelector('#fullscreen-button');
    if (btn) {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        toggleFullscreen();
      });
    }
  };

  const setupLineNumbersCheckbox = () => {
    const checkbox = document.querySelector('#line-numbers-checkbox');
    if (checkbox) {
      checkbox.checked = showLineNumbers;
      checkbox.addEventListener('change', () => {
        toggleLineNumbers();
      });
    }
  };

  // ----- Local state -----

  const loadLastContent = () => {
    const lastContent = Storehouse.getItem(localStorageNamespace, localStorageKey);
    return lastContent;
  };

  const saveLastContent = (content) => {
    const expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(localStorageNamespace, localStorageKey, content, expiredAt);
  };

  const loadScrollBarSettings = () => {
    const lastContent = Storehouse.getItem(localStorageNamespace, localStorageScrollBarKey);
    return lastContent;
  };

  const saveScrollBarSettings = (settings) => {
    const expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(localStorageNamespace, localStorageScrollBarKey, settings, expiredAt);
  };

  const setupDivider = () => {
    let lastLeftRatio = 0.5;
    const divider = document.getElementById('split-divider');
    const leftPane = document.getElementById('edit');
    const rightPane = document.getElementById('preview');
    const container = document.getElementById('container');

    let isDragging = false;

    divider.addEventListener('mouseenter', () => {
      divider.classList.add('hover');
    });

    divider.addEventListener('mouseleave', () => {
      if (!isDragging) {
        divider.classList.remove('hover');
      }
    });

    divider.addEventListener('mousedown', () => {
      isDragging = true;
      divider.classList.add('active');
      document.body.style.cursor = 'col-resize';
    });

    divider.addEventListener('dblclick', () => {
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const dividerWidth = divider.offsetWidth;
      const halfWidth = (totalWidth - dividerWidth) / 2;

      leftPane.style.width = halfWidth + 'px';
      rightPane.style.width = halfWidth + 'px';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      document.body.style.userSelect = 'none';
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;
      const dividerWidth = divider.offsetWidth;

      const minWidth = 100;
      const maxWidth = totalWidth - minWidth - dividerWidth;
      const leftWidth = Math.max(minWidth, Math.min(offsetX, maxWidth));
      leftPane.style.width = leftWidth + 'px';
      rightPane.style.width = totalWidth - leftWidth - dividerWidth + 'px';
      lastLeftRatio = leftWidth / (totalWidth - dividerWidth);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        divider.classList.remove('active');
        divider.classList.remove('hover');
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    });

    window.addEventListener('resize', () => {
      const containerRect = container.getBoundingClientRect();
      const totalWidth = containerRect.width;
      const dividerWidth = divider.offsetWidth;
      const availableWidth = totalWidth - dividerWidth;

      const newLeft = availableWidth * lastLeftRatio;
      const newRight = availableWidth * (1 - lastLeftRatio);

      leftPane.style.width = newLeft + 'px';
      rightPane.style.width = newRight + 'px';
    });
  };

  // ----- Download menu -----
  const setupDownloadMenu = () => {
    const downloadButton = document.getElementById('download-button');
    const downloadMenu = document.getElementById('download-menu');
    const dropdownContent = downloadMenu.querySelector('.dropdown-content');

    downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', (event) => {
      if (!downloadMenu.contains(event.target)) {
        dropdownContent.style.display = 'none';
      }
    });

    // Export PDF
    document.getElementById('export-pdf').addEventListener('click', (event) => {
      event.preventDefault();
      const outputElement = document.getElementById('output');
      const content = outputElement.innerHTML;
      const title = getDocumentTitleFromMarkdown(editor.getValue());
      exportAsPDF({ bodyHtml: content, title, isDarkMode });
      dropdownContent.style.display = 'none';
    });

    // Export DOC
    document.getElementById('export-doc').addEventListener('click', (event) => {
      event.preventDefault();
      const outputElement = document.getElementById('output');
      const content = outputElement.innerHTML;
      const title = getDocumentTitleFromMarkdown(editor.getValue());
      exportAsDOC({ bodyHtml: content, title });
      dropdownContent.style.display = 'none';
    });

    // Export HTML
    document.getElementById('export-html').addEventListener('click', (event) => {
      event.preventDefault();
      const outputElement = document.getElementById('output');
      const content = outputElement.innerHTML;
      const title = getDocumentTitleFromMarkdown(editor.getValue());
      exportAsHTML({ bodyHtml: content, title, isDarkMode });
      dropdownContent.style.display = 'none';
    });

    // Export Markdown
    document.getElementById('export-md').addEventListener('click', (event) => {
      event.preventDefault();
      const markdown = editor.getValue();
      const title = getDocumentTitleFromMarkdown(markdown);
      exportAsMarkdown({ markdown, title });
      dropdownContent.style.display = 'none';
    });
  };

  // ----- Entry point -----

  // Load settings
  isDarkMode = loadDarkMode();
  showLineNumbers = loadLineNumbers();

  const lastContent = loadLastContent();
  editor = setupEditor();

  if (lastContent) {
    presetValue(lastContent);
  } else {
    presetValue(defaultInput);
  }

  // Initial word count
  updateWordCount(editor.getValue());

  setupResetButton();
  setupCopyButton();
  setupDarkModeButton();
  setupImportButton();
  setupFullscreenButton();
  setupLineNumbersCheckbox();
  setupDownloadMenu();
  setupKeyboardShortcuts();
  setupImageDragDrop();

  const scrollBarSettings = loadScrollBarSettings() || false;
  initScrollBarSync(scrollBarSettings);

  setupDivider();

  // Apply dark mode if saved
  applyDarkMode();
};

window.addEventListener('load', () => {
  init();

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  }
});
