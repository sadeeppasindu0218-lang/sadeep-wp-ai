// KEBERA - Nav & Auth helper
// Include after supabase.js and config.js

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
        window.location.reload();
      };
    }
  } else {
    if (navAuth) {
      navAuth.textContent = 'Sign In';
      navAuth.href = 'login.html';
      navAuth.onclick = null;
    }
  }

  // Admin link (only visible if admin)
  if (navAdmin) {
    if (session && user && await isAdminEmail(user.email)) {
      navAdmin.style.display = '';
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
