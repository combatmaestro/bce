# Bristol Community Events (BCE) - Front-End Assessment

## Overview
This project implements a front-end prototype for Bristol Community Events using static HTML, CSS, and JavaScript.
It supports:
- Event discovery and filtering by category, date, and price
- Event details, booking flow, and booking receipt generation
- User registration, login, logout, and password updates
- Admin dashboard for event and venue management, reporting, and user controls
- Event organiser dashboard for creating events, paying hosting fees, and publishing events
- Waiting list handling for fully booked events
- Cancellation rules with penalty handling
- Multi-day event booking and advance booking discounts

## Files included
- `index.html` - main single-page application entry point
- `about.html`, `events.html`, `contact.html`, `login.html`, `register.html` - additional static pages
- `app.js` - application logic for event booking, user roles, admin and organiser features
- `data.json` - mock data source for users, venues, events, bookings, and waiting list
- `assets/css/style.css` - shared styling for pages
- `README.md` - project overview and instructions
- `run_instructions.txt` - instructions to launch the site locally
- `database_design.md` - database design, entity relationships, and normalization notes

## Usage
Open `index.html` directly in a browser, or use a local server for full functionality.

### Recommended local server command
```bash
cd StudentAssignment
python3 -m http.server 5500
```
Then open:

http://127.0.0.1:5500/StudentAssignment/

## Demo accounts
- Admin: `admin@bce.co.uk` / `admin123`
- Admin: `emma.admin@bce.co.uk` / `admin456`
- Organiser: `maya@bce.co.uk` / `organiser123`
- Organiser: `noah.organiser@bce.co.uk` / `organiser456`
- Standard user: `sam@example.com` / `student123`
- Standard user: `leah@example.com` / `pass1234`

## Notes before submission
- Add your student name and student ID to the top of key source files as required by the assessment.
- The current implementation uses `data.json` as the local data source; refreshing the page resets the in-memory state.
- The waiting list and cancellation flow are simulated in the client-side app.
