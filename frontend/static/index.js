/* =====================================================
   main.js  –  SugarCRM Customer Journeys Dashboard
   모든 기능을 최소 단위로 모듈화하여 작성
   ===================================================== */

"use strict";                                                         // 엄격 모드 활성화

/* =====================================================
   [1] DOM UTILITY  –  요소 선택 헬퍼
   ===================================================== */

/**
 * ID로 단일 DOM 요소를 반환합니다.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
const $ = (id) => document.getElementById(id);                       // ID 선택 단축함수

/**
 * CSS 셀렉터로 단일 요소를 반환합니다.
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $q = (sel, ctx = document) => ctx.querySelector(sel);          // 쿼리 선택 단축함수

/**
 * CSS 셀렉터로 NodeList를 반환합니다.
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $all = (sel, ctx = document) => ctx.querySelectorAll(sel);     // 다중 쿼리 선택 단축함수

/* =====================================================
   [2] DATA  –  정적 데이터 정의
   ===================================================== */

/** 상단 보드 팀 아바타 데이터 */
const BOARD_AVATARS = [                                               // 칸반 보드 아바타 목록
  { src: "https://i.pravatar.cc/28?img=1",  badge: "2" },
  { src: "https://i.pravatar.cc/28?img=2",  badge: "3" },
  { src: "https://i.pravatar.cc/28?img=3",  badge: null },
  { src: "https://i.pravatar.cc/28?img=4",  badge: "2" },
  { src: "https://i.pravatar.cc/28?img=5",  badge: null },
  { src: "https://i.pravatar.cc/28?img=6",  badge: "1" },
  { src: "https://i.pravatar.cc/28?img=7",  badge: null },
  { src: "https://i.pravatar.cc/28?img=8",  badge: "+", extra: true },
];

/** Suggested Knowledge 테이블 데이터 */
const KNOWLEDGE_DATA = [                                              // 지식 테이블 행 데이터
  {
    starred: true,
    subject:  "Design Sprint",
    status:   "Executed",
    start:    "2023-09-30 01:12",
    end:      "2023-10-01 01:11",
    user:     "Sam Frank",
  },
  {
    starred: false,
    subject:  "Meeting Lead",
    status:   "Scheduled",
    start:    "2023-10-01 01:41",
    end:      "2023-10-04 01:41",
    user:     "Nikki Olay",
  },
  {
    starred: false,
    subject:  "Product Review",
    status:   "Executed",
    start:    "2023-10-05 09:00",
    end:      "2023-10-06 09:00",
    user:     "Tom Baker",
  },
];

/** Support Ticket Journey 도넛 차트 데이터 */
const TICKET_DATA = {                                                 // 티켓 차트 데이터
  executed: { count: 5, color: "#3b6ef8", bg: "#e8eeff" },           // 실행됨 항목
  active:   { count: 7, color: "#e74c3c", bg: "#fdecea" },           // 활성 항목
};

/* =====================================================
   [3] TOPBAR NAV  –  상단 네비게이션 활성 탭 처리
   ===================================================== */

/**
 * 클릭한 nav-link 를 활성 상태로 전환합니다.
 * @param {HTMLElement} clickedLink
 */
function setActiveNavLink(clickedLink) {                              // 활성 탭 변경 함수
  $all(".nav-link").forEach((link) => {
    link.classList.remove("nav-link--active");                        // 기존 활성 탭 해제
  });
  clickedLink.classList.add("nav-link--active");                     // 클릭한 탭 활성화
}

/**
 * 상단 네비게이션 클릭 이벤트를 등록합니다.
 */
function initTopbarNav() {                                            // 탑바 네비 초기화
  $all(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();                                             // 기본 링크 이동 방지
      setActiveNavLink(link);                                         // 활성 탭 전환
    });
  });
}

/* =====================================================
   [4] DARK MODE  –  다크/라이트 모드 토글
   ===================================================== */

/**
 * body에 dark-mode 클래스를 추가/제거합니다.
 * @param {boolean} enable
 */
function applyDarkMode(enable) {                                      // 다크 모드 적용 함수
  document.body.classList.toggle("dark-mode", enable);               // 다크 모드 클래스 토글
  localStorage.setItem("darkMode", enable ? "1" : "0");             // 로컬 스토리지에 저장
}

/**
 * 다크/라이트 모드 버튼 이벤트를 등록하고, 저장된 설정을 복원합니다.
 */
