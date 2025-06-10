// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_REDIRECT_URI = 'YOUR_REDIRECT_URI';
const GITHUB_SCOPE = 'repo';

// DOM elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const usernameSpan = document.getElementById('username');

// Check for OAuth callback
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    exchangeCodeForToken(code);
  } else if (localStorage.getItem('github_token')) {
    showUserInfo();
    loadDashboard();
  }
});

// Login button click handler
loginBtn.addEventListener('click', () => {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${GITHUB_SCOPE}`;
  window.location.href = authUrl;
});

// Logout button click handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_user');
  window.location.href = window.location.pathname;
});

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('https://your-backend-service.com/github-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI
      })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      localStorage.setItem('github_token', data.access_token);
      localStorage.setItem('github_user', JSON.stringify(data.user));
      window.location.href = window.location.pathname;
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
  }
}

// Show user info when logged in
function showUserInfo() {
  const user = JSON.parse(localStorage.getItem('github_user'));
  
  loginBtn.classList.add('hidden');
  userInfo.classList.remove('hidden');
  
  userAvatar.src = user.avatar_url;
  usernameSpan.textContent = user.login;
}

// Get GitHub access token
export function getGitHubToken() {
  return localStorage.getItem('github_token');
}