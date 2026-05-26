import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import api from "./apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import type { RegisterUserDto } from "@/types/todo";

export async function login(email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  localStorage.setItem("token", token);
  const store = useAuthStore.getState();
  store.setUser(cred.user);
  store.setToken(token);
  store.setHydrated(true);
  return { user: cred.user, token };
}

export async function register(dto: RegisterUserDto) {
  try {
    await api.post("/users", dto);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    // Already exists in backend: proceed to login. Other backend errors propagate.
    if (status !== 409) throw err;
  }
  return login(dto.email, dto.password);
}

export async function logout() {
  const auth = getFirebaseAuth();
  await signOut(auth);
  localStorage.removeItem("token");
  useAuthStore.getState().reset();
}

export function subscribeAuth(cb: (user: User | null, token: string | null) => void) {
  const auth = getFirebaseAuth();
  return onIdTokenChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      cb(user, token);
    } else {
      localStorage.removeItem("token");
      cb(null, null);
    }
  });
}

export function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong email or password.";
    case "auth/email-already-in-use":
      return "Email is already registered.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return (err as Error)?.message ?? "Something went wrong.";
  }
}