function initDarkMode() {                                             // 다크 모드 초기화
  const saved = localStorage.getItem("darkMode");                    // 저장된 설정 불러오기
  if (saved === "1") applyDarkMode(true);                            // 저장값이 다크모드면 적용

  $("btnDarkMode")?.addEventListener("click", () => applyDarkMode(true));   // 다크 모드 버튼
  $("btnLightMode")?.addEventListener("click", () => applyDarkMode(false)); // 라이트 모드 버튼
}

/* =====================================================
   [5] BOARD AVATARS  –  팀원 아바타 렌더링
   ===================================================== */

/**
 * 아바타 단일 img 요소를 생성합니다.
 * @param {{src:string, badge:string|null, extra?:boolean}} av
 * @returns {HTMLElement}
 */
function createAvatarEl(av) {                                         // 아바타 DOM 생성 함수
  if (av.extra || (av.badge && av.badge.startsWith("+"))) {          // '+' 뱃지는 카운터 표시
    const div = document.createElement("div");
    div.className = "av av-badge";
    div.textContent = av.badge;
    return div;
  }

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display  = "inline-flex";

  const img = document.createElement("img");
  img.className = "av";
  img.src = av.src;
  img.alt = "Team member";
  wrapper.appendChild(img);                                           // 이미지 추가

  if (av.badge) {                                                     // 숫자 뱃지가 있으면 표시
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = av.badge;
    b.style.top   = "-2px";
    b.style.right = "-2px";
    wrapper.appendChild(b);
  }

  return wrapper;
}

/**
 * 보드 상단의 아바타 목록을 렌더링합니다.
 */
function renderBoardAvatars() {                                       // 보드 아바타 렌더링
  const container = $("boardAvatars");
  if (!container) return;

  BOARD_AVATARS.forEach((av) => {
    container.appendChild(createAvatarEl(av));                        // 각 아바타 추가
  });
}

/* =====================================================
   [6] KNOWLEDGE TABLE  –  지식 테이블 렌더링
   ===================================================== */

/**
 * 상태 문자열로 뱃지 HTML을 반환합니다.
 * @param {string} status
 * @returns {string}
 */
function getStatusBadgeHTML(status) {                                 // 상태 뱃지 HTML 생성
  const cls = status === "Executed" ? "status-badge--exec" : "status-badge--sched";
  return `<span class="status-badge ${cls}">${status}</span>`;       // 뱃지 HTML 반환
}

/**
 * 테이블 한 행의 HTML을 반환합니다.
 * @param {Object} row
 * @param {number} idx
 * @returns {string}
 */
function buildTableRowHTML(row, idx) {                                // 테이블 행 HTML 생성
  const star = row.starred
    ? "★"
    : "☆";                                                            // 별표 여부 처리

  return `
    <tr data-row="${idx}">
      <td class="star-cell">
        <button class="star-toggle" data-idx="${idx}" aria-label="Star">${star}</button>
      </td>
      <td>${row.subject}</td>
      <td>${getStatusBadgeHTML(row.status)}</td>
      <td>${row.start}</td>
      <td>${row.end}</td>
      <td>${row.user}</td>
    </tr>
  `.trim();
}

/**
 * tbody에 모든 지식 테이블 행을 렌더링합니다.
 */
function renderKnowledgeTable() {                                     // 테이블 전체 렌더링
  const tbody = $("knowledgeTableBody");
  if (!tbody) return;

  tbody.innerHTML = KNOWLEDGE_DATA                                    // 전체 행 HTML 조합
    .map((row, i) => buildTableRowHTML(row, i))
    .join("");
}

/* =====================================================
   [7] STAR TOGGLE  –  테이블 별표 토글
   ===================================================== */

/**
 * 행의 starred 값을 반전하고 DOM을 갱신합니다.
 * @param {number} idx
 */
function toggleStar(idx) {                                            // 별표 상태 토글 함수
  KNOWLEDGE_DATA[idx].starred = !KNOWLEDGE_DATA[idx].starred;        // 상태 반전
  const btn = $q(`.star-toggle[data-idx="${idx}"]`);
  if (btn) btn.textContent = KNOWLEDGE_DATA[idx].starred ? "★" : "☆"; // 버튼 갱신
}

/**
 * 테이블 별표 버튼 이벤트를 위임(delegation) 방식으로 등록합니다.
 */
function initStarToggle() {                                           // 별표 토글 이벤트 초기화
  const tbody = $("knowledgeTableBody");
  if (!tbody) return;

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".star-toggle");                     // 버튼 클릭 감지
    if (!btn) return;
    toggleStar(Number(btn.dataset.idx));                              // 해당 행 별표 토글
  });
}

/* =====================================================
   [8] DONUT CHART  –  캔버스 도넛 차트 드로잉
   ===================================================== */

