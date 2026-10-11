/**
 * Secure Share (v2.5) - Frontend Application Controller
 * Full-Screen Desktop Website Architecture
 * Exactly 4 Primary Navigation Tabs: Send Files, Receive Files, Request, Logout
 * Email-Based Multi-File Transfer & Request Governance
 */

// Application State
const state = {
  token: localStorage.getItem('secure_share_token') || null,
  user: null,
  currentPage: 'login',
  selectedFiles: [],
  verifiedRecipient: null,
  incomingRequests: [],
  sentRequests: [],
  currentRequestFilter: 'ALL',
  currentRequestSubtab: 'sent',
  activeRejectRequestId: null,
  checkRecipientTimer: null
};

// DOM References
const elements = {
  // Global Header
  websiteHeader: document.getElementById('websiteHeader'),
  headerBrandLogo: document.getElementById('headerBrandLogo'),
  headerNavTabs: document.getElementById('headerNavTabs'),
  headerUserEmail: document.getElementById('headerUserEmail'),
  quickSwitchAccountBtn: document.getElementById('quickSwitchAccountBtn'),

  // Exactly 4 Navigation Tabs
  tabSend: document.getElementById('tabSend'),
  tabReceive: document.getElementById('tabReceive'),
  tabRequest: document.getElementById('tabRequest'),
  tabLogout: document.getElementById('tabLogout'),
  incomingCounterBadge: document.getElementById('incomingCounterBadge'),

  // Page Views
  pageLogin: document.getElementById('pageLogin'),
  pageRegister: document.getElementById('pageRegister'),
  pageDashboard: document.getElementById('pageDashboard'),
  pageSend: document.getElementById('pageSend'),
  pageReceive: document.getElementById('pageReceive'),
  pageRequest: document.getElementById('pageRequest'),

  // Login Elements
  loginForm: document.getElementById('loginForm'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  toggleLoginPasswordBtn: document.getElementById('toggleLoginPasswordBtn'),
  loginAlert: document.getElementById('loginAlert'),
  loginSubmitBtn: document.getElementById('loginSubmitBtn'),
  goToRegisterLink: document.getElementById('goToRegisterLink'),
  cloudDemoBtn: document.getElementById('cloudDemoBtn'),
  offlineDemoBtn: document.getElementById('offlineDemoBtn'),

  // Register Elements
  registerForm: document.getElementById('registerForm'),
  regFullName: document.getElementById('regFullName'),
  regEmail: document.getElementById('regEmail'),
  regPassword: document.getElementById('regPassword'),
  regConfirmPassword: document.getElementById('regConfirmPassword'),
  toggleRegPasswordBtn: document.getElementById('toggleRegPasswordBtn'),
  registerAlert: document.getElementById('registerAlert'),
  registerSubmitBtn: document.getElementById('registerSubmitBtn'),
  goToLoginLink: document.getElementById('goToLoginLink'),

  // Dashboard Elements
  dashboardUserEmail: document.getElementById('dashboardUserEmail'),
  dashboardUserUid: document.getElementById('dashboardUserUid'),
  btnNavToSend: document.getElementById('btnNavToSend'),
  btnNavToReceive: document.getElementById('btnNavToReceive'),
  btnNavToRequest: document.getElementById('btnNavToRequest'),
  btnNavToLogout: document.getElementById('btnNavToLogout'),
  statPendingReviews: document.getElementById('statPendingReviews'),
  statAcceptedCount: document.getElementById('statAcceptedCount'),
  statSentRequests: document.getElementById('statSentRequests'),
  statEmailServiceStatus: document.getElementById('statEmailServiceStatus'),

  // Send Files Elements
  btnBackFromSend: document.getElementById('btnBackFromSend'),
  sendFilesForm: document.getElementById('sendFilesForm'),
  selectedFilesSummaryBadge: document.getElementById('selectedFilesSummaryBadge'),
  fileDropzone: document.getElementById('fileDropzone'),
  fileInput: document.getElementById('fileInput'),
  dropzonePlaceholder: document.getElementById('dropzonePlaceholder'),
  triggerFilePickerBtn: document.getElementById('triggerFilePickerBtn'),
  multiFileList: document.getElementById('multiFileList'),
  receiverEmailInput: document.getElementById('receiverEmailInput'),
  recipientCheckBadge: document.getElementById('recipientCheckBadge'),
  requestMessageInput: document.getElementById('requestMessageInput'),
  requestExpirySelect: document.getElementById('requestExpirySelect'),
  uploadProgressWrapper: document.getElementById('uploadProgressWrapper'),
  uploadProgressBar: document.getElementById('uploadProgressBar'),
  uploadProgressText: document.getElementById('uploadProgressText'),
  sendAlert: document.getElementById('sendAlert'),
  sendRequestSubmitBtn: document.getElementById('sendRequestSubmitBtn'),
  cancelSendBtn: document.getElementById('cancelSendBtn'),

  // Send Success Card Elements
  sendSuccessCard: document.getElementById('sendSuccessCard'),
  successRecipientEmail: document.getElementById('successRecipientEmail'),
  successFileCount: document.getElementById('successFileCount'),
  successTotalSize: document.getElementById('successTotalSize'),
  successEmailNote: document.getElementById('successEmailNote'),
  sendAnotherRequestBtn: document.getElementById('sendAnotherRequestBtn'),
  viewInRequestTabBtn: document.getElementById('viewInRequestTabBtn'),

  // Receive Files Elements
  btnBackFromReceive: document.getElementById('btnBackFromReceive'),
  refreshReceiveBtn: document.getElementById('refreshReceiveBtn'),
  incomingRequestsStack: document.getElementById('incomingRequestsStack'),

  // Request Tab Elements
  btnBackFromRequest: document.getElementById('btnBackFromRequest'),
  refreshRequestTabBtn: document.getElementById('refreshRequestTabBtn'),
  subtabSent: document.getElementById('subtabSent'),
  subtabReceived: document.getElementById('subtabReceived'),
  sentCountBadge: document.getElementById('sentCountBadge'),
  receivedCountBadge: document.getElementById('receivedCountBadge'),
  statusFiltersRow: document.getElementById('statusFiltersRow'),
  sentRequestsSection: document.getElementById('sentRequestsSection'),
  receivedRequestsSection: document.getElementById('receivedRequestsSection'),
  sentRequestsList: document.getElementById('sentRequestsList'),
  receivedRequestsList: document.getElementById('receivedRequestsList'),

  // Modals
  requestDetailsModal: document.getElementById('requestDetailsModal'),
  closeRequestDetailsModalBtn: document.getElementById('closeRequestDetailsModalBtn'),
  modalRequestId: document.getElementById('modalRequestId'),
  requestDetailsModalBody: document.getElementById('requestDetailsModalBody'),

  confirmRejectModal: document.getElementById('confirmRejectModal'),
  closeRejectModalBtn: document.getElementById('closeRejectModalBtn'),
  cancelRejectBtn: document.getElementById('cancelRejectBtn'),
  confirmRejectSubmitBtn: document.getElementById('confirmRejectSubmitBtn'),

  switchUserModal: document.getElementById('switchUserModal'),
  closeSwitchUserModalBtn: document.getElementById('closeSwitchUserModalBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

// ============================================================================
// NOTIFICATIONS & UTILITY HELPERS
// ============================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(isoString) {
  if (!isoString) return 'Never';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================================
// API CLIENT
// ============================================================================

async function apiFetch(endpoint, options = {}) {
  const headers = options.headers || {};
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Server request error');
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Error ${response.status}`);
  }

  return response;
}

// ============================================================================
// ROUTER & VIEW NAVIGATION
// ============================================================================

function navigateTo(pageId, queryParams = {}) {
  if (pageId === 'logout') {
    logout();
    return;
  }

  // Guard unauthenticated access
  if (!state.token && pageId !== 'login' && pageId !== 'register') {
    pageId = 'login';
  }

  // If authenticated and visiting auth pages, forward to dashboard
  if (state.token && (pageId === 'login' || pageId === 'register')) {
    pageId = 'dashboard';
  }

  state.currentPage = pageId;

  // Toggle Header visibility
  if (state.token) {
    elements.websiteHeader.classList.add('authenticated');
  } else {
    elements.websiteHeader.classList.remove('authenticated');
  }

  // Hide all pages
  const allPages = [
    elements.pageLogin,
    elements.pageRegister,
    elements.pageDashboard,
    elements.pageSend,
    elements.pageReceive,
    elements.pageRequest
  ];
  allPages.forEach(p => {
    if (p) p.classList.remove('active');
  });

  // Highlight active nav tab (among the exactly 4 tabs)
  const navTabs = [
    elements.tabSend,
    elements.tabReceive,
    elements.tabRequest
  ];
  navTabs.forEach(t => {
    if (t) {
      if (t.dataset.target === pageId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    }
  });

  // Activate target page view
  let targetElement = null;
  switch (pageId) {
    case 'login':
      targetElement = elements.pageLogin;
      break;
    case 'register':
      targetElement = elements.pageRegister;
      break;
    case 'dashboard':
      targetElement = elements.pageDashboard;
      loadDashboardMetrics();
      break;
    case 'send':
      targetElement = elements.pageSend;
      break;
    case 'receive':
      targetElement = elements.pageReceive;
      loadIncomingRequests(queryParams.requestId);
      break;
    case 'request':
      targetElement = elements.pageRequest;
      if (queryParams.subtab) {
        switchRequestSubtab(queryParams.subtab);
      }
      loadAllRequests();
      break;
    default:
      targetElement = elements.pageDashboard;
  }

  if (targetElement) {
    targetElement.classList.add('active');
  }

  // Update URL hash
  let newHash = `#${pageId}`;
  if (queryParams.requestId) {
    newHash += `?requestId=${encodeURIComponent(queryParams.requestId)}`;
  }
  if (window.location.hash !== newHash) {
    history.replaceState(null, '', newHash);
  }
}

function handleHashChange() {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    navigateTo(state.token ? 'dashboard' : 'login');
    return;
  }

  const [pagePart, queryPart] = hash.split('?');
  const queryParams = {};
  if (queryPart) {
    const pairs = queryPart.split('&');
    for (const p of pairs) {
      const [k, v] = p.split('=');
      if (k && v) queryParams[decodeURIComponent(k)] = decodeURIComponent(v);
    }
  }

  navigateTo(pagePart || (state.token ? 'dashboard' : 'login'), queryParams);
}

// ============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================

async function verifySession() {
  if (!state.token) {
    navigateTo('login');
    return;
  }

  try {
    const res = await apiFetch('/api/auth/me');
    if (res.success && res.user) {
      state.user = res.user;
      updateUserUI();
      handleHashChange();
      loadIncomingRequests();
    } else {
      logout();
    }
  } catch (err) {
    console.warn('Session verification error:', err.message);
    logout();
  }
}

function updateUserUI() {
  if (!state.user) return;
  if (elements.headerUserEmail) elements.headerUserEmail.textContent = state.user.email;
  if (elements.dashboardUserEmail) elements.dashboardUserEmail.textContent = state.user.email;
  if (elements.dashboardUserUid) {
    elements.dashboardUserUid.textContent = `node_${state.user.id.substring(4, 12)}`;
  }
}

async function handleLogin(email, password) {
  elements.loginAlert.classList.add('hidden');
  elements.loginSubmitBtn.disabled = true;
  elements.loginSubmitBtn.innerHTML = `<span>Authenticating Node...</span>`;

  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.success && res.token) {
      state.token = res.token;
      state.user = res.user;
      localStorage.setItem('secure_share_token', res.token);
      updateUserUI();
      showToast(`Authenticated Node: ${res.user.email}`, 'success');
      navigateTo('dashboard');
    }
  } catch (err) {
    elements.loginAlert.textContent = err.message || 'Authentication failed. Please verify credentials.';
    elements.loginAlert.classList.remove('hidden');
  } finally {
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      <span>Authenticate Console</span>
    `;
  }
}

async function handleRegister(fullName, email, password, confirmPassword) {
  elements.registerAlert.classList.add('hidden');
  elements.registerSubmitBtn.disabled = true;
  elements.registerSubmitBtn.innerHTML = `<span>Provisioning Node...</span>`;

  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });

    if (res.success && res.token) {
      state.token = res.token;
      state.user = res.user;
      localStorage.setItem('secure_share_token', res.token);
      updateUserUI();
      showToast(`Account registered: ${res.user.email}`, 'success');
      navigateTo('dashboard');
    }
  } catch (err) {
    elements.registerAlert.textContent = err.message || 'Registration failed.';
    elements.registerAlert.classList.remove('hidden');
  } finally {
    elements.registerSubmitBtn.disabled = false;
    elements.registerSubmitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      <span>Create Encrypted Identity</span>
    `;
  }
}

