# Knowledge Transfer Document: Bristol Community Events

## 1. Project purpose
Bristol Community Events is a front-end prototype built as a single-page application (SPA) for browsing, booking, and managing community events. It supports three user roles:

- Standard user: browse events, book tickets, view receipts, cancel bookings
- Event organiser: create/manage events and pay hosting fees
- Admin: manage events, users, venues, and reports

The app is implemented in plain HTML, CSS, and JavaScript with mock data and client-side state.

---

## 2. Project structure

| File | Purpose |
|---|---|
| [index.html](index.html) | SPA entry page; mounts the app into a div and loads Bootstrap and app scripts |
| [app.js](app.js) | Main application logic for rendering, routing, authentication, booking, admin tools, and organiser tools |
| [assets/css/style.css](assets/css/style.css) | Shared CSS for cards, layout, and compact dashboard styling |
| [data.json](data.json) | Mock dataset for users, venues, events, bookings, and waitlist |
| [server.js](server.js) | Express server for serving the app and exposing basic API routes |
| [package.json](package.json) | Node project metadata and start script |
| [README.md](README.md) | Project overview and usage instructions |
| [database_design.md](database_design.md) | Entity relationships and database design notes |
| [about.html](about.html), [events.html](events.html), [contact.html](contact.html), [login.html](login.html), [register.html](register.html), [organiser.html](organiser.html), [admin.html](admin.html) | Static pages with similar UI styling; not the primary SPA entry |

---

## 3. Core application flow
The app starts at [index.html](index.html), which loads [app.js](app.js). The main flow is:

1. The app loads on DOM ready via `window.addEventListener('DOMContentLoaded', loadData);`
2. `loadData()` fetches data from [data.json](data.json) and merges it with saved data from `localStorage`
3. `render()` decides which view to show based on `state.user.role`
4. Each role uses a dedicated renderer:
   - `renderHome()` for unauthenticated users
   - `renderStandardUser()` for standard users
   - `renderOrganiser()` for organisers
   - `renderAdmin()` for admins
5. After rendering, `bindEvents()` attaches handlers to buttons and forms
6. `handleRoute()` manages simple hash-based navigation, especially for the admin dashboard sections

---

## 4. Main state object
The global application state is stored in `state` inside [app.js](app.js):

| Property | Purpose |
|---|---|
| `user` | Current authenticated user |
| `events` | Array of event objects |
| `venues` | Array of venue objects |
| `bookings` | Array of booking objects |
| `waitlist` | Array of waitlist entries |
| `users` | Array of user accounts |
| `filters` | Search/category/date/price filters for the event list |
| `editingEventId` | Tracks the event being edited in the admin panel |
| `activeAdminSection` | Controls which admin panel is visible |

---

## 5. Data model

### 5.1 User
Example fields:
- `id`
- `name`
- `email`
- `password`
- `role` (`admin`, `organiser`, `standard`)

### 5.2 Venue
Example fields:
- `id`
- `name`
- `capacity`
- `suitableFor`

### 5.3 Event
Example fields:
- `id`
- `title`
- `category`
- `date`
- `price`
- `venueId`
- `capacity`
- `booked`
- `description`
- `conditions`
- `lastBookingDate`
- `multiDay`
- `days`
- `status`
- `organiserId`
- `hostingFeePaid` (for organiser flow)

### 5.4 Booking
Example fields:
- `id`
- `eventId`
- `userId`
- `quantity`
- `daysBooked`
- `total`
- `status`
- `bookedAt`
- `receiptNo`
- `breakdown`

### 5.5 Waitlist entry
Example fields:
- `id`
- `eventId`
- `userId`
- `quantity`
- `requestedAt`
- `status`
- `details`

---

## 6. Rendering and navigation logic

### 6.1 Home / guest view
The `renderHome()` function builds:
- navbar
- hero section
- event search panel
- featured events grid
- information cards
- footer

The event list is populated later with `filterAndRenderEvents()`.

### 6.2 Standard user view
The `renderStandardUser()` function builds:
- a welcome navbar
- a bookings panel
- an event booking panel
- a password update area

The `renderUserDashboards()` function fills these areas with booking cards and a list of events the user can book.

### 6.3 Organiser view
The `renderOrganiser()` function builds:
- organiser navbar
- a panel for existing organiser events
- a form to create new events

The `renderOrganiserDashboards()` function renders the organiser’s events and attaches handlers for paying hosting fees or cancelling events.

### 6.4 Admin view
The `renderAdmin()` function builds a sidebar and several content panels:
- Overview
- All events
- Add / update event
- Users
- Venues
- Reports

The `setActiveAdminSection()` function makes only the selected panel visible and updates the active sidebar item.

---

## 7. Key functions in [app.js](app.js)

### 7.1 Data and lifecycle
- `loadData()` – loads mock data and restores saved state from localStorage
- `persistData()` – saves the current state to localStorage
- `render()` – chooses the correct UI based on the current user role
- `handleRoute()` – manages hash-based route behavior

