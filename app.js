const owner = "kilevoy";
const repo = "hh";
const branch = "main";

const treeRoot = document.getElementById("treeRoot");
const searchInput = document.getElementById("searchInput");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const activePath = document.getElementById("activePath");
const dirtyFlag = document.getElementById("dirtyFlag");
const repoStatus = document.getElementById("repoStatus");
const saveLocalBtn = document.getElementById("saveLocalBtn");
const resetLocalBtn = document.getElementById("resetLocalBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const githubEditLink = document.getElementById("githubEditLink");
const tokenInput = document.getElementById("tokenInput");
const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const authStatus = document.getElementById("authStatus");
const commitMessageInput = document.getElementById("commitMessageInput");
const commitBtn = document.getElementById("commitBtn");

let markdownFiles = [];
let activeFile = null;
let activeSha = null;
let baseContent = "";
let loadingFiles = false;
let commitInProgress = false;
let githubToken = "";
let githubUser = "";

const tokenStorageKey = "hh-editor::github-token";

function storageKey(path) {
  return `hh-editor::${path}`;
}

function getLocalOverride(path) {
  return localStorage.getItem(storageKey(path));
}

function setDirtyState(isDirty) {
  dirtyFlag.textContent = isDirty ? "Есть локальные правки" : "Чисто";
  dirtyFlag.classList.toggle("dirty", isDirty);
}

function isDirty() {
  return Boolean(activeFile) && editor.value !== baseContent;
}

function setActionsEnabled(enabled) {
  saveLocalBtn.disabled = !enabled;
  resetLocalBtn.disabled = !enabled;
  copyBtn.disabled = !enabled;
  downloadBtn.disabled = !enabled;
  githubEditLink.classList.toggle("is-disabled", !enabled);
  updateCommitButtonState();
}

function updateCommitButtonState() {
  const canCommit = Boolean(activeFile) && Boolean(githubToken) && isDirty() && !commitInProgress;
  commitBtn.disabled = !canCommit;
}

function setAuthStatus(text, ok = false) {
  authStatus.textContent = text;
  authStatus.classList.toggle("ok", ok);
}

function updateAuthUi() {
  const authed = Boolean(githubToken);
  disconnectBtn.disabled = !authed;
  connectBtn.disabled = commitInProgress;
  tokenInput.disabled = commitInProgress;
  if (authed) {
    setAuthStatus(`Подключено: @${githubUser}`, true);
  } else {
    setAuthStatus("Не авторизовано", false);
  }
  updateCommitButtonState();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMarkdown(text) {
  if (window.marked?.parse) {
    preview.innerHTML = window.marked.parse(text);
    return;
  }
  preview.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
}

function nestedTree(paths) {
  const root = {};
  for (const fullPath of paths) {
    const chunks = fullPath.split("/");
    let current = root;
    for (let i = 0; i < chunks.length; i += 1) {
      const part = chunks[i];
      if (i === chunks.length - 1) {
        current[part] = fullPath;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }
  return root;
}

function renderTreeNode(node, parentElement, pathPrefix = "") {
  const ul = document.createElement("ul");

  const entries = Object.entries(node).sort(([aName, aVal], [bName, bVal]) => {
    const aDir = typeof aVal === "object";
    const bDir = typeof bVal === "object";
    if (aDir !== bDir) {
      return aDir ? -1 : 1;
    }
    return aName.localeCompare(bName);
  });

  for (const [name, value] of entries) {
    const li = document.createElement("li");
    const absolutePath = pathPrefix ? `${pathPrefix}/${name}` : name;

    if (typeof value === "object") {
      const dirLabel = document.createElement("div");
      dirLabel.className = "dir";
      dirLabel.textContent = name;
      li.appendChild(dirLabel);
      renderTreeNode(value, li, absolutePath);
    } else {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.dataset.path = value;
      btn.addEventListener("click", () => openFile(value));
      li.appendChild(btn);
    }
    ul.appendChild(li);
  }

  parentElement.appendChild(ul);
}

function redrawTree(filterTerm = "") {
  treeRoot.innerHTML = "";
  const query = filterTerm.trim().toLowerCase();
  const list = query
    ? markdownFiles.filter((f) => f.toLowerCase().includes(query))
    : markdownFiles;

  if (!list.length) {
    treeRoot.innerHTML = "<p>Ничего не найдено.</p>";
    return;
  }

  const tree = nestedTree(list);
  renderTreeNode(tree, treeRoot);

  if (activeFile) {
    const activeButton = treeRoot.querySelector(`button[data-path="${CSS.escape(activeFile)}"]`);
    activeButton?.classList.add("active");
  }
}

function githubHeaders(extra = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra
  };
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  return headers;
}

function encodePathForApi(path) {
  return path.split("/").map((chunk) => encodeURIComponent(chunk)).join("/");
}

function base64ToUtf8(base64Text) {
  const cleaned = base64Text.replace(/\n/g, "");
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function fetchMarkdownFiles() {
  loadingFiles = true;
  repoStatus.textContent = "Читаю дерево файлов из GitHub API...";

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status}`);
    }

    const payload = await res.json();
    markdownFiles = (payload.tree || [])
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path)
      .filter((path) => path.toLowerCase().endsWith(".md"))
      .filter((path) => !path.startsWith(".git/"));

    markdownFiles.sort((a, b) => a.localeCompare(b));
    repoStatus.textContent = `Найдено ${markdownFiles.length} markdown-файлов`;
    redrawTree();
  } catch (error) {
    console.error(error);
    repoStatus.textContent = "Не удалось загрузить дерево через API, использую резервный список";
    markdownFiles = [
      "README.md",
      "linkedin.md",
      "skills.md",
      "companies/target-companies.md",
      "cover-letters/templates.md",
      "interviews/complex-questions.md",
      "resume/achievements.md",
      "resume/resume-main.md",
      "stories/S001-masshtabirovanie-i-antikrizis.md",
      "stories/S002-vnedrenie-crm.md",
      "stories/S003-kalkulyatory-dlya-klientov.md",
      "stories/S004-dashbordy-power-bi.md",
      "stories/S005-rost-prodazh.md",
      "stories/S006-iso-9001.md",
      "stories/S007-upravlenie-komandoy.md"
    ];
    redrawTree();
  } finally {
    loadingFiles = false;
  }
}

async function loadRemoteContent(path) {
  const encodedPath = encodePathForApi(path);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`;

  const apiResponse = await fetch(apiUrl, { headers: githubHeaders() });
  if (apiResponse.ok) {
    const payload = await apiResponse.json();
    if (payload && payload.type === "file" && typeof payload.content === "string") {
      return {
        content: base64ToUtf8(payload.content),
        sha: payload.sha
      };
    }
  }

  const fallbackResponse = await fetch(`./${path}`);
  if (!fallbackResponse.ok) {
    throw new Error(`Cannot read ${path}: ${fallbackResponse.status}`);
  }
  return {
    content: await fallbackResponse.text(),
    sha: null
  };
}

async function openFile(path) {
  if (loadingFiles) {
    return;
  }

  activeFile = path;
  activePath.textContent = path;

  Array.from(treeRoot.querySelectorAll("button.active")).forEach((button) => {
    button.classList.remove("active");
  });
  treeRoot.querySelector(`button[data-path="${CSS.escape(path)}"]`)?.classList.add("active");

  editor.disabled = true;
  editor.value = "Загрузка...";
  setActionsEnabled(false);

  try {
    const remote = await loadRemoteContent(path);
    baseContent = remote.content;
    activeSha = remote.sha;
    const local = getLocalOverride(path);
    editor.value = local !== null ? local : baseContent;
    renderMarkdown(editor.value);
    setDirtyState(editor.value !== baseContent);
    commitMessageInput.value = `Update ${path}`;
    githubEditLink.href = `https://github.com/${owner}/${repo}/edit/${branch}/${path}`;
  } catch (error) {
    console.error(error);
    editor.value = "Ошибка загрузки файла.";
    renderMarkdown("## Ошибка\nНе удалось открыть файл.");
  } finally {
    editor.disabled = false;
    setActionsEnabled(true);
  }
}

async function validateToken(token) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`Токен не принят (${response.status})`);
  }

  return response.json();
}

