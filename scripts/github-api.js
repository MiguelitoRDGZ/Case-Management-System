const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'YOUR_GITHUB_USERNAME';
const REPO_NAME = 'YOUR_REPO_NAME';

// Get all issues (cases)
export async function getCases() {
  const token = getGitHubToken();
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
}

// Assign case to agent
export async function assignCase(issueNumber, agentName) {
  const token = getGitHubToken();
  
  try {
    // Get current labels
    const issueResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const issue = await issueResponse.json();
    
    // Filter out existing agent labels and status:open
    const currentLabels = issue.labels
      .filter(label => !label.name.startsWith('agent:'))
      .filter(label => label.name !== 'status:open')
      .map(label => label.name);
    
    // Add new agent label and status:assigned
    const newLabels = [...currentLabels, `agent:${agentName}`, 'status:assigned'];
    
    // Update issue with new labels
    const updateResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labels: newLabels
      })
    });
    
    return await updateResponse.json();
  } catch (error) {
    console.error('Error assigning case:', error);
    throw error;
  }
}

// Update case status
export async function updateCaseStatus(issueNumber, status) {
  const token = getGitHubToken();
  
  try {
    // Get current labels
    const issueResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const issue = await issueResponse.json();
    
    // Filter out existing status labels
    const currentLabels = issue.labels
      .filter(label => !label.name.startsWith('status:'))
      .map(label => label.name);
    
    // Add new status label
    const newLabels = [...currentLabels, `status:${status}`];
    
    // Update issue with new labels
    const updateResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labels: newLabels
      })
    });
    
    return await updateResponse.json();
  } catch (error) {
    console.error('Error updating case status:', error);
    throw error;
  }
}

// Request management assistance
export async function requestManagementAssistance(issueNumber, reason) {
  const token = getGitHubToken();
  
  try {
    // Add management:requested label
    const labelResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labels: ['management:requested']
      })
    });
    
    // Add comment with the reason
    const commentResponse = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        body: `**Management Assistance Requested**: ${reason}`
      })
    });
    
    return {
      issue: await labelResponse.json(),
      comment: await commentResponse.json()
    };
  } catch (error) {
    console.error('Error requesting management assistance:', error);
    throw error;
  }
}