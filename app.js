const state = {
  user: null,
  events: [],
  venues: [],
  bookings: [],
  waitlist: [],
  users: [],
  filters: { search: '', category: '', date: '', price: '' },
  editingEventId: null
};

async function loadData() {
  const response = await fetch('./data.json');
  const data = await response.json();
  const savedJson = window.localStorage.getItem('bceData');
  if (savedJson) {
    try {
      const saved = JSON.parse(savedJson);
      state.events = saved.events || data.events;
      state.venues = saved.venues || data.venues;
      state.bookings = saved.bookings || data.bookings;
      state.waitlist = saved.waitlist || data.waitlist;
      state.users = saved.users || data.users;
      if (saved.currentUserId) {
        state.user = state.users.find(u => u.id === saved.currentUserId) || null;
      }
    } catch (error) {
      state.events = data.events;
      state.venues = data.venues;
      state.bookings = data.bookings;
      state.waitlist = data.waitlist;
      state.users = data.users;
    }
  } else {
    state.events = data.events;
    state.venues = data.venues;
    state.bookings = data.bookings;
    state.waitlist = data.waitlist;
    state.users = data.users;
  }
  render();
}

async function persistData() {
  const payload = {
    events: state.events,
    venues: state.venues,
    bookings: state.bookings,
    waitlist: state.waitlist,
    users: state.users,
    currentUserId: state.user ? state.user.id : null
  };
  window.localStorage.setItem('bceData', JSON.stringify(payload));
}

function render() {
  const app = document.getElementById('app');
  if (!state.user) {
    app.innerHTML = renderHome();
    bindEvents();
    filterAndRenderEvents();
    return;
  }

  if (state.user.role === 'admin') {
    app.innerHTML = renderAdmin();
    renderAdminDashboards();
  } else if (state.user.role === 'organiser') {
    app.innerHTML = renderOrganiser();
    renderOrganiserDashboards();
  } else {
    app.innerHTML = renderStandardUser();
    renderUserDashboards();
  }

  bindEvents();
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '');
  if (!state.user) {
    if (hash === 'login') return showLoginForm();
    if (hash === 'register') return showRegisterForm();
    return;
  }

  if (state.user.role === 'admin') {
    if (hash && hash !== 'admin') {
      window.location.hash = 'admin';
    }
    return;
  }

  if (state.user.role === 'organiser') {
    if (hash && hash !== 'organiser') {
      window.location.hash = 'organiser';
    }
    return;
  }

  if (state.user.role === 'standard') {
    if (hash && hash !== 'user') {
      window.location.hash = 'user';
    }
    return;
  }
}

window.addEventListener('hashchange', handleRoute);

function renderHome() {
  return `
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">BCE</a>
        <button class="navbar-toggler bg-light" data-bs-toggle="collapse" data-bs-target="#menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a href="#" class="nav-link">Home</a></li>
            <li class="nav-item"><a href="#events" class="nav-link">Events</a></li>
            <li class="nav-item"><a href="#" class="nav-link" id="loginLink">Login</a></li>
            <li class="nav-item"><a href="#" class="btn btn-warning rounded-pill px-4 ms-3" id="registerLink">Register</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="container">
        <div class="row align-items-center gy-4">
          <div class="col-lg-7">
            <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold">Bristol Community Events</span>
            <h1>Discover, book and manage unforgettable events across Bristol.</h1>
            <p>BCE promotes tourism and brings the city together through exhibitions, workshops, sports, musical and religious events.</p>
            <a href="#events" class="btn btn-warning hero-btn">Explore Events</a>
            <a href="#" class="btn btn-outline-light hero-btn" id="showLoginBtn">Login / Register</a>
          </div>
          <div class="col-lg-5">
            <div class="info-card">
              <h4 class="fw-bold mb-3">What BCE offers</h4>
              <ul class="list-unstyled mb-0">
                <li class="mb-2"><i class="fa-solid fa-circle-check text-warning me-2"></i> Create and publish events quickly</li>
                <li class="mb-2"><i class="fa-solid fa-circle-check text-warning me-2"></i> Book tickets and manage attendance</li>
                <li class="mb-2"><i class="fa-solid fa-circle-check text-warning me-2"></i> Process secure payments</li>
                <li class="mb-2"><i class="fa-solid fa-circle-check text-warning me-2"></i> Generate receipts and invoices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container my-5">
      <div class="search-card">
        <h2 class="text-center fw-bold mb-4">Find your next event</h2>
        <div class="row g-3">
          <div class="col-md-3"><input type="text" id="searchText" class="form-control" placeholder="Search event"></div>
          <div class="col-md-3">
            <select id="categoryFilter" class="form-select">
              <option value="">All categories</option>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Religious">Religious</option>
            </select>
          </div>
          <div class="col-md-2"><input type="date" id="dateFilter" class="form-control"></div>
          <div class="col-md-2">
            <select id="priceFilter" class="form-select">
              <option value="">All prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div class="col-md-2 d-grid"><button class="btn btn-warning" id="applyFiltersBtn">Search</button></div>
        </div>
      </div>
    </div>

    <section class="container py-4" id="events">
      <h2 class="section-title">Featured events</h2>
      <div class="row g-4" id="eventCards"></div>
    </section>

    <section class="container py-5">
      <div class="row g-4">
        <div class="col-lg-4"><div class="feature-card"><i class="fa-solid fa-earth-europe"></i><h5 class="fw-bold mt-2">Unified discovery</h5><p class="text-muted mb-0">One place for exhibitions, workshops, sports and religious events.</p></div></div>
        <div class="col-lg-4"><div class="feature-card"><i class="fa-solid fa-ticket-simple"></i><h5 class="fw-bold mt-2">Simple booking</h5><p class="text-muted mb-0">Users can sign up, book events and manage their bookings with ease.</p></div></div>
        <div class="col-lg-4"><div class="feature-card"><i class="fa-solid fa-chart-line"></i><h5 class="fw-bold mt-2">Admin reporting</h5><p class="text-muted mb-0">Admins can review bookings, event capacity and profits.</p></div></div>
      </div>
    </section>

    <footer class="mt-5"><div class="container text-center py-4"><h5 class="fw-bold mb-2">Bristol Community Events</h5><p class="mb-0">Promoting tourism and community life through smart event experiences.</p></div></footer>
  `;
}

