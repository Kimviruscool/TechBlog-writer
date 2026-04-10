/* =====================================================
   index.js  –  TechBlog-Writer Dashboard
   모든 기능 최소 단위 모듈화
   ===================================================== */

"use strict";                                                        // 엄격 모드

/* =====================================================
   [1] DOM 참조  –  사용할 모든 요소를 한 곳에서 관리
   ===================================================== */

const DOM = {
  // 탑바
  topbarNav:          document.getElementById("topbarNav"),          // 상단 내비
  btnDark:            document.getElementById("btnDark"),            // 다크 모드 버튼
  stepIndicator:      document.getElementById("stepIndicator"),      // 스텝 인디케이터

  // 파이프라인 카드
  pipeStep1:          document.getElementById("pipeStep1"),
  pipeStep2:          document.getElementById("pipeStep2"),
  pipeStep3:          document.getElementById("pipeStep3"),
  pipeStep4:          document.getElementById("pipeStep4"),
  pipeStatus1:        document.getElementById("pipeStatus1"),
  pipeStatus2:        document.getElementById("pipeStatus2"),
  pipeStatus3:        document.getElementById("pipeStatus3"),
  pipeStatus4:        document.getElementById("pipeStatus4"),

  // 입력 패널
  topicInput:         document.getElementById("topicInput"),         // 주제 입력
  notesInput:         document.getElementById("notesInput"),         // 메모 입력
  topicCount:         document.getElementById("topicCount"),         // 주제 글자수
  notesCount:         document.getElementById("notesCount"),         // 메모 글자수
  inputError:         document.getElementById("inputError"),         // 입력 에러 메시지
  btnGenerate:        document.getElementById("btnGenerate"),        // Gemini 생성 버튼
  btnClearInput:      document.getElementById("btnClearInput"),      // 입력 초기화 버튼

  // Gemini 패널
  geminiTag:          document.getElementById("geminiTag"),          // 상태 태그
  geminiLoading:      document.getElementById("geminiLoading"),      // 로딩 오버레이
  geminiEmpty:        document.getElementById("geminiEmpty"),        // 빈 상태
  geminiPreview:      document.getElementById("geminiPreview"),      // 미리보기
  geminiEditor:       document.getElementById("geminiEditor"),       // HTML 편집기
  geminiFooter:       document.getElementById("geminiFooter"),       // 푸터 (Claude 버튼)
  btnGeminiEditToggle:document.getElementById("btnGeminiEditToggle"),// 편집 토글
  btnGeminiCopy:      document.getElementById("btnGeminiCopy"),      // 복사 버튼
  refineInstructions: document.getElementById("refineInstructions"), // 수정 지시사항
  btnRefine:          document.getElementById("btnRefine"),          // Claude 수정 버튼

  // Claude 패널
  claudeTag:          document.getElementById("claudeTag"),          // 상태 태그
  claudeLoading:      document.getElementById("claudeLoading"),      // 로딩 오버레이
  claudeEmpty:        document.getElementById("claudeEmpty"),        // 빈 상태
  claudePreview:      document.getElementById("claudePreview"),      // 미리보기
  claudeEditor:       document.getElementById("claudeEditor"),       // HTML 편집기
  claudeFooter:       document.getElementById("claudeFooter"),       // 푸터
  btnClaudeEditToggle:document.getElementById("btnClaudeEditToggle"),// 편집 토글
  btnClaudeCopy:      document.getElementById("btnClaudeCopy"),      // 복사 버튼
  btnClaudeDownload:  document.getElementById("btnClaudeDownload"),  // 다운로드 버튼
  btnReRefine:        document.getElementById("btnReRefine"),        // 다시 수정 버튼
  btnFinalize:        document.getElementById("btnFinalize"),        // 최종 완성 버튼

  // 통계 바
  statTopic:          document.getElementById("statTopic"),          // 현재 주제
  statGeminiLen:      document.getElementById("statGeminiLen"),      // Gemini 글자수
  statClaudeLen:      document.getElementById("statClaudeLen"),      // Claude 글자수
  statPipeStatus:     document.getElementById("statPipeStatus"),     // 파이프라인 상태

  // 토스트
  toast:              document.getElementById("toast"),              // 토스트 컨테이너
};