async function logout() {
  try {
    if (state.token) {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    }
  } catch (err) {}
  state.token = null;
  state.user = null;
  localStorage.removeItem('secure_share_token');
  showToast('Session terminated. Logged out.', 'info');
  navigateTo('login');
}

// ============================================================================
// DASHBOARD & TELEMETRY
// ============================================================================

async function loadDashboardMetrics() {
  try {
    const res = await apiFetch('/api/system/status');
    if (res.success && res.diagnostics) {
      const m = res.diagnostics.metrics || {};
      if (elements.statPendingReviews) elements.statPendingReviews.textContent = m.pendingTransfers || 0;
      if (elements.statAcceptedCount) elements.statAcceptedCount.textContent = m.acceptedTransfers || 0;
      if (elements.statSentRequests) elements.statSentRequests.textContent = m.totalTransfers || 0;
      if (elements.statEmailServiceStatus) {
        elements.statEmailServiceStatus.textContent = res.diagnostics.smtpConfigured ? 'Active (Live SMTP)' : 'Active (Diagnostic Mode)';
      }
    }
  } catch (err) {
    console.error('Error loading metrics:', err);
  }
}

// ============================================================================
// SEND FILES WORKFLOW (MULTI-FILE & EMAIL RECIPIENT)
// ============================================================================