function renderStandardUser() {
  return `
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">BCE</a>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a href="#" class="nav-link">Welcome, ${state.user.name}</a></li>
          <li class="nav-item"><a href="#" class="nav-link" id="logoutBtn">Logout</a></li>
        </ul>
      </div>
    </nav>
    <section class="container py-5" style="margin-top:80px;">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card-box">
            <h2 class="section-title text-start">Your bookings</h2>
            <div id="userBookings"></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card-box">
            <h4 class="fw-bold mb-3">Book an event</h4>
            <div id="bookingFormArea"></div>
            <hr>
            <h5 class="fw-bold mt-3">Update password</h5>
            <div class="mb-2"><input id="newPassword" class="form-control" type="password" placeholder="New password"></div>
            <button class="btn btn-warning btn-sm" id="updatePasswordBtn">Save password</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAdmin() {
  return `
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">BCE Admin</a>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a href="#" class="nav-link">Admin Dashboard</a></li>
          <li class="nav-item"><a href="#" class="nav-link" id="logoutBtn">Logout</a></li>
        </ul>
      </div>
    </nav>
    <section class="container py-5" style="margin-top:80px;">
      <div class="row g-4">
        <div class="col-lg-3">
          <div class="card-box sticky-top" style="top:100px;">
            <h5 class="fw-bold mb-3">Admin controls</h5>
            <div class="list-group">
              <a class="list-group-item list-group-item-action" href="#adminOverview">Overview</a>
              <a class="list-group-item list-group-item-action" href="#adminEventList">All events</a>
              <a class="list-group-item list-group-item-action" href="#adminEventForm">Add / update event</a>
              <a class="list-group-item list-group-item-action" href="#adminUsersSection">Users</a>
              <a class="list-group-item list-group-item-action" href="#adminVenuesSection">Venues</a>
              <a class="list-group-item list-group-item-action" href="#adminReportsSection">Reports</a>
            </div>
            <div class="mt-4">
              <h6 class="fw-semibold">Necessary event fields</h6>
              <ul class="small text-muted mb-0">
                <li>Title</li>
                <li>Category</li>
                <li>Date</li>
                <li>Venue</li>
                <li>Price</li>
                <li>Capacity</li>
                <li>Description</li>
                <li>Conditions</li>
                <li>Multi-day settings</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-lg-9">
          <div class="card-box mb-4" id="adminOverview">
            <h4 class="fw-bold mb-3">Admin dashboard</h4>
            <p class="text-muted">Use the sidebar to jump between event management, users, venues and reports. Edit an event from the list and save it in the form below.</p>
          </div>
          <div class="card-box mb-4" id="adminEventList">
            <h4 class="fw-bold mb-3">All events</h4>
            <div id="adminEvents"></div>
          </div>
          <div class="card-box mb-4" id="adminEventEditor">
            <h4 class="fw-bold mb-3">Add / update event</h4>
            <div id="adminEventFormArea"></div>
          </div>
          <div class="card-box mb-4" id="adminUsersSection">
            <h4 class="fw-bold mb-3">Manage users</h4>
            <div id="adminUsers"></div>
          </div>
          <div class="card-box mb-4" id="adminVenuesSection">
            <h4 class="fw-bold mb-3">Add venue</h4>
            <div id="venueForm"></div>
          </div>
          <div class="card-box mb-4" id="adminReportsSection">
            <h4 class="fw-bold mb-3">Reports & admin tools</h4>
            <div id="adminReports"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderOrganiser() {
  return `
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <a class="navbar-brand" href="#">BCE Organiser</a>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a href="#" class="nav-link">${state.user.name}</a></li>
          <li class="nav-item"><a href="#" class="nav-link" id="logoutBtn">Logout</a></li>
        </ul>
      </div>
    </nav>
    <section class="container py-5" style="margin-top:80px;">
      <div class="row g-4">
        <div class="col-lg-7"><div class="card-box"><h4 class="fw-bold mb-3">Manage your events</h4><div id="organiserEvents"></div></div></div>
        <div class="col-lg-5"><div class="card-box"><h4 class="fw-bold mb-3">Create event</h4><div id="organiserForm"></div></div></div>
      </div>
    </section>
  `;
}

function bindEvents() {
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginLink) loginLink.addEventListener('click', showLoginForm);
  if (registerLink) registerLink.addEventListener('click', showRegisterForm);
  if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginForm);
  if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => {
    state.filters.search = document.getElementById('searchText')?.value || '';
    state.filters.category = document.getElementById('categoryFilter')?.value || '';
    state.filters.date = document.getElementById('dateFilter')?.value || '';
    state.filters.price = document.getElementById('priceFilter')?.value || '';
    filterAndRenderEvents();
  });
  if (logoutBtn) logoutBtn.addEventListener('click', () => { state.user = null; render(); });

  if (state.user) {
    if (state.user.role === 'standard') {
      renderUserDashboards();
    } else if (state.user.role === 'admin') {
      renderAdminDashboards();
    } else if (state.user.role === 'organiser') {
      renderOrganiserDashboards();
    }
  } else {
    filterAndRenderEvents();
  }
}

function showLoginForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="#">BCE</a></div></nav>
    <section class="container py-5" style="margin-top:100px;">
      <div class="row justify-content-center">
        <div class="col-lg-5">
          <div class="card-box">
            <h3 class="fw-bold mb-3">Login</h3>
            <div class="mb-3"><label class="form-label">Email</label><input id="loginEmail" class="form-control" /></div>
            <div class="mb-3"><label class="form-label">Password</label><input id="loginPassword" type="password" class="form-control" /></div>
            <button class="btn btn-warning w-100" id="submitLogin">Login</button>
            <p class="text-muted mt-3 mb-0">Not registered? <a href="#" id="switchRegister">Register</a></p>
          </div>
        </div>
      </div>
    </section>
  `;
  document.getElementById('submitLogin').addEventListener('click', handleLogin);
  document.getElementById('switchRegister').addEventListener('click', showRegisterForm);
}

function showRegisterForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar navbar-expand-lg fixed-top"><div class="container"><a class="navbar-brand" href="#">BCE</a></div></nav>
    <section class="container py-5" style="margin-top:100px;">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card-box">
            <h3 class="fw-bold mb-3">Register</h3>
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label">Name</label><input id="regName" class="form-control" /></div>
              <div class="col-md-6"><label class="form-label">Email</label><input id="regEmail" class="form-control" /></div>
            </div>
            <div class="mb-3 mt-3"><label class="form-label">Password</label><input id="regPassword" type="password" class="form-control" /></div>
            <div class="mb-3"><label class="form-label">Role</label><select id="regRole" class="form-select"><option value="standard">Standard User</option><option value="organiser">Event Organiser</option></select></div>
            <button class="btn btn-warning w-100" id="submitRegister">Register</button>
            <p class="text-muted mt-3 mb-0">Already registered? <a href="#" id="switchLogin">Login</a></p>
          </div>
        </div>
      </div>
    </section>
  `;
  document.getElementById('submitRegister').addEventListener('click', handleRegister);
  document.getElementById('switchLogin').addEventListener('click', showLoginForm);
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    state.user = user;
    window.location.hash = user.role === 'standard' ? 'user' : user.role;
    render();
  } else {
    alert('Invalid login details');
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  if (!name || !email || !password) {
    alert('Please fill all registration fields.');
    return;
  }
  if (state.users.some(u => u.email === email)) {
    alert('An account with this email already exists.');
    return;
  }
  const user = {
    id: 'u' + (state.users.length + 1),
    name,
    email,
    password,
    role
  };
  state.users.push(user);
  await persistData();
  state.user = user;
  window.location.hash = user.role === 'standard' ? 'user' : user.role;
  render();
}

