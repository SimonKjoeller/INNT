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
/**
 * Overblik over Auth-arkitekturen
 *
 * - "user": Rå Firebase Auth-bruger (token, uid, displayName m.m.).
 * - "profile": Udvidet brugerprofil hentet fra Realtime Database (RTDB) under `users/<uid>`.
 * - "username": Praktisk, afledt felt til visning/søgning; hentes i rækkefølgen RTDB.username -> RTDB.displayName -> Auth.displayName.
 * - "initializing": True indtil første auth-state er modtaget; brug det til at gate UI (fx Loading vs. Login).
 * - "error"/"loadingAction": Simpele UI-flags til at vise fejl eller spindere under login/signup.
 *
 * Livscyklus & lyttere
 * - Vi sætter én auth-lytter (onAuthStateChanged). Den holder "user" opdateret og slår initializing fra.
 * - Når "user" skifter, sætter vi en RTDB-lytter på `users/<uid>` for at få live profilændringer.
 * - Alle lyttere ryddes op (unsubscribe/off) i cleanup for at undgå memory leaks.
 *
 * Datamodellen
 * - Unikt brugernavn reserveres under `usernames/<username_lower>` for hurtig konflikt-tjek.
 * - Profiler gemmes både under `users/<uid>` og `usersByUsername/<username_lower>` for fleksibel opslag.
 * - Feltet `username_lower` gemmes eksplicit for case-insensitive søgning og indexering i Firebase rules.
 */


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
  // Bemærk: Disse UI-states er lokalt for AuthProvider. Andre skærme bør bruge dem via context
  // (fx til at disable knapper eller vise fejl), men undgå at lave egne kopier af dem.



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
    // Dyb forklaring:
    // onAuthStateChanged er en global observer på auth-sessions.
    // Den fyres ved app-start (for cached session), login, logout og token-refresh.
    // Vi gemmer hele brugerobjektet, da det indeholder nyttig metadata (uid/displayName) og token-håndtering.
    // Når første hændelse er modtaget, er app’en ikke længere i "initializing"-tilstand.
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
    // Dyb forklaring:
    // RTDB-lytteren giver realtidsopdateringer af profilfelter (fx displayName, stats).
    // Ved logout (ingen uid) nulstiller vi profil/username for at undgå stale data.
    // Vi afleder "username" i denne lytter for at centralisere logikken ét sted.
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
    // Dyb forklaring:
    // 1) Valider og normaliser brugernavn til lowercase ("usernameKey").
    // 2) Tjek unikhed under `usernames/<usernameKey>` for at undgå kollisioner.
    // 3) Opret auth-bruger og opdater displayName for enkel visning.
    // 4) Skriv profil flere steder i RTDB (pr. username og pr. uid) for fleksibel opslag.
    // 5) Inkludér `username_lower` for effektiv prefix-søgning (kræver index i rules).
    // NB: `serverTimestamp` (importeret som `_serverTimestamp`) kan bruges hvis du vil have
    //     serverside-tidsstempler i stedet for clientens `Date.now()`. Her bruges client-tid.
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
    // Simpel login-wrapper omkring Firebase Auth.
    // Ved succes opdateres auth-lytter automatisk (user + initializing=false).
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
    // Logger brugeren ud. RTDB-lytteren vil blive afregistreret af effect ovenfor
    // når `user?.uid` bliver null, og UI kan reagere (fx gå til login-skærm).
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
  // Best practice for forbrug:
  // - Brug `useAuth()` i skærme/komponenter for at hente disse værdier.
  // - Tjek `initializing` før du viser privat indhold.
  // - Brug `error`/`loadingAction` til at styre UI-feedback under auth-handlinger.



  // Auth context provider
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// Hook-brug:
// - Kald `const { user, profile, username, signup, login, logout } = useAuth();`
// - Undgå at kalde hooks betinget; wrap betinget rendering rundt om brugen af værdierne.
// - Del ikke `value` via andre contexts for at undgå desynkronisering; brug denne ene kilde.