function addFilesToSelection(fileList) {
  if (!fileList || fileList.length === 0) return;

  for (let i = 0; i < fileList.length; i++) {
    const f = fileList[i];
    // Prevent duplicates by name and size
    const exists = state.selectedFiles.some(item => item.name === f.name && item.size === f.size);
    if (!exists) {
      state.selectedFiles.push(f);
    }
  }

  renderSelectedFiles();
  elements.sendAlert.classList.add('hidden');
}

function removeFileFromSelection(index) {
  state.selectedFiles.splice(index, 1);
  renderSelectedFiles();
}

function renderSelectedFiles() {
  if (state.selectedFiles.length === 0) {
    elements.dropzonePlaceholder.classList.remove('hidden');
    elements.multiFileList.classList.add('hidden');
    elements.selectedFilesSummaryBadge.textContent = '0 Files Selected';
    return;
  }

  elements.dropzonePlaceholder.classList.add('hidden');
  elements.multiFileList.classList.remove('hidden');

  const totalSize = state.selectedFiles.reduce((acc, f) => acc + f.size, 0);
  elements.selectedFilesSummaryBadge.textContent = `${state.selectedFiles.length} File(s) (${formatBytes(totalSize)})`;

  elements.multiFileList.innerHTML = `
    ${state.selectedFiles.map((f, idx) => `
      <div class="selected-file-chip">
        <div class="chip-left">
          <div class="chip-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div class="chip-name">${escapeHtml(f.name)}</div>
            <div class="chip-size">${formatBytes(f.size)}</div>
          </div>
        </div>
        <button type="button" class="chip-remove-btn" onclick="removeFileFromSelection(${idx})" title="Remove file">&times;</button>
      </div>
    `).join('')}
    <div class="add-more-files-bar">
      <button type="button" class="add-more-btn" onclick="document.getElementById('fileInput').click()">+ Add More Files</button>
    </div>
  `;
}