function filterAndRenderEvents() {
  const filtered = state.events.filter(event => {
    const matchesText = event.title.toLowerCase().includes(state.filters.search.toLowerCase()) || event.description.toLowerCase().includes(state.filters.search.toLowerCase());
    const matchesCategory = !state.filters.category || event.category === state.filters.category;
    const matchesDate = !state.filters.date || event.date === state.filters.date;
    const matchesPrice = !state.filters.price || (state.filters.price === 'free' ? event.price === 0 : event.price > 0);
    return matchesText && matchesCategory && matchesDate && matchesPrice;
  });

  const eventCards = document.getElementById('eventCards');
  if (eventCards) {
    eventCards.innerHTML = filtered.length ? filtered.map(event => `
      <div class="col-lg-4">
        <div class="event-card">
          <h5 class="fw-bold">${event.title}</h5>
          <p class="text-muted mb-2"><i class="fa-solid fa-calendar me-2"></i>${event.date}</p>
          <p class="text-muted mb-2"><i class="fa-solid fa-location-dot me-2"></i>${getVenueName(event.venueId)}</p>
          <p class="text-muted mb-2"><i class="fa-solid fa-tag me-2"></i>${event.category}</p>
          <p class="text-muted mb-2"><i class="fa-solid fa-ticket-simple me-2"></i>£${event.price}</p>
          <p class="mb-3">${event.description}</p>
          <p class="small text-muted">Remaining: ${Math.max(event.capacity - event.booked, 0)}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-warning viewBtn" data-event-id="${event.id}">View details</button>
            <button class="btn btn-warning bookBtn" data-event-id="${event.id}">Book now</button>
          </div>
        </div>
      </div>
    `).join('') : '<div class="col-12"><div class="alert alert-light">No events match your filters.</div></div>';
  }

  document.querySelectorAll('.viewBtn').forEach(btn => btn.addEventListener('click', () => viewEventDetails(btn.dataset.eventId)));
  document.querySelectorAll('.bookBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!state.user) {
        alert('Please login or register before booking.');
        showLoginForm();
        return;
      }
      openBookingModal(btn.dataset.eventId);
    });
  });
}

