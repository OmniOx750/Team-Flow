(() => {
  'use strict';

  const CONFIG = window.TEAM_FLOW_CONFIG || {};
  const CACHE_KEY = 'teamFlowRemoteCacheV6';
  const USER_KEY = 'teamFlowCurrentUserV2';
  const TOKEN_KEY = 'teamFlowAccessTokenV2';
  const ACTIVE_TEAM_KEY = 'teamFlowActiveTeamV2';
  const STATUS = {
    before: { label: '진행 전', color: '#89909d' },
    progress: { label: '진행 중', color: '#2f6bff' },
    completed: { label: '완료', color: '#23a36d' },
    hold: { label: '보류', color: '#e58a18' },
    delayed: { label: '지연', color: '#e14a55' }
  };
  const PRIORITY = { low: '낮음', normal: '보통', high: '높음', urgent: '긴급' };
  const REQUIRED_API_VERSION = '2.2.0';
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
    weeklyMeetingTabs: $('#weeklyMeetingTabs'),
    weeklyMeetingTaskList: $('#weeklyMeetingTaskList'),
    weeklyMeetingScopeLabel: $('#weeklyMeetingScopeLabel'),
    weeklyMeetingScopeCount: $('#weeklyMeetingScopeCount'),
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
    taskNeedsDecision: $('#taskNeedsDecision'),
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
    periodSegment: $('#periodSegment'),
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
    saveMeetingBtn: $('#saveMeetingBtn'),
    projectCategoryModal: $('#projectCategoryModal'),
    projectCategoryForm: $('#projectCategoryForm'),
    projectCategoryName: $('#projectCategoryName'),
    projectCategoryList: $('#projectCategoryList'),
    addProjectCategoryBtn: $('#addProjectCategoryBtn'),
    closeProjectCategoryModalBtn: $('#closeProjectCategoryModalBtn'),
    doneProjectCategoryBtn: $('#doneProjectCategoryBtn'),
    adminNavItem: $('#adminNavItem'),
    currentTeamName: $('#currentTeamName'),
    adminTeamSelect: $('#adminTeamSelect'),
    teamAdminForm: $('#teamAdminForm'),
    adminTeamId: $('#adminTeamId'),
    adminTeamName: $('#adminTeamName'),
    saveTeamAdminBtn: $('#saveTeamAdminBtn'),
    cancelTeamEditBtn: $('#cancelTeamEditBtn'),
    adminTeamList: $('#adminTeamList'),
    adminTeamCount: $('#adminTeamCount'),
    credentialReveal: $('#credentialReveal'),
    credentialRevealCode: $('#credentialRevealCode'),
    copyCredentialBtn: $('#copyCredentialBtn'),
    memberAdminForm: $('#memberAdminForm'),
    adminMemberId: $('#adminMemberId'),
    adminMemberName: $('#adminMemberName'),
    adminMemberPosition: $('#adminMemberPosition'),
    adminMemberTeamLabel: $('#adminMemberTeamLabel'),
    adminMemberSortOrder: $('#adminMemberSortOrder'),
    adminMemberColor: $('#adminMemberColor'),
    adminMemberActive: $('#adminMemberActive'),
    saveMemberAdminBtn: $('#saveMemberAdminBtn'),
    cancelMemberEditBtn: $('#cancelMemberEditBtn'),
    adminMemberList: $('#adminMemberList'),
    adminMemberCount: $('#adminMemberCount'),
    adminMemberTeamName: $('#adminMemberTeamName'),
    teamShortcutSection: $('#teamShortcutSection'),
    teamShortcutTitle: $('#teamShortcutTitle'),
    teamShortcutList: $('#teamShortcutList'),
    openTeamShortcutModalBtn: $('#openTeamShortcutModalBtn'),
    teamShortcutModal: $('#teamShortcutModal'),
    teamShortcutModalTeamName: $('#teamShortcutModalTeamName'),
    closeTeamShortcutModalBtn: $('#closeTeamShortcutModalBtn'),
    doneTeamShortcutBtn: $('#doneTeamShortcutBtn'),
    teamShortcutForm: $('#teamShortcutForm'),
    teamShortcutId: $('#teamShortcutId'),
    teamShortcutName: $('#teamShortcutName'),
    teamShortcutUrl: $('#teamShortcutUrl'),
    teamShortcutIcon: $('#teamShortcutIcon'),
    teamShortcutSortOrder: $('#teamShortcutSortOrder'),
    teamShortcutActive: $('#teamShortcutActive'),
    teamShortcutNewTab: $('#teamShortcutNewTab'),
    saveTeamShortcutBtn: $('#saveTeamShortcutBtn'),
    cancelTeamShortcutEditBtn: $('#cancelTeamShortcutEditBtn'),
    teamShortcutManagerList: $('#teamShortcutManagerList')
  };

  let tasks = [];
  let comments = [];
  let meetings = [];
  let teamMembers = [];
  let projectCategories = [];
  let teamShortcuts = [];
  let companyTeams = [];
  let adminMembers = [];
  let authState = { role: 'team', isAdmin: false, teamId: '', teamName: '' };
  let activeTeamId = localStorage.getItem(ACTIVE_TEAM_KEY) || '';
  let currentUser = localStorage.getItem(USER_KEY) || '';
  let meetingVisibleCount = 30;
  let weeklyMeetingScope = 'ongoing';
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
      makeTask('ERS 부스 그래픽 최종 전달', '전시회/학회', '김마케팅', addDays(monday, -1), addDays(monday, 1), 'progress', 'urgent', 70, 'Google Sheets 연결 전 화면 확인용 샘플 업무입니다.'),
      makeTask('OmniOx750U 영상 스토리보드 검토', '영상/콘텐츠', '이콘텐츠', monday, addDays(monday, 3), 'progress', 'high', 45, ''),
      makeTask('MV50 카탈로그 사양표 업데이트', 'Material', '김마케팅', addDays(monday, 2), addDays(monday, 4), 'before', 'high', 15, ''),
      makeTask('웹사이트 Bi-Flow 페이지 수정', '웹사이트', '박디자인', addDays(monday, 1), addDays(monday, 5), 'before', 'normal', 10, '')
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
      subtasks: normalizeSubtasks(task.subtasks),
      teamId: String(task.teamId || ''),
      needsDecision: task.needsDecision === true || String(task.needsDecision).toLowerCase() === 'true',
      completedAt: String(task.completedAt || '')
    };
  }

  function normalizeComment(comment = {}) {
    return {
      id: String(comment.id || ''),
      taskId: String(comment.taskId || ''),
      author: String(comment.author || ''),
      content: String(comment.content || '').slice(0, 1000),
      createdAt: String(comment.createdAt || ''),
      teamId: String(comment.teamId || '')
    };
  }

  function normalizeProjectCategory(category = {}) {
    return {
      id: String(category.id || ''),
      name: String(category.name || '').trim().slice(0, 50),
      active: category.active === true || String(category.active).toLowerCase() === 'true',
      sortOrder: Number(category.sortOrder) || 999,
      createdAt: String(category.createdAt || ''),
      updatedAt: String(category.updatedAt || ''),
      teamId: String(category.teamId || '')
    };
  }


  function normalizeTeamShortcut(shortcut = {}) {
    return {
      id: String(shortcut.id || ''),
      name: String(shortcut.name || '').trim().slice(0, 50),
      url: String(shortcut.url || '').trim().slice(0, 500),
      icon: String(shortcut.icon || '🔗').trim().slice(0, 8) || '🔗',
      active: shortcut.active === true || String(shortcut.active).toLowerCase() === 'true',
      sortOrder: Number(shortcut.sortOrder) || 999,
      openNewTab: shortcut.openNewTab !== false && String(shortcut.openNewTab).toLowerCase() !== 'false',
      createdAt: String(shortcut.createdAt || ''),
      updatedAt: String(shortcut.updatedAt || ''),
      teamId: String(shortcut.teamId || '')
    };
  }

  function safeShortcutUrl(value) {
    try {
      const url = new URL(String(value || '').trim());
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
      return '';
    }
  }


  function normalizeMember(member = {}) {
    return {
      id: String(member.id || ''),
      name: String(member.name || '').trim(),
      position: String(member.position || '').trim(),
      team: String(member.team || '').trim(),
      active: member.active !== false && String(member.active).toLowerCase() !== 'false',
      sortOrder: Number(member.sortOrder) || 999,
      avatarColor: normalizeColor(member.avatarColor, member.name),
      teamId: String(member.teamId || ''),
      createdAt: String(member.createdAt || ''),
      updatedAt: String(member.updatedAt || '')
    };
  }

  function normalizeTeam(team = {}) {
    return {
      teamId: String(team.teamId || ''),
      teamName: String(team.teamName || '').trim(),
      active: team.active !== false && String(team.active).toLowerCase() !== 'false',
      sortOrder: Number(team.sortOrder) || 999,
      codeVersion: String(team.codeVersion || ''),
      createdAt: String(team.createdAt || ''),
      updatedAt: String(team.updatedAt || '')
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
      updatedAt: String(meeting.updatedAt || ''),
      teamId: String(meeting.teamId || '')
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
    // v2부터 팀 간 데이터 노출을 막기 위해 업무/회의록 본문을 브라우저에 캐시하지 않습니다.
    localStorage.removeItem(CACHE_KEY);
    tasks = [];
    comments = [];
    meetings = [];
    teamMembers = [];
    adminMembers = [];
    projectCategories = [];
    teamShortcuts = [];
    companyTeams = [];
    return false;
  }

  function writeCache() {
    // 멀티팀 보안상 민감한 팀 데이터는 localStorage에 저장하지 않습니다.
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
  function decisionBadge(task) { return task.needsDecision ? '<span class="badge decision">결정 필요</span>' : ''; }

  function startOfNextWeek(reference = new Date()) { return addDays(startOfWeek(reference), 7); }
  function endOfNextWeek(reference = new Date()) { return addDays(startOfWeek(reference), 13); }
  function completedAtDate(task) {
    const value = task.completedAt || task.updatedAt || '';
    return value ? dateOnly(value) : null;
  }
  function deadlineBadge(task) {
    if (task.status === 'completed') return '<span class="deadline-badge completed">완료</span>';
    const today = dateOnly(iso(new Date()));
    const end = dateOnly(task.end);
    const diff = Math.round((end - today) / 86400000);
    if (diff === 0) return '<span class="deadline-badge today">D-Day</span>';
    if (diff > 0) return `<span class="deadline-badge upcoming">D-${diff}</span>`;
    return `<span class="deadline-badge overdue">D+${Math.abs(diff)}</span>`;
  }
  function isNewThisWeek(task) {
    if (!task.createdAt) return false;
    const created = dateOnly(task.createdAt);
    return created >= startOfWeek(new Date()) && created <= endOfWeek(new Date());
  }
  function weeklyMeetingBuckets(source = tasks) {
    const today = dateOnly(iso(new Date()));
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const nextStart = startOfNextWeek(today);
    const nextEnd = endOfNextWeek(today);
    const open = source.filter(task => task.status !== 'completed');
    return {
      ongoing: open.filter(task => task.status === 'progress'),
      due: open.filter(task => between(task.end, weekStart, weekEnd)),
      next: open.filter(task => overlaps(task, nextStart, nextEnd)),
      delayed: open.filter(task => actualStatus(task) === 'delayed'),
      completed: source.filter(task => task.status === 'completed' && (() => {
        const completed = completedAtDate(task);
        return completed && completed >= weekStart && completed <= weekEnd;
      })()),
      decision: open.filter(task => task.needsDecision)
    };
  }
  const WEEKLY_MEETING_META = {
    ongoing: { label: '진행중', note: '현재 실행 중인 모든 업무' },
    due: { label: '이번주 마감', note: '이번 주 종료 예정 업무' },
    next: { label: '차주 일정', note: '다음 주에 진행되는 업무' },
    delayed: { label: '지연', note: '마감일이 지난 미완료 업무' },
    completed: { label: '이번주 완료', note: '이번 주에 완료 처리된 업무' },
    decision: { label: '결정 필요', note: '회의에서 확인·결정이 필요한 업무' }
  };
  function sortWeeklyMeetingTasks(items, scope) {
    return [...items].sort((a, b) => {
      if (scope === 'completed') return String(b.completedAt || b.updatedAt).localeCompare(String(a.completedAt || a.updatedAt));
      const urgent = (b.priority === 'urgent') - (a.priority === 'urgent');
      const decision = Number(Boolean(b.needsDecision)) - Number(Boolean(a.needsDecision));
      return decision || urgent || dateOnly(a.end) - dateOnly(b.end) || a.title.localeCompare(b.title, 'ko');
    });
  }
  function renderWeeklyMeetingBoard(source = tasks) {
    if (!els.weeklyMeetingTaskList || !els.weeklyMeetingTabs) return;
    const buckets = weeklyMeetingBuckets(source);
    const meta = WEEKLY_MEETING_META[weeklyMeetingScope] || WEEKLY_MEETING_META.ongoing;
    const items = sortWeeklyMeetingTasks(buckets[weeklyMeetingScope] || [], weeklyMeetingScope);

    els.weeklyMeetingTabs.innerHTML = Object.entries(WEEKLY_MEETING_META).map(([key, item]) => `
      <button type="button" class="meeting-scope-tab ${weeklyMeetingScope === key ? 'active' : ''}" data-weekly-scope="${key}">
        <span>${item.label}</span><b>${(buckets[key] || []).length}</b>
      </button>`).join('');
    if (els.weeklyMeetingScopeLabel) els.weeklyMeetingScopeLabel.textContent = meta.note;
    if (els.weeklyMeetingScopeCount) els.weeklyMeetingScopeCount.textContent = `${items.length}건`;

    els.weeklyMeetingTaskList.innerHTML = items.length ? items.map(task => {
      const next = nextSubtask(task);
      const badges = [
        statusBadge(task),
        priorityBadge(task),
        task.needsDecision ? '<span class="badge decision">결정 필요</span>' : '',
        isNewThisWeek(task) ? '<span class="badge new">신규</span>' : ''
      ].filter(Boolean).join('');
      return `
        <button type="button" class="meeting-task-row ${task.needsDecision ? 'needs-decision' : ''}" data-open-task="${escapeHTML(task.id)}">
          <div class="meeting-task-main">
            <div class="meeting-task-title-line">
              <strong>${escapeHTML(task.title)}</strong>
              ${deadlineBadge(task)}
            </div>
            <div class="meeting-task-detail-row">
              <span class="meeting-assignee-chip" data-member-filter="${escapeHTML(task.assignee || '')}" role="button" tabindex="0"${avatarStyle(task.assignee || '담당자 미정')} aria-label="${escapeHTML(task.assignee || '담당자 미정')} 담당 업무만 보기">
                ${avatarMarkup(task.assignee || '담당자 미정', 'meeting-assignee-avatar')}
                <span><small>담당자</small><strong>${escapeHTML(task.assignee || '담당자 미정')}</strong></span>
              </span>
              <div class="meeting-task-meta">
                <span>${escapeHTML(task.project)}</span>
                <span>${formatShort(task.start)} ~ ${formatShort(task.end)}</span>
                <span>${task.progress}%</span>
              </div>
            </div>
            ${next ? `<small class="meeting-task-next">다음 일정 ${formatShort(next.dueDate)} · ${escapeHTML(next.title)}</small>` : ''}
          </div>
          <div class="meeting-task-badges">${badges}</div>
        </button>`;
    }).join('') : `<div class="empty-state">${meta.label}에 해당하는 업무가 없습니다.</div>`;
  }

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

  function mutationApplied(action, payload, remoteTasks, remoteComments, remoteMembers = [], remoteMeetings = [], remoteProjectCategories = [], remoteTeams = [], remoteAdminMembers = [], remoteTeamShortcuts = []) {
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
    if (action === 'saveMemberAdmin') {
      const savedMember = remoteAdminMembers.find(member => member.id === payload.id);
      return Boolean(savedMember
        && savedMember.name === payload.name
        && savedMember.position === payload.position
        && Boolean(savedMember.active) === Boolean(payload.active)
        && Number(savedMember.sortOrder) === Number(payload.sortOrder));
    }
    if (action === 'saveTeam') {
      const savedTeam = remoteTeams.find(team => team.teamId === payload.teamId);
      return Boolean(savedTeam
        && savedTeam.teamName === payload.teamName
        && Boolean(savedTeam.active) === Boolean(payload.active)
        && String(savedTeam.codeVersion || '') === String(payload.codeVersion || savedTeam.codeVersion || ''));
    }
    if (action === 'saveProjectCategory') {
      const savedCategory = remoteProjectCategories.find(category => category.id === payload.id);
      return Boolean(savedCategory
        && savedCategory.name === payload.name
        && Boolean(savedCategory.active) === Boolean(payload.active));
    }
    if (action === 'saveTeamShortcut') {
      const savedShortcut = remoteTeamShortcuts.find(shortcut => shortcut.id === payload.id);
      return Boolean(savedShortcut
        && savedShortcut.name === payload.name
        && savedShortcut.url === safeShortcutUrl(payload.url)
        && savedShortcut.icon === (String(payload.icon || '🔗').trim().slice(0, 8) || '🔗')
        && Boolean(savedShortcut.active) === Boolean(payload.active)
        && Boolean(savedShortcut.openNewTab) === Boolean(payload.openNewTab)
        && Number(savedShortcut.sortOrder) === Number(payload.sortOrder));
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
      && Boolean(saved.needsDecision) === Boolean(payload.needsDecision)
      && normalizedSubtaskSignature(saved.subtasks) === normalizedSubtaskSignature(payload.subtasks);
  }

  function getAccessToken({ ask = false } = {}) {
    let token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token && ask) {
      token = window.prompt('TEAM FLOW 팀 접속코드 또는 관리자 접속키를 입력하세요.') || '';
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
      if (!token) return reject(new Error('접속코드가 필요합니다.'));

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
      if (activeTeamId) url.searchParams.set('teamId', activeTeamId);
      url.searchParams.set('_', Date.now().toString());
      script.src = url.toString();
      script.async = true;
      document.head.appendChild(script);
    });
  }

  async function postMutation(action, payload) {
    if (!apiConfigured()) throw new Error('config.js에 Apps Script 웹 앱 URL을 입력하세요.');
    const token = getAccessToken({ ask: true });
    if (!token) throw new Error('접속코드가 필요합니다.');

    await fetch(CONFIG.API_URL, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ action, token, teamId: activeTeamId, payload })
    });
  }

  async function loadRemoteData({ silent = false } = {}) {
    if (isSyncing) return;
    if (!apiConfigured()) {
      setConnectionState('offline', 'Google Sheets 설정 필요', 'config.js에 Apps Script 웹 앱 URL을 붙여넣으세요.');
      renderAll();
      return;
    }

    isSyncing = true;
    els.refreshDataBtn.disabled = true;
    if (!silent) setConnectionState('loading', 'Google Sheets 동기화 중', '현재 팀의 업무와 회의록을 불러오고 있습니다.');
    try {
      const response = await jsonpRequest('getData');
      assertApiVersion(response);

      authState = {
        role: String(response.auth?.role || 'team'),
        isAdmin: Boolean(response.auth?.isAdmin),
        teamId: String(response.auth?.teamId || ''),
        teamName: String(response.auth?.teamName || '')
      };
      if (authState.teamId) {
        activeTeamId = authState.teamId;
        localStorage.setItem(ACTIVE_TEAM_KEY, activeTeamId);
      }

      companyTeams = Array.isArray(response.teams) ? response.teams.map(normalizeTeam) : [];
      tasks = Array.isArray(response.tasks) ? response.tasks.map(normalizeTask) : [];
      comments = Array.isArray(response.comments) ? response.comments.map(normalizeComment) : [];
      meetings = Array.isArray(response.meetings) ? response.meetings.map(normalizeMeeting) : [];
      teamMembers = Array.isArray(response.members) ? response.members.map(normalizeMember).filter(member => member.active) : [];
      adminMembers = Array.isArray(response.allMembers) ? response.allMembers.map(normalizeMember) : [...teamMembers];
      projectCategories = Array.isArray(response.projectCategories) ? response.projectCategories.map(normalizeProjectCategory) : [];
      teamShortcuts = Array.isArray(response.teamShortcuts) ? response.teamShortcuts.map(normalizeTeamShortcut) : [];

      ensureCurrentUser();
      renderAll();
      const syncedAt = new Date();
      setConnectionState('connected', `${authState.teamName || '현재 팀'} 연결됨`, `마지막 동기화 ${syncedAt.getHours()}:${String(syncedAt.getMinutes()).padStart(2, '0')}`);
    } catch (error) {
      console.error(error);
      tasks = [];
      comments = [];
      meetings = [];
      teamMembers = [];
      adminMembers = [];
      projectCategories = [];
      teamShortcuts = [];
      companyTeams = [];
      authState = { role: 'team', isAdmin: false, teamId: '', teamName: '' };
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
        const remoteMembers = Array.isArray(response.members) ? response.members.map(normalizeMember).filter(member => member.active) : [];
        const remoteAdminMembers = Array.isArray(response.allMembers) ? response.allMembers.map(normalizeMember) : [...remoteMembers];
        const remoteProjectCategories = Array.isArray(response.projectCategories) ? response.projectCategories.map(normalizeProjectCategory) : [];
        const remoteTeamShortcuts = Array.isArray(response.teamShortcuts) ? response.teamShortcuts.map(normalizeTeamShortcut) : [];
        const remoteTeams = Array.isArray(response.teams) ? response.teams.map(normalizeTeam) : companyTeams;

        if (!mutationApplied(action, payload, remoteTasks, remoteComments, remoteMembers, remoteMeetings, remoteProjectCategories, remoteTeams, remoteAdminMembers, remoteTeamShortcuts)) {
          lastError = new Error('저장 내용이 아직 Google Sheets에 반영되지 않았습니다.');
          continue;
        }

        authState = {
          role: String(response.auth?.role || authState.role || 'team'),
          isAdmin: Boolean(response.auth?.isAdmin),
          teamId: String(response.auth?.teamId || activeTeamId),
          teamName: String(response.auth?.teamName || authState.teamName || '')
        };
        if (authState.teamId) {
          activeTeamId = authState.teamId;
          localStorage.setItem(ACTIVE_TEAM_KEY, activeTeamId);
        }
        tasks = remoteTasks;
        comments = remoteComments;
        meetings = remoteMeetings;
        teamMembers = remoteMembers;
        adminMembers = remoteAdminMembers;
        projectCategories = remoteProjectCategories;
        teamShortcuts = remoteTeamShortcuts;
        companyTeams = remoteTeams;
        ensureCurrentUser();
        renderAll();
        setConnectionState('connected', `${authState.teamName || '현재 팀'} 연결됨`, '방금 변경 사항을 저장했습니다.');
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
    renderAdmin();
    renderTeamShortcuts();
    updateProfile();
    updateWorkspaceContext();
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

    populateProjectSelectors();
  }

  function activeProjectCategories() {
    return projectCategories
      .filter(category => category.active)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ko'));
  }

  function projectSelectOptions({ includeBlank = false, selectedValue = '' } = {}) {
    const categories = activeProjectCategories();
    const selected = String(selectedValue || '').trim();
    const names = categories.map(category => category.name);
    if (selected && !names.includes(selected)) names.push(selected);
    return `${includeBlank ? '<option value="">선택 안 함</option>' : '<option value="" disabled>카테고리 선택</option>'}`
      + names.map(name => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`).join('');
  }

  function populateProjectSelectors({ taskValue, meetingValue } = {}) {
    const taskSelected = taskValue !== undefined ? String(taskValue || '') : els.taskProject.value;
    const meetingSelected = meetingValue !== undefined ? String(meetingValue || '') : els.meetingProject.value;
    els.taskProject.innerHTML = projectSelectOptions({ selectedValue: taskSelected });
    els.meetingProject.innerHTML = projectSelectOptions({ includeBlank: true, selectedValue: meetingSelected });
    if (taskSelected) els.taskProject.value = taskSelected;
    else if (activeProjectCategories()[0]) els.taskProject.value = activeProjectCategories()[0].name;
    if (meetingSelected) els.meetingProject.value = meetingSelected;
  }

  function renderProjectCategoryList() {
    if (!els.projectCategoryList) return;
    const sorted = [...projectCategories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ko'));
    els.projectCategoryList.innerHTML = sorted.length ? sorted.map(category => `
      <div class="project-category-row ${category.active ? '' : 'inactive'}">
        <div class="project-category-copy">
          <span class="project-category-dot"></span>
          <strong>${escapeHTML(category.name)}</strong>
          <small>${category.active ? '사용 중' : '숨김'}</small>
        </div>
        <button type="button" class="category-state-button ${category.active ? '' : 'restore'}"
          data-toggle-project-category="${escapeHTML(category.id)}">${category.active ? '숨기기' : '다시 사용'}</button>
      </div>`).join('') : '<div class="category-empty">등록된 카테고리가 없습니다.</div>';
  }

  function openProjectCategoryModal() {
    renderProjectCategoryList();
    els.projectCategoryName.value = '';
    els.projectCategoryModal.classList.add('open');
    els.projectCategoryModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => els.projectCategoryName.focus(), 80);
  }

  function closeProjectCategoryModal() {
    els.projectCategoryModal.classList.remove('open');
    els.projectCategoryModal.setAttribute('aria-hidden', 'true');
  }

  async function submitProjectCategory(event) {
    event.preventDefault();
    const name = els.projectCategoryName.value.trim().replace(/\s+/g, ' ');
    if (!name) return showToast('카테고리명을 입력하세요.');
    if (projectCategories.some(category => category.name.toLowerCase() === name.toLowerCase())) return showToast('이미 등록된 카테고리입니다.');
    const payload = {
      id: `PC${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      name,
      active: true,
      sortOrder: Math.max(0, ...projectCategories.map(category => Number(category.sortOrder) || 0)) + 1
    };
    els.addProjectCategoryBtn.disabled = true;
    try {
      await mutateAndRefresh('saveProjectCategory', payload, '프로젝트 카테고리를 추가했습니다.');
      els.projectCategoryName.value = '';
      renderProjectCategoryList();
      populateProjectSelectors();
      els.projectCategoryName.focus();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '카테고리 저장 확인 필요', error.message);
      showToast(error.message);
    } finally {
      els.addProjectCategoryBtn.disabled = false;
    }
  }

  async function toggleProjectCategory(categoryId) {
    const category = projectCategories.find(item => item.id === categoryId);
    if (!category) return;
    const activeCount = activeProjectCategories().length;
    if (category.active && activeCount <= 1) return showToast('최소 한 개의 프로젝트 카테고리는 사용 중이어야 합니다.');
    const payload = { ...category, active: !category.active };
    try {
      await mutateAndRefresh('saveProjectCategory', payload, payload.active ? '카테고리를 다시 사용합니다.' : '카테고리를 숨겼습니다.');
      renderProjectCategoryList();
      populateProjectSelectors();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '카테고리 저장 확인 필요', error.message);
      showToast(error.message);
    }
  }


  function sortedTeamShortcuts() {
    return [...teamShortcuts].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ko'));
  }

  function renderTeamShortcuts() {
    if (!els.teamShortcutSection || !els.teamShortcutList) return;
    const teamName = authState.teamName || '현재 팀';
    if (els.teamShortcutTitle) els.teamShortcutTitle.textContent = teamName;
    const activeShortcuts = sortedTeamShortcuts().filter(shortcut => shortcut.active && safeShortcutUrl(shortcut.url));
    els.teamShortcutList.innerHTML = activeShortcuts.length ? activeShortcuts.map(shortcut => {
      const href = safeShortcutUrl(shortcut.url);
      const target = shortcut.openNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="team-shortcut-link" href="${escapeHTML(href)}"${target} title="${escapeHTML(shortcut.name)}">
        <span class="team-shortcut-icon" aria-hidden="true">${escapeHTML(shortcut.icon || '🔗')}</span>
        <span>${escapeHTML(shortcut.name)}</span>
        <i aria-hidden="true">↗</i>
      </a>`;
    }).join('') : '<div class="team-shortcut-empty">등록된 바로가기가 없습니다.</div>';
  }

  function renderTeamShortcutManagerList() {
    if (!els.teamShortcutManagerList) return;
    const shortcuts = sortedTeamShortcuts();
    els.teamShortcutManagerList.innerHTML = shortcuts.length ? shortcuts.map(shortcut => `
      <div class="shortcut-manager-row ${shortcut.active ? '' : 'inactive'}">
        <div class="shortcut-manager-icon">${escapeHTML(shortcut.icon || '🔗')}</div>
        <div class="shortcut-manager-copy">
          <strong>${escapeHTML(shortcut.name)}</strong>
          <small>${escapeHTML(shortcut.url)} · 순서 ${shortcut.sortOrder}${shortcut.openNewTab ? ' · 새 탭' : ''}${shortcut.active ? '' : ' · 숨김'}</small>
        </div>
        <div class="shortcut-manager-actions">
          <button type="button" data-edit-team-shortcut="${escapeHTML(shortcut.id)}">수정</button>
          <button type="button" data-toggle-team-shortcut="${escapeHTML(shortcut.id)}">${shortcut.active ? '숨기기' : '다시 사용'}</button>
        </div>
      </div>`).join('') : '<div class="category-empty">등록된 바로가기가 없습니다.</div>';
  }

  function resetTeamShortcutForm() {
    if (!els.teamShortcutForm) return;
    els.teamShortcutForm.reset();
    els.teamShortcutId.value = '';
    els.teamShortcutName.value = '';
    els.teamShortcutUrl.value = '';
    els.teamShortcutIcon.value = '🔗';
    els.teamShortcutSortOrder.value = Math.max(0, ...teamShortcuts.map(shortcut => Number(shortcut.sortOrder) || 0)) + 1;
    els.teamShortcutActive.checked = true;
    els.teamShortcutNewTab.checked = true;
    els.saveTeamShortcutBtn.textContent = '＋ 바로가기 추가';
    els.cancelTeamShortcutEditBtn.classList.add('hidden');
  }

  function openTeamShortcutModal() {
    resetTeamShortcutForm();
    renderTeamShortcutManagerList();
    if (els.teamShortcutModalTeamName) els.teamShortcutModalTeamName.textContent = authState.teamName || '현재 팀';
    els.teamShortcutModal.classList.add('open');
    els.teamShortcutModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => els.teamShortcutName.focus(), 80);
  }

  function closeTeamShortcutModal() {
    els.teamShortcutModal?.classList.remove('open');
    els.teamShortcutModal?.setAttribute('aria-hidden', 'true');
  }

  function editTeamShortcut(shortcutId) {
    const shortcut = teamShortcuts.find(item => item.id === shortcutId);
    if (!shortcut) return;
    els.teamShortcutId.value = shortcut.id;
    els.teamShortcutName.value = shortcut.name;
    els.teamShortcutUrl.value = shortcut.url;
    els.teamShortcutIcon.value = shortcut.icon || '🔗';
    els.teamShortcutSortOrder.value = shortcut.sortOrder;
    els.teamShortcutActive.checked = shortcut.active;
    els.teamShortcutNewTab.checked = shortcut.openNewTab;
    els.saveTeamShortcutBtn.textContent = '바로가기 저장';
    els.cancelTeamShortcutEditBtn.classList.remove('hidden');
    els.teamShortcutName.focus();
  }

  async function submitTeamShortcut(event) {
    event.preventDefault();
    const name = els.teamShortcutName.value.trim().replace(/\s+/g, ' ');
    const url = safeShortcutUrl(els.teamShortcutUrl.value);
    if (!name) return showToast('바로가기 이름을 입력하세요.');
    if (!url) return showToast('http:// 또는 https://로 시작하는 올바른 URL을 입력하세요.');
    const editingId = els.teamShortcutId.value.trim();
    const payload = {
      id: editingId || `TS${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      name,
      url,
      icon: els.teamShortcutIcon.value.trim().slice(0, 8) || '🔗',
      sortOrder: Math.max(1, Number(els.teamShortcutSortOrder.value) || 1),
      active: els.teamShortcutActive.checked,
      openNewTab: els.teamShortcutNewTab.checked
    };
    const duplicate = teamShortcuts.find(item => item.id !== payload.id && item.name.toLocaleLowerCase('ko-KR') === name.toLocaleLowerCase('ko-KR'));
    if (duplicate) return showToast('같은 이름의 바로가기가 이미 있습니다.');
    els.saveTeamShortcutBtn.disabled = true;
    try {
      await mutateAndRefresh('saveTeamShortcut', payload, editingId ? '바로가기를 수정했습니다.' : '바로가기를 추가했습니다.');
      resetTeamShortcutForm();
      renderTeamShortcutManagerList();
    } catch (error) {
      console.error(error);
      setConnectionState('error', '바로가기 저장 확인 필요', error.message);
      showToast(error.message);
    } finally {
      els.saveTeamShortcutBtn.disabled = false;
    }
  }

  async function toggleTeamShortcut(shortcutId) {
    const shortcut = teamShortcuts.find(item => item.id === shortcutId);
    if (!shortcut) return;
    const payload = { ...shortcut, active: !shortcut.active };
    try {
      await mutateAndRefresh('saveTeamShortcut', payload, payload.active ? '바로가기를 다시 표시합니다.' : '바로가기를 숨겼습니다.');
      renderTeamShortcutManagerList();
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  }


  function updateWorkspaceContext() {
    if (els.currentTeamName) els.currentTeamName.textContent = authState.teamName || '팀 확인 중';

    const adminMode = Boolean(authState.isAdmin);
    els.adminNavItem?.classList.toggle('hidden', !adminMode);
    els.adminTeamSelect?.classList.toggle('hidden', !adminMode);

    if (adminMode && els.adminTeamSelect) {
      const activeTeams = companyTeams.filter(team => team.active);
      els.adminTeamSelect.innerHTML = activeTeams.map(team =>
        `<option value="${escapeHTML(team.teamId)}">${escapeHTML(team.teamName)}</option>`).join('');
      if (activeTeams.some(team => team.teamId === activeTeamId)) els.adminTeamSelect.value = activeTeamId;
    }

    if (els.adminMemberTeamName) els.adminMemberTeamName.textContent = authState.teamName || '현재 팀';
    if (els.teamShortcutModalTeamName) els.teamShortcutModalTeamName.textContent = authState.teamName || '현재 팀';
    if (els.adminMemberTeamLabel && !els.adminMemberId?.value && !els.adminMemberTeamLabel.value) {
      els.adminMemberTeamLabel.value = authState.teamName || '';
    }
  }

  function generateTeamAccessCode() {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const chars = [...bytes].map(value => alphabet[value % alphabet.length]).join('');
    return `TF-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
  }

  function generateTeamId() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    const suffix = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
    return `team-${suffix}`;
  }

  function revealCredential(code) {
    if (!els.credentialReveal || !els.credentialRevealCode) return;
    els.credentialRevealCode.textContent = code;
    els.credentialReveal.classList.remove('hidden');
  }

  function resetTeamAdminForm() {
    if (!els.teamAdminForm) return;
    els.teamAdminForm.reset();
    els.adminTeamId.value = '';
    els.adminTeamName.value = '';
    els.saveTeamAdminBtn.textContent = '＋ 팀 추가';
    els.cancelTeamEditBtn.classList.add('hidden');
  }

  function resetMemberAdminForm() {
    if (!els.memberAdminForm) return;
    els.memberAdminForm.reset();
    els.adminMemberId.value = '';
    els.adminMemberName.readOnly = false;
    els.adminMemberName.value = '';
    els.adminMemberPosition.value = '';
    els.adminMemberTeamLabel.value = authState.teamName || '';
    els.adminMemberSortOrder.value = Math.max(1, ...adminMembers.map(member => Number(member.sortOrder) || 0)) + 1;
    els.adminMemberColor.value = DEFAULT_AVATAR_COLOR;
    els.adminMemberActive.checked = true;
    els.saveMemberAdminBtn.textContent = '＋ 팀원 추가';
    els.cancelMemberEditBtn.classList.add('hidden');
  }

  function renderAdmin() {
    if (!els.adminTeamList || !els.adminMemberList) return;
    if (!authState.isAdmin) {
      els.adminTeamList.innerHTML = '';
      els.adminMemberList.innerHTML = '';
      return;
    }

    const teams = [...companyTeams].sort((a, b) => a.sortOrder - b.sortOrder || a.teamName.localeCompare(b.teamName, 'ko'));
    if (els.adminTeamCount) els.adminTeamCount.textContent = `${teams.length}개`;
    els.adminTeamList.innerHTML = teams.map(team => `
      <div class="admin-team-row ${team.teamId === activeTeamId ? 'current' : ''} ${team.active ? '' : 'inactive'}">
        <div class="admin-team-copy">
          <span class="admin-team-icon">${escapeHTML(team.teamName.slice(-2))}</span>
          <div><strong>${escapeHTML(team.teamName)}</strong><small>${team.teamId === activeTeamId ? '현재 선택한 팀' : (team.active ? '사용 중' : '비활성')}</small></div>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-admin-select-team="${escapeHTML(team.teamId)}">열기</button>
          <button type="button" data-admin-edit-team="${escapeHTML(team.teamId)}">이름 수정</button>
          <button type="button" data-admin-reset-code="${escapeHTML(team.teamId)}">코드 재발급</button>
        </div>
      </div>`).join('') || '<div class="empty-state">등록된 팀이 없습니다.</div>';

    const members = [...adminMembers].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ko'));
    if (els.adminMemberCount) els.adminMemberCount.textContent = `${members.filter(member => member.active).length}명 사용 중 · 전체 ${members.length}명`;
    els.adminMemberList.innerHTML = members.map(member => `
      <div class="admin-member-row ${member.active ? '' : 'inactive'}">
        ${avatarMarkup(member.name, 'admin-member-avatar')}
        <div class="admin-member-copy">
          <strong>${escapeHTML(member.name)} <span>${escapeHTML(member.position || '')}</span></strong>
          <small>${escapeHTML(member.team || authState.teamName || '')} · 순서 ${member.sortOrder}${member.active ? '' : ' · 비활성'}</small>
        </div>
        <div class="admin-row-actions">
          <button type="button" data-admin-edit-member="${escapeHTML(member.id)}">수정</button>
          <button type="button" class="${member.active ? 'danger-text' : ''}" data-admin-toggle-member="${escapeHTML(member.id)}">${member.active ? '비활성' : '다시 사용'}</button>
        </div>
      </div>`).join('') || '<div class="empty-state">이 팀에 등록된 팀원이 없습니다.</div>';
  }

  async function submitTeamAdmin(event) {
    event.preventDefault();
    if (!authState.isAdmin) return showToast('관리자 권한이 필요합니다.');
    const editingId = els.adminTeamId.value.trim();
    const teamName = els.adminTeamName.value.trim().replace(/\s+/g, ' ');
    if (!teamName) return showToast('팀 이름을 입력하세요.');

    const existing = companyTeams.find(team => team.teamId === editingId);
    const accessCode = existing ? '' : generateTeamAccessCode();
    const payload = {
      teamId: existing?.teamId || generateTeamId(teamName),
      teamName,
      active: existing ? existing.active : true,
      sortOrder: existing?.sortOrder || Math.max(0, ...companyTeams.map(team => Number(team.sortOrder) || 0)) + 1,
      codeVersion: existing?.codeVersion || String(Date.now()),
      ...(accessCode ? { accessCode, codeVersion: String(Date.now()) } : {})
    };

    els.saveTeamAdminBtn.disabled = true;
    try {
      await mutateAndRefresh('saveTeam', payload, existing ? '팀 이름을 수정했습니다.' : '새 팀을 추가했습니다.');
      if (accessCode) revealCredential(accessCode);
      resetTeamAdminForm();
    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      els.saveTeamAdminBtn.disabled = false;
    }
  }

  async function resetTeamAccessCode(teamId) {
    if (!authState.isAdmin) return;
    const team = companyTeams.find(item => item.teamId === teamId);
    if (!team || !confirm(`${team.teamName}의 접속코드를 재발급할까요?\n기존 코드는 즉시 사용할 수 없게 됩니다.`)) return;
    const accessCode = generateTeamAccessCode();
    const payload = {
      ...team,
      accessCode,
      codeVersion: String(Date.now())
    };
    try {
      await mutateAndRefresh('saveTeam', payload, `${team.teamName} 접속코드를 재발급했습니다.`);
      revealCredential(accessCode);
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  }

  async function selectAdminTeam(teamId) {
    if (!authState.isAdmin || !teamId || teamId === activeTeamId) return;
    activeTeamId = teamId;
    localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
    currentUser = '';
    meetingVisibleCount = 30;
    resetMemberAdminForm();
    await loadRemoteData();
    if (activeView !== 'admin') renderAll();
  }

  function editAdminTeam(teamId) {
    const team = companyTeams.find(item => item.teamId === teamId);
    if (!team) return;
    els.adminTeamId.value = team.teamId;
    els.adminTeamName.value = team.teamName;
    els.saveTeamAdminBtn.textContent = '팀 이름 저장';
    els.cancelTeamEditBtn.classList.remove('hidden');
    els.adminTeamName.focus();
  }

  function editAdminMember(memberId) {
    const member = adminMembers.find(item => item.id === memberId);
    if (!member) return;
    els.adminMemberId.value = member.id;
    els.adminMemberName.value = member.name;
    els.adminMemberName.readOnly = true;
    els.adminMemberPosition.value = member.position;
    els.adminMemberTeamLabel.value = member.team || authState.teamName || '';
    els.adminMemberSortOrder.value = member.sortOrder;
    els.adminMemberColor.value = normalizeColor(member.avatarColor, member.name);
    els.adminMemberActive.checked = member.active;
    els.saveMemberAdminBtn.textContent = '팀원 정보 저장';
    els.cancelMemberEditBtn.classList.remove('hidden');
    els.adminMemberName.focus();
  }

  async function submitMemberAdmin(event) {
    event.preventDefault();
    if (!authState.isAdmin) return showToast('관리자 권한이 필요합니다.');
    const id = els.adminMemberId.value.trim();
    const name = els.adminMemberName.value.trim().replace(/\s+/g, ' ');
    if (!name) return showToast('팀원 이름을 입력하세요.');
    const payload = {
      id: id || `MB${Date.now()}${Math.random().toString(16).slice(2, 8)}`,
      teamId: activeTeamId,
      name,
      position: els.adminMemberPosition.value.trim(),
      team: els.adminMemberTeamLabel.value.trim() || authState.teamName,
      sortOrder: Math.max(1, Number(els.adminMemberSortOrder.value) || 999),
      avatarColor: normalizeColor(els.adminMemberColor.value, name),
      active: els.adminMemberActive.checked
    };
    els.saveMemberAdminBtn.disabled = true;
    try {
      await mutateAndRefresh('saveMemberAdmin', payload, id ? '팀원 정보를 수정했습니다.' : '새 팀원을 추가했습니다.');
      resetMemberAdminForm();
    } catch (error) {
      console.error(error);
      showToast(error.message);
    } finally {
      els.saveMemberAdminBtn.disabled = false;
    }
  }

  async function toggleAdminMember(memberId) {
    const member = adminMembers.find(item => item.id === memberId);
    if (!member) return;
    if (member.active && !confirm(`${member.name} 팀원을 비활성화할까요?\n과거 업무와 회의록 기록은 유지됩니다.`)) return;
    const payload = { ...member, active: !member.active, teamId: activeTeamId };
    try {
      await mutateAndRefresh('saveMemberAdmin', payload, payload.active ? '팀원을 다시 사용하도록 변경했습니다.' : '팀원을 비활성화했습니다.');
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  }

  function renderDashboard() {
    // 주간마감회의는 '이번 주' 필터와 무관하게 현재 팀의 업무 전체 흐름을 보여줍니다.
    // 담당자/상태/검색 필터는 그대로 적용되며, 긴 기간의 진행 업무도 빠지지 않습니다.
    const filtered = getFilteredTasks({ ignorePeriod: true });
    const buckets = weeklyMeetingBuckets(filtered);
    const counts = {
      ongoing: buckets.ongoing.length,
      due: buckets.due.length,
      next: buckets.next.length,
      delayed: buckets.delayed.length,
      completed: buckets.completed.length,
      decision: buckets.decision.length
    };
    const summary = [
      ['ongoing', '진행중', counts.ongoing, '현재 실행 중인 모든 일정', '↻'],
      ['due', '이번주 마감', counts.due, '이번 주 종료 예정', '◷'],
      ['next', '차주 일정', counts.next, '다음 주 진행 일정', '→'],
      ['delayed', '지연', counts.delayed, '마감일 경과', '!'],
      ['completed', '이번주 완료', counts.completed, '이번 주 완료 처리', '✓'],
      ['decision', '결정 필요', counts.decision, '회의에서 확인 필요', '?']
    ];
    els.summaryCards.innerHTML = summary.map(([key, label, value, note, icon]) => `
      <article class="summary-card ${key}"><button type="button" data-weekly-scope="${key}">
        <div class="summary-label"><span>${label}</span><span class="summary-icon">${icon}</span></div>
        <div class="summary-value">${value}</div><div class="summary-note">${note}</div>
      </button></article>`).join('');

    renderWeeklyMeetingBoard(filtered);

    const grouped = Object.values(filtered.reduce((acc, task) => {
      acc[task.project] ||= { name: task.project, tasks: [], total: 0 };
      acc[task.project].tasks.push(task);
      acc[task.project].total += Number(task.progress || 0);
      return acc;
    }, {})).map(group => ({ ...group, avg: Math.round(group.total / group.tasks.length) }))
      .sort((a, b) => b.tasks.length - a.tasks.length).slice(0, 6);
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
      html += `<div class="timeline-label" data-open-task="${escapeHTML(task.id)}"><strong>${escapeHTML(task.title)}</strong><button type="button" class="timeline-assignee" data-member-filter="${escapeHTML(task.assignee)}">${avatarMarkup(task.assignee, 'timeline-assignee-avatar')}<span>${escapeHTML(task.assignee)}</span></button></div>`;
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
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const nextStart = startOfNextWeek(today);
    const nextEnd = endOfNextWeek(today);
    const names = memberNames();
    const selected = els.assigneeFilter?.value || 'all';
    els.teamStatusBody.innerHTML = names.length ? names.map(name => {
      const mine = tasks.filter(task => task.assignee === name);
      const open = mine.filter(task => task.status !== 'completed');
      const progress = open.filter(task => task.status === 'progress').length;
      const due = open.filter(task => between(task.end, weekStart, weekEnd)).length;
      const next = open.filter(task => overlaps(task, nextStart, nextEnd)).length;
      const delayed = open.filter(task => actualStatus(task) === 'delayed').length;
      const decision = open.filter(task => task.needsDecision).length;
      const info = memberInfo(name);
      return `<button type="button" class="team-status-card ${selected === name ? 'active' : ''}" data-member-filter="${escapeHTML(name)}" aria-pressed="${selected === name}">
        <div class="team-status-person">
          ${avatarMarkup(name, 'team-status-avatar')}
          <div class="team-status-person-copy">
            <span class="team-status-label">담당자</span>
            <strong>${escapeHTML(name)}</strong>
            <small>${escapeHTML([info.position, info.team].filter(Boolean).join(' · ') || '팀원')}</small>
          </div>
          <span class="team-status-filter-hint">${selected === name ? '필터 적용 중' : '업무 보기'} →</span>
        </div>
        <div class="team-status-metrics">
          <span><small>진행 중</small><b class="metric-primary">${progress}</b></span>
          <span><small>이번주 마감</small><b>${due}</b></span>
          <span><small>차주 일정</small><b>${next}</b></span>
          <span><small>지연</small><b class="${delayed ? 'metric-danger' : ''}">${delayed}</b></span>
          <span><small>결정 필요</small><b class="${decision ? 'metric-warning' : ''}">${decision}</b></span>
        </div>
      </button>`;
    }).join('') : '<div class="empty-state">등록된 팀원이 없습니다.</div>';
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
            <div><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.project)} ${priorityBadge(task)}${decisionBadge(task)}${detailsMeta ? ` · ${detailsMeta}` : ''}</span></div>
          </div>
        </td>
        <td><button type="button" class="assignee-chip" data-member-filter="${escapeHTML(task.assignee)}" aria-label="${escapeHTML(task.assignee)} 담당 업무만 보기">${avatarMarkup(task.assignee)}<div><span>담당자</span><strong>${escapeHTML(task.assignee)}</strong>${memberInfo(task.assignee).position ? `<small>${escapeHTML(memberInfo(task.assignee).position)}</small>` : ''}</div></button></td>
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
          <div class="task-card-top">${statusBadge(task)}${priorityBadge(task)}${decisionBadge(task)}</div>
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

    const visibleMeetings = filtered.slice(0, meetingVisibleCount);
    els.meetingList.innerHTML = visibleMeetings.map(meeting => {
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
    if (filtered.length > visibleMeetings.length) {
      els.meetingList.insertAdjacentHTML('beforeend', `<button type="button" class="meeting-load-more" data-load-more-meetings>이전 회의록 더 보기 <span>${filtered.length - visibleMeetings.length}개 남음</span></button>`);
    }
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
    const selectedMeetingProject = meeting?.project || '';
    populateProjectSelectors({ meetingValue: selectedMeetingProject });
    els.meetingProject.value = selectedMeetingProject;
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
    if (view === 'admin' && !authState.isAdmin) return;
    activeView = view;
    activeMineOnly = view === 'mine';
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    $$('.view').forEach(viewElement => viewElement.classList.remove('active'));

    if (view === 'dashboard') {
      $('#dashboardView').classList.add('active');
      els.pageTitle.textContent = '주간마감 대시보드';
    } else if (view === 'calendar') {
      $('#calendarView').classList.add('active');
      els.pageTitle.textContent = '주간 일정';
    } else if (view === 'meetings') {
      $('#meetingView').classList.add('active');
      els.pageTitle.textContent = '회의록';
    } else if (view === 'admin') {
      $('#adminView').classList.add('active');
      els.pageTitle.textContent = 'TEAM FLOW 관리';
    } else {
      $('#taskListView').classList.add('active');
      els.pageTitle.textContent = activeMineOnly ? '내 업무' : '전체 업무';
    }

    const meetingMode = view === 'meetings';
    const adminMode = view === 'admin';
    els.taskFilterRow.classList.toggle('hidden', meetingMode || adminMode);
    els.periodSegment?.classList.toggle('hidden', view === 'dashboard');
    els.openTaskModalBtn.classList.toggle('hidden', adminMode);
    els.globalSearch.closest('.search-box')?.classList.toggle('hidden', adminMode);
    if (!adminMode) {
      els.openTaskModalBtn.textContent = meetingMode ? '＋ 새 회의록' : '＋ 새 업무';
      els.globalSearch.placeholder = meetingMode ? '회의 제목, 참석자, 내용 검색' : '업무명, 담당자 검색';
    }
    els.sidebar.classList.remove('open');
    renderAll();
  }

  function openTaskModal(task = null) {
    els.taskForm.reset();
    els.taskId.value = task?.id || '';
    els.taskTitle.value = task?.title || '';
    const selectedProject = task?.project || activeProjectCategories()[0]?.name || '';
    populateProjectSelectors({ taskValue: selectedProject });
    els.taskProject.value = selectedProject;
    els.taskAssignee.value = task?.assignee || currentUser;
    els.taskStart.value = task?.start || iso(new Date());
    els.taskEnd.value = task?.end || iso(addDays(new Date(), 1));
    els.taskStatus.value = task?.status || 'before';
    els.taskPriority.value = task?.priority || 'normal';
    if (els.taskNeedsDecision) els.taskNeedsDecision.checked = Boolean(task?.needsDecision);
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
      needsDecision: Boolean(els.taskNeedsDecision?.checked),
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
    els.globalSearch.addEventListener('input', () => {
      if (activeView === 'meetings') meetingVisibleCount = 30;
      renderAll();
    });
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
      const loadMoreMeetings = event.target.closest('[data-load-more-meetings]');
      if (loadMoreMeetings) {
        meetingVisibleCount += 30;
        renderMeetingList();
        return;
      }
      const adminSelectTeam = event.target.closest('[data-admin-select-team]');
      if (adminSelectTeam) {
        selectAdminTeam(adminSelectTeam.dataset.adminSelectTeam);
        return;
      }
      const adminEditTeam = event.target.closest('[data-admin-edit-team]');
      if (adminEditTeam) {
        editAdminTeam(adminEditTeam.dataset.adminEditTeam);
        return;
      }
      const adminResetCode = event.target.closest('[data-admin-reset-code]');
      if (adminResetCode) {
        resetTeamAccessCode(adminResetCode.dataset.adminResetCode);
        return;
      }
      const adminEditMember = event.target.closest('[data-admin-edit-member]');
      if (adminEditMember) {
        editAdminMember(adminEditMember.dataset.adminEditMember);
        return;
      }
      const adminToggleMember = event.target.closest('[data-admin-toggle-member]');
      if (adminToggleMember) {
        toggleAdminMember(adminToggleMember.dataset.adminToggleMember);
        return;
      }

      const shortcutEdit = event.target.closest('[data-edit-team-shortcut]');
      if (shortcutEdit) {
        editTeamShortcut(shortcutEdit.dataset.editTeamShortcut);
        return;
      }
      const shortcutToggle = event.target.closest('[data-toggle-team-shortcut]');
      if (shortcutToggle) {
        toggleTeamShortcut(shortcutToggle.dataset.toggleTeamShortcut);
        return;
      }

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
      const memberFilterTarget = event.target.closest('[data-member-filter]');
      if (memberFilterTarget) {
        event.preventDefault();
        event.stopPropagation();
        const name = memberFilterTarget.dataset.memberFilter || 'all';
        const current = els.assigneeFilter?.value || 'all';
        const next = name === 'all' || current === name ? 'all' : name;
        if (els.assigneeFilter) els.assigneeFilter.value = next;
        renderAll();
        showToast(next === 'all' ? '담당자 필터를 해제했습니다.' : `${name} 담당 업무만 표시합니다.`);
        return;
      }
      const taskTarget = event.target.closest('[data-open-task]');
      if (taskTarget) {
        const task = tasks.find(item => item.id === taskTarget.dataset.openTask);
        if (task) openTaskModal(task);
      }
      const jump = event.target.closest('[data-jump]');
      if (jump) switchView(jump.dataset.jump);
      const weeklyScopeTarget = event.target.closest('[data-weekly-scope]');
      if (weeklyScopeTarget) {
        const key = weeklyScopeTarget.dataset.weeklyScope;
        if (WEEKLY_MEETING_META[key]) {
          weeklyMeetingScope = key;
          renderWeeklyMeetingBoard(getFilteredTasks({ ignorePeriod: true }));
          if (weeklyScopeTarget.closest('.summary-card')) {
            $('#weeklyClosingPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
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
      const next = window.prompt('새 팀 접속코드 또는 관리자 접속키를 입력하세요.', current) || '';
      if (!next.trim()) return;
      localStorage.setItem(TOKEN_KEY, next.trim());
      activeTeamId = '';
      localStorage.removeItem(ACTIVE_TEAM_KEY);
      currentUser = '';
      meetingVisibleCount = 30;
      loadRemoteData();
    });
    els.openTeamShortcutModalBtn?.addEventListener('click', openTeamShortcutModal);
    els.teamShortcutForm?.addEventListener('submit', submitTeamShortcut);
    els.cancelTeamShortcutEditBtn?.addEventListener('click', resetTeamShortcutForm);
    els.closeTeamShortcutModalBtn?.addEventListener('click', closeTeamShortcutModal);
    els.doneTeamShortcutBtn?.addEventListener('click', closeTeamShortcutModal);
    els.teamShortcutModal?.addEventListener('click', event => {
      if (event.target === els.teamShortcutModal) closeTeamShortcutModal();
    });
    $$('[data-open-project-categories]').forEach(button => button.addEventListener('click', openProjectCategoryModal));
    els.projectCategoryForm?.addEventListener('submit', submitProjectCategory);
    els.teamAdminForm?.addEventListener('submit', submitTeamAdmin);
    els.memberAdminForm?.addEventListener('submit', submitMemberAdmin);
    els.cancelTeamEditBtn?.addEventListener('click', resetTeamAdminForm);
    els.cancelMemberEditBtn?.addEventListener('click', resetMemberAdminForm);
    els.adminTeamSelect?.addEventListener('change', () => selectAdminTeam(els.adminTeamSelect.value));
    els.copyCredentialBtn?.addEventListener('click', async () => {
      const code = els.credentialRevealCode?.textContent || '';
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        showToast('접속코드를 복사했습니다.');
      } catch (error) {
        window.prompt('아래 접속코드를 복사하세요.', code);
      }
    });
    els.closeProjectCategoryModalBtn?.addEventListener('click', closeProjectCategoryModal);
    els.doneProjectCategoryBtn?.addEventListener('click', closeProjectCategoryModal);
    els.projectCategoryModal?.addEventListener('click', event => {
      if (event.target === els.projectCategoryModal) closeProjectCategoryModal();
      const toggleButton = event.target.closest('[data-toggle-project-category]');
      if (toggleButton) toggleProjectCategory(toggleButton.dataset.toggleProjectCategory);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (els.teamShortcutModal?.classList.contains('open')) closeTeamShortcutModal();
      else if (els.projectCategoryModal?.classList.contains('open')) closeProjectCategoryModal();
      else { closeTaskModal(); closeMeetingModal(); }
    });
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