// Live Recipient Verification
function checkRecipientEmail(email) {
  clearTimeout(state.checkRecipientTimer);
  const badge = elements.recipientCheckBadge;
  
  if (!email || !email.includes('@') || !email.includes('.')) {
    badge.className = 'verification-pill hidden';
    state.verifiedRecipient = null;
    return;
  }

  state.checkRecipientTimer = setTimeout(async () => {
    try {
      const res = await apiFetch(`/api/users/check?email=${encodeURIComponent(email)}`);
      badge.classList.remove('hidden');
      if (res.exists) {
        if (res.isSelf) {
          badge.className = 'verification-pill invalid';
          badge.textContent = '✗ Sender and receiver cannot be the same account';
          state.verifiedRecipient = null;
        } else {
          badge.className = 'verification-pill valid';
          badge.textContent = `✓ Registered Recipient: ${res.user.fullName}`;
          state.verifiedRecipient = res.user;
        }
      } else {
        badge.className = 'verification-pill invalid';
        badge.textContent = '✗ Recipient email is not registered in the system';
        state.verifiedRecipient = null;
      }
    } catch (err) {
      badge.className = 'verification-pill hidden';
    }
  }, 350);
}

// Dispatch Request
async function handleSendRequest(e) {
  e.preventDefault();

  if (state.selectedFiles.length === 0) {
    elements.sendAlert.textContent = 'Please select at least one file to transfer';
    elements.sendAlert.classList.remove('hidden');
    return;
  }

  const receiverEmail = elements.receiverEmailInput.value.trim().toLowerCase();
  const message = elements.requestMessageInput.value.trim();
  const expiryHours = elements.requestExpirySelect.value;

  if (!receiverEmail) {
    elements.sendAlert.textContent = "Please enter the recipient's registered email address";
    elements.sendAlert.classList.remove('hidden');
    return;
  }

  elements.sendAlert.classList.add('hidden');
  elements.sendRequestSubmitBtn.disabled = true;
  elements.uploadProgressWrapper.classList.remove('hidden');
  elements.uploadProgressBar.style.width = '10%';
  elements.uploadProgressText.textContent = 'Validating recipient identity and initializing request...';

  try {
    // Step 1: Initialize Request
    const createRes = await apiFetch('/api/requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverEmail, message, expiryHours })
    });

    const requestId = createRes.requestId;

    // Step 2: Upload Files sequentially with progress
    const totalFiles = state.selectedFiles.length;
    for (let i = 0; i < totalFiles; i++) {
      const file = state.selectedFiles[i];
      const percent = Math.round(15 + ((i / totalFiles) * 70));
      elements.uploadProgressBar.style.width = `${percent}%`;
      elements.uploadProgressText.textContent = `Encrypting and streaming file ${i + 1} of ${totalFiles}: ${file.name} (${formatBytes(file.size)})...`;

      const headers = {
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(file.name),
        'X-File-Size': String(file.size),
        'X-Mime-Type': file.type || 'application/octet-stream'
      };

      await apiFetch(`/api/requests/${requestId}/upload-file`, {
        method: 'POST',
        headers,
        body: file
      });
    }

    // Step 3: Finalize and Dispatch
    elements.uploadProgressBar.style.width = '90%';
    elements.uploadProgressText.textContent = 'Finalizing transfer request and dispatching email notification...';

    const dispatchRes = await apiFetch(`/api/requests/${requestId}/dispatch`, {
      method: 'POST'
    });

    elements.uploadProgressBar.style.width = '100%';
    elements.uploadProgressText.textContent = 'Request dispatched successfully!';

    // Render Success Card
    renderSendSuccess(dispatchRes);
    showToast(`Request sent to ${receiverEmail}! Status: Pending`, 'success');

  } catch (err) {
    elements.sendAlert.textContent = err.message || 'Failed to dispatch request';
    elements.sendAlert.classList.remove('hidden');
  } finally {
    elements.sendRequestSubmitBtn.disabled = false;
    setTimeout(() => {
      elements.uploadProgressWrapper.classList.add('hidden');
    }, 1500);
  }
}

