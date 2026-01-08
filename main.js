// ==== AUTH0 CONFIG (SAFE TO EXPOSE) ====
const auth0Config = {
  domain: 'dev-no3wf8qje06y7gdv.us.auth0.com/',
  clientId: 'kKUL0au1891gf9jqsjiMsASDURKA1JkT',
  audience: 'https://zurge.'
};

let auth0 = null;

const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const profileEl = document.getElementById('profile');

// Initialize Auth0
async function init() {
  auth0 = await auth0.createAuth0Client({
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: auth0Config.audience
    }
  });

  // Handle redirect from Auth0
  if (window.location.search.includes('code=')) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/');
  }

  updateUI();
}

async function updateUI() {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';

    const user = await auth0.getUser();
    profileEl.textContent = JSON.stringify(user, null, 2);

    callWorker();
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    profileEl.textContent = '';
  }
}

loginBtn.onclick = () => auth0.loginWithRedirect();

logoutBtn.onclick = () =>
  auth0.logout({
    logoutParams: { returnTo: window.location.origin }
  });

// Call Cloudflare Worker
async function callWorker() {
  const token = await auth0.getTokenSilently();

  const res = await fetch('https://YOUR_WORKER.workers.dev/protected', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(await res.text());
}

init();