/**
 * 캔버스에 도넛 차트를 그립니다.
 * @param {HTMLCanvasElement} canvas
 * @param {number} total     - 전체 최대값
 * @param {number} value     - 현재 값
 * @param {string} fillColor - 채워진 호 색상
 * @param {string} bgColor   - 배경 호 색상
 */
function drawDonut(canvas, total, value, fillColor, bgColor) {        // 도넛 차트 드로잉 함수
  const ctx  = canvas.getContext("2d");                               // 2D 컨텍스트 획득
  const W    = canvas.width;
  const H    = canvas.height;
  const cx   = W / 2;
  const cy   = H / 2;
  const r    = (Math.min(W, H) / 2) - 8;                             // 반지름 (패딩 포함)
  const lw   = 10;                                                    // 선 두께
  const startAngle = -Math.PI / 2;                                   // 12시 방향 시작
  const ratio      = Math.min(value / total, 1);                     // 채움 비율 계산
  const endAngle   = startAngle + 2 * Math.PI * ratio;               // 끝 각도

  ctx.clearRect(0, 0, W, H);                                         // 이전 드로잉 초기화

  // 배경 원 (회색 트랙)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = bgColor;
  ctx.lineWidth   = lw;
  ctx.stroke();

  // 값 원호 (채워진 부분)
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = fillColor;
  ctx.lineWidth   = lw;
  ctx.lineCap     = "round";                                          // 끝 처리 둥글게
  ctx.stroke();
}

/**
 * 두 도넛 차트를 초기화하고 그립니다.
 */
function initDonutCharts() {                                          // 도넛 차트 초기화
  const cExec   = $("chartExecuted");
  const cActive = $("chartActive");
  const total   = TICKET_DATA.executed.count + TICKET_DATA.active.count; // 합계 계산

  if (cExec) {                                                        // 실행됨 차트 드로우
    drawDonut(
      cExec,
      total,
      TICKET_DATA.executed.count,
      TICKET_DATA.executed.color,
      TICKET_DATA.executed.bg,
    );
    $("numExecuted").textContent = TICKET_DATA.executed.count;        // 중앙 숫자 설정
  }

  if (cActive) {                                                      // 활성 차트 드로우
    drawDonut(
      cActive,
      total,
      TICKET_DATA.active.count,
      TICKET_DATA.active.color,
      TICKET_DATA.active.bg,
    );
    $("numActive").textContent = TICKET_DATA.active.count;            // 중앙 숫자 설정
  }
}

/* =====================================================
   [9] TASK PILL TOGGLE  –  New Tasks 필 선택
   ===================================================== */

/**
 * 클릭된 task-pill 을 활성화하고 나머지는 해제합니다.
 * @param {HTMLElement} pill
 */
function activateTaskPill(pill) {                                     // 태스크 필 활성화 함수
  $all(".task-pill").forEach((p) => p.classList.remove("task-pill--active")); // 전체 해제
  pill.classList.add("task-pill--active");                            // 선택 항목 활성화
}

/**
 * New Tasks 그리드의 클릭 이벤트를 등록합니다.
 */
function initTaskPills() {                                            // 태스크 필 이벤트 초기화
  $all(".task-pill").forEach((pill) => {
    pill.addEventListener("click", () => activateTaskPill(pill));    // 클릭시 활성화
  });
}

/* =====================================================
   [10] CHECK BUTTONS  –  카드 체크박스 토글
   ===================================================== */

/**
 * check-btn 의 done 상태를 토글합니다.
 * @param {HTMLElement} btn
 */
function toggleCheckBtn(btn) {                                        // 체크 버튼 토글 함수
  btn.classList.toggle("check-btn--done");                            // done 클래스 토글
}

/**
 * 모든 check-btn 에 클릭 이벤트를 등록합니다.
 */
function initCheckButtons() {                                         // 체크 버튼 이벤트 초기화
  $all(".check-btn[aria-label='Done']").forEach((btn) => {
    btn.addEventListener("click", () => toggleCheckBtn(btn));        // 클릭시 토글
  });
}

/* =====================================================
   [11] ADD TASK  –  태스크 추가 버튼 (플레이스홀더)
   ===================================================== */

/**
 * 추가 버튼 클릭 시 토스트 알림을 표시합니다.
 */
function handleAddTask() {                                            // 태스크 추가 핸들러
  showToast("새 태스크 추가 기능 준비 중입니다.");                    // 토스트 메시지 표시
}

/**
 * 모든 add-task-btn 에 클릭 이벤트를 등록합니다.
 */
