(() => {
  'use strict';

  const CONFIG = window.TEAM_FLOW_CONFIG || {};
  const CACHE_KEY = 'teamFlowRemoteCacheV4';
  const USER_KEY = 'teamFlowCurrentUserV2';
  const TOKEN_KEY = 'teamFlowAccessTokenV2';
  const STATUS = {
    before: { label: '진행 전', color: '#89909d' },
    progress: { label: '진행 중', color: '#2f6bff' },
    completed: { label: '완료', color: '#23a36d' },
    hold: { label: '보류', color: '#e58a18' },
    delayed: { label: '지연', color: '#e14a55' }
  };
  const PRIORITY = { low: '낮음', normal: '보통', high: '높음', urgent: '긴급' };
  const REQUIRED_API_VERSION = '1.6.0';
  const DEFAULT_AVATAR_COLOR = '#2f6bff';
  const AVATAR_PALETTE = ['#2f6bff', '#5b8def', '#7c5cff', '#ff5c7c', '#ef6c00', '#16a34a', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#6b7280'];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    sidebar: $('#sidebar'),
    pageTitle: $('#pageTitle'),
    todayLabel: $('#todayLabel'),
    summaryCards: $('#summaryCards'),
    focusTaskList: $('#focusTaskList'),
    projectProgressList: $('#projectProgressList'),
    weeklyTimeline: $('#weeklyTimeline'),
    teamStatusBody: $('#teamStatusBody'),
    statusDonut: $('#statusDonut'),
    donutTotal: $('#donutTotal'),
    statusLegend: $('#statusLegend'),
    taskListContainer: $('#taskListContainer'),
    taskListTitle: $('#taskListTitle'),
    calendarGrid: $('#calendarGrid'),
    weekRangeLabel: $('#weekRangeLabel'),
    assigneeFilter: $('#assigneeFilter'),
    statusFilter: $('#statusFilter'),
    globalSearch: $('#globalSearch'),
    taskModal: $('#taskModal'),
    taskForm: $('#taskForm'),
    taskId: $('#taskId'),
    taskTitle: $('#taskTitle'),
    taskProject: $('#taskProject'),
    taskAssignee: $('#taskAssignee'),
    taskStart: $('#taskStart'),
    taskEnd: $('#taskEnd'),
    taskStatus: $('#taskStatus'),
    taskPriority: $('#taskPriority'),
    taskProgress: $('#taskProgress'),
    progressValue: $('#progressValue'),
    taskDescription: $('#taskDescription'),
    taskLink: $('#taskLink'),
    addSubtaskBtn: $('#addSubtaskBtn'),
    subtaskEditorList: $('#subtaskEditorList'),
    subtaskEditorCount: $('#subtaskEditorCount'),
    taskModalTitle: $('#taskModalTitle'),
    deleteTaskBtn: $('#deleteTaskBtn'),
    saveTaskBtn: $('#saveTaskBtn'),
    toast: $('#toast'),
    projectOptions: $('#projectOptions'),
    currentUserSelect: $('#currentUserSelect'),
    profileName: $('#profileName'),
    profileTeam: $('#profileTeam'),
    profileAvatar: $('#profileAvatar'),
    openAvatarPickerBtn: $('#openAvatarPickerBtn'),
    avatarPicker: $('#avatarPicker'),
    connectionBanner: $('#connectionBanner'),
    connectionLabel: $('#connectionLabel'),
    connectionDot: $('#connectionDot'),
    lastSyncLabel: $('#lastSyncLabel'),
    refreshDataBtn: $('#refreshDataBtn'),
    changeAccessKeyBtn: $('#changeAccessKeyBtn'),
    taskFilterRow: $('#taskFilterRow'),
    openTaskModalBtn: $('#openTaskModalBtn'),
    meetingList: $('#meetingList'),
    meetingSummary: $('#meetingSummary'),
    meetingModal: $('#meetingModal'),
    meetingForm: $('#meetingForm'),
    meetingId: $('#meetingId'),
    meetingTitle: $('#meetingTitle'),
    meetingDate: $('#meetingDate'),
    meetingStartTime: $('#meetingStartTime'),
    meetingEndTime: $('#meetingEndTime'),
    meetingLocation: $('#meetingLocation'),
    meetingProject: $('#meetingProject'),
    meetingRecorder: $('#meetingRecorder'),
    meetingAttendeePicker: $('#meetingAttendeePicker'),
    meetingAgenda: $('#meetingAgenda'),
    meetingDiscussion: $('#meetingDiscussion'),
    meetingDecisions: $('#meetingDecisions'),
    meetingActionList: $('#meetingActionList'),
    addMeetingActionBtn: $('#addMeetingActionBtn'),
    meetingModalTitle: $('#meetingModalTitle'),
    deleteMeetingBtn: $('#deleteMeetingBtn'),
    saveMeetingBtn: $('#saveMeetingBtn')
  };

  let tasks = [];
  let comments = [];
  let meetings = [];
  let teamMembers = [];
  let currentUser = localStorage.getItem(USER_KEY) || '';
  let activeView = 'dashboard';
  let taskLayout = 'list';
  let period = 'week';
  let calendarAnchor = startOfWeek(new Date());
  let activeMineOnly = false;
  let isSyncing = false;
  let editingSubtasks = [];
  let editingMeetingActions = [];
  const expandedTaskIds = new Set();
  const expandedMeetingIds = new Set();

  function iso(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function addDays(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
  }

  function startOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return d;
  }

  function endOfWeek(date) { return addDays(startOfWeek(date), 6); }
  function dateOnly(value) {
    const safe = /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? `${value}T00:00:00` : value;
    const d = new Date(safe);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function isSameDay(a, b) { return iso(a) === iso(b); }
  function between(value, start, end) { const d = dateOnly(value); return d >= start && d <= end; }
  function overlaps(task, start, end) { return dateOnly(task.start) <= end && dateOnly(task.end) >= start; }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  function actualStatus(task) {
    const today = dateOnly(iso(new Date()));
    return task.status !== 'completed' && dateOnly(task.end) < today ? 'delayed' : task.status;
  }

  function sampleTasks() {
    const monday = startOfWeek(new Date());
    return [
      makeTask('ERS 부스 그래픽 최종 전달', 'ERS 2026', '김마케팅', addDays(monday, -1), addDays(monday, 1), 'progress', 'urgent', 70, 'Google Sheets 연결 전 화면 확인용 샘플 업무입니다.'),
      makeTask('OmniOx750U 영상 스토리보드 검토', 'OmniOx750U 영상', '이콘텐츠', monday, addDays(monday, 3), 'progress', 'high', 45, ''),
      makeTask('MV50 카탈로그 사양표 업데이트', 'MV50 카탈로그', '김마케팅', addDays(monday, 2), addDays(monday, 4), 'before', 'high', 15, ''),
      makeTask('웹사이트 Bi-Flow 페이지 수정', '웹사이트 개편', '박디자인', addDays(monday, 1), addDays(monday, 5), 'before', 'normal', 10, '')
    ];
  }

  function makeTask(title, project, assignee, start, end, status, priority, progress, description) {
    return normalizeTask({
      id: `T${Date.now()}${Math.random().toString(16).slice(2, 7)}`,
      title, project, assignee, start: iso(start), end: iso(end), status, priority, progress,
      description, link: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), subtasks: []
    });
  }

  function normalizeSubtasks(value) {
    let source = value;
    if (typeof source === 'string') {
      try { source = JSON.parse(source); } catch (error) { source = []; }
    }
    if (!Array.isArray(source)) return [];
    return source.slice(0, 30).map((item, index) => ({
      id: String(item?.id || `S${Date.now()}${index}${Math.random().toString(16).slice(2, 6)}`),
      title: String(item?.title || '').slice(0, 120),
      dueDate: String(item?.dueDate || '').slice(0, 10),
      completed: item?.completed === true || String(item?.completed).toLowerCase() === 'true'
    })).filter(item => item.title || item.dueDate);
  }

  function normalizeTask(task = {}) {
    return {
      id: String(task.id || ''),
      title: String(task.title || ''),
      project: String(task.project || '기타'),
      assignee: String(task.assignee || ''),
      start: String(task.start || iso(new Date())).slice(0, 10),
      end: String(task.end || iso(new Date())).slice(0, 10),
      status: ['before', 'progress', 'completed', 'hold'].includes(task.status) ? task.status : 'before',
      priority: ['low', 'normal', 'high', 'urgent'].includes(task.priority) ? task.priority : 'normal',
      progress: Math.max(0, Math.min(100, Number(task.progress) || 0)),
      description: String(task.description || ''),
      link: String(task.link || ''),
      createdAt: String(task.createdAt || ''),
      updatedAt: String(task.updatedAt || ''),
      subtasks: normalizeSubtasks(task.subtasks)
    };
  }

  function normalizeComment(comment = {}) {
    return {
      id: String(comment.id || ''),
      taskId: String(comment.taskId || ''),
      author: String(comment.author || ''),
      content: String(comment.content || '').slice(0, 1000),
      createdAt: String(comment.createdAt || '')
    };
  }


  function normalizeMeetingActions(value) {
    let source = value;
    if (typeof source === 'string') {
      try { source = JSON.parse(source); } catch (error) { source = []; }
    }
    if (!Array.isArray(source)) return [];
    return source.slice(0, 30).map((item, index) => ({
      id: String(item?.id || `MA${Date.now()}${index}${Math.random().toString(16).slice(2, 6)}`),
      title: String(item?.title || '').slice(0, 160),
      owner: String(item?.owner || ''),
      dueDate: String(item?.dueDate || '').slice(0, 10),
      completed: item?.completed === true || String(item?.completed).toLowerCase() === 'true'
    })).filter(item => item.title || item.owner || item.dueDate);
  }

  function normalizeMeeting(meeting = {}) {
    let attendees = meeting.attendees;
    if (typeof attendees === 'string') {
      try { attendees = JSON.parse(attendees); } catch (error) { attendees = attendees.split(','); }
    }
    if (!Array.isArray(attendees)) attendees = [];
    return {
      id: String(meeting.id || ''),
      title: String(meeting.title || ''),
      date: String(meeting.date || iso(new Date())).slice(0, 10),
      startTime: String(meeting.startTime || '').slice(0, 5),
      endTime: String(meeting.endTime || '').slice(0, 5),
      location: String(meeting.location || ''),
      project: String(meeting.project || ''),
      attendees: [...new Set(attendees.map(value => String(value || '').trim()).filter(Boolean))],
      recorder: String(meeting.recorder || ''),
      agenda: String(meeting.agenda || ''),
      discussion: String(meeting.discussion || ''),
      decisions: String(meeting.decisions || ''),
      actionItems: normalizeMeetingActions(meeting.actionItems),
      createdAt: String(meeting.createdAt || ''),
      updatedAt: String(meeting.updatedAt || '')
    };
  }

  function newMeetingAction() {
    return { id: `MA${Date.now()}${Math.random().toString(16).slice(2, 7)}`, title: '', owner: currentUser || '', dueDate: '', completed: false };
  }

  function meetingActionStats(meeting) {
    const items = normalizeMeetingActions(meeting.actionItems);
    return { total: items.length, completed: items.filter(item => item.completed).length };
  }

  function commentsForTask(taskId) {
    return comments
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  function formatCommentTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    const day = `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`;
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${sameYear ? day : `${date.getFullYear()}.${day}`} ${time}`;
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && Array.isArray(cached.tasks)) {
        tasks = cached.tasks.map(normalizeTask);
        comments = Array.isArray(cached.comments) ? cached.comments.map(normalizeComment) : [];
        meetings = Array.isArray(cached.meetings) ? cached.meetings.map(normalizeMeeting) : [];
        teamMembers = Array.isArray(cached.members) ? cached.members : [];
        return true;
      }
    } catch (error) {
      console.warn('캐시를 읽지 못했습니다.', error);
    }
    tasks = sampleTasks();
    comments = [];
    meetings = [];
    teamMembers = [
      { name: '김마케팅', position: '프로', team: '마케팅팀', active: true },
      { name: '박디자인', position: '프로', team: '마케팅팀', active: true },
      { name: '이콘텐츠', position: '프로', team: '마케팅팀', active: true }
    ];
    return false;
  }

  function writeCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ tasks, comments, meetings, members: teamMembers, savedAt: new Date().toISOString() }));
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function initials(name) {
    const value = String(name || '나').trim();
    const compact = value.replace(/\s+/g, '');
    if (!compact) return '나';
    if (/[가-힣]/.test(compact)) return compact.slice(-2);
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length > 1) return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    return compact.slice(0, 2).toUpperCase();
  }
  function formatShort(value) { const d = dateOnly(value); return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`; }
  function statusBadge(task) { const st = actualStatus(task); return `<span class="badge ${st}">${STATUS[st].label}</span>`; }
  function priorityBadge(task) { return ['urgent', 'high'].includes(task.priority) ? `<span class="badge priority-${task.priority}">${PRIORITY[task.priority]}</span>` : ''; }

  function memberInfo(name) {
    return teamMembers.find(member => member.name === name) || {};
  }

  function fallbackAvatarColor(name) {
    const value = String(name || '').trim();
    if (!value) return DEFAULT_AVATAR_COLOR;
    let hash = 0;
    for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  }

  function normalizeColor(value, fallbackName = '') {
    const color = String(value || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : fallbackAvatarColor(fallbackName);
  }

  function avatarColor(name) {
    return normalizeColor(memberInfo(name)?.avatarColor, name);
  }

  function avatarStyle(name) {
    return ` style="--avatar-color:${escapeHTML(avatarColor(name))}"`;
  }

  function avatarMarkup(name, className = 'avatar') {
    return `<div class="${className}"${avatarStyle(name)}>${escapeHTML(initials(name))}</div>`;
  }

  function renderAvatarPicker() {
    if (!els.avatarPicker) return;
    els.avatarPicker.innerHTML = `
      <div class="avatar-picker-head">
        <strong>프로필 아이콘</strong>
        <span>이름 뒤 두 글자가 자동 표시됩니다.</span>
      </div>
      <div class="avatar-color-grid">
        ${AVATAR_PALETTE.map(color => `
          <button type="button" class="avatar-color-swatch${avatarColor(currentUser) === color ? ' active' : ''}"
            data-avatar-color="${color}" style="--swatch:${color}" aria-label="아이콘 색상 ${color}"></button>`).join('')}
      </div>`;
  }

  function subtaskStats(task) {
    const items = normalizeSubtasks(task.subtasks);
    const completed = items.filter(item => item.completed).length;
    return { total: items.length, completed };
  }

  function nextSubtask(task) {
    return normalizeSubtasks(task.subtasks)
      .filter(item => !item.completed && item.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] || null;
  }

  function checklistProgress(items) {
    if (!items.length) return null;
    return Math.round(items.filter(item => item.completed).length / items.length * 100);
  }

  function newSubtask() {
    return { id: `S${Date.now()}${Math.random().toString(16).slice(2, 7)}`, title: '', dueDate: '', completed: false };
  }

  function syncProgressFromEditingSubtasks() {
    const progress = checklistProgress(editingSubtasks);
    if (progress === null) return;
    els.taskProgress.value = progress;
    els.progressValue.textContent = `${progress}% · 체크리스트 자동 계산`;
    if (progress === 100) els.taskStatus.value = 'completed';
    else if (els.taskStatus.value === 'completed') els.taskStatus.value = progress > 0 ? 'progress' : 'before';
  }

  function renderSubtaskEditor() {
    const completedCount = editingSubtasks.filter(item => item.completed).length;
    if (els.subtaskEditorCount) {
      els.subtaskEditorCount.textContent = editingSubtasks.length
        ? `${completedCount}/${editingSubtasks.length} 완료`
        : '0개';
    }

    if (!editingSubtasks.length) {
      els.subtaskEditorList.innerHTML = `
        <button type="button" class="subtask-empty" data-add-subtask-empty>
          <span class="subtask-empty-icon">＋</span>
          <span><strong>첫 세부 일정 추가</strong><small>예: 8월 12일까지 1차 스크립트 완료</small></span>
        </button>`;
      els.progressValue.textContent = `${els.taskProgress.value}%`;
      return;
    }

    els.subtaskEditorList.innerHTML = editingSubtasks.map((item, index) => `
      <div class="subtask-editor-row ${item.completed ? 'completed' : ''}">
        <button type="button" class="subtask-check-button ${item.completed ? 'checked' : ''}" data-subtask-toggle="${index}" aria-pressed="${item.completed}" aria-label="${item.completed ? '세부 일정 미완료로 변경' : '세부 일정 완료로 변경'}" title="완료 여부">
          <span aria-hidden="true"></span>
        </button>
        <input class="subtask-title-input" data-subtask-field="title" data-subtask-index="${index}" maxlength="120" value="${escapeHTML(item.title)}" placeholder="세부 일정 입력">
        <div class="subtask-date-wrap">
          <span>마감</span>
          <input class="subtask-date-input" data-subtask-field="dueDate" data-subtask-index="${index}" type="date" value="${escapeHTML(item.dueDate)}" aria-label="세부 일정 마감일">
        </div>
        <button type="button" class="remove-subtask-button" data-remove-subtask="${index}" aria-label="세부 일정 삭제">×</button>
      </div>`).join('');
    syncProgressFromEditingSubtasks();
  }

  function apiConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(String(CONFIG.API_URL || '')) && !/PASTE_|YOUR_/i.test(CONFIG.API_URL);
  }

  function compareVersions(a, b) {
    const pa = String(a || '0').split('.').map(value => Number(value) || 0);
    const pb = String(b || '0').split('.').map(value => Number(value) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff) return diff;
    }
    return 0;
  }

  function assertApiVersion(response) {
    if (compareVersions(response?.version, REQUIRED_API_VERSION) < 0) {
      throw new Error(`Apps Script가 이전 버전(${response?.version || '확인 불가'})입니다. Code.gs를 교체한 뒤 새 버전으로 다시 배포하세요.`);
    }
  }

  function normalizedSubtaskSignature(items) {
    return JSON.stringify(normalizeSubtasks(items).map(item => ({
      id: item.id,
      title: item.title.trim(),
      dueDate: item.dueDate,
      completed: Boolean(item.completed)
    })));
  }

  function mutationApplied(action, payload, remoteTasks, remoteComments, remoteMembers = [], remoteMeetings = []) {
    if (action === 'deleteTask') {
      return !remoteTasks.some(task => task.id === payload.id)
        && !remoteComments.some(comment => comment.taskId === payload.id);
    }
    if (action === 'addComment') {
      const saved = remoteComments.find(comment => comment.id === payload.id);
      return Boolean(saved && saved.taskId === payload.taskId && saved.author === payload.author && saved.content === payload.content);
    }
    if (action === 'deleteComment') return !remoteComments.some(comment => comment.id === payload.id);
    if (action === 'saveMemberProfile') {
      const savedMember = remoteMembers.find(member => member.name === payload.name);
      return Boolean(savedMember && normalizeColor(savedMember.avatarColor, savedMember.name) === normalizeColor(payload.avatarColor, payload.name));
    }
    if (action === 'deleteMeeting') return !remoteMeetings.some(meeting => meeting.id === payload.id);
    if (action === 'saveMeeting') {
      const savedMeeting = remoteMeetings.find(meeting => meeting.id === payload.id);
      if (!savedMeeting) return false;
      return savedMeeting.title === payload.title
        && savedMeeting.date === payload.date
        && savedMeeting.recorder === payload.recorder
        && JSON.stringify(savedMeeting.attendees) === JSON.stringify(payload.attendees)
        && JSON.stringify(normalizeMeetingActions(savedMeeting.actionItems)) === JSON.stringify(normalizeMeetingActions(payload.actionItems));
    }
    if (action !== 'saveTask') return true;
    const saved = remoteTasks.find(task => task.id === payload.id);
    if (!saved) return false;
    return saved.title === payload.title
      && saved.project === payload.project
      && saved.assignee === payload.assignee
      && saved.start === payload.start
      && saved.end === payload.end
      && normalizedSubtaskSignature(saved.subtasks) === normalizedSubtaskSignature(payload.subtasks);
  }

  function getAccessToken({ ask = false } = {}) {
    let token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token && ask) {
      token = window.prompt('TEAM FLOW 팀 접속키를 입력하세요.\n관리자가 Apps Script에서 확인한 접속키입니다.') || '';
      token = token.trim();
      if (token) localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  }

  function setConnectionState(state, label, detail) {
    els.connectionBanner.classList.remove('loading', 'connected', 'offline', 'error');
    els.connectionBanner.classList.add(state);
    els.connectionLabel.textContent = label;
    els.lastSyncLabel.textContent = detail;
  }

  function jsonpRequest(action) {
    return new Promise((resolve, reject) => {
      if (!apiConfigured()) return reject(new Error('config.js에 Apps Script 웹 앱 URL을 입력하세요.'));
      const token = getAccessToken({ ask: true });
      if (!token) return reject(new Error('팀 접속키가 필요합니다.'));

      const callbackName = `__teamFlowCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const timeoutMs = Number(CONFIG.REQUEST_TIMEOUT_MS) || 20000;
      const timer = setTimeout(() => cleanup(new Error('Google Sheets 응답 시간이 초과되었습니다.')), timeoutMs);

      function cleanup(error, data) {
        clearTimeout(timer);
        delete window[callbackName];
        script.remove();
        if (error) reject(error); else resolve(data);
      }

      window[callbackName] = data => {
        if (!data || data.ok !== true) return cleanup(new Error(data?.error || 'Google Sheets 요청에 실패했습니다.'));
        cleanup(null, data);
      };
      script.onerror = () => cleanup(new Error('Apps Script에 연결하지 못했습니다. 배포 권한과 URL을 확인하세요.'));

      const url = new URL(CONFIG.API_URL);
      url.searchParams.set('action', action);
      url.searchParams.set('callback', callbackName);
      url.searchParams.set('token', token);
      url.searchParams.set('_', Date.now().toString());
      script.src = url.toString();
      script.async = true;
      document.head.appendChild(script);
    });
  }

  async function postMutation(action, payload) {
    if (!apiConfigured()) throw new Error('config.js에 Apps Script 웹 앱 URL을 입력하세요.');
    const token = getAccessToken({ ask: true });
    if (!token) throw new Error('팀 접속키가 필요합니다.');

    await fetch(CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ action, token, payload })
    });
  }

  async function loadRemoteData({ silent = false } = {}) {
    if (isSyncing) return;
    if (!apiConfigured()) {
      setConnectionState('offline', 'Google Sheets 설정 필요', 'config.js에 Apps Script 웹 앱 URL을 붙여넣으세요. 현재는 샘플 화면입니다.');
      renderAll();
      return;
    }

    isSyncing = true;
    els.refreshDataBtn.disabled = true;
    if (!silent) setConnectionState('loading', 'Google Sheets 동기화 중', '팀 공용 업무를 불러오고 있습니다.');
    try {
      const response = await jsonpRequest('getData');
      assertApiVersion(response);
      tasks = Array.isArray(response.tasks) ? response.tasks.map(normalizeTask) : [];
      comments = Array.isArray(response.comments) ? response.comments.map(normalizeComment) : [];
      meetings = Array.isArray(response.meetings) ? response.meetings.map(normalizeMeeting) : [];
      teamMembers = Array.isArray(response.members) ? response.members.filter(member => member.active !== false) : [];
      ensureCurrentUser();
      writeCache();
      renderAll();
      const syncedAt = new Date();
      setConnectionState('connected', 'Google Sheets 연결됨', `마지막 동기화 ${syncedAt.getHours()}:${String(syncedAt.getMinutes()).padStart(2, '0')}`);
    } catch (error) {
      console.error(error);
      setConnectionState('error', 'Google Sheets 연결 실패', error.message);
      renderAll();
      if (!silent) showToast(error.message);
    } finally {
      isSyncing = false;
      els.refreshDataBtn.disabled = false;
    }
  }

  async function mutateAndRefresh(action, payload, successMessage) {
    setConnectionState('loading', 'Google Sheets 저장 중', '저장 결과를 확인하고 있습니다.');
    await postMutation(action, payload);

    const attempts = Number(CONFIG.SYNC_POLL_ATTEMPTS) || 12;
    const interval = Number(CONFIG.SYNC_POLL_INTERVAL_MS) || 800;
    let lastError = null;

    for (let i = 0; i < attempts; i += 1) {
      await sleep(interval);
      try {
        const response = await jsonpRequest('getData');
        assertApiVersion(response);
        const remoteTasks = Array.isArray(response.tasks) ? response.tasks.map(normalizeTask) : [];
        const remoteComments = Array.isArray(response.comments) ? response.comments.map(normalizeComment) : [];
        const remoteMeetings = Array.isArray(response.meetings) ? response.meetings.map(normalizeMeeting) : [];
        const remoteMembers = Array.isArray(response.members) ? response.members.filter(member => member.active !== false) : [];
        if (!mutationApplied(action, payload, remoteTasks, remoteComments, remoteMembers, remoteMeetings)) {
          lastError = new Error('저장 내용이 아직 Google Sheets에 반영되지 않았습니다.');
          continue;
        }

        tasks = remoteTasks;
        comments = remoteComments;
        meetings = remoteMeetings;
        teamMembers = remoteMembers;
        ensureCurrentUser();
        writeCache();
        renderAll();
        setConnectionState('connected', 'Google Sheets 연결됨', '방금 변경 사항을 저장했습니다.');
        showToast(successMessage);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('저장 내용을 확인하지 못했습니다. Apps Script를 새 버전으로 배포했는지 확인하세요.');
  }

  function memberNames() {
    const names = teamMembers.map(member => String(member.name || '').trim()).filter(Boolean);
    const taskNames = tasks.map(task => task.assignee).filter(Boolean);
    const meetingNames = meetings.flatMap(meeting => [meeting.recorder, ...meeting.attendees, ...normalizeMeetingActions(meeting.actionItems).map(item => item.owner)]).filter(Boolean);
    return [...new Set([...names, ...taskNames, ...meetingNames])];
  }

  function ensureCurrentUser() {
    const names = memberNames();
    if (!names.length) {
      currentUser = '';
      return;
    }
    if (!names.includes(currentUser)) currentUser = names[0];
    localStorage.setItem(USER_KEY, currentUser);
  }

  function updateProfile() {
    const member = teamMembers.find(item => item.name === currentUser);
    els.profileName.textContent = currentUser || '사용자 선택';
    els.profileTeam.textContent = [member?.position, member?.team].filter(Boolean).join(' · ') || '팀 공용';
    els.profileAvatar.textContent = initials(currentUser);
    els.profileAvatar.style.setProperty('--avatar-color', avatarColor(currentUser));
    renderAvatarPicker();
  }

  function getFilteredTasks({ ignorePeriod = false } = {}) {
    const query = els.globalSearch.value.trim().toLowerCase();
    const assignee = els.assigneeFilter.value;
    const status = els.statusFilter.value;
    const today = dateOnly(iso(new Date()));
    let start;
    let end;
    if (period === 'week') { start = startOfWeek(today); end = endOfWeek(today); }
    if (period === 'month') { start = new Date(today.getFullYear(), today.getMonth(), 1); end = new Date(today.getFullYear(), today.getMonth() + 1, 0); }

    return tasks.filter(task => {
      if (activeMineOnly && task.assignee !== currentUser) return false;
      if (!ignorePeriod && period !== 'all' && !overlaps(task, start, end)) return false;
      if (assignee !== 'all' && task.assignee !== assignee) return false;
      if (status !== 'all' && actualStatus(task) !== status) return false;
      const subtaskText = normalizeSubtasks(task.subtasks).map(item => item.title).join(' ');
      const commentText = commentsForTask(task.id).map(comment => `${comment.author} ${comment.content}`).join(' ');
      if (query && ![task.title, task.project, task.assignee, task.description, subtaskText, commentText].some(value => (value || '').toLowerCase().includes(query))) return false;
      return true;
    });
  }

  function renderAll() {
    populateFilters();
    renderDashboard();
    renderTaskList();
    renderCalendar();
    renderMeetingList();
    updateProfile();
  }

  function populateFilters() {
    const names = memberNames();
    const selectedAssignee = els.assigneeFilter.value || 'all';
    const selectedTaskAssignee = els.taskAssignee.value || currentUser;
    const selectedCurrentUser = els.currentUserSelect.value || currentUser;
    const options = names.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');

    els.assigneeFilter.innerHTML = '<option value="all">담당자 전체</option>' + options;
    els.assigneeFilter.value = names.includes(selectedAssignee) ? selectedAssignee : 'all';
    els.taskAssignee.innerHTML = options || '<option value="">팀원을 먼저 등록하세요</option>';
    els.taskAssignee.value = names.includes(selectedTaskAssignee) ? selectedTaskAssignee : (currentUser || names[0] || '');
    els.currentUserSelect.innerHTML = options || '<option value="">등록된 팀원 없음</option>';
    els.currentUserSelect.value = names.includes(selectedCurrentUser) ? selectedCurrentUser : (currentUser || names[0] || '');
    if (els.meetingRecorder) {
      const selectedRecorder = els.meetingRecorder.value || currentUser;
      els.meetingRecorder.innerHTML = options || '<option value="">팀원을 먼저 등록하세요</option>';
      els.meetingRecorder.value = names.includes(selectedRecorder) ? selectedRecorder : (currentUser || names[0] || '');
    }
    renderMeetingAttendeePicker();

    const projects = [...new Set(tasks.map(task => task.project).filter(Boolean))].sort();
    els.projectOptions.innerHTML = projects.map(project => `<option value="${escapeHTML(project)}"></option>`).join('');
  }

  function renderDashboard() {
    const filtered = getFilteredTasks();
    const today = dateOnly(iso(new Date()));
    const weekEnd = endOfWeek(today);
    const counts = {
      total: filtered.length,
      progress: filtered.filter(task => actualStatus(task) === 'progress').length,
      due: filtered.filter(task => actualStatus(task) !== 'completed' && between(task.end, today, weekEnd)).length,
      delayed: filtered.filter(task => actualStatus(task) === 'delayed').length,
      completed: filtered.filter(task => actualStatus(task) === 'completed').length
    };
    const summary = [
      ['total', '전체 업무', counts.total, '현재 조회 범위', '☷'],
      ['progress', '진행 중', counts.progress, '실행 중인 업무', '↻'],
      ['due', '이번 주 마감', counts.due, '확인이 필요한 일정', '◷'],
      ['delayed', '지연', counts.delayed, '종료일이 지난 업무', '!'],
      ['completed', '완료', counts.completed, '완료 처리된 업무', '✓']
    ];
    els.summaryCards.innerHTML = summary.map(([key, label, value, note, icon]) => `
      <article class="summary-card ${key}"><button data-summary-filter="${key}">
        <div class="summary-label"><span>${label}</span><span class="summary-icon">${icon}</span></div>
        <div class="summary-value">${value}</div><div class="summary-note">${note}</div>
      </button></article>`).join('');

    const focus = tasks.filter(task => task.assignee === currentUser && actualStatus(task) !== 'completed')
      .filter(task => dateOnly(task.end) <= weekEnd)
      .sort((a, b) => {
        const delayedDiff = (actualStatus(a) === 'delayed' ? 0 : 1) - (actualStatus(b) === 'delayed' ? 0 : 1);
        return delayedDiff || dateOnly(a.end) - dateOnly(b.end) || (b.priority === 'urgent') - (a.priority === 'urgent');
      }).slice(0, 6);
    els.focusTaskList.innerHTML = focus.length ? focus.map(task => `
      <div class="focus-item" data-open-task="${escapeHTML(task.id)}">
        <div class="focus-date"><strong>${String(dateOnly(task.end).getDate()).padStart(2, '0')}</strong><span>${dateOnly(task.end).getMonth() + 1}월</span></div>
        <div class="focus-copy"><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.project)} · ${task.progress}%</span>${nextSubtask(task) ? `<small>다음 일정 ${formatShort(nextSubtask(task).dueDate)} · ${escapeHTML(nextSubtask(task).title)}</small>` : ''}</div>
        ${statusBadge(task)}
      </div>`).join('') : '<div class="empty-state">이번 주 마감 예정인 내 업무가 없습니다.</div>';

    const grouped = Object.values(tasks.reduce((acc, task) => {
      acc[task.project] ||= { name: task.project, tasks: [], total: 0 };
      acc[task.project].tasks.push(task);
      acc[task.project].total += Number(task.progress || 0);
      return acc;
    }, {})).map(group => ({ ...group, avg: Math.round(group.total / group.tasks.length) })).sort((a, b) => b.tasks.length - a.tasks.length).slice(0, 5);
    els.projectProgressList.innerHTML = grouped.length ? grouped.map(project => `
      <div class="project-row">
        <div class="project-head"><strong>${escapeHTML(project.name)}</strong><span>${project.avg}%</span></div>
        <div class="progress-track"><div class="progress-bar" style="width:${project.avg}%"></div></div>
        <div class="project-meta">세부 업무 ${project.tasks.length}개 · 완료 ${project.tasks.filter(task => actualStatus(task) === 'completed').length}개</div>
      </div>`).join('') : '<div class="empty-state">등록된 프로젝트가 없습니다.</div>';

    renderTimeline();
    renderTeamStatus();
    renderStatusChart(filtered);
  }

  function renderTimeline() {
    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    const visible = tasks.filter(task => overlaps(task, weekStart, addDays(weekStart, 6))).sort((a, b) => dateOnly(a.start) - dateOnly(b.start)).slice(0, 9);
    let html = '<div class="timeline"><div class="timeline-head">업무 / 담당자</div>';
    html += days.map(day => `<div class="timeline-head ${isSameDay(day, new Date()) ? 'today' : ''}">${['월', '화', '수', '목', '금', '토', '일'][(day.getDay() + 6) % 7]} ${day.getMonth() + 1}/${day.getDate()}</div>`).join('');
    visible.forEach(task => {
      html += `<div class="timeline-label" data-open-task="${escapeHTML(task.id)}"><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.assignee)}</span></div>`;
      days.forEach(day => {
        const inside = day >= dateOnly(task.start) && day <= dateOnly(task.end);
        html += `<div class="timeline-day">${inside ? `<div class="timeline-bar ${actualStatus(task)}" data-open-task="${escapeHTML(task.id)}">${task.progress}%</div>` : ''}</div>`;
      });
    });
    html += '</div>';
    els.weeklyTimeline.innerHTML = visible.length ? html : '<div class="empty-state">이번 주에 등록된 업무가 없습니다.</div>';
  }

  function renderTeamStatus() {
    const today = dateOnly(iso(new Date()));
    const weekEnd = endOfWeek(today);
    const names = memberNames();
    els.teamStatusBody.innerHTML = names.map(name => {
      const mine = tasks.filter(task => task.assignee === name);
      const before = mine.filter(task => actualStatus(task) === 'before').length;
      const progress = mine.filter(task => actualStatus(task) === 'progress').length;
      const due = mine.filter(task => actualStatus(task) !== 'completed' && between(task.end, today, weekEnd)).length;
      const delayed = mine.filter(task => actualStatus(task) === 'delayed').length;
      return `<tr>
        <td><div class="team-person">${avatarMarkup(name)}<div><strong>${escapeHTML(name)}</strong><span>${escapeHTML([memberInfo(name).position, memberInfo(name).team].filter(Boolean).join(' · '))}</span></div></div></td>
        <td>${before}</td><td class="metric-primary">${progress}</td><td>${due}</td><td class="${delayed ? 'metric-danger' : ''}">${delayed}</td>
      </tr>`;
    }).join('');
  }

  function renderStatusChart(filtered) {
    const order = ['before', 'progress', 'completed', 'hold', 'delayed'];
    const counts = Object.fromEntries(order.map(key => [key, filtered.filter(task => actualStatus(task) === key).length]));
    const total = filtered.length || 1;
    let cursor = 0;
    const segments = order.map(key => {
      const start = cursor;
      cursor += counts[key] / total * 100;
      return `${STATUS[key].color} ${start}% ${cursor}%`;
    });
    els.statusDonut.style.background = `conic-gradient(${segments.join(',')})`;
    els.donutTotal.textContent = filtered.length;
    els.statusLegend.innerHTML = order.map(key => `<div class="status-legend-row"><i style="background:${STATUS[key].color}"></i><span>${STATUS[key].label}</span><strong>${counts[key]}</strong></div>`).join('');
  }

  function renderTaskList() {
    const filtered = getFilteredTasks({ ignorePeriod: activeView === 'tasks' || activeView === 'mine' });
    els.taskListTitle.textContent = activeMineOnly ? '내 업무' : '전체 업무';
    if (taskLayout === 'board') return renderBoard(filtered);
    if (!filtered.length) {
      els.taskListContainer.innerHTML = '<div class="empty-state">조건에 맞는 업무가 없습니다.</div>';
      return;
    }

    const rows = filtered.sort((a, b) => dateOnly(a.end) - dateOnly(b.end)).map(task => {
      const stats = subtaskStats(task);
      const taskComments = commentsForTask(task.id);
      const expanded = expandedTaskIds.has(task.id);
      const detailsMeta = [
        stats.total ? `체크리스트 ${stats.completed}/${stats.total}` : '',
        taskComments.length ? `댓글 ${taskComments.length}` : ''
      ].filter(Boolean).join(' · ');

      const mainRow = `<tr class="task-main-row" data-open-task="${escapeHTML(task.id)}">
        <td class="task-title-cell">
          <div class="task-title-wrap">
            <button type="button" class="subtask-toggle ${expanded ? 'open' : ''}" data-toggle-subtasks="${escapeHTML(task.id)}" aria-expanded="${expanded}" aria-label="업무 상세 ${expanded ? '접기' : '펼치기'}">${expanded ? '−' : '+'}</button>
            <div><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.project)} ${priorityBadge(task)}${detailsMeta ? ` · ${detailsMeta}` : ''}</span></div>
          </div>
        </td>
        <td><div class="assignee-chip">${avatarMarkup(task.assignee)}<div>${escapeHTML(task.assignee)}${memberInfo(task.assignee).position ? `<small>${escapeHTML(memberInfo(task.assignee).position)}</small>` : ''}</div></div></td>
        <td>${formatShort(task.start)} ~ ${formatShort(task.end)}</td>
        <td>${statusBadge(task)}</td><td><strong>${task.progress}%</strong></td>
        <td class="row-actions"><button class="row-action" data-open-task="${escapeHTML(task.id)}">수정</button></td>
      </tr>`;

      if (!expanded) return mainRow;

      const checklistHtml = stats.total ? `
        <section class="detail-section checklist-detail-section">
          <div class="subtask-checklist-head"><strong>세부 일정</strong><span>${stats.completed}/${stats.total} 완료</span></div>
          ${normalizeSubtasks(task.subtasks).map((item, index) => {
            const overdue = !item.completed && item.dueDate && dateOnly(item.dueDate) < dateOnly(iso(new Date()));
            return `<div class="subtask-view-item ${item.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
              <button type="button" class="subtask-view-check ${item.completed ? 'checked' : ''}" data-subtask-check="${escapeHTML(task.id)}" data-subtask-index="${index}" data-subtask-completed="${item.completed}" aria-pressed="${item.completed}" aria-label="${item.completed ? '세부 일정 미완료로 변경' : '세부 일정 완료로 변경'}"><span aria-hidden="true"></span></button>
              <span class="subtask-view-title">${escapeHTML(item.title)}</span>
              <time>${item.dueDate ? formatShort(item.dueDate) : '날짜 미정'}</time>
              ${overdue ? '<b>지연</b>' : ''}
            </div>`;
          }).join('')}
        </section>` : '';

      const commentsHtml = `
        <section class="detail-section comment-section">
          <div class="comment-section-head">
            <div><strong>코멘트</strong><span>${taskComments.length}</span></div>
            <small>현재 사용자 · ${escapeHTML(currentUser || '사용자 미선택')}</small>
          </div>
          <div class="comment-thread">
            ${taskComments.length ? taskComments.map(comment => {
              const author = memberInfo(comment.author);
              const canDelete = comment.author === currentUser;
              return `<article class="comment-item">
                ${avatarMarkup(comment.author, 'comment-avatar')}
                <div class="comment-body">
                  <div class="comment-meta">
                    <div><strong>${escapeHTML(comment.author)}</strong>${author.position ? `<span>${escapeHTML(author.position)}</span>` : ''}</div>
                    <time>${escapeHTML(formatCommentTime(comment.createdAt))}</time>
                  </div>
                  <p>${escapeHTML(comment.content).replace(/\n/g, '<br>')}</p>
                </div>
                ${canDelete ? `<button type="button" class="comment-delete" data-delete-comment="${escapeHTML(comment.id)}" aria-label="댓글 삭제">×</button>` : ''}
              </article>`;
            }).join('') : '<div class="comment-empty">첫 코멘트를 남겨보세요.</div>'}
          </div>
          <form class="comment-composer" data-comment-form="${escapeHTML(task.id)}">
            ${avatarMarkup(currentUser, 'comment-avatar composer-avatar')}
            <textarea name="comment" rows="1" maxlength="1000" placeholder="진행 상황이나 확인할 내용을 남겨주세요." aria-label="코멘트 입력"></textarea>
            <button type="submit">등록</button>
          </form>
        </section>`;

      const detailRow = `<tr class="subtask-detail-row"><td colspan="6">
        <div class="task-detail-panel">${checklistHtml}${commentsHtml}</div>
      </td></tr>`;
      return mainRow + detailRow;
    }).join('');

    els.taskListContainer.innerHTML = `<div class="table-scroll"><table class="task-table"><thead><tr>
      <th>업무</th><th>담당자</th><th>기간</th><th>상태</th><th>진행률</th><th></th>
    </tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderBoard(filtered) {
    const columns = ['before', 'progress', 'completed', 'hold'];
    els.taskListContainer.innerHTML = `<div class="board">${columns.map(status => {
      const items = filtered.filter(task => actualStatus(task) === status || (status === 'progress' && actualStatus(task) === 'delayed'));
      return `<section class="board-column"><div class="board-title">${STATUS[status].label}<span>${items.length}</span></div>${items.map(task => `
        <article class="task-card" data-open-task="${escapeHTML(task.id)}">
          <div class="task-card-top">${statusBadge(task)}${priorityBadge(task)}</div>
          <h3>${escapeHTML(task.title)}</h3><p>${escapeHTML(task.project)} · ${escapeHTML(task.assignee)}</p>
          ${subtaskStats(task).total ? `<div class="task-card-checklist">✓ ${subtaskStats(task).completed}/${subtaskStats(task).total} 세부 일정 완료</div>` : ''}
          ${commentsForTask(task.id).length ? `<div class="task-card-comments">댓글 ${commentsForTask(task.id).length}</div>` : ''}
          <div class="mini-progress"><i style="width:${task.progress}%"></i></div>
          <div class="task-card-footer"><span>${formatShort(task.start)} ~ ${formatShort(task.end)}</span><strong>${task.progress}%</strong></div>
        </article>`).join('') || '<div class="empty-state">업무 없음</div>'}</section>`;
    }).join('')}</div>`;
  }

  function renderCalendar() {
    const days = Array.from({ length: 7 }, (_, index) => addDays(calendarAnchor, index));
    els.weekRangeLabel.textContent = `${days[0].getFullYear()}.${days[0].getMonth() + 1}.${days[0].getDate()} ~ ${days[6].getMonth() + 1}.${days[6].getDate()}`;
    els.calendarGrid.innerHTML = days.map(day => {
      const dayTasks = tasks.filter(task => day >= dateOnly(task.start) && day <= dateOnly(task.end)).sort((a, b) => dateOnly(a.end) - dateOnly(b.end));
      return `<section class="calendar-day ${isSameDay(day, new Date()) ? 'today' : ''}">
        <div class="calendar-date"><strong>${['일', '월', '화', '수', '목', '금', '토'][day.getDay()]} ${day.getDate()}</strong><span>${dayTasks.length}개</span></div>
        ${dayTasks.map(task => `<article class="calendar-task ${actualStatus(task)}" data-open-task="${escapeHTML(task.id)}"><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.assignee)} · ${task.progress}%</span></article>`).join('')}
      </section>`;
    }).join('');
  }


  function meetingTimeLabel(meeting) {
    if (!meeting.startTime && !meeting.endTime) return '';
    if (meeting.startTime && meeting.endTime) return `${meeting.startTime}–${meeting.endTime}`;
    return meeting.startTime || meeting.endTime;
  }

  function formatMeetingDate(value) {
    const date = dateOnly(value);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${['일','월','화','수','목','금','토'][date.getDay()]})`;
  }

  function meetingSearchResults() {
    const query = els.globalSearch.value.trim().toLowerCase();
    return meetings.filter(meeting => {
      if (!query) return true;
      const actionText = normalizeMeetingActions(meeting.actionItems).map(item => `${item.title} ${item.owner}`).join(' ');
      return [meeting.title, meeting.project, meeting.location, meeting.recorder, meeting.attendees.join(' '), meeting.agenda, meeting.discussion, meeting.decisions, actionText]
        .some(value => String(value || '').toLowerCase().includes(query));
    }).sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
  }

  function renderMeetingList() {
    if (!els.meetingList) return;
    const filtered = meetingSearchResults();
    const thisMonth = meetings.filter(meeting => {
      const date = dateOnly(meeting.date);
      const now = new Date();
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
    const openActions = meetings.flatMap(meeting => normalizeMeetingActions(meeting.actionItems)).filter(item => !item.completed).length;
    els.meetingSummary.innerHTML = `<span><strong>${meetings.length}</strong> 전체</span><span><strong>${thisMonth}</strong> 이번 달</span><span><strong>${openActions}</strong> 미완료 후속 업무</span>`;

    if (!filtered.length) {
      els.meetingList.innerHTML = `<div class="meeting-empty"><div class="meeting-empty-icon">✦</div><strong>등록된 회의록이 없습니다.</strong><span>오른쪽 위 ‘새 회의록’에서 첫 기록을 남겨보세요.</span></div>`;
      return;
    }

    els.meetingList.innerHTML = filtered.map(meeting => {
      const expanded = expandedMeetingIds.has(meeting.id);
      const stats = meetingActionStats(meeting);
      const time = meetingTimeLabel(meeting);
      const attendeePreview = meeting.attendees.slice(0, 5).map(name => avatarMarkup(name, 'meeting-avatar')).join('');
      const moreCount = Math.max(0, meeting.attendees.length - 5);
      const detail = expanded ? `
        <div class="meeting-detail">
          ${meeting.agenda ? `<section><span>안건</span><p>${escapeHTML(meeting.agenda).replace(/\n/g, '<br>')}</p></section>` : ''}
          <section><span>논의 내용</span><p>${escapeHTML(meeting.discussion).replace(/\n/g, '<br>')}</p></section>
          ${meeting.decisions ? `<section class="decision-section"><span>결정 사항</span><p>${escapeHTML(meeting.decisions).replace(/\n/g, '<br>')}</p></section>` : ''}
          <section class="meeting-action-view">
            <div class="meeting-action-view-head"><span>후속 업무</span><strong>${stats.completed}/${stats.total} 완료</strong></div>
            ${stats.total ? normalizeMeetingActions(meeting.actionItems).map(item => `<div class="meeting-action-view-item ${item.completed ? 'completed' : ''}">
              <button type="button" data-meeting-action-toggle="${escapeHTML(meeting.id)}" data-meeting-action-id="${escapeHTML(item.id)}" data-meeting-action-completed="${item.completed}" aria-label="후속 업무 완료 상태 변경"><i></i></button>
              <div><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.owner || '담당자 미정')}${item.dueDate ? ` · ${formatShort(item.dueDate)}` : ''}</span></div>
            </div>`).join('') : '<div class="meeting-action-empty">등록된 후속 업무가 없습니다.</div>'}
          </section>
        </div>` : '';
      return `<article class="meeting-card ${expanded ? 'expanded' : ''}">
        <button type="button" class="meeting-card-main" data-toggle-meeting="${escapeHTML(meeting.id)}" aria-expanded="${expanded}">
          <div class="meeting-date-block"><strong>${String(dateOnly(meeting.date).getDate()).padStart(2, '0')}</strong><span>${dateOnly(meeting.date).getMonth() + 1}월</span></div>
          <div class="meeting-card-copy">
            <div class="meeting-card-title"><h3>${escapeHTML(meeting.title)}</h3>${meeting.project ? `<span>${escapeHTML(meeting.project)}</span>` : ''}</div>
            <p>${formatMeetingDate(meeting.date)}${time ? ` · ${escapeHTML(time)}` : ''}${meeting.location ? ` · ${escapeHTML(meeting.location)}` : ''}</p>
            <div class="meeting-card-bottom"><div class="meeting-attendees">${attendeePreview}${moreCount ? `<b>+${moreCount}</b>` : ''}<span>${meeting.attendees.length}명 참석</span></div>${stats.total ? `<div class="meeting-action-badge">후속 업무 ${stats.completed}/${stats.total}</div>` : ''}</div>
          </div>
          <span class="meeting-expand-icon">${expanded ? '−' : '+'}</span>
        </button>
        <div class="meeting-card-actions"><button type="button" data-edit-meeting="${escapeHTML(meeting.id)}">수정</button></div>
        ${detail}
      </article>`;
    }).join('');
  }

  function renderMeetingAttendeePicker(selected = null) {
    if (!els.meetingAttendeePicker) return;
    const selectedNames = selected || new Set($$('[data-meeting-attendee]:checked', els.meetingAttendeePicker).map(input => input.value));
    const names = memberNames();
    els.meetingAttendeePicker.innerHTML = names.map(name => {
      const checked = selectedNames instanceof Set ? selectedNames.has(name) : Array.isArray(selectedNames) && selectedNames.includes(name);
      return `<label class="attendee-chip ${checked ? 'selected' : ''}"><input type="checkbox" data-meeting-attendee value="${escapeHTML(name)}" ${checked ? 'checked' : ''}>${avatarMarkup(name, 'attendee-avatar')}<span>${escapeHTML(name)}</span></label>`;
    }).join('') || '<div class="meeting-action-empty">Members 시트에 팀원을 먼저 등록하세요.</div>';
  }

  function renderMeetingActionEditor() {
    if (!els.meetingActionList) return;
    if (!editingMeetingActions.length) {
      els.meetingActionList.innerHTML = `<button type="button" class="meeting-action-empty-add" data-add-meeting-action-empty><span>＋</span><div><strong>첫 후속 업무 추가</strong><small>회의에서 정해진 담당 업무와 기한을 기록하세요.</small></div></button>`;
      return;
    }
    const names = memberNames();
    const options = names.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');
    els.meetingActionList.innerHTML = editingMeetingActions.map((item, index) => `<div class="meeting-action-editor-row ${item.completed ? 'completed' : ''}">
      <button type="button" class="meeting-action-check ${item.completed ? 'checked' : ''}" data-meeting-action-check="${index}" aria-label="완료 상태 변경"><i></i></button>
      <input data-meeting-action-field="title" data-meeting-action-index="${index}" maxlength="160" value="${escapeHTML(item.title)}" placeholder="후속 업무 입력">
      <select data-meeting-action-field="owner" data-meeting-action-index="${index}" aria-label="담당자"><option value="">담당자</option>${options}</select>
      <input data-meeting-action-field="dueDate" data-meeting-action-index="${index}" type="date" value="${escapeHTML(item.dueDate)}" aria-label="마감일">
      <button type="button" class="remove-subtask-button" data-remove-meeting-action="${index}" aria-label="후속 업무 삭제">×</button>
    </div>`).join('');
    editingMeetingActions.forEach((item, index) => {
      const select = els.meetingActionList.querySelector(`select[data-meeting-action-index="${index}"]`);
      if (select) select.value = item.owner || '';
    });
  }

  function openMeetingModal(meeting = null) {
    els.meetingForm.reset();
    els.meetingId.value = meeting?.id || '';
    els.meetingTitle.value = meeting?.title || '';
    els.meetingDate.value = meeting?.date || iso(new Date());
    els.meetingStartTime.value = meeting?.startTime || '';
    els.meetingEndTime.value = meeting?.endTime || '';
    els.meetingLocation.value = meeting?.location || '';
    els.meetingProject.value = meeting?.project || '';
    els.meetingRecorder.value = meeting?.recorder || currentUser || memberNames()[0] || '';
    els.meetingAgenda.value = meeting?.agenda || '';
    els.meetingDiscussion.value = meeting?.discussion || '';
    els.meetingDecisions.value = meeting?.decisions || '';
    renderMeetingAttendeePicker(meeting?.attendees || (currentUser ? [currentUser] : []));
    editingMeetingActions = normalizeMeetingActions(meeting?.actionItems || []).map(item => ({ ...item }));
    renderMeetingActionEditor();
    els.meetingModalTitle.textContent = meeting ? '회의록 수정' : '새 회의록';
    els.deleteMeetingBtn.classList.toggle('hidden', !meeting);
    els.meetingModal.classList.add('open');
    els.meetingModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => els.meetingTitle.focus(), 80);
  }

  function closeMeetingModal() {
    els.meetingModal.classList.remove('open');
    els.meetingModal.setAttribute('aria-hidden', 'true');
  }

  async function submitMeeting(event) {
    event.preventDefault();
    const attendees = $$('[data-meeting-attendee]:checked', els.meetingAttendeePicker).map(input => input.value);
    if (!attendees.length) return showToast('참석자를 한 명 이상 선택하세요.');
    if (els.meetingStartTime.value && els.meetingEndTime.value && els.meetingStartTime.value > els.meetingEndTime.value) return showToast('종료 시간은 시작 시간보다 빠를 수 없습니다.');
    const invalidAction = editingMeetingActions.find(item => !item.title.trim() || !item.owner || !/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate));
    if (invalidAction) return showToast('후속 업무의 내용, 담당자, 마감일을 모두 입력하세요.');
    const payload = {
      id: els.meetingId.value || `M${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      title: els.meetingTitle.value.trim(), date: els.meetingDate.value,
      startTime: els.meetingStartTime.value, endTime: els.meetingEndTime.value,
      location: els.meetingLocation.value.trim(), project: els.meetingProject.value.trim(),
      attendees, recorder: els.meetingRecorder.value,
      agenda: els.meetingAgenda.value.trim(), discussion: els.meetingDiscussion.value.trim(), decisions: els.meetingDecisions.value.trim(),
      actionItems: editingMeetingActions.map(item => ({ ...item, title: item.title.trim() }))
    };
    const isEditing = Boolean(els.meetingId.value);
    els.saveMeetingBtn.disabled = true;
    els.deleteMeetingBtn.disabled = true;
    try {
      await mutateAndRefresh('saveMeeting', payload, isEditing ? '회의록을 수정했습니다.' : '새 회의록을 저장했습니다.');
      closeMeetingModal();
      switchView('meetings');
    } catch (error) {
      console.error(error);
      setConnectionState('error', '회의록 저장 확인 필요', error.message);
      showToast(error.message);
    } finally {
      els.saveMeetingBtn.disabled = false;
      els.deleteMeetingBtn.disabled = false;
    }
  }

  async function deleteMeeting() {
    const id = els.meetingId.value;
    if (!id || !confirm('이 회의록을 삭제할까요?')) return;
    els.saveMeetingBtn.disabled = true;
    els.deleteMeetingBtn.disabled = true;
    try {
      await mutateAndRefresh('deleteMeeting', { id }, '회의록을 삭제했습니다.');
      expandedMeetingIds.delete(id);
      closeMeetingModal();
    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      els.saveMeetingBtn.disabled = false;
      els.deleteMeetingBtn.disabled = false;
    }
  }

  async function toggleMeetingAction(meetingId, actionId, completed) {
    const meeting = meetings.find(item => item.id === meetingId);
    if (!meeting) return;
    const action = meeting.actionItems.find(item => item.id === actionId);
    if (!action) return;
    const previous = normalizeMeeting(meeting);
    action.completed = completed;
    renderMeetingList();
    try {
      await mutateAndRefresh('saveMeeting', normalizeMeeting(meeting), '후속 업무 상태를 변경했습니다.');
      expandedMeetingIds.add(meetingId);
      renderMeetingList();
    } catch (error) {
      Object.assign(meeting, previous);
      renderMeetingList();
      showToast(error.message);
    }
  }

  function switchView(view) {
    activeView = view;
    activeMineOnly = view === 'mine';
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    $$('.view').forEach(viewElement => viewElement.classList.remove('active'));
    if (view === 'dashboard') {
      $('#dashboardView').classList.add('active');
      els.pageTitle.textContent = '업무 대시보드';
    } else if (view === 'calendar') {
      $('#calendarView').classList.add('active');
      els.pageTitle.textContent = '주간 일정';
    } else if (view === 'meetings') {
      $('#meetingView').classList.add('active');
      els.pageTitle.textContent = '회의록';
    } else {
      $('#taskListView').classList.add('active');
      els.pageTitle.textContent = activeMineOnly ? '내 업무' : '전체 업무';
    }
    const meetingMode = view === 'meetings';
    els.taskFilterRow.classList.toggle('hidden', meetingMode);
    els.openTaskModalBtn.textContent = meetingMode ? '＋ 새 회의록' : '＋ 새 업무';
    els.globalSearch.placeholder = meetingMode ? '회의 제목, 참석자 검색' : '업무명, 담당자 검색';
    els.sidebar.classList.remove('open');
    renderAll();
  }

  function openTaskModal(task = null) {
    els.taskForm.reset();
    els.taskId.value = task?.id || '';
    els.taskTitle.value = task?.title || '';
    els.taskProject.value = task?.project || '';
    els.taskAssignee.value = task?.assignee || currentUser;
    els.taskStart.value = task?.start || iso(new Date());
    els.taskEnd.value = task?.end || iso(addDays(new Date(), 1));
    els.taskStatus.value = task?.status || 'before';
    els.taskPriority.value = task?.priority || 'normal';
    els.taskProgress.value = task?.progress ?? 0;
    els.progressValue.textContent = `${els.taskProgress.value}%`;
    els.taskDescription.value = task?.description || '';
    els.taskLink.value = task?.link || '';
    editingSubtasks = normalizeSubtasks(task?.subtasks || []).map(item => ({ ...item }));
    renderSubtaskEditor();
    els.taskModalTitle.textContent = task ? '업무 수정' : '새 업무 등록';
    els.deleteTaskBtn.classList.toggle('hidden', !task);
    els.taskModal.classList.add('open');
    els.taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => els.taskTitle.focus(), 80);
  }

  function closeTaskModal() {
    els.taskModal.classList.remove('open');
    els.taskModal.setAttribute('aria-hidden', 'true');
  }

  async function submitTask(event) {
    event.preventDefault();
    if (!apiConfigured()) return showToast('먼저 config.js에 Apps Script 웹 앱 URL을 입력하세요.');
    if (dateOnly(els.taskStart.value) > dateOnly(els.taskEnd.value)) return showToast('종료일은 시작일보다 빠를 수 없습니다.');

    const invalidSubtask = editingSubtasks.find(item => !item.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate));
    if (invalidSubtask) return showToast('세부 일정의 이름과 마감일을 모두 입력하세요.');
    const outOfRangeSubtask = editingSubtasks.find(item => item.dueDate < els.taskStart.value || item.dueDate > els.taskEnd.value);
    if (outOfRangeSubtask) return showToast('세부 일정 마감일은 전체 업무 기간 안으로 설정하세요.');

    const isEditing = Boolean(els.taskId.value);
    const payload = {
      id: els.taskId.value || `T${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      title: els.taskTitle.value.trim(),
      project: els.taskProject.value.trim(),
      assignee: els.taskAssignee.value,
      start: els.taskStart.value,
      end: els.taskEnd.value,
      status: els.taskStatus.value,
      priority: els.taskPriority.value,
      progress: Number(els.taskProgress.value),
      description: els.taskDescription.value.trim(),
      link: els.taskLink.value.trim(),
      subtasks: editingSubtasks.map(item => ({ ...item, title: item.title.trim() }))
    };
    if (payload.status === 'completed') payload.progress = 100;

    els.saveTaskBtn.disabled = true;
    els.deleteTaskBtn.disabled = true;
    try {
      await mutateAndRefresh('saveTask', payload, isEditing ? '업무를 수정했습니다.' : '새 업무를 등록했습니다.');
      closeTaskModal();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '저장 확인 필요', error.message);
      showToast(error.message);
    } finally {
      els.saveTaskBtn.disabled = false;
      els.deleteTaskBtn.disabled = false;
    }
  }

  async function toggleSubtaskCompletion(taskId, index, completed) {
    const task = tasks.find(item => item.id === taskId);
    if (!task || !task.subtasks[index]) return;
    const previous = normalizeTask(task);
    task.subtasks[index].completed = completed;
    const progress = checklistProgress(task.subtasks);
    if (progress !== null) task.progress = progress;
    if (progress === 100) task.status = 'completed';
    else if (task.status === 'completed') task.status = progress > 0 ? 'progress' : 'before';
    renderAll();
    try {
      await mutateAndRefresh('saveTask', task, '세부 일정을 업데이트했습니다.');
    } catch (error) {
      const taskIndex = tasks.findIndex(item => item.id === taskId);
      if (taskIndex >= 0) tasks[taskIndex] = previous;
      renderAll();
      setConnectionState('error', '저장 확인 필요', error.message);
      showToast(error.message);
    }
  }

  async function saveMemberProfile(avatarHex) {
    if (!currentUser) return showToast('왼쪽 아래에서 내 이름을 먼저 선택하세요.');
    const payload = { name: currentUser, avatarColor: normalizeColor(avatarHex, currentUser) };
    try {
      await mutateAndRefresh('saveMemberProfile', payload, '아이콘 색상을 변경했습니다.');
      renderAvatarPicker();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '프로필 저장 확인 필요', error.message);
      showToast(error.message);
    }
  }

  async function addComment(taskId, content, submitButton) {
    const trimmed = String(content || '').trim();
    if (!currentUser) return showToast('왼쪽 아래에서 내 이름을 먼저 선택하세요.');
    if (!trimmed) return showToast('코멘트 내용을 입력하세요.');
    const payload = {
      id: `C${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      taskId,
      author: currentUser,
      content: trimmed,
      createdAt: new Date().toISOString()
    };
    if (submitButton) submitButton.disabled = true;
    try {
      await mutateAndRefresh('addComment', payload, '코멘트를 등록했습니다.');
      expandedTaskIds.add(taskId);
      renderTaskList();
      return true;
    } catch (error) {
      console.error(error);
      setConnectionState('error', '댓글 저장 확인 필요', error.message);
      showToast(error.message);
      return false;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  async function deleteComment(commentId) {
    const comment = comments.find(item => item.id === commentId);
    if (!comment || comment.author !== currentUser) return;
    if (!confirm('이 코멘트를 삭제할까요?')) return;
    try {
      await mutateAndRefresh('deleteComment', { id: comment.id, author: currentUser }, '코멘트를 삭제했습니다.');
      expandedTaskIds.add(comment.taskId);
      renderTaskList();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '댓글 삭제 확인 필요', error.message);
      showToast(error.message);
    }
  }

  async function deleteTask() {
    const id = els.taskId.value;
    if (!id || !confirm('이 업무를 삭제할까요?')) return;
    els.saveTaskBtn.disabled = true;
    els.deleteTaskBtn.disabled = true;
    try {
      await mutateAndRefresh('deleteTask', { id }, '업무를 삭제했습니다.');
      closeTaskModal();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '삭제 확인 필요', error.message);
      showToast(error.message);
    } finally {
      els.saveTaskBtn.disabled = false;
      els.deleteTaskBtn.disabled = false;
    }
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  function bindEvents() {
    $$('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
    $('#mobileMenuBtn').addEventListener('click', () => els.sidebar.classList.toggle('open'));
    els.openTaskModalBtn.addEventListener('click', () => activeView === 'meetings' ? openMeetingModal() : openTaskModal());
    $('#closeTaskModalBtn').addEventListener('click', closeTaskModal);
    $('#cancelTaskBtn').addEventListener('click', closeTaskModal);
    els.taskModal.addEventListener('click', event => { if (event.target === els.taskModal) closeTaskModal(); });
    $('#closeMeetingModalBtn').addEventListener('click', closeMeetingModal);
    $('#cancelMeetingBtn').addEventListener('click', closeMeetingModal);
    els.meetingModal.addEventListener('click', event => { if (event.target === els.meetingModal) closeMeetingModal(); });
    els.meetingForm.addEventListener('submit', submitMeeting);
    els.deleteMeetingBtn.addEventListener('click', deleteMeeting);
    els.taskForm.addEventListener('submit', submitTask);
    els.deleteTaskBtn.addEventListener('click', deleteTask);
    els.taskProgress.addEventListener('input', () => { els.progressValue.textContent = `${els.taskProgress.value}%`; });
    els.addSubtaskBtn.addEventListener('click', () => {
      editingSubtasks.push(newSubtask());
      renderSubtaskEditor();
      const lastInput = els.subtaskEditorList.querySelector('.subtask-editor-row:last-child .subtask-title-input');
      if (lastInput) lastInput.focus();
    });
    const updateEditingSubtask = event => {
      const index = Number(event.target.dataset.subtaskIndex);
      const field = event.target.dataset.subtaskField;
      if (!Number.isInteger(index) || !editingSubtasks[index] || !field) return;
      editingSubtasks[index][field] = event.target.value;
      syncProgressFromEditingSubtasks();
    };
    els.subtaskEditorList.addEventListener('input', updateEditingSubtask);
    els.subtaskEditorList.addEventListener('change', updateEditingSubtask);
    els.subtaskEditorList.addEventListener('click', event => {
      const toggleButton = event.target.closest('[data-subtask-toggle]');
      if (toggleButton) {
        event.preventDefault();
        event.stopPropagation();
        const index = Number(toggleButton.dataset.subtaskToggle);
        if (Number.isInteger(index) && editingSubtasks[index]) {
          editingSubtasks[index].completed = !editingSubtasks[index].completed;
          renderSubtaskEditor();
        }
        return;
      }
      if (event.target.closest('[data-add-subtask-empty]')) {
        editingSubtasks.push(newSubtask());
        renderSubtaskEditor();
        els.subtaskEditorList.querySelector('.subtask-title-input')?.focus();
        return;
      }
      const button = event.target.closest('[data-remove-subtask]');
      if (!button) return;
      editingSubtasks.splice(Number(button.dataset.removeSubtask), 1);
      renderSubtaskEditor();
    });
    els.addMeetingActionBtn.addEventListener('click', () => {
      editingMeetingActions.push(newMeetingAction());
      renderMeetingActionEditor();
      els.meetingActionList.querySelector('.meeting-action-editor-row:last-child input[data-meeting-action-field="title"]')?.focus();
    });
    const updateMeetingAction = event => {
      const index = Number(event.target.dataset.meetingActionIndex);
      const field = event.target.dataset.meetingActionField;
      if (!Number.isInteger(index) || !editingMeetingActions[index] || !field) return;
      editingMeetingActions[index][field] = event.target.value;
    };
    els.meetingActionList.addEventListener('input', updateMeetingAction);
    els.meetingActionList.addEventListener('change', updateMeetingAction);
    els.meetingActionList.addEventListener('click', event => {
      const check = event.target.closest('[data-meeting-action-check]');
      if (check) {
        const index = Number(check.dataset.meetingActionCheck);
        if (editingMeetingActions[index]) editingMeetingActions[index].completed = !editingMeetingActions[index].completed;
        renderMeetingActionEditor();
        return;
      }
      if (event.target.closest('[data-add-meeting-action-empty]')) {
        editingMeetingActions.push(newMeetingAction());
        renderMeetingActionEditor();
        els.meetingActionList.querySelector('input[data-meeting-action-field="title"]')?.focus();
        return;
      }
      const remove = event.target.closest('[data-remove-meeting-action]');
      if (remove) {
        editingMeetingActions.splice(Number(remove.dataset.removeMeetingAction), 1);
        renderMeetingActionEditor();
      }
    });
    els.meetingAttendeePicker.addEventListener('change', event => {
      const chip = event.target.closest('.attendee-chip');
      if (chip) chip.classList.toggle('selected', event.target.checked);
    });
    els.taskStatus.addEventListener('change', () => {
      if (els.taskStatus.value === 'completed') {
        els.taskProgress.value = 100;
        els.progressValue.textContent = '100%';
      }
    });
    [els.assigneeFilter, els.statusFilter].forEach(element => element.addEventListener('change', renderAll));
    els.globalSearch.addEventListener('input', renderAll);
    $$('#periodSegment button').forEach(button => button.addEventListener('click', () => {
      period = button.dataset.period;
      $$('#periodSegment button').forEach(item => item.classList.toggle('active', item === button));
      renderAll();
    }));
    $$('.view-switcher button').forEach(button => button.addEventListener('click', () => {
      taskLayout = button.dataset.taskLayout;
      $$('.view-switcher button').forEach(item => item.classList.toggle('active', item === button));
      renderTaskList();
    }));
    els.taskListContainer.addEventListener('submit', event => {
      const form = event.target.closest('[data-comment-form]');
      if (!form) return;
      event.preventDefault();
      event.stopPropagation();
      const textarea = form.querySelector('textarea[name="comment"]');
      const button = form.querySelector('button[type="submit"]');
      const content = textarea?.value || '';
      if (!content.trim()) return showToast('코멘트 내용을 입력하세요.');
      addComment(form.dataset.commentForm, content, button).then(saved => {
        if (saved && textarea) textarea.value = '';
      });
    });
    els.taskListContainer.addEventListener('keydown', event => {
      const textarea = event.target.closest('.comment-composer textarea');
      if (!textarea || event.key !== 'Enter' || event.shiftKey) return;
      event.preventDefault();
      textarea.closest('form')?.requestSubmit();
    });
    document.addEventListener('click', event => {
      const avatarSwatch = event.target.closest('[data-avatar-color]');
      if (avatarSwatch) {
        event.preventDefault();
        event.stopPropagation();
        saveMemberProfile(avatarSwatch.dataset.avatarColor);
        els.avatarPicker?.classList.remove('open');
        return;
      }
      if (els.avatarPicker && !event.target.closest('#avatarPicker') && !event.target.closest('#profileAvatar') && !event.target.closest('#openAvatarPickerBtn')) {
        els.avatarPicker.classList.remove('open');
      }
      const deleteCommentButton = event.target.closest('[data-delete-comment]');
      if (deleteCommentButton) {
        event.preventDefault();
        event.stopPropagation();
        deleteComment(deleteCommentButton.dataset.deleteComment);
        return;
      }
      const toggle = event.target.closest('[data-toggle-subtasks]');
      if (toggle) {
        event.preventDefault();
        event.stopPropagation();
        const id = toggle.dataset.toggleSubtasks;
        if (expandedTaskIds.has(id)) expandedTaskIds.delete(id); else expandedTaskIds.add(id);
        renderTaskList();
        return;
      }
      const checklist = event.target.closest('[data-subtask-check]');
      if (checklist) {
        event.preventDefault();
        event.stopPropagation();
        const completed = checklist.dataset.subtaskCompleted === 'true';
        toggleSubtaskCompletion(checklist.dataset.subtaskCheck, Number(checklist.dataset.subtaskIndex), !completed);
        return;
      }
      const meetingActionToggle = event.target.closest('[data-meeting-action-toggle]');
      if (meetingActionToggle) {
        event.preventDefault();
        event.stopPropagation();
        toggleMeetingAction(meetingActionToggle.dataset.meetingActionToggle, meetingActionToggle.dataset.meetingActionId, meetingActionToggle.dataset.meetingActionCompleted !== 'true');
        return;
      }
      const editMeetingButton = event.target.closest('[data-edit-meeting]');
      if (editMeetingButton) {
        event.preventDefault();
        event.stopPropagation();
        const meeting = meetings.find(item => item.id === editMeetingButton.dataset.editMeeting);
        if (meeting) openMeetingModal(meeting);
        return;
      }
      const meetingToggle = event.target.closest('[data-toggle-meeting]');
      if (meetingToggle) {
        event.preventDefault();
        const id = meetingToggle.dataset.toggleMeeting;
        if (expandedMeetingIds.has(id)) expandedMeetingIds.delete(id); else expandedMeetingIds.add(id);
        renderMeetingList();
        return;
      }
      const taskTarget = event.target.closest('[data-open-task]');
      if (taskTarget) {
        const task = tasks.find(item => item.id === taskTarget.dataset.openTask);
        if (task) openTaskModal(task);
      }
      const jump = event.target.closest('[data-jump]');
      if (jump) switchView(jump.dataset.jump);
      const summary = event.target.closest('[data-summary-filter]');
      if (summary) {
        const key = summary.dataset.summaryFilter;
        if (key === 'due') {
          els.statusFilter.value = 'all';
          period = 'week';
        } else if (key !== 'total') {
          els.statusFilter.value = key;
        } else {
          els.statusFilter.value = 'all';
        }
        switchView('tasks');
      }
    });
    $('#prevWeekBtn').addEventListener('click', () => { calendarAnchor = addDays(calendarAnchor, -7); renderCalendar(); });
    $('#nextWeekBtn').addEventListener('click', () => { calendarAnchor = addDays(calendarAnchor, 7); renderCalendar(); });
    $('#todayWeekBtn').addEventListener('click', () => { calendarAnchor = startOfWeek(new Date()); renderCalendar(); });
    els.refreshDataBtn.addEventListener('click', () => loadRemoteData());
    els.currentUserSelect.addEventListener('change', () => {
      currentUser = els.currentUserSelect.value;
      localStorage.setItem(USER_KEY, currentUser);
      renderAll();
    });
    els.profileAvatar?.addEventListener('click', () => els.avatarPicker?.classList.toggle('open'));
    els.openAvatarPickerBtn?.addEventListener('click', () => els.avatarPicker?.classList.toggle('open'));
    els.changeAccessKeyBtn.addEventListener('click', () => {
      const current = localStorage.getItem(TOKEN_KEY) || '';
      const next = window.prompt('새 팀 접속키를 입력하세요.', current) || '';
      if (!next.trim()) return;
      localStorage.setItem(TOKEN_KEY, next.trim());
      loadRemoteData();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeTaskModal(); closeMeetingModal(); } });
  }

  async function init() {
    const now = new Date();
    els.todayLabel.textContent = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][now.getDay()]}`;
    readCache();
    ensureCurrentUser();
    bindEvents();
    renderAll();
    await loadRemoteData();
  }

  init();
})();