function renderSendSuccess(res) {
  elements.sendFilesForm.classList.add('hidden');
  elements.sendSuccessCard.classList.remove('hidden');

  elements.successRecipientEmail.textContent = elements.receiverEmailInput.value.trim();
  elements.successFileCount.textContent = `${res.fileCount} file(s)`;
  elements.successTotalSize.textContent = formatBytes(res.totalSize);

  if (res.emailNotification && res.emailNotification.delivered) {
    elements.successEmailNote.textContent = 'Delivered to recipient via SMTP';
  } else {
    elements.successEmailNote.textContent = 'Notification generated (Dev diagnostic logged in console)';
  }
}

function resetSendForm() {
  state.selectedFiles = [];
  renderSelectedFiles();
  elements.sendFilesForm.reset();
  elements.recipientCheckBadge.className = 'verification-pill hidden';
  elements.sendFilesForm.classList.remove('hidden');
  elements.sendSuccessCard.classList.add('hidden');
  elements.sendAlert.classList.add('hidden');
}

// ============================================================================
// RECEIVE FILES WORKFLOW (ACCEPT / REJECT & DOWNLOAD)
// ============================================================================

async function loadIncomingRequests(highlightRequestId = null) {
  try {
    const res = await apiFetch('/api/requests/incoming');
    if (res.success) {
      state.incomingRequests = res.requests;
      
      // Update counter badge on Receive tab
      const pendingCount = res.requests.filter(r => r.status === 'PENDING').length;
      if (pendingCount > 0) {
        elements.incomingCounterBadge.textContent = pendingCount;
        elements.incomingCounterBadge.classList.remove('hidden');
      } else {
        elements.incomingCounterBadge.classList.add('hidden');
      }

      renderIncomingRequests(res.requests, highlightRequestId);
    }
  } catch (err) {
    console.error('Error loading incoming requests:', err);
  }
}