### 7.2 Authentication
- `showLoginForm()` – renders the login form
- `showRegisterForm()` – renders the registration form
- `handleLogin()` – checks login credentials and sets the active user
- `handleRegister()` – creates a new user account and logs them in

### 7.3 Event discovery and filtering
- `filterAndRenderEvents()` – filters events by text, category, date, and price and renders the event cards

### 7.4 Booking flow
- `viewEventDetails()` – opens a modal with event details
- `openBookingModal()` – opens a booking dialog for a selected event
- `calculateBookingBreakdown()` – calculates subtotal, discounts, and final total
- `getAdvanceDiscount()` – computes advance booking discounts based on date difference
- `addToWaitlist()` – handles full-event waitlist operations
- `showReceipt()` – displays a booking receipt modal
- `downloadReceipt()` – downloads a text receipt file

### 7.5 User account management
- `renderUserDashboards()` – shows the user’s bookings and booking options
- `updateCurrentUserPassword()` – updates a logged-in user’s password
- `cancelBooking()` – cancels a booking and applies penalty logic if needed

### 7.6 Admin features
- `renderAdminDashboards()` – renders admin content and binds sidebar actions
- `setActiveAdminSection()` – switches the active admin section panel
- `addVenue()` – creates a new venue
- `removeUser()` – deletes a user
- `resetUserPassword()` – resets a user password via prompt
- `addAdminEvent()` – creates or updates an event from the admin form
- `editEvent()` – loads an existing event into the admin editor
- `removeEvent()` – removes an event and its related bookings/waitlist entries

### 7.7 Organiser features
- `renderOrganiserDashboards()` – shows organiser events and creates event form
- `createOrganiserEvent()` – creates a new event with pending status
- `payHostingFee()` – marks hosting fee as paid and publishes the event
- `cancelOrganiserEvent()` – cancels an organiser’s event

### 7.8 Helpers
- `getVenueName()` – resolves a venue ID to a venue name

---

## 8. UI styling notes
The styling is primarily driven by:

- Bootstrap classes for layout and components
- Custom CSS inside [index.html](index.html) for the SPA visual design
- Custom CSS inside [assets/css/style.css](assets/css/style.css) for reusable card and dashboard styling

### Common classes
- `.card-box` – generic card container
- `.event-card` – event listing card
- `.info-card` – information panel cards
- `.feature-card` – feature highlight cards
- `.admin-panel` – hidden/shown admin section bodies
- `.admin-nav-link.active` – active admin sidebar item

### Important styling note
The SPA entry page [index.html](index.html) uses embedded CSS rather than linking [assets/css/style.css](assets/css/style.css). As a result, some styling changes in the stylesheet may not reflect in the SPA unless the CSS file is linked from [index.html](index.html) or the styles are moved inline.

---

## 9. Persistence and storage
The app does not currently use a real backend database for state. Instead:

- Initial data comes from [data.json](data.json)
- Current state is saved to browser `localStorage` using the key `bceData`
- The app also contains an Express server in [server.js](server.js), but the SPA itself does not currently rely on it for state persistence

This means:
- Refreshing the page keeps saved data in the browser
- A fresh browser profile or clearing storage resets the app to the seeded mock data

---

## 10. Demo accounts
The seeded demo accounts in [data.json](data.json) are:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bce.co.uk` | `admin123` |
| Admin | `emma.admin@bce.co.uk` | `admin456` |
| Organiser | `maya@bce.co.uk` | `organiser123` |
| Organiser | `noah.organiser@bce.co.uk` | `organiser456` |
| Standard user | `sam@example.com` | `student123` |
| Standard user | `leah@example.com` | `pass1234` |

---

## 11. How to run the project
### Option 1: Open directly in the browser
Open [index.html](index.html) in a browser.

### Option 2: Use a local server
From the project folder:

```bash
cd StudentAssignment
python3 -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500/StudentAssignment/
```

### Option 3: Run the Express server
```bash
cd StudentAssignment
npm install
npm start
```

Then open:

```text
http://localhost:5501/
```

---

## 12. Known implementation notes and considerations
- The app is a prototype and uses mock data rather than a real database
- Booking, waitlist, and cancellation logic are simulated in the client
- Payments are only simulated with alerts and status changes
- The admin dashboard uses hash-based section switching for the sidebar panels
- The app uses direct DOM manipulation and string-based HTML templates rather than a component framework
- Some static HTML pages exist but are not the primary SPA flow

---

## 13. Suggested next improvements
- Connect the app to a real backend/API for persistent storage
- Replace inline HTML string rendering with reusable component functions or a framework
- Link [assets/css/style.css](assets/css/style.css) from [index.html](index.html) for consistent styling
- Add validation for event creation and editing
- Add loading/error states and improved accessibility
