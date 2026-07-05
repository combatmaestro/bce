# Developer Handover Document

## 1. Purpose
This project is a front-end prototype for Bristol Community Events. It is built as a single-page application using plain JavaScript and Bootstrap. The implementation focuses on role-based access, event browsing, booking workflows, and admin/organiser dashboards.

## 2. Architecture overview
The app is driven by a single JavaScript controller in [app.js](app.js). Rendering is mostly done using string-based HTML templates inserted into the `#app` container.

### Main responsibilities of [app.js](app.js)
- Initialize and persist application state
- Render different UI views based on user role
- Handle login and registration
- Filter and render events
- Process event booking, waitlist, and receipts
- Render admin dashboards and admin actions
- Render organiser dashboards and organiser actions

## 3. State management
The app uses a single global `state` object. It is updated directly by functions and saved to localStorage.

### Key state fields
- `user`
- `events`
- `venues`
- `bookings`
- `waitlist`
- `users`
- `filters`
- `editingEventId`
- `activeAdminSection`

## 4. Data sources
- Seed data comes from [data.json](data.json)
- Session persistence uses `localStorage` with the key `bceData`
- There is also an Express-based server in [server.js](server.js), but the SPA itself uses client-side state

## 5. Role-based views
### Guest / unauthenticated user
- Sees the home page with hero banner, filters, featured events, and feature cards

### Standard user
- Sees their bookings
- Can book events from a list
- Can cancel bookings with penalty logic
- Can update password

### Organiser
- Sees their own events
- Can create new events
- Can pay hosting fee to publish
- Can cancel events

### Admin
- Sees a sidebar with sections for overview, events, event editor, users, venues, and reports
- Can add/update events
- Can remove events
- Can manage users
- Can add venues
- Can view reporting summaries

## 6. Important functions
### Rendering and routing
- `render()`
- `handleRoute()`
- `setActiveAdminSection()`

### Authentication
- `showLoginForm()`
- `showRegisterForm()`
- `handleLogin()`
- `handleRegister()`

### Booking flow
- `filterAndRenderEvents()`
- `viewEventDetails()`
- `openBookingModal()`
- `calculateBookingBreakdown()`
- `addToWaitlist()`
- `showReceipt()`

### Admin features
- `renderAdminDashboards()`
- `addVenue()`
- `removeUser()`
- `resetUserPassword()`
- `addAdminEvent()`
- `editEvent()`
- `removeEvent()`

### Organiser features
- `renderOrganiserDashboards()`
- `createOrganiserEvent()`
- `payHostingFee()`
- `cancelOrganiserEvent()`

## 7. UI styling notes
- [index.html](index.html) contains the initial page shell and embedded styles.
- [assets/css/style.css](assets/css/style.css) contains additional reusable styles.
- The app uses Bootstrap classes heavily.
- The admin dashboard section switching is controlled with `.admin-panel` and `.admin-nav-link` classes.

## 8. Running locally
### Simple static run
```bash
cd StudentAssignment
python3 -m http.server 5500
```

### Express server
```bash
cd StudentAssignment
npm install
npm start
```

## 9. Suggested future improvements
- Move from string-based rendering to components or a framework
- Connect to a real backend API
- Add validation and error handling for all forms
- Improve accessibility and responsive behavior
- Refactor repeated DOM manipulation into reusable helpers
