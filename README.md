# CoachDeck 🏆

**Aplikacja mobilna i webowa dla trenerów oraz klubów sportowych** — zarządzanie
zawodnikami, treningami i meczami w każdej dyscyplinie. Coś jak *Football Manager*,
ale do realnej pracy trenera, w stylu SportsMango.

Jeden kod źródłowy → działa jako **apka na iOS/Android** i jako **strona www**
(Expo + React Native Web). Development i wersja www są **darmowe**.

## Funkcje (MVP)

- 📊 **Pulpit** — podsumowanie: drużyny, zawodnicy, najbliższe wydarzenia, kontuzje
- 🛡️ **Drużyny** — wiele drużyn i kategorii (Seniorzy, U-15, ...), różne dyscypliny
- 👥 **Zawodnicy** — kadra, profile, atrybuty (kondycja/technika/taktyka/mentalność), status
- 🎯 **Taktyka i skład** (jak Football Manager) — boisko z formacją (4-4-2, 4-3-3, 3-5-2,
  4-2-3-1), ustawianie pierwszej jedenastki na pozycjach i ławki rezerwowych
- 📈 **Statystyki i rozwój** — gole, asysty, minuty, kartki, średnia ocena, forma
  (ostatnie mecze), morale, gotowość na mecz, potencjał, wartość rynkowa, wykres rozwoju
- 🏆 **Liga i wyniki** — dwie zakładki:
  - *Moja liga* — tabela i wyniki Twojej drużyny (dane własne)
  - *Liga zawodowa* — automatyczne tabele i mecze prawdziwych lig z **TheSportsDB**
    (Ekstraklasa, Premier League, La Liga, NBA... + wyszukiwarka lig po kraju)
- 📅 **Kalendarz** — treningi i mecze, grupowane po dniach, dodawanie wydarzeń
- 💰 **Finanse i składki** — składki miesięczne, opłaty za zajęcia/obozy/sprzęt,
  statusy (zapłacone / oczekujące / zaległe), oznaczanie „zapłacono" jednym kliknięciem,
  podsumowanie zebranych i zaległych kwot, historia płatności w profilu zawodnika
- ⚙️ **Więcej** — profil, statystyki, plany treningowe (placeholdery)
- 🏅 **Wielodyscyplinowość** — piłka nożna, koszykówka, siatkówka, piłka ręczna,
  tenis, lekkoatletyka, pływanie, hokej

## Technologia

