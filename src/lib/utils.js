// src/lib/utils.js

/**
 * Format large numbers with Indian numbering system
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-'
  
  const d = new Date(date)
  
  if (includeTime) {
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Calculate days ago from a date
 * @param {Date|string} date - Date to calculate from
 * @returns {number} Number of days ago
 */
export function daysAgo(date) {
  if (!date) return 0
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Get relative time string (e.g., "2 days ago", "just now")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '-'
  
  const days = daysAgo(date)
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

/**
 * Get status color for different statuses
 * @param {string} status - Status string
 * @returns {Object} Tailwind color classes
 */
export function getStatusColor(status) {
  const colors = {
    uploaded: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-500',
    },
    scheduled: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-500',
    },
    delayed: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-500',
    },
    active: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-500',
    },
    completed: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-500',
    },
  }
  
  return colors[status] || colors.active
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generate a random color for avatars/placeholders
 * @param {string} str - String to generate color from
 * @returns {string} Hex color code
 */
export function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return '#' + '00000'.substring(0, 6 - c.length) + c
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  if (!date) return false
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Get day name from date
 * @param {Date|string} date - Date to get day from
 * @returns {string} Day name (e.g., "Monday")
 */
export function getDayName(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function getPercentage(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}