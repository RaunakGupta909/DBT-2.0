// Auth + Profile Menu utilities (localStorage only)
// Uses theme variables from styles.css

const AUTH_CONFIG = {
  student: {
    label: 'Student', icon: '🎓', dashboard: 'student_dashboard.html', loginPage: 'student_login.html', registerPage: 'student_register.html',
    loginFields: [
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: '12-digit Aadhaar', pattern: '\\d{12}', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'class', label: 'Class', type: 'text', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: '12-digit Aadhaar', pattern: '\\d{12}', required: true },
      { name: 'roll', label: 'Roll No', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'aadhaar'
  },
  parent: {
    label: 'Parent', icon: '👪', dashboard: 'parents_dashboard.html', loginPage: 'parent_login.html', registerPage: 'parent_register.html',
    loginFields: [
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: '12-digit Aadhaar', pattern: '\\d{12}', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'aadhaar', label: 'Aadhaar Number', type: 'text', placeholder: '12-digit Aadhaar', pattern: '\\d{12}', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile', pattern: '\\d{10}', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'aadhaar'
  },
  teacher: {
    label: 'Teacher', icon: '👩‍🏫', dashboard: 'teacher_dashboard.html', loginPage: 'teacher_login.html', registerPage: 'teacher_register.html',
    loginFields: [
      { name: 'teacherId', label: 'Teacher Unique ID', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'teacherId', label: 'Teacher Unique ID', type: 'text', required: true },
      { name: 'schoolCode', label: 'School Code', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'teacherId'
  },
  citizen: {
    label: 'Citizen', icon: '🧑', dashboard: 'citizen_dashboard.html', loginPage: 'citizen_login.html', registerPage: 'citizen_register.html',
    loginFields: [
      { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile', pattern: '\\d{10}', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile', pattern: '\\d{10}', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'mobile'
  },
  beo: {
    label: 'BEO Officer', icon: '🏢', dashboard: 'beo_dashboard.html', loginPage: 'beo_login.html', registerPage: 'beo_register.html',
    loginFields: [
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'officialId'
  },
  deo: {
    label: 'DEO Officer', icon: '🏛️', dashboard: 'deo_dashboard.html', loginPage: 'deo_login.html', registerPage: 'deo_register.html',
    loginFields: [
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'officialId'
  },
  state: {
    label: 'State Officer', icon: '🌐', dashboard: 'state_dbt_officer_dashboard.html', loginPage: 'state_login.html', registerPage: 'state_register.html',
    loginFields: [
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'officialId'
  },
  mosje: {
    label: 'MoSJE Officer', icon: '⚖️', dashboard: 'ministry_dashboard.html', loginPage: 'mosje_login.html', registerPage: 'mosje_register.html',
    loginFields: [
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    registerFields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'officialId', label: 'Official ID', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    uniqueField: 'officialId'
  }
};

const AUTH_STORE_KEY = 'dbt_auth_users_v1';
const AUTH_SESSION_KEY = 'dbt_auth_session_v1';

const AuthStore = {
  _load() {
    try { return JSON.parse(localStorage.getItem(AUTH_STORE_KEY)) || {}; }
    catch { return {}; }
  },
  _save(data) { localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(data)); },
  getUsers(role) {
    const store = this._load();
    return store[role] || [];
  },
  saveUsers(role, users) {
    const store = this._load();
    store[role] = users;
    this._save(store);
  }
};

const AuthSession = {
  set(session) { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)); },
  get() {
    try { return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)); }
    catch { return null; }
  },
  clear() { localStorage.removeItem(AUTH_SESSION_KEY); }
};

function registerUser(role, payload) {
  const cfg = AUTH_CONFIG[role];
  if (!cfg) return { ok: false, error: 'Unknown role' };
  const users = AuthStore.getUsers(role);
  const key = cfg.uniqueField;
  if (users.some(u => (u[key] || '').toLowerCase() === (payload[key] || '').toLowerCase())) {
    return { ok: false, error: `${cfg.label} with same ${key} already exists` };
  }
  const user = { ...payload, role, createdAt: new Date().toISOString() };
  users.push(user);
  AuthStore.saveUsers(role, users);
  return { ok: true, user };
}

function loginUser(role, credentials) {
  const cfg = AUTH_CONFIG[role];
  if (!cfg) return { ok: false, error: 'Unknown role' };
  const users = AuthStore.getUsers(role);
  const key = cfg.uniqueField;
  const candidate = users.find(u => (u[key] || '').toLowerCase() === (credentials[key] || '').toLowerCase());
  if (!candidate) return { ok: false, error: `${cfg.label} not found` };
  if (candidate.password !== credentials.password) return { ok: false, error: 'Incorrect password' };
  AuthSession.set({ role, name: candidate.name, identifier: candidate[key], dashboard: cfg.dashboard });
  return { ok: true, user: candidate };
}

function requireAuth(role, loginPage) {
  const session = AuthSession.get();
  if (!session || session.role !== role) {
    window.location.href = loginPage || AUTH_CONFIG[role]?.loginPage || 'index.html';
  }
}

function buildField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  const label = document.createElement('label');
  label.setAttribute('for', field.name);
  label.textContent = field.label;
  const input = document.createElement(field.type === 'select' ? 'select' : 'input');
  input.name = field.name;
  input.id = field.name;
  input.type = field.type || 'text';
  input.placeholder = field.placeholder || '';
  if (field.pattern) input.pattern = field.pattern;
  if (field.required) input.required = true;
  if (field.options) {
    field.options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value; o.textContent = opt.label; input.appendChild(o);
    });
  }
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

const AuthUI = {
  renderPage({ role, mode, mountId = 'auth-root' }) {
    const cfg = AUTH_CONFIG[role];
    if (!cfg) { console.error('Unknown role', role); return; }
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'auth-shell';

    const header = document.createElement('div');
    header.className = 'auth-header';
    header.innerHTML = `<h1>${cfg.icon} ${cfg.label} ${mode === 'login' ? 'Login' : 'Register'}</h1><p>${mode === 'login' ? 'Access your dashboard securely' : 'Create your account to continue'}</p>`;
    shell.appendChild(header);

    const errorBox = document.createElement('div');
    errorBox.className = 'error-box';
    const successBox = document.createElement('div');
    successBox.className = 'success-box';
    shell.appendChild(errorBox);
    shell.appendChild(successBox);

    const form = document.createElement('form');
    form.className = 'form-grid';
    const fields = mode === 'login' ? cfg.loginFields : cfg.registerFields;
    fields.forEach(f => form.appendChild(buildField(f)));

    // OTP UI (only shown during login second step)
    const otpInfo = document.createElement('div');
    otpInfo.className = 'info-box';
    otpInfo.style.display = 'none';
    form.appendChild(otpInfo);

    const otpGroup = document.createElement('div');
    otpGroup.className = 'form-field';
    otpGroup.style.display = 'none';
    const otpLabel = document.createElement('label');
    otpLabel.setAttribute('for', 'otp');
    otpLabel.textContent = 'Enter OTP';
    const otpInput = document.createElement('input');
    otpInput.name = 'otp';
    otpInput.id = 'otp';
    otpInput.type = 'text';
    otpInput.placeholder = '6-digit OTP';
    otpInput.pattern = '\\d{6}';
    otpInput.inputMode = 'numeric';
    otpGroup.appendChild(otpLabel);
    otpGroup.appendChild(otpInput);
    form.appendChild(otpGroup);

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'primary-btn';
    submit.textContent = mode === 'login' ? 'Login' : 'Register';
    form.appendChild(submit);

    let otpState = null;
    const resetOtpStage = () => {
      otpState = null;
      otpInfo.style.display = 'none';
      otpGroup.style.display = 'none';
      otpInput.value = '';
      submit.textContent = 'Login';
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errorBox.style.display = 'none';
      successBox.style.display = 'none';
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((v, k) => payload[k] = v.trim());

      if (mode === 'login') {
        const key = cfg.uniqueField;

        // Stage 1: validate credentials and send OTP
        if (!otpState) {
          delete payload.otp;
          const users = AuthStore.getUsers(role);
          const candidate = users.find(u => (u[key] || '').toLowerCase() === (payload[key] || '').toLowerCase());
          if (!candidate) { errorBox.textContent = `${cfg.label} not found`; errorBox.style.display = 'block'; return; }
          if (candidate.password !== payload.password) { errorBox.textContent = 'Incorrect password'; errorBox.style.display = 'block'; return; }

          const generated = String(Math.floor(100000 + Math.random() * 900000));
          otpState = { user: candidate, otp: generated };
          otpInfo.innerHTML = `OTP sent (demo): <strong>${generated}</strong> · <button type="button" class="link-btn" id="edit-creds">Edit details</button>`;
          alert(`Your OTP is ${generated}`);
          otpInfo.style.display = 'block';
          otpGroup.style.display = 'block';
          submit.textContent = 'Verify OTP';
          successBox.textContent = 'Enter the OTP shown above to complete login.';
          successBox.style.display = 'block';
          const editBtn = otpInfo.querySelector('#edit-creds');
          if (editBtn) editBtn.onclick = () => resetOtpStage();
          return;
        }

        // Stage 2: verify OTP and finish login
        if ((payload.otp || '') !== otpState.otp) {
          errorBox.textContent = 'Invalid OTP. Please try again.';
          errorBox.style.display = 'block';
          return;
        }
        AuthSession.set({ role, name: otpState.user.name, identifier: otpState.user[key], dashboard: cfg.dashboard });
        successBox.textContent = 'Login successful. Redirecting...';
        successBox.style.display = 'block';
        setTimeout(() => window.location.href = cfg.dashboard, 600);
      } else {
        const res = registerUser(role, payload);
        if (!res.ok) { errorBox.textContent = res.error; errorBox.style.display = 'block'; return; }
        successBox.textContent = 'Registration successful. You can login now.';
        successBox.style.display = 'block';
        setTimeout(() => window.location.href = cfg.loginPage, 800);
      }
    });

    shell.appendChild(form);

    const alt = document.createElement('div');
    alt.className = 'alt-link';
    if (mode === 'login') {
      alt.innerHTML = `New here? <a href="${cfg.registerPage}">Register</a>`;
    } else {
      alt.innerHTML = `Already registered? <a href="${cfg.loginPage}">Login</a>`;
    }
    shell.appendChild(alt);

    const back = document.createElement('a');
    back.className = 'back-link';
    back.href = 'index.html';
    back.textContent = '← Back to Home';
    shell.appendChild(back);

    mount.appendChild(shell);
  },

  attachProfileMenu({ container = document.body } = {}) {
    const session = AuthSession.get();
    if (!session) return;
    const cfg = AUTH_CONFIG[session.role];
    const wrapper = document.createElement('div');
    wrapper.className = 'profile-menu';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'profile-trigger';
    const avatar = document.createElement('div');
    avatar.className = 'profile-avatar';
    avatar.textContent = (session.name || cfg?.label || 'U').slice(0, 2).toUpperCase();
    const name = document.createElement('div');
    name.className = 'profile-name';
    name.textContent = session.name || cfg?.label || 'User';
    trigger.appendChild(avatar);
    trigger.appendChild(name);

    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    const profileLink = document.createElement('a');
    profileLink.href = '#';
    profileLink.textContent = 'Profile';
    const settingsLink = document.createElement('a');
    settingsLink.href = '#';
    settingsLink.textContent = 'Settings';
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';

    logoutBtn.addEventListener('click', () => {
      AuthSession.clear();
      window.location.href = cfg?.loginPage || 'index.html';
    });

    dropdown.appendChild(profileLink);
    dropdown.appendChild(settingsLink);
    dropdown.appendChild(logoutBtn);

    trigger.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) dropdown.style.display = 'none';
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
    container.appendChild(wrapper);
  }
};

// Expose to global
window.AuthConfig = AUTH_CONFIG;
window.AuthUI = AuthUI;
window.AuthSession = AuthSession;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.requireAuth = requireAuth;