/* =====================================================
   [2] 앱 상태  –  전역 상태 관리 객체
   ===================================================== */

const State = {
  currentStep:  1,          // 현재 파이프라인 스텝 (1~4)
  geminiHTML:   "",         // Gemini 생성 HTML
  claudeHTML:   "",         // Claude 수정 HTML
  currentTopic: "",         // 현재 주제
  geminiMode:   "preview",  // gemini 패널 표시 모드 (preview | edit)
  claudeMode:   "preview",  // claude 패널 표시 모드 (preview | edit)
};

/* =====================================================
   [3] 다크 모드  –  테마 토글
   ===================================================== */

/**
 * 다크/라이트 모드를 적용합니다.
 * @param {boolean} enable
 */
function applyDarkMode(enable) {                                     // 다크 모드 적용
  document.body.classList.toggle("dark", enable);
  localStorage.setItem("darkMode", enable ? "1" : "0");            // 저장
}

/**
 * 다크 모드 버튼 이벤트 및 저장 설정 복원을 초기화합니다.
 */
function initDarkMode() {                                            // 다크 모드 초기화
  if (localStorage.getItem("darkMode") === "1") applyDarkMode(true);
  DOM.btnDark?.addEventListener("click", () => {
    applyDarkMode(!document.body.classList.contains("dark"));       // 토글
  });
}

/* =====================================================
   [4] 탑바 내비  –  탭 활성화
   ===================================================== */

/**
 * 클릭된 nav-link를 활성화합니다.
 * @param {HTMLElement} link
 */
function setActiveNavLink(link) {                                    // 탭 활성화
  DOM.topbarNav?.querySelectorAll(".nav-link").forEach(l => l.classList.remove("nav-link--active"));
  link.classList.add("nav-link--active");
}

function initTopbarNav() {                                           // 탑바 내비 초기화
  DOM.topbarNav?.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      setActiveNavLink(link);
    });
  });
}

/* =====================================================
   [5] 파이프라인 스텝  –  스텝 UI 갱신
   ===================================================== */

/** 스텝 번호에 해당하는 파이프 카드 요소를 반환합니다. */
const getPipeCard   = n => DOM[`pipeStep${n}`];                      // 파이프 카드 반환
const getPipeStatus = n => DOM[`pipeStatus${n}`];                    // 파이프 상태 반환

/**
 * 파이프라인 스텝 상태를 갱신합니다.
 * @param {number} step  - 스텝 번호 (1~4)
 * @param {'idle'|'active'|'loading'|'done'|'error'} status
 */
function setPipeStatus(step, status) {                               // 파이프 스텝 상태 설정
  const statusEl = getPipeStatus(step);
  if (!statusEl) return;
  const dot = statusEl.querySelector(".pipe-dot");
  if (!dot) return;

  dot.className = "pipe-dot";                                        // 클래스 초기화
  if (status === "active")  dot.classList.add("pipe-dot--active");
  if (status === "loading") dot.classList.add("pipe-dot--loading");
  if (status === "done")    dot.classList.add("pipe-dot--done");
  if (status === "error")   dot.classList.add("pipe-dot--error");
}

/**
 * 상단 스텝 인디케이터 점을 갱신합니다.
 * @param {number} activeStep
 */
function updateStepIndicator(activeStep) {                           // 스텝 인디케이터 갱신
  DOM.stepIndicator?.querySelectorAll(".step-dot").forEach(dot => {
    const n = parseInt(dot.dataset.step, 10);
    dot.className = "step-dot";
    if (n < activeStep)  dot.classList.add("step-dot--done");
    if (n === activeStep) dot.classList.add("step-dot--active");
  });
}

/**
 * 현재 스텝을 전환하고 UI를 일괄 갱신합니다.
 * @param {number} step
 */
function goToStep(step) {                                            // 스텝 이동
  State.currentStep = step;
  updateStepIndicator(step);
  updateStatsBar();
}

/* =====================================================
   [6] 글자 수 카운터  –  입력 필드 글자 수 표시
   ===================================================== */