function viewEventDetails(eventId) {
  const event = state.events.find(e => e.id === eventId);
  const venue = state.venues.find(v => v.id === event.venueId);
  if (!event) return;
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade show" style="display:block; background:rgba(0,0,0,.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="modal-header">
            <h5 class="modal-title">${event.title}</h5>
            <button class="btn-close" id="closeModal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Category:</strong> ${event.category}</p>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Venue:</strong> ${venue ? venue.name : 'TBD'} (${venue ? venue.capacity : 'n/a'} seats)</p>
            <p><strong>Price:</strong> £${event.price}</p>
            <p><strong>Remaining tickets:</strong> ${Math.max(event.capacity - event.booked, 0)}</p>
            <p><strong>Last booking date:</strong> ${event.lastBookingDate}</p>
            <p><strong>Conditions:</strong> ${event.conditions}</p>
            <p class="small text-muted">Advance booking discounts and student discount are applied during checkout.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelModal">Close</button>
            <button class="btn btn-warning" id="bookFromDetails">Book this event</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModal').addEventListener('click', () => modal.remove());
  document.getElementById('cancelModal').addEventListener('click', () => modal.remove());
  document.getElementById('bookFromDetails').addEventListener('click', () => {
    modal.remove();
    if (!state.user) {
      alert('Please login or register before booking.');
      showLoginForm();
      return;
    }
    openBookingModal(event.id);
  });
}

function openBookingModal(eventId) {
  const event = state.events.find(e => e.id === eventId);
  const remaining = Math.max(event.capacity - event.booked, 0);
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade show" style="display:block; background:rgba(0,0,0,.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="modal-header"><h5 class="modal-title">Book ${event.title}</h5><button class="btn-close" id="closeModal"></button></div>
          <div class="modal-body">
            <p><strong>Venue:</strong> ${getVenueName(event.venueId)}</p>
            <p><strong>Price:</strong> £${event.price}</p>
            <p><strong>Available:</strong> ${remaining}</p>
            <p class="small text-muted">Student discount: 10%. Advance booking discounts may apply.</p>
            <label class="form-label">Number of tickets</label>
            <input id="ticketQty" type="number" class="form-control" min="1" value="1" />
            ${event.multiDay ? `<label class="form-label mt-2">Days to book (max ${event.days})</label><input id="daysQty" type="number" class="form-control" min="1" max="${event.days}" value="1" />` : ''}
            <div class="form-check mt-3"><input class="form-check-input" type="checkbox" id="studentDiscount" checked><label class="form-check-label">Student discount</label></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelModal">Cancel</button>
            <button class="btn btn-warning" id="confirmBooking">Confirm booking</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModal').addEventListener('click', () => modal.remove());
  document.getElementById('cancelModal').addEventListener('click', () => modal.remove());
  document.getElementById('confirmBooking').addEventListener('click', async () => {
    const qty = Number(document.getElementById('ticketQty').value);
    const days = event.multiDay ? Number(document.getElementById('daysQty').value) : 1;
    const student = document.getElementById('studentDiscount').checked;
    if (qty < 1 || (event.multiDay && days < 1)) {
      alert('Please enter valid ticket details.');
      return;
    }
    const breakdown = calculateBookingBreakdown(event, qty, days, student);
    const remainingAfter = Math.max(event.capacity - event.booked - qty, 0);
    if (remainingAfter < 0) {
      await addToWaitlist(event, qty, student, breakdown);
      modal.remove();
      render();
      return;
    }
    const booking = {
      id: 'b' + (state.bookings.length + 1),
      eventId: event.id,
      userId: state.user.id,
      quantity: qty,
      daysBooked: days,
      total: breakdown.finalTotal,
      status: 'confirmed',
      bookedAt: new Date().toISOString().split('T')[0],
      receiptNo: 'REC-' + (1000 + state.bookings.length + 1),
      breakdown
    };
    state.bookings.push(booking);
    event.booked += qty;
    await persistData();
    modal.remove();
    render();
    showReceipt(booking, event, breakdown);
  });
}

function calculateBookingBreakdown(event, qty, days, student) {
  const dailyRate = event.multiDay ? (event.price / event.days) : event.price;
  const subtotal = qty * days * dailyRate;
  const advanceDiscountPct = getAdvanceDiscount(event.date);
  const advanceDiscount = subtotal * advanceDiscountPct;
  const studentDiscount = student ? subtotal * 0.10 : 0;
  const finalTotal = Math.max(0, subtotal - advanceDiscount - studentDiscount);
  return { subtotal, advanceDiscountPct, advanceDiscount, studentDiscount, finalTotal, student };
}

function getAdvanceDiscount(eventDate) {
  const diff = Math.round((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff >= 50 && diff <= 60) return 0.20;
  if (diff >= 35 && diff < 50) return 0.15;
  if (diff >= 25 && diff < 35) return 0.10;
  if (diff >= 15 && diff < 25) return 0.05;
  return 0;
}

async function addToWaitlist(event, qty, student, breakdown) {
  state.waitlist.push({
    id: 'w' + (state.waitlist.length + 1),
    eventId: event.id,
    userId: state.user.id,
    quantity: qty,
    requestedAt: new Date().toISOString().split('T')[0],
    status: 'waiting',
    details: { student, breakdown }
  });
  await persistData();
  alert('The event is full. You have been added to the waiting list.');
}

function showReceipt(booking, event, breakdown) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade show" style="display:block; background:rgba(0,0,0,.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="modal-header"><h5 class="modal-title">Booking receipt</h5><button class="btn-close" id="closeModal"></button></div>
          <div class="modal-body">
            <p><strong>Receipt:</strong> ${booking.receiptNo}</p>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Subtotal:</strong> £${breakdown.subtotal.toFixed(2)}</p>
            <p><strong>Advance discount:</strong> ${breakdown.advanceDiscountPct * 100}%</p>
            <p><strong>Student discount:</strong> £${breakdown.studentDiscount.toFixed(2)}</p>
            <p><strong>Total paid:</strong> £${breakdown.finalTotal.toFixed(2)}</p>
            <p class="small text-muted">Please bring student ID to claim discount.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelModal">Close</button>
            <button class="btn btn-warning" id="downloadReceipt">Download receipt</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModal').addEventListener('click', () => modal.remove());
  document.getElementById('cancelModal').addEventListener('click', () => modal.remove());
  document.getElementById('downloadReceipt').addEventListener('click', () => downloadReceipt(booking, event, breakdown));
}

function downloadReceipt(booking, event, breakdown) {
  const text = `BCE Booking Receipt\nReceipt: ${booking.receiptNo}\nEvent: ${event.title}\nUser: ${state.user.name}\nSubtotal: £${breakdown.subtotal.toFixed(2)}\nAdvance discount: ${breakdown.advanceDiscountPct * 100}%\nStudent discount: £${breakdown.studentDiscount.toFixed(2)}\nTotal paid: £${breakdown.finalTotal.toFixed(2)}`;
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${booking.receiptNo}.txt`;
  link.click();
}

function renderUserDashboards() {
  const bookings = state.bookings.filter(b => b.userId === state.user.id);
  const container = document.getElementById('userBookings');
  if (container) {
    container.innerHTML = bookings.length ? bookings.map(b => {
      const event = state.events.find(e => e.id === b.eventId);
      return `<div class="border rounded p-3 mb-3">
        <h6 class="fw-bold">${event.title}</h6>
        <p class="mb-1">Status: ${b.status}</p>
        <p class="mb-1">Receipt: ${b.receiptNo}</p>
        <p class="mb-1">Total: £${b.total.toFixed(2)}</p>
        <button class="btn btn-outline-danger btn-sm cancelBookingBtn" data-booking-id="${b.id}">Cancel booking</button>
      </div>`;
    }).join('') : '<p class="text-muted">No bookings yet.</p>';
  }

  document.querySelectorAll('.cancelBookingBtn').forEach(btn => btn.addEventListener('click', () => cancelBooking(btn.dataset.bookingId)));

  const bookingFormArea = document.getElementById('bookingFormArea');
  if (bookingFormArea) {
    bookingFormArea.innerHTML = `<div class="list-group">${state.events.map(event => `<button class="list-group-item list-group-item-action" data-event-id="${event.id}">${event.title}</button>`).join('')}</div>`;
    bookingFormArea.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => openBookingModal(btn.dataset.eventId)));
  }

  const updatePasswordBtn = document.getElementById('updatePasswordBtn');
  if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener('click', updateCurrentUserPassword);
  }
}

async function updateCurrentUserPassword() {
  const newPassword = document.getElementById('newPassword').value;
  if (!newPassword) return;
  const user = state.users.find(u => u.id === state.user.id);
  if (user) {
    user.password = newPassword;
    state.user.password = newPassword;
    await persistData();
    alert('Password updated successfully.');
  }
}

async function cancelBooking(bookingId) {
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return;
  const event = state.events.find(e => e.id === booking.eventId);
  const daysBefore = Math.round((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
  let penalty = 0;
  if (daysBefore >= 25 && daysBefore < 40) penalty = booking.total * 0.4;
  if (daysBefore < 25) penalty = booking.total;
  if (confirm(`Cancel booking? You may incur a penalty of £${penalty.toFixed(2)}.`)) {
    booking.status = 'cancelled';
    event.booked = Math.max(event.booked - booking.quantity, 0);
    if (state.waitlist.length) {
      const next = state.waitlist.shift();
      event.booked += next.quantity;
      state.bookings.push({
        id: 'b' + (state.bookings.length + 1),
        eventId: event.id,
        userId: next.userId,
        quantity: next.quantity,
        daysBooked: event.multiDay ? next.details.breakdown.daysBooked : 1,
        total: next.details.breakdown.finalTotal,
        status: 'confirmed',
        bookedAt: new Date().toISOString().split('T')[0],
        receiptNo: 'REC-' + (1000 + state.bookings.length + 1)
      });
      alert(`A waiting list customer has been moved into the booking for ${event.title}.`);
    }
    await persistData();
    render();
  }
}

function renderAdminDashboards() {
  const adminEvents = document.getElementById('adminEvents');
  if (adminEvents) {
    adminEvents.innerHTML = state.events.map(event => `
      <div class="border rounded p-3 mb-3">
        <h6 class="fw-bold">${event.title}</h6>
        <p class="mb-1">Booked: ${event.booked}/${event.capacity}</p>
        <p class="mb-1">Revenue: £${(event.booked * event.price).toFixed(2)}</p>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-outline-warning btn-sm" data-edit-event="${event.id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm" data-remove-event="${event.id}">Remove</button>
        </div>
      </div>
    `).join('');
  }

  document.querySelectorAll('[data-edit-event]').forEach(btn => btn.addEventListener('click', () => editEvent(btn.dataset.editEvent)));
  document.querySelectorAll('[data-remove-event]').forEach(btn => btn.addEventListener('click', () => removeEvent(btn.dataset.removeEvent)));

  const adminEventForm = document.getElementById('adminEventFormArea');
  if (adminEventForm) {
    adminEventForm.innerHTML = `
      <div class="mb-2"><input id="adminEventTitle" class="form-control" placeholder="Title"></div>
      <div class="mb-2"><select id="adminEventCategory" class="form-select"><option>Music</option><option>Workshop</option><option>Sports</option><option>Exhibition</option><option>Religious</option></select></div>
      <div class="mb-2"><input id="adminEventDate" type="date" class="form-control"></div>
      <div class="mb-2"><input id="adminEventPrice" type="number" class="form-control" placeholder="Price"></div>
      <div class="mb-2"><select id="adminEventVenue" class="form-select">${state.venues.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}</select></div>
      <div class="mb-2"><input id="adminEventCapacity" type="number" class="form-control" placeholder="Capacity"></div>
      <div class="mb-2"><textarea id="adminEventDescription" class="form-control" rows="2" placeholder="Description"></textarea></div>
      <div class="mb-2"><input id="adminEventConditions" class="form-control" placeholder="Conditions"></div>
      <div class="mb-2 form-check"><input id="adminEventMultiDay" class="form-check-input" type="checkbox"><label class="form-check-label">Multi-day event</label></div>
      <div class="mb-2"><input id="adminEventDays" type="number" class="form-control" placeholder="Number of days" value="1" min="1"></div>
      <button class="btn btn-warning w-100" id="saveAdminEventBtn">Save event</button>
    `;
    document.getElementById('saveAdminEventBtn').addEventListener('click', addAdminEvent);
  }

  const adminReports = document.getElementById('adminReports');
  if (adminReports) {
    const totalRevenue = state.bookings.reduce((sum, b) => sum + b.total, 0);
    const fullyBooked = state.events.filter(e => e.booked >= e.capacity).map(e => e.title).join(', ') || 'None';
    adminReports.innerHTML = `
      <p><strong>Total bookings:</strong> ${state.bookings.length}</p>
      <p><strong>Total revenue:</strong> £${totalRevenue.toFixed(2)}</p>
      <p><strong>Fully booked:</strong> ${fullyBooked}</p>
      <p><strong>Upcoming events:</strong> ${state.events.filter(e => e.status === 'published').length}</p>
      <p class="small text-muted">Admin can lower prices if fewer than 50% of tickets are sold in the last 10 days.</p>
    `;
  }

  const venueForm = document.getElementById('venueForm');
  if (venueForm) {
    venueForm.innerHTML = `
      <div class="mb-2"><input id="venueName" class="form-control" placeholder="Venue name"></div>
      <div class="mb-2"><input id="venueCapacity" type="number" class="form-control" placeholder="Capacity"></div>
      <div class="mb-2"><input id="venueSuitability" class="form-control" placeholder="Suitable for"></div>
      <button class="btn btn-warning w-100" id="saveVenueBtn">Add venue</button>
    `;
    document.getElementById('saveVenueBtn').addEventListener('click', addVenue);
  }

  const adminUsers = document.getElementById('adminUsers');
  if (adminUsers) {
    adminUsers.innerHTML = state.users.map(user => `
      <div class="border rounded p-3 mb-3">
        <h6 class="fw-bold mb-1">${user.name}</h6>
        <p class="mb-1">${user.email} • ${user.role}</p>
        <button class="btn btn-outline-secondary btn-sm me-2" data-reset-password="${user.id}">Reset password</button>
        <button class="btn btn-outline-danger btn-sm" data-remove-user="${user.id}">Remove</button>
      </div>
    `).join('');
    document.querySelectorAll('[data-reset-password]').forEach(btn => btn.addEventListener('click', () => resetUserPassword(btn.dataset.resetPassword)));
    document.querySelectorAll('[data-remove-user]').forEach(btn => btn.addEventListener('click', () => removeUser(btn.dataset.removeUser)));
  }
}

async function addVenue() {
  const name = document.getElementById('venueName').value.trim();
  const capacity = Number(document.getElementById('venueCapacity').value);
  const suitableFor = document.getElementById('venueSuitability').value.trim();
  if (!name || !capacity || !suitableFor) {
    alert('Please fill all venue fields.');
    return;
  }
  const newVenue = {
    id: 'v' + (state.venues.length + 1),
    name,
    capacity,
    suitableFor
  };
  state.venues.push(newVenue);
  await persistData();
  render();
}

async function removeUser(userId) {
  state.users = state.users.filter(u => u.id !== userId);
  if (state.user && state.user.id === userId) {
    state.user = null;
  }
  await persistData();
  render();
}

async function resetUserPassword(userId) {
  const user = state.users.find(u => u.id === userId);
  if (!user) return;
  const newPassword = prompt(`Enter new password for ${user.name}`);
  if (!newPassword) return;
  user.password = newPassword;
  if (state.user && state.user.id === user.id) {
    state.user.password = newPassword;
  }
  await persistData();
  alert(`Password updated for ${user.name}.`);
}

async function addAdminEvent() {
  const title = document.getElementById('adminEventTitle').value.trim();
  const category = document.getElementById('adminEventCategory').value;
  const date = document.getElementById('adminEventDate').value;
  const price = Number(document.getElementById('adminEventPrice').value);
  const venueId = document.getElementById('adminEventVenue').value;
  const capacity = Number(document.getElementById('adminEventCapacity').value);
  const description = document.getElementById('adminEventDescription').value.trim();
  const conditions = document.getElementById('adminEventConditions').value.trim();
  const multiDay = document.getElementById('adminEventMultiDay').checked;
  const days = multiDay ? Number(document.getElementById('adminEventDays').value) : 1;
  if (!title || !date || !venueId || !capacity) {
    alert('Please fill all required fields.');
    return;
  }

  if (state.editingEventId) {
    const event = state.events.find(e => e.id === state.editingEventId);
    event.title = title;
    event.category = category;
    event.date = date;
    event.price = price;
    event.venueId = venueId;
    event.capacity = capacity;
    event.description = description || event.description;
    event.conditions = conditions || event.conditions;
    event.lastBookingDate = date;
    event.multiDay = multiDay;
    event.days = multiDay ? days : undefined;
    event.status = 'published';
    state.editingEventId = null;
    alert('Event updated successfully.');
  } else {
    const newEvent = {
      id: 'e' + (state.events.length + 1),
      title,
      category,
      date,
      price,
      venueId,
      capacity,
      booked: 0,
      description: description || 'Added via admin dashboard.',
      conditions: conditions || 'Please arrive early.',
      lastBookingDate: date,
      multiDay,
      days: multiDay ? days : undefined,
      status: 'published',
      organiserId: state.user.id
    };
    state.events.push(newEvent);
    alert('Event created successfully.');
  }
  await persistData();
  render();
}

function editEvent(eventId) {
  const event = state.events.find(e => e.id === eventId);
  state.editingEventId = event.id;
  document.getElementById('adminEventTitle').value = event.title;
  document.getElementById('adminEventCategory').value = event.category;
  document.getElementById('adminEventDate').value = event.date;
  document.getElementById('adminEventPrice').value = event.price;
  document.getElementById('adminEventVenue').value = event.venueId;
  document.getElementById('adminEventCapacity').value = event.capacity;
  document.getElementById('adminEventDescription').value = event.description;
  document.getElementById('adminEventConditions').value = event.conditions;
  document.getElementById('adminEventMultiDay').checked = event.multiDay;
  document.getElementById('adminEventDays').value = event.multiDay ? event.days : 1;
  alert('Event loaded into the editor. Click save event to update it.');
}

async function removeEvent(eventId) {
  state.events = state.events.filter(e => e.id !== eventId);
  state.bookings = state.bookings.filter(b => b.eventId !== eventId);
  state.waitlist = state.waitlist.filter(w => w.eventId !== eventId);
  await persistData();
  render();
}

function renderOrganiserDashboards() {
  const organiserEvents = document.getElementById('organiserEvents');
  if (organiserEvents) {
    const ownEvents = state.events.filter(e => e.organiserId === state.user.id);
    organiserEvents.innerHTML = ownEvents.length ? ownEvents.map(event => `
      <div class="border rounded p-3 mb-3">
        <h6 class="fw-bold">${event.title}</h6>
        <p class="mb-1">Price: £${event.price}</p>
        <p class="mb-1">Capacity: ${event.capacity} | Booked: ${event.booked}</p>
        <p class="mb-1">Status: ${event.status}</p>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-outline-warning btn-sm" data-pay-host="${event.id}">Pay hosting fee</button>
          <button class="btn btn-outline-danger btn-sm" data-cancel-organiser-event="${event.id}">Cancel</button>
        </div>
      </div>
    `).join('') : '<p class="text-muted">No events added yet.</p>';
  }

  document.querySelectorAll('[data-pay-host]').forEach(btn => btn.addEventListener('click', () => payHostingFee(btn.dataset.payHost)));
  document.querySelectorAll('[data-cancel-organiser-event]').forEach(btn => btn.addEventListener('click', () => cancelOrganiserEvent(btn.dataset.cancelOrganiserEvent)));

  const organiserForm = document.getElementById('organiserForm');
  if (organiserForm) {
    organiserForm.innerHTML = `
      <div class="mb-3"><label class="form-label">Event title</label><input id="newEventTitle" class="form-control" /></div>
      <div class="mb-3"><label class="form-label">Category</label><select id="newEventCategory" class="form-select"><option>Music</option><option>Workshop</option><option>Sports</option><option>Exhibition</option><option>Religious</option></select></div>
      <div class="mb-3"><label class="form-label">Date</label><input id="newEventDate" type="date" class="form-control" /></div>
      <div class="mb-3"><label class="form-label">Price</label><input id="newEventPrice" type="number" class="form-control" /></div>
      <div class="mb-3"><label class="form-label">Capacity</label><input id="newEventCapacity" type="number" class="form-control" /></div>
      <button class="btn btn-warning w-100" id="createEventBtn">Create event</button>
    `;
    document.getElementById('createEventBtn').addEventListener('click', createOrganiserEvent);
  }
}

async function createOrganiserEvent() {
  const newEvent = {
    id: 'e' + (state.events.length + 1),
    title: document.getElementById('newEventTitle').value,
    category: document.getElementById('newEventCategory').value,
    date: document.getElementById('newEventDate').value,
    price: Number(document.getElementById('newEventPrice').value),
    venueId: 'v6',
    capacity: Number(document.getElementById('newEventCapacity').value),
    booked: 0,
    description: 'Created by event organiser.',
    conditions: 'Please arrive early.',
    lastBookingDate: document.getElementById('newEventDate').value,
    multiDay: false,
    status: 'pending',
    organiserId: state.user.id,
    hostingFeePaid: false
  };
  state.events.push(newEvent);
  await persistData();
  render();
}

async function payHostingFee(eventId) {
  const event = state.events.find(e => e.id === eventId);
  event.hostingFeePaid = true;
  event.status = 'published';
  await persistData();
  alert('Hosting fee of £100 simulated successfully. The event is now published.');
  render();
}

async function cancelOrganiserEvent(eventId) {
  const event = state.events.find(e => e.id === eventId);
  event.status = 'cancelled';
  await persistData();
  render();
}

function getVenueName(venueId) {
  const venue = state.venues.find(v => v.id === venueId);
  return venue ? venue.name : 'Venue TBD';
}

window.addEventListener('DOMContentLoaded', loadData);
