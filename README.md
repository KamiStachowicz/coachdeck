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

## Plan rozwoju

- [ ] Backend + logowanie (Supabase / Firebase – darmowe plany)
- [ ] Frekwencja na treningach i statystyki formy
- [ ] Wybór daty/godziny wydarzenia
- [ ] Powiadomienia push (przypomnienia o treningach/meczach)
- [ ] Komunikacja z drużyną i rodzicami
- [ ] Moduł składek/finansów klubu
- [ ] Publikacja w App Store / Google Play

---

*MVP wygenerowany jako start projektu — gotowy do dalszej rozbudowy.*