/**
 * input/textarea 글자 수를 표시 요소에 갱신합니다.
 * @param {HTMLElement} inputEl
 * @param {HTMLElement} countEl
 */
function updateCount(inputEl, countEl) {                             // 글자 수 갱신
  countEl.textContent = `${inputEl.value.length} / ${inputEl.maxLength}`;
}

function initCounters() {                                            // 카운터 초기화
  DOM.topicInput?.addEventListener("input", () => updateCount(DOM.topicInput, DOM.topicCount));
  DOM.notesInput?.addEventListener("input", () => updateCount(DOM.notesInput, DOM.notesCount));
}

/* =====================================================
   [7] 유효성 검사  –  입력 검증
   ===================================================== */

/**
 * 주제 입력값을 검사합니다.
 * @param {string} val
 * @returns {{ valid: boolean, message: string }}
 */
function validateTopic(val) {                                        // 주제 유효성 검사
  if (!val.trim()) return { valid: false, message: "블로그 주제를 입력해 주세요." };
  if (val.trim().length < 2) return { valid: false, message: "주제는 2글자 이상이어야 합니다." };
  return { valid: true, message: "" };
}

/**
 * 에러 메시지를 표시하거나 숨깁니다.
 * @param {string} msg
 */
function setInputError(msg) {                                        // 입력 에러 표시
  DOM.inputError.textContent = msg;
  DOM.inputError.classList.toggle("hidden", !msg);
}

/* =====================================================
   [8] 입력 초기화  –  전체 상태 리셋
   ===================================================== */

/**
 * 입력 패널과 앱 전체 상태를 초기화합니다.
 */
function clearInput() {                                              // 입력 초기화
  DOM.topicInput.value = "";
  DOM.notesInput.value = "";
  updateCount(DOM.topicInput, DOM.topicCount);
  updateCount(DOM.notesInput, DOM.notesCount);
  setInputError("");

  // 상태 초기화
  State.geminiHTML   = "";
  State.claudeHTML   = "";
  State.currentTopic = "";
  State.geminiMode   = "preview";
  State.claudeMode   = "preview";

  // Gemini 패널 초기화
  showGeminiEmpty();
  DOM.geminiFooter?.classList.add("hidden");
  setTagState(DOM.geminiTag, "idle");

  // Claude 패널 초기화
  showClaudeEmpty();
  DOM.claudeFooter?.classList.add("hidden");
  setTagState(DOM.claudeTag, "idle");

  // 파이프 스텝 초기화
  [1,2,3,4].forEach(n => setPipeStatus(n, "idle"));
  setPipeStatus(1, "active");
  goToStep(1);

  showToast("초기화되었습니다.");
}

/* =====================================================
   [9] 패널 상태 태그  –  Gemini/Claude 태그 변경
   ===================================================== */

/**
 * 패널 상단 상태 태그 텍스트와 클래스를 설정합니다.
 * @param {HTMLElement} tagEl
 * @param {'idle'|'active'|'done'|'error'} status
 * @param {string} [label]
 */
function setTagState(tagEl, status, label) {                         // 태그 상태 설정
  const labels = { idle: "대기 중", active: "진행 중", done: "완료", error: "오류" };
  tagEl.textContent = label || labels[status] || status;
  tagEl.className   = "panel__tag";
  if (status === "active") tagEl.classList.add("panel__tag--active");
  if (status === "done")   tagEl.classList.add("panel__tag--done");
  if (status === "error")  tagEl.classList.add("panel__tag--error");
}

/* =====================================================
   [10] Gemini 패널 표시 제어
   ===================================================== */

/** Gemini 패널 빈 상태를 표시합니다. */
function showGeminiEmpty() {                                         // Gemini 빈 상태 표시
  DOM.geminiEmpty?.classList.remove("hidden");
  DOM.geminiPreview?.classList.add("hidden");
  DOM.geminiEditor?.classList.add("hidden");
}

/**
 * Gemini 패널에 HTML을 렌더링합니다.
 * @param {string} html
 * @param {'preview'|'edit'} mode
 */
