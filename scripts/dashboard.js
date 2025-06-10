import { getCases } from './github-api.js';

// DOM elements
const statsElements = {
  totalCases: document.getElementById('total-cases').querySelector('.stat-value'),
  openCases: document.getElementById('open-cases').querySelector('.stat-value'),
  assignedCases: document.getElementById('assigned-cases').querySelector('.stat-value'),
  managementRequests: document.getElementById('management-requests').querySelector('.stat-value')
};

const casesContainer = document.getElementById('cases-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const caseDetailView = document.getElementById('case-detail-view');
const dashboardView = document.getElementById('dashboard-view');
const backButton = document.getElementById('back-to-dashboard');

// Current view state
let currentView = 'all-cases';
let currentUser = null;

// Initialize dashboard
export async function loadDashboard() {
  try {
    const cases = await getCases();
    updateStats(cases);
    renderCases(cases);
    
    // Set up tab click handlers
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentView = button.dataset.view;
        renderCases(cases);
      });
    });
    
    // Set up back button
    backButton.addEventListener('click', () => {
      caseDetailView.classList.add('hidden');
      dashboardView.classList.remove('hidden');
    });
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    casesContainer.innerHTML = `<div class="error">Error loading cases. Please try again.</div>`;
  }
}

// Update statistics
function updateStats(cases) {
  const totalCases = cases.length;
  const openCases = cases.filter(case => 
    case.labels.some(label => label.name === 'status:open')).length;
  const assignedCases = cases.filter(case => 
    case.labels.some(label => label.name.startsWith('agent:'))).length;
  const managementRequests = cases.filter(case => 
    case.labels.some(label => label.name === 'management:requested')).length;
  
  statsElements.totalCases.textContent = totalCases;
  statsElements.openCases.textContent = openCases;
  statsElements.assignedCases.textContent = assignedCases;
  statsElements.managementRequests.textContent = managementRequests;
}

// Render cases based on current view
function renderCases(cases) {
  casesContainer.innerHTML = '';
  
  let filteredCases = [];
  
  switch (currentView) {
    case 'all-cases':
      filteredCases = cases;
      break;
    case 'my-cases':
      const user = JSON.parse(localStorage.getItem('github_user'));
      filteredCases = cases.filter(case => 
        case.labels.some(label => label.name === `agent:${user.login}`));
      break;
    case 'management':
      filteredCases = cases.filter(case => 
        case.labels.some(label => label.name === 'management:requested'));
      break;
  }
  
  if (filteredCases.length === 0) {
    casesContainer.innerHTML = `<div class="empty-state">No cases found for this view.</div>`;
    return;
  }
  
  filteredCases.forEach(case => {
    const caseCard = createCaseCard(case);
    casesContainer.appendChild(caseCard);
  });
}

// Create a case card element
function createCaseCard(case) {
  const card = document.createElement('div');
  card.className = 'case-card';
  card.dataset.id = case.id;
  
  // Get status label
  const statusLabel = case.labels.find(label => label.name.startsWith('status:'))?.name.replace('status:', '') || 'open';
  const agentLabel = case.labels.find(label => label.name.startsWith('agent:'))?.name.replace('agent:', '');
  const isManagementRequest = case.labels.some(label => label.name === 'management:requested');
  
  // Format dates
  const createdAt = new Date(case.created_at).toLocaleDateString();
  const updatedAt = new Date(case.updated_at).toLocaleDateString();
  
  // Create card HTML
  card.innerHTML = `
    <h3>${case.title}</h3>
    <p>${case.body || 'No description provided'}</p>
    
    <div class="case-meta">
      <span>Created: ${createdAt}</span>
      <span>Updated: ${updatedAt}</span>
    </div>
    
    <div class="case-labels">
      <span class="case-label label-status-${statusLabel}">${statusLabel}</span>
      ${agentLabel ? `<span class="case-label label-agent">${agentLabel}</span>` : ''}
      ${isManagementRequest ? `<span class="case-label label-management">Management</span>` : ''}
    </div>
    
    <div class="case-actions">
      <button class="btn btn-secondary btn-view">View Details</button>
      ${!agentLabel ? `<button class="btn btn-primary btn-assign">Assign</button>` : ''}
    </div>
  `;
  
  // Add event listeners
  card.querySelector('.btn-view').addEventListener('click', () => viewCaseDetails(case));
  if (card.querySelector('.btn-assign')) {
    card.querySelector('.btn-assign').addEventListener('click', (e) => {
      e.stopPropagation();
      openAssignModal(case);
    });
  }
  
  return card;
}

// View case details
function viewCaseDetails(case) {
  dashboardView.classList.add('hidden');
  caseDetailView.classList.remove('hidden');
  
  // Format dates
  const createdAt = new Date(case.created_at).toLocaleString();
  const updatedAt = new Date(case.updated_at).toLocaleString();
  
  // Get labels
  const statusLabel = case.labels.find(label => label.name.startsWith('status:'))?.name.replace('status:', '') || 'open';
  const agentLabel = case.labels.find(label => label.name.startsWith('agent:'))?.name.replace('agent:', '');
  const isManagementRequest = case.labels.some(label => label.name === 'management:requested');
  
  // Create details HTML
  document.getElementById('case-detail-content').innerHTML = `
    <div class="case-detail-header">
      <h2>${case.title}</h2>
      <div class="case-labels">
        <span class="case-label label-status-${statusLabel}">${statusLabel}</span>
        ${agentLabel ? `<span class="case-label label-agent">${agentLabel}</span>` : ''}
        ${isManagementRequest ? `<span class="case-label label-management">Management</span>` : ''}
      </div>
    </div>
    
    <div class="case-detail-body">
      <p>${case.body || 'No description provided'}</p>
      
      <div class="case-detail-meta">
        <p><strong>Created:</strong> ${createdAt}</p>
        <p><strong>Last Updated:</strong> ${updatedAt}</p>
        <p><strong>GitHub URL:</strong> <a href="${case.html_url}" target="_blank">View on GitHub</a></p>
      </div>
      
      ${case.comments > 0 ? `<h3>Comments (${case.comments})</h3>` : ''}
      
      <div class="case-detail-actions">
        <button id="btn-update-status" class="btn btn-primary">Update Status</button>
        ${!isManagementRequest ? `<button id="btn-request-management" class="btn btn-secondary">Request Management</button>` : ''}
      </div>
    </div>
  `;
  
  // Add event listeners for detail view buttons
  document.getElementById('btn-update-status').addEventListener('click', () => openStatusModal(case));
  if (document.getElementById('btn-request-management')) {
    document.getElementById('btn-request-management').addEventListener('click', () => openManagementModal(case));
  }
}