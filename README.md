## 📁 Mappestruktur

```
INNT/
├── App.js                     # Hovedapplikation og entry point
├── assets/                    # Billeder, ikoner og statiske filer
│   ├── *.jpg                  # Spil cover billeder
│   └── ...
├── components/                # Genanvendelige UI komponenter
│   ├── CustomButton.js        # Brugerdefinerede knapper
│   ├── NavigationBar.js       # Navigation komponenter
│   └── ...
├── screens/                   # Applikations sider/skærme
│   ├── HomeScreen.js          # Forside
│   ├── SearchScreen.js        # Søgefunktion
│   ├── LibraryScreen.js       # Brugerens bibliotek
│   ├── ProfileScreen.js       # Brugerprofil
│   ├── TrendingScreen.js      # Trending spil
│   ├── UpcomingScreen.js      # Kommende spil
│   └── ...
├── navigation/                # Navigation logik
│   ├── AppNavigator.js        # Hovednavigation (Tab + Stack)
│   └── TabNavigation.js       # Tab navigation konfiguration
├── data/                      # Data håndtering og database integration
│   ├── userData.js            # Brugerdata funktioner
│   ├── gameData.js            # Spildata og API kald
│   ├── reviewData.js          # Anmeldelser og vurderinger
│   └── databaseConfig.js      # Database konfiguration (Firebase/Supabase)
├── styles/                    # Styling og design
│   ├── globalStyles.js        # Globale styles der bruges overalt
│   ├── homeStyles.js          # Home screen styles
│   ├── navigationStyles.js    # Navigation styling
│   ├── screenStyles.js        # Generelle screen styles
│   └── ...
├── package.json              # Dependencies og scripts
├── babel.config.js           # Babel konfiguration
└── app.json                  # Expo konfiguration
```

## 🏗️ Arkitektur og Sammenhæng

### App.js - Entry Point
`App.js` fungerer som applikationens hovedindgang og:
- Importerer og renderer `AppNavigator`
- Sætter StatusBar styling
- Fungerer som root komponent for hele appen

### Components Mappe
Indeholder **genanvendelige UI komponenter** som:
- Knapper, inputs, cards
- Loading indicators
- Modal komponenter
- Custom headers og footers

### Screens Mappe
Indeholder **komplette skærme/sider** som:
- Importerer komponenter fra `/components`
- Bruger styles fra `/styles`
- Håndterer brugerinteraktion og navigation
- Kalder data funktioner fra `/data`

### Navigation Mappe
Håndterer **routing og navigation** mellem screens:
- `AppNavigator.js`: Hovednavigation (kombinerer Tab + Stack)
- `TabNavigation.js`: Konfiguration af bottom tabs
- Definerer hvilke screens der er tilgængelige hvor

### Data Mappe (Database Integration)
Indeholder **alle data-relaterede funktioner** til jeres valgte database:

## 🔥 Firebase vs Supabase - Hvilken skal I vælge?

Med jeres 400 MB data har I to gode muligheder:

### 🟡 Firebase
**Free Tier:**
- ✅ 1 GB database storage (I har plads!)
- ❌ Daglige læse/skrive begrænsninger (kan være problematisk)
- ❌ Uforudsigelige costs når I scaler
- ✅ Google's infrastruktur og stabilitet

**Pris ved opgradering:** Pay-as-you-go (kan blive dyrt)

### 🟢 Supabase (ANBEFALET)
**Free Tier:**
- ✅ 500 MB database storage (dækker jeres behov)
- ✅ PostgreSQL (relational database - bedre for komplekse data)
- ✅ Forudsigelige costs ($25/måned ved opgradering)
- ✅ Open source og moderne
- ✅ Nemmere at integrere med React

### 🎯 ANBEFALING: Gå med Supabase!

**Hvorfor?**
1. **Billigere og mere forudsigelig** pricing
2. **PostgreSQL** er bedre til gaming data (relationer mellem spil, users, reviews)
3. **500 MB** er rigeligt til jeres nuværende data
4. **Modern stack** og bedre developer experience
5. **Nem at integrere** med React Native

### 📦 Er det omfattende at skifte til Supabase?

**NEJ! Det er faktisk nemt:**

### Styles Mappe
Indeholder **styling for hele appen**:
- `globalStyles.js`: Farver, fonts, fælles elementer
- Individuelle style filer for hver screen
- Navigation og komponent styling



## Sådan arbejder mapperne sammen:

1. **App.js** starter appen og viser navigationerne
2. **navigation** bestemmer hvilke screen der vises
3. **Screens** bruger components til at bygge UI
4. **Components** får styling fra styles mappen
6. **Data funktioner** kommunikerer med Firebase
7. **Styles** sørger for ensartet design på tværs af appen