function renderGeminiContent(html, mode = "preview") {               // Gemini 내용 렌더링
  DOM.geminiEmpty?.classList.add("hidden");

  if (mode === "preview") {
    DOM.geminiPreview.innerHTML = extractArticle(html);             // HTML 렌더링
    DOM.geminiPreview?.classList.remove("hidden");
    DOM.geminiEditor?.classList.add("hidden");
  } else {
    DOM.geminiEditor.value = html;                                  // 편집기에 원본 HTML
    DOM.geminiEditor?.classList.remove("hidden");
    DOM.geminiPreview?.classList.add("hidden");
  }
}

/* =====================================================
   [11] Claude 패널 표시 제어
   ===================================================== */

/** Claude 패널 빈 상태를 표시합니다. */
function showClaudeEmpty() {                                         // Claude 빈 상태 표시
  DOM.claudeEmpty?.classList.remove("hidden");
  DOM.claudePreview?.classList.add("hidden");
  DOM.claudeEditor?.classList.add("hidden");
}

/**
 * Claude 패널에 HTML을 렌더링합니다.
 * @param {string} html
 * @param {'preview'|'edit'} mode
 */
function renderClaudeContent(html, mode = "preview") {               // Claude 내용 렌더링
  DOM.claudeEmpty?.classList.add("hidden");

  if (mode === "preview") {
    DOM.claudePreview.innerHTML = extractArticle(html);
    DOM.claudePreview?.classList.remove("hidden");
    DOM.claudeEditor?.classList.add("hidden");
  } else {
    DOM.claudeEditor.value = html;
    DOM.claudeEditor?.classList.remove("hidden");
    DOM.claudePreview?.classList.add("hidden");
  }
}

/* =====================================================
   [12] HTML 파싱  –  article 태그 추출
   ===================================================== */

/**
 * HTML 문자열에서 <article>...</article>을 추출합니다.
 * 없으면 원본 반환.
 * @param {string} html
 * @returns {string}
 */
function extractArticle(html) {                                      // article 태그 추출
  const match = html.match(/<article[\s\S]*?<\/article>/i);
  return match ? match[0] : html;
}

/* =====================================================
   [13] 편집 모드 토글  –  미리보기 ↔ HTML 편집
   ===================================================== */

/**
 * Gemini 패널 편집 모드를 토글합니다.
 */
function toggleGeminiEdit() {                                        // Gemini 편집 토글
  if (!State.geminiHTML) return;

  // 편집 모드 → 미리보기: 편집기 내용을 상태에 저장
  if (State.geminiMode === "edit") {
    State.geminiHTML = DOM.geminiEditor.value;                      // 수정 내용 저장
    State.geminiMode = "preview";
    DOM.btnGeminiEditToggle?.classList.remove("active");
    renderGeminiContent(State.geminiHTML, "preview");
    updateStatsBar();
  } else {
    State.geminiMode = "edit";
    DOM.btnGeminiEditToggle?.classList.add("active");
    renderGeminiContent(State.geminiHTML, "edit");
  }
}

/**
 * Claude 패널 편집 모드를 토글합니다.
 */
function toggleClaudeEdit() {                                        // Claude 편집 토글
  if (!State.claudeHTML) return;

  if (State.claudeMode === "edit") {
    State.claudeHTML = DOM.claudeEditor.value;                      // 수정 내용 저장
    State.claudeMode = "preview";
    DOM.btnClaudeEditToggle?.classList.remove("active");
    renderClaudeContent(State.claudeHTML, "preview");
    updateStatsBar();
  } else {
    State.claudeMode = "edit";
    DOM.btnClaudeEditToggle?.classList.add("active");
    renderClaudeContent(State.claudeHTML, "edit");
  }
}

/* =====================================================
   [14] 탭 전환  –  미리보기 / HTML 편집 탭
   ===================================================== */

/**
 * 패널 탭 클릭 이벤트를 처리합니다.
 * @param {string} panel  - 'gemini' | 'claude'
 * @param {string} mode   - 'preview' | 'edit'
 * @param {HTMLElement} clickedTab
 */
