# Sepang Race Hub

A mobile-first race-weekend companion for the Formula 1 Gulf Air Bahrain Grand Prix in Malaysia at Sepang International Circuit, 2–4 October 2026.

## Run locally

```bash
npm install
npm run dev
```

## Included flows

- Friday–Sunday session switching
- Auto-refreshing MET Malaysia seven-day Sepang district forecast via data.gov.my
- Active weather bulletins mentioning Selangor or Sepang (read geographic scope)
- OpenLayers / OpenStreetMap geographic map with pan, zoom and attribution
- Google Maps directions using your starting point and travel mode
- Official F1 session times converted to MYT, calendar export and dynamic countdown
- Source-linked Sepang history and official event news
- Persistent race-weekend packing checklist

Weather is fetched from https://api.data.gov.my/weather/forecast/ for Sepang district Ds064 and https://api.data.gov.my/weather/warning/. The client refreshes every five minutes while visible and when returning to the page. MET Malaysia updates the forecast daily. Daily min/max temperatures are forecasts, not live observations. Humidity, rain percentages and trackside conditions are not supplied and are not invented. Failures and empty responses are visible; retained data after a failed refresh is labelled stale.

Official timetable: https://www.formula1.com/en/racing/2026/bahrain — UTC timestamps and +08:00 session data verified 2026-09-05. Schedule and news are source-checked content, not auto-updating feeds or live timing. Later changes require verification and a content update. Calendar end times are scheduled, not guaranteed durations.

OpenStreetMap geography is community-maintained, not an event access map. Unknown gate, parking, shuttle and amenity information is marked unavailable. No map API keys or location tracking. Origins are passed to Google Maps only when the user opens directions. Observe https://operations.osmfoundation.org/policies/tiles/ for production traffic; no tile prefetch or offline downloading.

Live site: https://sepang-race-hub.fhmzhr.chatgpt.site
