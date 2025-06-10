import { assignCase, updateCaseStatus, requestManagementAssistance } from './github-api.js';

// DOM elements
const assignModal = document.getElementById('assign-modal');
const statusModal = document.getElementById('status-modal');
const managementModal = document.getElementById('management-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const agentSelect = document.getElementById('agent-select');
const statusSelect = document.getElementById('status-select');
const confirmAssign = document.getElementById('confirm-assign');
const confirmStatus = document.getElementById('confirm-status');
const confirmManagement = document.getElementById('confirm-management');
const managementReason = document.getElementById('management-reason');

// Current case being modified
let currentCase = null;

// List of agents (would normally come from your GitHub labels)
const AGENTS = [
  'Anthony Smith',
  'Tiffany Moore',
  'Alex Collado',
  'Luz Fernandez',
  'Alex Kim'
];

// Initialize modals
function initModals() {
  // Populate agent select
  agentSelect.innerHTML = '<option value="">Select Agent</option>';
  AGENTS.forEach(agent => {
    agentSelect.innerHTML += `<option value="${agent}">${agent}</option>`;
  });
  
  // Close modal buttons
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      assignModal.classList.add('hidden');
      statusModal.classList.add('hidden');
      managementModal.classList.add('hidden');
    });
  });
  
  // Confirm assign
  confirmAssign.addEventListener('click', async () => {
    if (!currentCase || !agentSelect.value) return;
    
    try {
      await assignCase(currentCase.number, agentSelect.value);
      window.location.reload();
    } catch (error) {
      console.error('Error assigning case:', error);
      alert('Failed to assign case. Please try again.');
    }
  });
  
  // Confirm status
  confirmStatus.addEventListener('click', async () => {
    if (!currentCase || !statusSelect.value) return;
    
    try {
      await updateCaseStatus(currentCase.number, statusSelect.value);
      window.location.reload();
    } catch (error) {
      console.error('Error updating case status:', error);
      alert('Failed to update case status. Please try again.');
    }
  });
  
  // Confirm management
  confirmManagement.addEventListener('click', async () => {
    if (!currentCase || !managementReason.value) {
      alert('Please provide a reason for management assistance');
      return;
    }
    
    try {
      await requestManagementAssistance(currentCase.number, managementReason.value);
      window.location.reload();
    } catch (error) {
      console.error('Error requesting management assistance:', error);
      alert('Failed to submit management request. Please try again.');
    }
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === assignModal) assignModal.classList.add('hidden');
    if (event.target === statusModal) statusModal.classList.add('hidden');
    if (event.target === managementModal) managementModal.classList.add('hidden');
  });
}

// Open assign modal
function openAssignModal(case) {
  currentCase = case;
  assignModal.classList.remove('hidden');
}

// Open status modal
function openStatusModal(case) {
  currentCase = case;
  statusModal.classList.remove('hidden');
}

// Open management modal
function openManagementModal(case) {
  currentCase = case;
  managementReason.value = '';
  managementModal.classList.remove('hidden');
}

// Initialize the cases module
export function initCases() {
  initModals();
  
  // Make functions available globally (for inline event handlers)
  window.openAssignModal = openAssignModal;
  window.openStatusModal = openStatusModal;
  window.openManagementModal = openManagementModal;
}