function switchTab(panel, mode, clickedTab) {                        // 탭 전환 처리
  // 같은 패널 탭 비활성화
  clickedTab.closest(".panel__tabs")
    ?.querySelectorAll(".tab")
    .forEach(t => t.classList.remove("tab--active"));
  clickedTab.classList.add("tab--active");

  if (panel === "gemini") {
    if (!State.geminiHTML) return;
    if (State.geminiMode === "edit") State.geminiHTML = DOM.geminiEditor.value; // 편집 내용 저장
    State.geminiMode = mode;
    renderGeminiContent(State.geminiHTML, mode);
  }

  if (panel === "claude") {
    if (!State.claudeHTML) return;
    if (State.claudeMode === "edit") State.claudeHTML = DOM.claudeEditor.value;
    State.claudeMode = mode;
    renderClaudeContent(State.claudeHTML, mode);
  }
}

function initTabs() {                                                // 탭 이벤트 초기화
  document.querySelectorAll(".tab[data-panel]").forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.panel, tab.dataset.mode, tab);
    });
  });
}

/* =====================================================
   [15] API 호출  –  /api/generate (Gemini)
   ===================================================== */

/**
 * 백엔드 /api/generate 에 POST 요청을 보냅니다.
 * @param {string} topic
 * @param {string} notes
 * @returns {Promise<Object>}
 */
async function apiGenerate(topic, notes) {                           // Gemini API 호출
  const res = await fetch("/api/generate", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ topic, notes }),
  });
  if (!res.ok) throw new Error(`서버 오류 ${res.status}`);
  return res.json();
}

/* =====================================================
   [16] API 호출  –  /api/refine (Claude)
   ===================================================== */

/**
 * 백엔드 /api/refine 에 POST 요청을 보냅니다.
 * @param {string} html_content
 * @param {string} instructions
 * @returns {Promise<Object>}
 */
async function apiRefine(html_content, instructions) {               // Claude API 호출
  const res = await fetch("/api/refine", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ html_content, instructions }),
  });
  if (!res.ok) throw new Error(`서버 오류 ${res.status}`);
  return res.json();
}

/* =====================================================
   [17] Gemini 생성 핸들러  –  Step 1 → Step 2
   ===================================================== */

/**
 * Gemini 초안 생성을 실행합니다.
 */
async function handleGenerate() {                                    // Gemini 생성 핸들러
  const topic = DOM.topicInput.value.trim();
  const notes = DOM.notesInput.value.trim();

  const check = validateTopic(topic);
  if (!check.valid) { setInputError(check.message); return; }
  setInputError("");

  // UI 로딩 상태
  DOM.btnGenerate.disabled = true;
  DOM.geminiLoading?.classList.remove("hidden");
  setTagState(DOM.geminiTag, "active", "생성 중...");
  setPipeStatus(1, "done");
  setPipeStatus(2, "loading");

  try {
    const data = await apiGenerate(topic, notes);

    State.geminiHTML   = data.content || "";
    State.currentTopic = topic;

    renderGeminiContent(State.geminiHTML, "preview");
    State.geminiMode = "preview";

    DOM.geminiFooter?.classList.remove("hidden");
    setTagState(DOM.geminiTag, "done", "초안 완료");
    setPipeStatus(2, "done");
    setPipeStatus(3, "active");
    goToStep(2);
    showToast("✨ Gemini 초안 생성 완료!");

  } catch (err) {
    setTagState(DOM.geminiTag, "error", "오류");
    setPipeStatus(2, "error");
    showToast(`❌ 생성 실패: ${err.message}`);
    showGeminiEmpty();
  } finally {
    DOM.btnGenerate.disabled = false;
    DOM.geminiLoading?.classList.add("hidden");
  }
}

/* =====================================================
   [18] Claude 수정 핸들러  –  Step 2 → Step 3
   ===================================================== */

/**
 * 편집기가 열려 있으면 현재 편집 내용을 상태에 반영합니다.
 */
function syncGeminiEditorToState() {                                 // 편집기 내용 동기화
  if (State.geminiMode === "edit") {
    State.geminiHTML = DOM.geminiEditor.value;
  }
}

/**
 * Claude 2차 수정을 실행합니다.
 */
