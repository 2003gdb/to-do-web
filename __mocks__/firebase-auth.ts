// Manual mock for `firebase/auth` so tests don't pull the Node SDK (which
// requires global fetch/Response).
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const onIdTokenChanged = jest.fn(() => () => undefined);
export const onAuthStateChanged = jest.fn(() => () => undefined);
export const getAuth = jest.fn(() => ({ name: "auth-mock" }));
export const setPersistence = jest.fn(() => Promise.resolve());
export const browserLocalPersistence = { kind: "local" };
export type User = { uid: string; email?: string; displayName?: string };
