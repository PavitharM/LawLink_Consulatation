import { createContext } from 'react';

/** Current session: `{ user, role, setAuth(user, role, token?) }`. */
export const AuthContext = createContext({ user: null, role: null, setAuth: () => {} });
