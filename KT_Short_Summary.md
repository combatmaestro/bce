# Short KT Summary

## Project overview
Bristol Community Events is a single-page event booking app for three roles:
- Standard users can browse events, book tickets, view receipts, and cancel bookings.
- Organisers can create events and publish them after paying a hosting fee.
- Admins manage events, users, venues, and reports.

## Main files
- [index.html](index.html) – app entry page.
- [app.js](app.js) – all app logic, rendering, routing, login, booking, and dashboard actions.
- [data.json](data.json) – mock data for users, venues, events, bookings, and waitlist.
- [assets/css/style.css](assets/css/style.css) – shared styling for cards and dashboard sections.

## App flow
1. The app loads and reads data from [data.json](data.json) and browser storage.
2. It renders a different screen depending on the logged-in user role.
3. Event filtering, booking, and receipts are handled in the frontend.
4. Admin and organiser dashboards are rendered dynamically from JavaScript.

## Important notes
- The app uses client-side state and localStorage rather than a real database.
- Booking, waitlist, cancellation, and payment actions are simulated.
- The admin dashboard uses sidebar navigation to switch sections in place.

## Demo accounts
- Admin: admin@bce.co.uk / admin123
- Organiser: maya@bce.co.uk / organiser123
- Standard user: sam@example.com / student123