function initAddTaskButtons() {                                       // 추가 버튼 이벤트 초기화
  $all(".add-task-btn").forEach((btn) => {
    btn.addEventListener("click", handleAddTask);                     // 클릭 핸들러 연결
  });
}

/* =====================================================
   [12] TOAST NOTIFICATION  –  간단한 알림 표시
   ===================================================== */

/** 토스트 타이머 ID */
let toastTimer = null;                                                // 이전 토스트 타이머 저장

/**
 * 화면 우측 하단에 토스트 메시지를 표시합니다.
 * @param {string} message
 * @param {number} [duration=2500]
 */
function showToast(message, duration = 2500) {                        // 토스트 알림 함수
  let toast = $q(".toast-msg");

  if (!toast) {                                                       // 토스트 DOM이 없으면 생성
    toast = document.createElement("div");
    toast.className = "toast-msg";
    applyToastStyles(toast);                                          // 스타일 적용
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  if (toastTimer) clearTimeout(toastTimer);                          // 이전 타이머 취소

  toastTimer = setTimeout(() => {                                     // 지정 시간 후 숨김
    toast.style.opacity    = "0";
    toast.style.transform  = "translateY(8px)";
  }, duration);
}

/**
 * 토스트 DOM에 인라인 스타일을 적용합니다.
 * @param {HTMLElement} el
 */
function applyToastStyles(el) {                                       // 토스트 스타일 설정 함수
  Object.assign(el.style, {
    position:       "fixed",
    bottom:         "24px",
    right:          "24px",
    background:     "var(--text-primary)",
    color:          "var(--bg-surface)",
    padding:        "10px 18px",
    borderRadius:   "10px",
    fontSize:       "12.5px",
    fontFamily:     "var(--font)",
    boxShadow:      "var(--shadow-md)",
    zIndex:         "9999",
    opacity:        "0",
    transform:      "translateY(8px)",
    transition:     "opacity .22s ease, transform .22s ease",
    pointerEvents:  "none",
  });
}

/* =====================================================
   [13] ICON SEARCH BUTTON  –  검색 버튼 핸들러
   ===================================================== */

/**
 * 검색 버튼 클릭 이벤트를 등록합니다.
 */
function initSearchButton() {                                         // 검색 버튼 초기화
  $("btnSearch")?.addEventListener("click", () => {
    showToast("검색 기능 준비 중입니다.");                            // 토스트 메시지 표시
  });
}

/* =====================================================
   [14] SIDEBAR BACK BUTTON  –  뒤로가기 핸들러
   ===================================================== */

/**
 * 사이드바 뒤로가기 버튼 이벤트를 등록합니다.
 */
function initBackButton() {                                           // 뒤로가기 버튼 초기화
  $("btnBack")?.addEventListener("click", () => {
    showToast("이전 페이지로 이동합니다.");                           // 토스트 메시지 표시
  });
}

/* =====================================================
   [15] BOARD ADD BUTTON  –  보드 추가 버튼 핸들러
   ===================================================== */

/**
 * 보드 상단 추가 버튼 이벤트를 등록합니다.
 */
function initBoardAddButton() {                                       // 보드 추가 버튼 초기화
  $("btnBoardAdd")?.addEventListener("click", () => {
    showToast("새 케이스 관리 항목 추가 준비 중입니다.");             // 토스트 메시지 표시
  });
}

/* =====================================================
   [16] APP INIT  –  앱 진입점, 모든 모듈 초기화
   ===================================================== */

/**
 * 앱 전체 초기화 함수 – DOM 로드 완료 후 실행됩니다.
 */
function init() {                                                     // 앱 초기화 진입점
  initTopbarNav();         // [3] 탑바 네비게이션 초기화
  initDarkMode();          // [4] 다크 모드 초기화
  renderBoardAvatars();    // [5] 보드 아바타 렌더링
  renderKnowledgeTable();  // [6] 지식 테이블 렌더링
  initStarToggle();        // [7] 별표 토글 초기화
  initDonutCharts();       // [8] 도넛 차트 초기화
  initTaskPills();         // [9] 태스크 필 초기화
  initCheckButtons();      // [10] 체크 버튼 초기화
  initAddTaskButtons();    // [11] 추가 버튼 초기화
  initSearchButton();      // [13] 검색 버튼 초기화
  initBackButton();        // [14] 뒤로가기 버튼 초기화
  initBoardAddButton();    // [15] 보드 추가 버튼 초기화
}

document.addEventListener("DOMContentLoaded", init);                  // DOM 준비 후 init 실행