async function handleRefine() {                                      // Claude 수정 핸들러
  syncGeminiEditorToState();

  if (!State.geminiHTML.trim()) {
    showToast("먼저 Gemini 초안을 생성해 주세요.");
    return;
  }

  const instructions = DOM.refineInstructions?.value?.trim() || "";

  // UI 로딩 상태
  DOM.btnRefine.disabled = true;
  DOM.claudeLoading?.classList.remove("hidden");
  setTagState(DOM.claudeTag, "active", "수정 중...");
  setPipeStatus(3, "loading");

  try {
    const data = await apiRefine(State.geminiHTML, instructions);

    State.claudeHTML = data.content || "";
    State.claudeMode = "preview";

    renderClaudeContent(State.claudeHTML, "preview");

    DOM.claudeFooter?.classList.remove("hidden");
    setTagState(DOM.claudeTag, "done", "수정 완료");
    setPipeStatus(3, "done");
    setPipeStatus(4, "active");
    goToStep(3);
    showToast("🎯 Claude 2차 수정 완료!");

  } catch (err) {
    setTagState(DOM.claudeTag, "error", "오류");
    setPipeStatus(3, "error");
    showToast(`❌ 수정 실패: ${err.message}`);
    showClaudeEmpty();
  } finally {
    DOM.btnRefine.disabled = false;
    DOM.claudeLoading?.classList.add("hidden");
  }
}

/* =====================================================
   [19] 다시 수정  –  Claude에게 재요청
   ===================================================== */

/**
 * Claude 패널을 비우고 수정 지시사항 입력창을 포커스합니다.
 */
function handleReRefine() {                                          // 다시 수정 핸들러
  showClaudeEmpty();
  DOM.claudeFooter?.classList.add("hidden");
  setTagState(DOM.claudeTag, "idle");
  setPipeStatus(3, "active");
  setPipeStatus(4, "idle");
  State.claudeHTML = "";
  DOM.refineInstructions?.focus();                                  // 지시사항 입력 포커스
  showToast("수정 지시사항을 변경하고 다시 요청하세요.");
}

/* =====================================================
   [20] 최종 완성  –  Step 4
   ===================================================== */

/**
 * 최종 완성 스텝으로 이동합니다.
 */
function handleFinalize() {                                          // 최종 완성 핸들러
  if (!State.claudeHTML.trim()) {
    showToast("Claude 수정본이 없습니다.");
    return;
  }
  // Claude 편집기 내용 동기화
  if (State.claudeMode === "edit") {
    State.claudeHTML = DOM.claudeEditor.value;
  }

  setPipeStatus(4, "done");
  goToStep(4);
  updateStatsBar();
  showToast("🎉 최종 완성! HTML을 다운로드하거나 복사하세요.");
}

/* =====================================================
   [21] 클립보드 복사
   ===================================================== */

/**
 * 텍스트를 클립보드에 복사합니다.
 * @param {string} text
 * @param {string} label
 */
async function copyToClipboard(text, label = "내용") {              // 클립보드 복사
  try {
    await navigator.clipboard.writeText(text);
    showToast(`📋 ${label} 복사 완료`);
  } catch {
    showToast("복사 실패: 브라우저 권한을 확인하세요.");
  }
}

/* =====================================================
   [22] HTML 다운로드
   ===================================================== */

/**
 * HTML 문자열을 .html 파일로 다운로드합니다.
 * @param {string} html
 * @param {string} filename
 */