function renderIncomingRequests(requests, highlightId = null) {
  if (!requests || requests.length === 0) {
    elements.incomingRequestsStack.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
        </div>
        <div class="empty-state-title">No incoming file requests</div>
        <p>File-sharing requests addressed to your registered email address will appear here.</p>
      </div>
    `;
    return;
  }

  elements.incomingRequestsStack.innerHTML = requests.map(r => {
    const isPending = r.status === 'PENDING';
    const isAccepted = r.status === 'ACCEPTED';
    const isRejected = r.status === 'REJECTED';
    const isCancelled = r.status === 'CANCELLED';

    let statusBadge = `<span class="status-badge pending">PENDING REVIEW</span>`;
    if (isAccepted) statusBadge = `<span class="status-badge accepted">ACCEPTED</span>`;
    if (isRejected) statusBadge = `<span class="status-badge rejected">REJECTED</span>`;
    if (isCancelled) statusBadge = `<span class="status-badge cancelled">CANCELLED</span>`;

    const highlightStyle = r.id === highlightId ? 'border: 2px solid var(--primary-blue); box-shadow: 0 0 16px var(--primary-blue-glow);' : '';

    return `
      <div class="request-card" id="req-card-${r.id}" style="${highlightStyle}">
        <div class="request-card-header">
          <div class="request-sender-group">
            <div class="sender-avatar">${escapeHtml((r.sender.fullName || r.sender.email)[0].toUpperCase())}</div>
            <div class="sender-info">
              <div class="sender-name-label">${escapeHtml(r.sender.fullName || r.sender.email)}</div>
              <div class="sender-meta-row">
                <span>From: <strong>${escapeHtml(r.sender.email)}</strong></span>
                <span>•</span>
                <span>${formatDate(r.createdAt)}</span>
              </div>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        ${r.message ? `
          <div class="request-message-bubble">
            "${escapeHtml(r.message)}"
          </div>
        ` : ''}

        <!-- Files List Tray -->
        <div class="request-files-tray">
          <div class="tray-header">
            <span>SHARED FILES (${r.fileCount} items)</span>
            <span>TOTAL: ${formatBytes(r.totalSize)}</span>
          </div>
          ${r.files.map(f => `
            <div class="tray-file-item">
              <div class="tray-file-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="tray-file-name">${escapeHtml(f.fileName)}</span>
                <span class="tray-file-size">(${formatBytes(f.fileSize)})</span>
              </div>
              <div>
                ${isAccepted ? `
                  <a href="/api/requests/${r.id}/files/${f.id}/download?token=${state.token}" class="btn-download-auth" download>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Download</span>
                  </a>
                ` : `
                  <span style="font-size:11.5px;color:var(--text-muted);">Locked (Accept to unlock)</span>
                `}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div class="request-card-actions">
          ${isPending ? `
            <button type="button" class="btn-reject" onclick="promptRejectRequest('${r.id}')">Reject</button>
            <button type="button" class="btn-accept" onclick="acceptIncomingRequest('${r.id}')">Accept Request</button>
          ` : ''}
          ${isAccepted ? `
            <span style="font-size:12px;font-weight:700;color:var(--status-green);">✓ Authorized: You can download files above</span>
          ` : ''}
          ${isRejected ? `
            <span style="font-size:12px;font-weight:700;color:var(--status-red);">Access Denied: Request Rejected</span>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Accept Request
window.acceptIncomingRequest = async function(requestId) {
  try {
    const res = await apiFetch(`/api/requests/${requestId}/accept`, { method: 'POST' });
    showToast('Transfer request accepted! File downloads are now unlocked.', 'success');
    loadIncomingRequests(requestId);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Reject Prompt
window.promptRejectRequest = function(requestId) {
  state.activeRejectRequestId = requestId;
  elements.confirmRejectModal.classList.remove('hidden');
};

async function confirmRejectRequest() {
  if (!state.activeRejectRequestId) return;
  const requestId = state.activeRejectRequestId;
  elements.confirmRejectModal.classList.add('hidden');

  try {
    await apiFetch(`/api/requests/${requestId}/reject`, { method: 'POST' });
    showToast('Request rejected. File access denied.', 'info');
    loadIncomingRequests();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    state.activeRejectRequestId = null;
  }
}

// ============================================================================
// REQUEST TAB WORKFLOW (SENT & RECEIVED REQUESTS)
// ============================================================================

async function loadAllRequests() {
  try {
    const [sentRes, incomingRes] = await Promise.all([
      apiFetch('/api/requests/sent'),
      apiFetch('/api/requests/incoming')
    ]);

    state.sentRequests = sentRes.requests || [];
    state.incomingRequests = incomingRes.requests || [];

    if (elements.sentCountBadge) elements.sentCountBadge.textContent = state.sentRequests.length;
    if (elements.receivedCountBadge) elements.receivedCountBadge.textContent = state.incomingRequests.length;

    renderSentRequests();
    renderReceivedRequestsInTab();
  } catch (err) {
    console.error('Error loading requests:', err);
  }
}

function switchRequestSubtab(subtab) {
  state.currentRequestSubtab = subtab;

  if (subtab === 'sent') {
    elements.subtabSent.classList.add('active');
    elements.subtabReceived.classList.remove('active');
    elements.sentRequestsSection.classList.add('active');
    elements.receivedRequestsSection.classList.remove('active');
  } else {
    elements.subtabReceived.classList.add('active');
    elements.subtabSent.classList.remove('active');
    elements.receivedRequestsSection.classList.add('active');
    elements.sentRequestsSection.classList.remove('active');
  }
}

function filterRequests(requests) {
  if (state.currentRequestFilter === 'ALL') return requests;
  return requests.filter(r => r.status === state.currentRequestFilter);
}

function renderSentRequests() {
  const filtered = filterRequests(state.sentRequests);

  if (filtered.length === 0) {
    elements.sentRequestsList.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-title">No sent requests found</div>
        <p>No requests dispatched from your account matching the current filter.</p>
      </div>
    `;
    return;
  }

  elements.sentRequestsList.innerHTML = filtered.map(r => {
    let statusBadge = `<span class="status-badge pending">PENDING</span>`;
    if (r.status === 'ACCEPTED') statusBadge = `<span class="status-badge accepted">ACCEPTED</span>`;
    if (r.status === 'REJECTED') statusBadge = `<span class="status-badge rejected">REJECTED</span>`;
    if (r.status === 'CANCELLED') statusBadge = `<span class="status-badge cancelled">CANCELLED</span>`;

    return `
      <div class="request-card">
        <div class="request-card-header">
          <div class="request-sender-group">
            <div class="sender-avatar">${escapeHtml((r.receiver.fullName || r.receiver.email)[0].toUpperCase())}</div>
            <div class="sender-info">
              <div class="sender-name-label">To: ${escapeHtml(r.receiver.fullName || r.receiver.email)}</div>
              <div class="sender-meta-row">
                <span>Recipient: <strong>${escapeHtml(r.receiver.email)}</strong></span>
                <span>•</span>
                <span>${formatDate(r.createdAt)}</span>
              </div>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div style="font-size:13.5px;color:var(--text-dark);">
          <strong>Payload:</strong> ${r.fileCount} file(s) (${formatBytes(r.totalSize)})
          ${r.files.length > 0 ? `— <em>${r.files.map(f => escapeHtml(f.fileName)).join(', ')}</em>` : ''}
        </div>

        <div class="request-card-actions">
          <button type="button" class="btn-details" onclick="openRequestDetailsModal('${r.id}')">View Details</button>
          ${r.status === 'PENDING' ? `
            <button type="button" class="btn-reject" onclick="cancelSentRequest('${r.id}')">Cancel Request</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderReceivedRequestsInTab() {
  const filtered = filterRequests(state.incomingRequests);

  if (filtered.length === 0) {
    elements.receivedRequestsList.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-title">No received requests found</div>
        <p>No incoming requests matching the current filter.</p>
      </div>
    `;
    return;
  }

  elements.receivedRequestsList.innerHTML = filtered.map(r => {
    let statusBadge = `<span class="status-badge pending">PENDING</span>`;
    if (r.status === 'ACCEPTED') statusBadge = `<span class="status-badge accepted">ACCEPTED</span>`;
    if (r.status === 'REJECTED') statusBadge = `<span class="status-badge rejected">REJECTED</span>`;
    if (r.status === 'CANCELLED') statusBadge = `<span class="status-badge cancelled">CANCELLED</span>`;

    return `
      <div class="request-card">
        <div class="request-card-header">
          <div class="request-sender-group">
            <div class="sender-avatar">${escapeHtml((r.sender.fullName || r.sender.email)[0].toUpperCase())}</div>
            <div class="sender-info">
              <div class="sender-name-label">From: ${escapeHtml(r.sender.fullName || r.sender.email)}</div>
              <div class="sender-meta-row">
                <span>Sender: <strong>${escapeHtml(r.sender.email)}</strong></span>
                <span>•</span>
                <span>${formatDate(r.createdAt)}</span>
              </div>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div style="font-size:13.5px;color:var(--text-dark);">
          <strong>Payload:</strong> ${r.fileCount} file(s) (${formatBytes(r.totalSize)})
          ${r.files.length > 0 ? `— <em>${r.files.map(f => escapeHtml(f.fileName)).join(', ')}</em>` : ''}
        </div>

        <div class="request-card-actions">
          <button type="button" class="btn-details" onclick="openRequestDetailsModal('${r.id}')">View Details</button>
          ${r.status === 'PENDING' ? `
            <button type="button" class="btn-reject" onclick="promptRejectRequest('${r.id}')">Reject</button>
            <button type="button" class="btn-accept" onclick="acceptIncomingRequest('${r.id}')">Accept</button>
          ` : ''}
          ${r.status === 'ACCEPTED' ? `
            <a href="#receive?requestId=${r.id}" class="btn-download-auth">Open & Download</a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.cancelSentRequest = async function(requestId) {
  if (!confirm('Are you sure you want to cancel this pending file transfer request?')) return;
  try {
    await apiFetch(`/api/requests/${requestId}/cancel`, { method: 'POST' });
    showToast('Transfer request cancelled.', 'info');
    loadAllRequests();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.openRequestDetailsModal = async function(requestId) {
  try {
    const res = await apiFetch(`/api/requests/${requestId}/details`);
    if (res.success && res.request) {
      const r = res.request;
      elements.modalRequestId.textContent = r.id;
      elements.requestDetailsModalBody.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;font-size:13px;">
            <div><strong>Sender:</strong><br>${escapeHtml(r.sender.fullName)} (${escapeHtml(r.sender.email)})</div>
            <div><strong>Recipient:</strong><br>${escapeHtml(r.receiver.fullName)} (${escapeHtml(r.receiver.email)})</div>
            <div><strong>Dispatched:</strong><br>${formatDate(r.createdAt)}</div>
            <div><strong>Status:</strong><br><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></div>
          </div>

          ${r.message ? `
            <div style="background:#eff6ff;border-left:3px solid var(--primary-blue);padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#1e40af;">
              <strong>Message:</strong> "${escapeHtml(r.message)}"
            </div>
          ` : ''}

          <div>
            <h4 style="font-size:14px;font-weight:800;margin-bottom:10px;">Attached Files (${r.files.length})</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${r.files.map(f => `
                <div style="display:flex;align-items:center;justify-content:space-between;background:#ffffff;border:1px solid #e2e8f0;padding:12px 16px;border-radius:10px;font-size:13px;">
                  <div>
                    <strong>${escapeHtml(f.file_name)}</strong>
                    <div style="font-size:11.5px;color:var(--text-muted);font-family:var(--font-mono);">
                      Size: ${formatBytes(f.file_size)} | SHA-256: ${f.checksum_sha256 ? f.checksum_sha256.substring(0, 16) + '...' : 'Verified'}
                    </div>
                  </div>
                  <div>
                    ${r.status === 'ACCEPTED' ? `
                      <a href="/api/requests/${r.id}/files/${f.id}/download?token=${state.token}" class="btn-download-auth" download>Download</a>
                    ` : `
                      <span style="font-size:11.5px;color:var(--text-muted);">Gated</span>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      elements.requestDetailsModal.classList.remove('hidden');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ============================================================================
// EVENT LISTENERS INITIALIZATION
// ============================================================================

function initEventListeners() {
  // Navigation Tabs (The exactly 4 tabs)
  elements.tabSend.addEventListener('click', () => navigateTo('send'));
  elements.tabReceive.addEventListener('click', () => navigateTo('receive'));
  elements.tabRequest.addEventListener('click', () => navigateTo('request'));
  elements.tabLogout.addEventListener('click', logout);

  // Dashboard Action Cards
  elements.btnNavToSend.addEventListener('click', () => navigateTo('send'));
  elements.btnNavToReceive.addEventListener('click', () => navigateTo('receive'));
  elements.btnNavToRequest.addEventListener('click', () => navigateTo('request'));
  elements.btnNavToLogout.addEventListener('click', logout);

  // Back to Dashboard Buttons
  elements.btnBackFromSend.addEventListener('click', () => navigateTo('dashboard'));
  elements.btnBackFromReceive.addEventListener('click', () => navigateTo('dashboard'));
  elements.btnBackFromRequest.addEventListener('click', () => navigateTo('dashboard'));

  // Header Brand Logo
  elements.headerBrandLogo.addEventListener('click', () => {
    if (state.token) navigateTo('dashboard');
  });

  // Quick Switch User Modal
  elements.quickSwitchAccountBtn.addEventListener('click', () => {
    elements.switchUserModal.classList.remove('hidden');
  });
  elements.closeSwitchUserModalBtn.addEventListener('click', () => {
    elements.switchUserModal.classList.add('hidden');
  });

  document.querySelectorAll('.switch-user-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.dataset.email;
      elements.switchUserModal.classList.add('hidden');
      handleLogin(email, 'Password123!');
    });
  });

  // Password Toggles
  elements.toggleLoginPasswordBtn.addEventListener('click', () => {
    elements.loginPassword.type = elements.loginPassword.type === 'password' ? 'text' : 'password';
  });

  elements.toggleRegPasswordBtn.addEventListener('click', () => {
    elements.regPassword.type = elements.regPassword.type === 'password' ? 'text' : 'password';
  });

  // Login Form
  elements.loginForm.addEventListener('submit', e => {
    e.preventDefault();
    handleLogin(elements.loginEmail.value.trim(), elements.loginPassword.value);
  });

  // Register Form
  elements.registerForm.addEventListener('submit', e => {
    e.preventDefault();
    handleRegister(
      elements.regFullName.value.trim(),
      elements.regEmail.value.trim(),
      elements.regPassword.value,
      elements.regConfirmPassword.value
    );
  });

  elements.goToRegisterLink.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('register');
  });

  elements.goToLoginLink.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('login');
  });

  // Sandbox Quick Login Buttons
  elements.cloudDemoBtn.addEventListener('click', () => {
    handleLogin('alice@secureshare.io', 'Password123!');
  });

  elements.offlineDemoBtn.addEventListener('click', () => {
    handleLogin('bob@secureshare.io', 'Password123!');
  });

  // File Dropzone & Multiple File Selection
  elements.triggerFilePickerBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToSelection(e.target.files);
    }
  });

  elements.fileDropzone.addEventListener('dragover', e => {
    e.preventDefault();
    elements.fileDropzone.classList.add('dragover');
  });
  elements.fileDropzone.addEventListener('dragleave', () => {
    elements.fileDropzone.classList.remove('dragover');
  });
  elements.fileDropzone.addEventListener('drop', e => {
    e.preventDefault();
    elements.fileDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToSelection(e.dataTransfer.files);
    }
  });

  // Recipient Email Live Check
  elements.receiverEmailInput.addEventListener('input', e => {
    checkRecipientEmail(e.target.value.trim());
  });

  // Send Request Form Submit
  elements.sendFilesForm.addEventListener('submit', handleSendRequest);

  elements.cancelSendBtn.addEventListener('click', () => {
    resetSendForm();
    navigateTo('dashboard');
  });

  elements.sendAnotherRequestBtn.addEventListener('click', resetSendForm);
  elements.viewInRequestTabBtn.addEventListener('click', () => navigateTo('request'));

  // Receive Files Refresh
  elements.refreshReceiveBtn.addEventListener('click', () => loadIncomingRequests());

  // Request Tab Subtabs & Filters
  elements.subtabSent.addEventListener('click', () => switchRequestSubtab('sent'));
  elements.subtabReceived.addEventListener('click', () => switchRequestSubtab('received'));

  elements.refreshRequestTabBtn.addEventListener('click', loadAllRequests);

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentRequestFilter = btn.dataset.filter;
      renderSentRequests();
      renderReceivedRequestsInTab();
    });
  });

  // Reject Confirmation Modal
  elements.closeRejectModalBtn.addEventListener('click', () => {
    elements.confirmRejectModal.classList.add('hidden');
    state.activeRejectRequestId = null;
  });
  elements.cancelRejectBtn.addEventListener('click', () => {
    elements.confirmRejectModal.classList.add('hidden');
    state.activeRejectRequestId = null;
  });
  elements.confirmRejectSubmitBtn.addEventListener('click', confirmRejectRequest);

  // Request Details Modal Close
  elements.closeRequestDetailsModalBtn.addEventListener('click', () => {
    elements.requestDetailsModal.classList.add('hidden');
  });

  // Hash Routing
  window.addEventListener('hashchange', handleHashChange);
}

// Window functions
window.removeFileFromSelection = removeFileFromSelection;

// Entry Point
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  verifySession();
});