- [Expo](https://expo.dev) SDK 57 + [Expo Router](https://docs.expo.dev/router/introduction/) (nawigacja plikowa)
- React Native 0.86 + React Native Web
- TypeScript
- Stan aplikacji: React Context (w pamięci) — kolejny krok: darmowa baza (np. Supabase)

## Uruchomienie

```bash
npm install
npm run web       # w przeglądarce
npm run ios       # symulator iOS (wymaga macOS) lub apka Expo Go
npm run android   # emulator Android lub apka Expo Go
```

Najszybciej: `npm run start`, potem zeskanuj kod QR aplikacją **Expo Go** na telefonie.

## Struktura

```
app/                 # ekrany (Expo Router)
  (tabs)/            # zakładki: pulpit, drużyny, kalendarz, zawodnicy, więcej
  team/[id].tsx      # szczegóły drużyny
  player/[id].tsx    # profil zawodnika
  modal.tsx          # dodawanie zawodnika / wydarzenia
components/ui.tsx    # komponenty UI (Card, Badge, StatTile, Avatar, ...)
src/
  theme.ts           # motyw (kolory, odstępy) – tryb jasny/ciemny
  types.ts           # model danych
  data.ts            # dane demonstracyjne + lista dyscyplin
  store.tsx          # magazyn stanu (Context)
```

## Płatności online (Przelewy24) 💳

Aplikacja ma **gotową integrację z Przelewy24** (BLIK, karty, przelewy), uśpioną do
czasu podania kluczy. Bez konfiguracji apka działa w trybie **DEMO** (składki oznaczasz
ręcznie). Po podaniu kluczy pojawia się przycisk **„Zapłać online"**, a potwierdzenia
płatności trafiają automatycznie do aplikacji (webhook P24 → baza → apka).

**Architektura:** aplikacja → funkcja `p24-register` (Supabase) → P24 → webhook
`p24-webhook` (Supabase) weryfikuje płatność → oznacza składkę jako opłaconą.

### Jak uruchomić (checklist)

1. **Supabase** – załóż darmowy projekt na [supabase.com](https://supabase.com).
2. **Baza** – w SQL Editor uruchom `supabase/migrations/0001_init.sql`.
3. **Klient** – skopiuj `.env.example` → `.env` i wpisz `EXPO_PUBLIC_SUPABASE_URL`
   oraz `EXPO_PUBLIC_SUPABASE_ANON_KEY` (z ustawień projektu Supabase → API).
4. **Konto Przelewy24** – zarejestruj się, zdobądź: `MerchantId`, `PosId`, `CRC`,
   `klucz do raportów (API key)`. Na testy użyj **sandboxa** P24.
5. **Sekrety P24 w Supabase** (nie w kodzie!):
   ```bash
   supabase secrets set P24_MERCHANT_ID=xxxxx P24_POS_ID=xxxxx \
     P24_CRC=xxxxx P24_API_KEY=xxxxx P24_SANDBOX=true
   ```
6. **Wdróż funkcje brzegowe:**
   ```bash
   supabase functions deploy p24-register
   supabase functions deploy p24-webhook --no-verify-jwt   # webhook musi być publiczny
   ```
7. **Test na sandboxie** – kliknij „Zapłać online", opłać testowo, sprawdź, że składka
   zmienia status na „Zapłacone".
8. **Produkcja** – ustaw `P24_SANDBOX=false` i wdróż funkcje ponownie.

> Prowizja P24 to ok. 1,9% od wpłaty. Development na sandboxie jest darmowy.

Pliki integracji:
```
src/config.ts                          # odczyt kluczy (EXPO_PUBLIC_*)
src/supabase.ts                        # klient + mapowanie danych
src/payments/online.ts                 # start płatności z aplikacji
supabase/migrations/0001_init.sql      # schemat bazy + RLS + dane startowe
supabase/functions/_shared/p24.ts      # podpisy SHA-384 + weryfikacja
supabase/functions/p24-register/       # rejestracja transakcji
supabase/functions/p24-webhook/        # webhook: potwierdzenie płatności
```

## Ligi zawodowe (TheSportsDB) 🏟️

Zakładka *Liga zawodowa* pobiera prawdziwe tabele i wyniki z
[TheSportsDB](https://www.thesportsdb.com). Działa na darmowym kluczu testowym `123`,
ale ma on ograniczenia (część endpointów, np. tabela/mecze, bywa limitowana).

**Dla pełnej niezawodności** załóż własny klucz (Patreon TheSportsDB) i ustaw w `.env`:
```
EXPO_PUBLIC_THESPORTSDB_KEY=twoj_klucz
```

Uwaga: ligi **amatorskie i młodzieżowe** (U-15, klasa okręgowa itp.) zwykle **nie są**
dostępne w żadnym publicznym API — do nich służy zakładka *Moja liga* (dane własne).
Aplikacja obsługuje brak danych z API: pokazuje komunikat i nie blokuje reszty ekranu.

Pliki: `src/sports/thesportsdb.ts` (serwis + mapowanie), `app/league.tsx` (ekran).

## Plan rozwoju

- [x] Moduł składek/finansów klubu
- [x] Integracja płatności online (Przelewy24) – gotowa do podpięcia kluczy
- [x] Backend danych (Supabase) – warstwa płatności
- [ ] Logowanie i konta (Supabase Auth) + zaostrzenie reguł RLS
- [ ] Pełna migracja CRUD (drużyny/zawodnicy/wydarzenia) do bazy
- [ ] E-mail płatnika (opiekuna) pobierany z profilu zawodnika
- [ ] Frekwencja na treningach i statystyki formy
- [ ] Wybór daty/godziny wydarzenia
- [ ] Powiadomienia push (przypomnienia o treningach, zaległych składkach)
- [ ] Komunikacja z drużyną i rodzicami
- [ ] Publikacja w App Store / Google Play

---

*MVP wygenerowany jako start projektu — gotowy do dalszej rozbudowy.*