function downloadHTML(html, filename = "blog-post.html") {           // HTML 다운로드
  const full = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${State.currentTopic || "Blog Post"}</title>
<style>
  body { font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1d2e; }
  h1 { font-size: 28px; margin-bottom: 20px; }
  h2 { font-size: 20px; color: #4f63f8; margin: 28px 0 12px; }
  p  { margin-bottom: 14px; color: #374151; }
  ul, ol { padding-left: 22px; margin-bottom: 14px; }
  li { margin-bottom: 6px; color: #374151; }
</style>
</head>
<body>${extractArticle(html)}</body>
</html>`;

  const blob = new Blob([full], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);                                         // 메모리 해제
  showToast("💾 HTML 파일 다운로드 시작");
}

/* =====================================================
   [23] 통계 바 갱신
   ===================================================== */

/**
 * 하단 통계 바의 값을 갱신합니다.
 */
function updateStatsBar() {                                          // 통계 바 갱신
  DOM.statTopic.textContent     = State.currentTopic || "—";
  DOM.statGeminiLen.textContent = State.geminiHTML
    ? `${State.geminiHTML.replace(/<[^>]+>/g, "").length.toLocaleString()} 자`
    : "—";
  DOM.statClaudeLen.textContent = State.claudeHTML
    ? `${State.claudeHTML.replace(/<[^>]+>/g, "").length.toLocaleString()} 자`
    : "—";

  const steps = ["준비", "입력 완료", "초안 완료", "수정 완료", "최종 완성"];
  const badge = DOM.statPipeStatus;
  badge.textContent = steps[State.currentStep] || "—";

  // 스텝별 색상
  badge.style.background = ["","var(--blue-light)","var(--violet-light)","var(--orange-light)","var(--green-light)"][State.currentStep] || "";
  badge.style.color       = ["","var(--blue)","var(--violet)","var(--orange)","var(--green)"][State.currentStep] || "";
}

/* =====================================================
   [24] 토스트 알림
   ===================================================== */

let _toastTimer = null;                                              // 타이머 ID

/**
 * 화면 우하단에 토스트 메시지를 표시합니다.
 * @param {string} message
 * @param {number} [duration=2600]
 */
function showToast(message, duration = 2600) {                       // 토스트 표시
  DOM.toast.textContent = message;
  DOM.toast.classList.add("toast--show");
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => DOM.toast.classList.remove("toast--show"), duration);
}

/* =====================================================
   [25] 이벤트 바인딩  –  모든 이벤트 일괄 등록
   ===================================================== */

function initEvents() {                                              // 이벤트 초기화
  // 입력 초기화
  DOM.btnClearInput?.addEventListener("click", clearInput);

  // Gemini 생성
  DOM.btnGenerate?.addEventListener("click", handleGenerate);
  DOM.topicInput?.addEventListener("keydown", e => { if (e.key === "Enter") handleGenerate(); });
  DOM.topicInput?.addEventListener("input", () => setInputError(""));  // 에러 초기화

  // Gemini 편집 토글 & 복사
  DOM.btnGeminiEditToggle?.addEventListener("click", toggleGeminiEdit);
  DOM.btnGeminiCopy?.addEventListener("click", () => copyToClipboard(State.geminiHTML, "Gemini 초안"));

  // Claude 수정
  DOM.btnRefine?.addEventListener("click", handleRefine);

  // Claude 편집 토글 & 복사 & 다운로드
  DOM.btnClaudeEditToggle?.addEventListener("click", toggleClaudeEdit);
  DOM.btnClaudeCopy?.addEventListener("click", () => copyToClipboard(State.claudeHTML, "Claude 수정본"));
  DOM.btnClaudeDownload?.addEventListener("click", () => {
    const filename = `${(State.currentTopic || "blog").replace(/\s+/g, "-")}.html`;
    downloadHTML(State.claudeHTML, filename);
  });

  // 다시 수정 / 최종 완성
  DOM.btnReRefine?.addEventListener("click", handleReRefine);
  DOM.btnFinalize?.addEventListener("click", handleFinalize);
}

/* =====================================================
   [26] 앱 진입점  –  초기화 실행
   ===================================================== */

/**
 * 앱 전체를 초기화합니다.
 */
function init() {                                                    // 앱 초기화
  initDarkMode();          // [3]  다크 모드
  initTopbarNav();         // [4]  탑바 내비
  initCounters();          // [6]  글자 수 카운터
  initTabs();              // [14] 패널 탭
  initEvents();            // [25] 이벤트 바인딩
  setPipeStatus(1, "active");                                        // 첫 스텝 활성화
  updateStatsBar();                                                  // 통계 바 초기화
  DOM.topicInput?.focus();                                          // 포커스
}

document.addEventListener("DOMContentLoaded", init);                 // DOM 준비 후 실행