async function connectToken() {
  const token = tokenInput.value.trim();
  if (!token) {
    alert("Вставьте GitHub token.");
    return;
  }

  setAuthStatus("Проверяю токен...");
  connectBtn.disabled = true;

  try {
    const user = await validateToken(token);
    githubToken = token;
    githubUser = user.login;
    localStorage.setItem(tokenStorageKey, token);
    updateAuthUi();
    repoStatus.textContent = `Авторизация активна: @${githubUser}`;
  } catch (error) {
    console.error(error);
    githubToken = "";
    githubUser = "";
    localStorage.removeItem(tokenStorageKey);
    updateAuthUi();
    alert(`Не удалось подключиться: ${error.message}`);
  } finally {
    connectBtn.disabled = false;
  }
}

function disconnectToken() {
  githubToken = "";
  githubUser = "";
  tokenInput.value = "";
  localStorage.removeItem(tokenStorageKey);
  updateAuthUi();
}

async function commitActiveFile() {
  if (!activeFile || !githubToken || !isDirty()) {
    return;
  }

  commitInProgress = true;
  commitBtn.textContent = "Коммит...";
  updateCommitButtonState();

  const message = commitMessageInput.value.trim() || `Update ${activeFile}`;

  try {
    repoStatus.textContent = `Коммит ${activeFile}...`;
    const latest = await loadRemoteContent(activeFile);
    const encodedPath = encodePathForApi(activeFile);

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
      method: "PUT",
      headers: githubHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message,
        content: utf8ToBase64(editor.value),
        sha: latest.sha || activeSha,
        branch
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const apiMessage = errorPayload.message || `GitHub API error ${response.status}`;
      throw new Error(apiMessage);
    }

    const payload = await response.json();
    baseContent = editor.value;
    activeSha = payload.content?.sha || activeSha;
    localStorage.removeItem(storageKey(activeFile));
    setDirtyState(false);
    updateCommitButtonState();
    repoStatus.textContent = `Коммит создан: ${payload.commit?.sha?.slice(0, 7) || "OK"}`;
  } catch (error) {
    console.error(error);
    alert(`Ошибка коммита: ${error.message}`);
  } finally {
    commitInProgress = false;
    commitBtn.textContent = "Commit to GitHub";
    updateCommitButtonState();
  }
}

