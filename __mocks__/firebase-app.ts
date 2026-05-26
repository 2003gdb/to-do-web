export const initializeApp = jest.fn(() => ({ name: "app-mock" }));
export const getApps = jest.fn(() => [] as Array<{ name: string }>);
export const getApp = jest.fn(() => ({ name: "app-mock" }));
export type FirebaseApp = { name: string };
