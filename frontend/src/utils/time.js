/** "Just now", "5m ago", "3h ago", "2d ago", then a short date. */
export const relativeTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
