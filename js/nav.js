// KEBERA - Nav & Auth helper

function createPinModal() {
  if (document.getElementById('pin-modal')) return;
  const html = `
    <div id="pin-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);align-items:center;justify-content:center">
      <div style="background:rgba(20,20,35,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;width:320px;text-align:center">
        <h3 style="margin-bottom:8px">🔐 Admin Access</h3>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:20px">Enter your 4-digit PIN</p>
        <input id="pin-input" type="password" maxlength="4" inputmode="numeric" pattern="[0-9]*" style="width:100%;padding:14px;font-size:24px;text-align:center;letter-spacing:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-family:monospace;outline:none">
        <div style="display:flex;gap:8px;margin-top:16px">
          <button id="pin-cancel" style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;cursor:pointer;font-size:14px">Cancel</button>
          <button id="pin-submit" style="flex:1;padding:10px;background:linear-gradient(135deg,#c084fc,#7c3aed);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:14px;font-weight:600">Enter</button>
        </div>
        <p id="pin-error" style="color:#f44336;font-size:12px;margin-top:12px;display:none">Incorrect PIN. Access denied.</p>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('pin-cancel').onclick = () => {
    document.getElementById('pin-modal').style.display = 'none';
    document.getElementById('pin-error').style.display = 'none';
    document.getElementById('pin-input').value = '';
  };
  document.getElementById('pin-submit').onclick = handlePinSubmit;
  document.getElementById('pin-input').oninput = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  };
  document.getElementById('pin-input').onkeydown = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };
  document.getElementById('pin-input').onkeyup = (e) => {
    if (e.key === 'Enter') handlePinSubmit();
  };
}

let pinRedirectUrl = '';

async function handlePinSubmit() {
  const input = document.getElementById('pin-input');
  const error = document.getElementById('pin-error');
  const pin = input.value.trim();
  if (pin.length !== 4) { error.textContent = 'Enter exactly 4 digits.'; error.style.display = 'block'; return; }
  const ok = await verifyAdminPin(pin);
  if (ok) {
    document.getElementById('pin-modal').style.display = 'none';
    input.value = '';
    error.style.display = 'none';
    window.location.href = pinRedirectUrl;
  } else {
    error.textContent = 'Incorrect PIN. Access denied.';
    error.style.display = 'block';
    input.value = '';
    input.focus();
  }
}

async function initNav() {
  const session = await getSession();
  const user = await getUser();
  const navAuth = document.getElementById('nav-auth');
  const navAdmin = document.getElementById('nav-admin');

  // Auth link (Sign In / Sign Out)
  if (session && user) {
    if (navAuth) {
      navAuth.textContent = 'Sign Out';
      navAuth.href = '#';
      navAuth.onclick = async (e) => {
        e.preventDefault();
        await signOut();
        window.location.href = 'index.html';
      };
    }
  } else {
    if (navAuth) {
      navAuth.textContent = 'Sign In';
      navAuth.href = 'login.html';
      navAuth.onclick = null;
    }
  }

  // Admin link (only visible if admin, PIN required on click)
  if (navAdmin) {
    if (session && user && await isAdminEmail(user.email)) {
      navAdmin.style.display = '';
      navAdmin.onclick = async (e) => {
        e.preventDefault();
        createPinModal();
        pinRedirectUrl = navAdmin.getAttribute('href');
        const modal = document.getElementById('pin-modal');
        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('pin-input').focus(), 100);
      };
    } else {
      navAdmin.style.display = 'none';
    }
  }

  // Load logo from settings
  const settings = await loadSettingsFromDB();
  if (settings && settings.logo_url && settings.logo_url.url) {
    const logoImg = document.getElementById('nav-logo-img');
    const logoText = document.getElementById('nav-logo-text');
    if (logoImg && logoText) {
      logoImg.src = settings.logo_url.url;
      logoImg.style.display = 'block';
      logoText.style.display = 'none';
    }
  }
}