searchInput.addEventListener("input", () => {
  redrawTree(searchInput.value);
});

editor.addEventListener("input", () => {
  if (!activeFile) {
    return;
  }
  renderMarkdown(editor.value);
  setDirtyState(editor.value !== baseContent);
  updateCommitButtonState();
});

saveLocalBtn.addEventListener("click", () => {
  if (!activeFile) {
    return;
  }
  localStorage.setItem(storageKey(activeFile), editor.value);
  setDirtyState(editor.value !== baseContent);
  updateCommitButtonState();
});

resetLocalBtn.addEventListener("click", () => {
  if (!activeFile) {
    return;
  }
  localStorage.removeItem(storageKey(activeFile));
  editor.value = baseContent;
  renderMarkdown(editor.value);
  setDirtyState(false);
  updateCommitButtonState();
});

copyBtn.addEventListener("click", async () => {
  if (!activeFile) {
    return;
  }
  try {
    await navigator.clipboard.writeText(editor.value);
  } catch (error) {
    console.error(error);
    alert("Не удалось скопировать в буфер обмена.");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!activeFile) {
    return;
  }
  const blob = new Blob([editor.value], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = activeFile.split("/").at(-1) || "document.md";
  a.click();
  URL.revokeObjectURL(url);
});

connectBtn.addEventListener("click", () => {
  connectToken();
});

disconnectBtn.addEventListener("click", () => {
  disconnectToken();
});

commitBtn.addEventListener("click", () => {
  commitActiveFile();
});

(async function bootstrap() {
  setActionsEnabled(false);
  const savedToken = localStorage.getItem(tokenStorageKey);

  if (savedToken) {
    tokenInput.value = savedToken;
    try {
      const user = await validateToken(savedToken);
      githubToken = savedToken;
      githubUser = user.login;
    } catch (error) {
      console.warn("Stored token is invalid.", error);
      localStorage.removeItem(tokenStorageKey);
      tokenInput.value = "";
    }
  }

  updateAuthUi();
  await fetchMarkdownFiles();
})();
