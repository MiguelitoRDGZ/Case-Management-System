// Utility functions

// Format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get label class based on type
export function getLabelClass(labelName) {
  if (labelName.startsWith('status:')) {
    return `label-status-${labelName.replace('status:', '')}`;
  }
  if (labelName.startsWith('agent:')) {
    return 'label-agent';
  }
  if (labelName === 'management:requested') {
    return 'label-management';
  }
  return '';
}

// Get label display name
export function getLabelDisplayName(labelName) {
  if (labelName.startsWith('status:')) {
    return labelName.replace('status:', '');
  }
  if (labelName.startsWith('agent:')) {
    return labelName.replace('agent:', '');
  }
  return labelName;
}

// Debounce function for performance
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}