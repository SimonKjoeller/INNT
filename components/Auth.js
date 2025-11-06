import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../database/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get, onValue, off, serverTimestamp as _serverTimestamp } from 'firebase/database';

const AuthContext = createContext();


  // Auth context provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user object eller null
  const [profile, setProfile] = useState(null); // Brugerprofil fra RTDB
  const [username, setUsername] = useState(null); // Simpel adgang til brugernavn

  // initializing starter som true = app’en er i “første load / tjekker login-status”.
  // setInitializing(false) kaldes, når du har fået svar fra Firebase om der er en bruger eller ej.
  // Bruges typisk til at vise en “Loading…”-skærm, indtil status er kendt.
  const [initializing, setInitializing] = useState(true); // Første loading state
  const [error, setError] = useState(null); // Simpelt error state
  const [loadingAction, setLoadingAction] = useState(false); // Login/signup in progress



  // Lytter på auth state ændringer (login/logout/persistens)

  // Den sætter en “lytter” på Firebase-login.
  // Hver gang du logger ind/ud (eller app’en finder en gemt session), 
    // opdaterer den user og slår initializing fra første gang der kommer svar.
  // Når komponenten forsvinder, fjerner den lytteren igen.

  // Målet er, at app’en altid ved om der er en bruger logget ind eller ej – 
    // også når den starter op og tjekker en gemt session.
  // Så du kan vise det rigtige indhold: f.eks. “Loading…” mens du venter, 
    // login-skærm hvis ingen er logget ind, eller brugerens dashboard hvis de er.
  useEffect(() => {
    // Lytteren får besked fra Firebase når:
    // 1) App starter og den tjekker om en bruger-session ligger gemt (cached/persistent)
    // 2) Bruger logger ind
    // 3) Bruger logger ud
    // 4) Token fornyes i baggrunden

    // Hver gang den får besked, kaldes denne funktion med bruger-objektet (eller null)
    const handleAuthChange = (firebaseUser) => {
      // Gem hele Firebase user objektet (eller null ved logout)
      setUser(firebaseUser || null);
      // Når vi har fået første svar, er initial load færdig
      setInitializing(false);
    };

    // Opret lytteren – returnerer en unsubscribe-funktion
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    // Oprydning: fjern lytter når component unmountes
    return () => {
      unsubscribe();
    };
  }, []); // Tom dependency array: vi skal kun sætte lytteren én gang
  // Hent og hold profil/brugernavn opdateret i realtime når bruger ændres
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setUsername(null);
      return;
    }
    const userRef = ref(db, `users/${user.uid}`);
    const handler = (snap) => {
      const val = snap.exists() ? snap.val() : null;
      setProfile(val);
      // Brug rækkefølge: RTDB username -> RTDB displayName -> Auth displayName
      const name = val?.username || val?.displayName || user.displayName || null;
      setUsername(name);
    };
    onValue(userRef, handler);
    return () => off(userRef, 'value', handler);
  }, [user?.uid]);







  // Signup funktion
  const signup = useCallback(async ({ email, password, username }) => {
    setError(null);
    setLoadingAction(true);
    try {
      const usernameKey = (username || '').trim().toLowerCase();
      if (!usernameKey) {
        throw new Error('Please choose a username.');
      }
      // Tjek om brugernavn er ledigt
      const usernameRef = ref(db, `usernames/${usernameKey}`);
      const usernameSnap = await get(usernameRef);
      if (usernameSnap.exists()) {
        throw new Error('Username already taken.');
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Sæt displayName til det valgte brugernavn
      if (cred.user) {
        await updateProfile(cred.user, { displayName: usernameKey });
      }
      // Opret bruger i RTDB: map brugernavn -> uid og gem profil både pr. username og pr. uid
      try {
        // Inkluder eksplicit username_lower for entydig, case-insensitiv søgning
        const profile = {
          uid: cred.user.uid,
          email: cred.user.email,
          username: usernameKey,
          username_lower: usernameKey, // <-- tilføjet
          displayName: usernameKey,
          createdAt: Date.now(),
          stats: {
            posts: 0,
            likes: 0,
            level: 0,
          },
        };
        // reservation af brugernavn (key er allerede lowercase)
        await set(ref(db, `usernames/${usernameKey}`), { uid: cred.user.uid, createdAt: Date.now() });
        // profil gemt pr. brugernavn (inkl. username_lower)
        await set(ref(db, `usersByUsername/${usernameKey}`), profile);
        // profil gemt pr. uid (inkl. username_lower) for kompatibilitet
        await set(ref(db, `users/${cred.user.uid}`), profile);
      } catch (writeErr) {
        console.log('Realtime DB user write failed:', writeErr.message);
      }
      return cred.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoadingAction(false);
    }
  }, []);






  // Login funktion
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setLoadingAction(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoadingAction(false);
    }
  }, []);



  // Logout funktion
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (e) {
      setError(e.message);
    }
  }, []);



  // Auth context value
  const value = {
    user,
    profile,
    username,
    initializing,
    error,
    loadingAction,
    signup,
    login,
    logout,
  }; 



  // Auth context provider
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
