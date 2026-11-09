import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titles = [
  [/^\/admin\/users/, 'Users'],
  [/^\/admin\/lawyers/, 'Lawyers'],
  [/^\/admin\/complaints/, 'Complaints'],
  [/^\/admin\/packages/, 'Packages'],
  [/^\/admin\/articles/, 'Articles'],
  [/^\/admin\/report/, 'Reports'],
  [/^\/admin\/notifications/, 'Notifications'],
  [/^\/admin\/profile/, 'My Profile'],
  [/^\/admin$/, 'Admin Dashboard'],
  [/^\/user\/complaints\/new/, 'New Complaint'],
  [/^\/user\/complaints\/.+/, 'Complaint Details'],
  [/^\/user\/complaints/, 'My Complaints'],
  [/^\/user\/lawyers/, 'Find a Lawyer'],
  [/^\/user\/packages/, 'Select a Package'],
  [/^\/user\/payment/, 'Payment'],
  [/^\/user\/upload/, 'Upload Documents'],
  [/^\/user\/review/, 'Review'],
  [/^\/user\/notifications/, 'Notifications'],
  [/^\/user\/profile/, 'My Profile'],
  [/^\/user\/consultation/, 'Consultation'],
  [/^\/user$/, 'Dashboard'],
  [/^\/lawyer\/assigned-complaints/, 'Assigned Cases'],
  [/^\/lawyer\/complaint\//, 'Case Review'],
  [/^\/lawyer\/packages/, 'My Packages'],
  [/^\/lawyer\/notifications/, 'Notifications'],
  [/^\/lawyer\/profile/, 'My Profile'],
  [/^\/lawyer$/, 'Lawyer Dashboard'],
  [/^\/login/, 'Sign In'],
  [/^\/register/, 'Create Account'],
  [/^\/forgot-password/, 'Reset Password'],
];

const BASE = 'LawLink';
const HOME = 'LawLink — Accessible Legal Services for Sri Lanka';

/** Keeps the browser tab title in sync with the current route. */
export default function useDocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/') { document.title = HOME; return; }
    const match = titles.find(([re]) => re.test(pathname));
    document.title = match ? `${match[1]} · ${BASE}` : `Page Not Found · ${BASE}`;
  }, [pathname]);
}
