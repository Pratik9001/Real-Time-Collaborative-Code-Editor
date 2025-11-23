// Pre-defined color palette for user cursors and avatars
export const USER_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B739', // Orange
  '#52C777'  // Emerald
];

// Generate a consistent color for a user based on their ID
export const getUserColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

// Generate initials from display name or username
export const getUserInitials = (displayName?: string, username?: string): string => {
  const name = displayName || username || 'User';
  const parts = name.trim().split(' ');

  if (parts.length >= 2) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  } else {
    return name.substring(0, Math.min(2, name.length)).toUpperCase();
  }
};