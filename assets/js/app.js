const isPageLoad = !sessionStorage.getItem('appInitialized');

if (isPageLoad) {
  sessionStorage.setItem('appInitialized', 'true');
  
  const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' }
  ];
  
  const defaultRoutes = [
    {
      title: 'KL to Penang Express',
      description: 'Comfortable express bus with air conditioning and WiFi',
      from: 'Kuala Lumpur',
      to: 'Penang',
      times: ['08:00', '12:00', '16:00', '20:00'],
      maxSeats: 40
    },
    {
      title: 'JB Southern Route',
      description: 'Direct route from KL to Johor Bahru with rest stops',
      from: 'Kuala Lumpur',
      to: 'Johor Bahru',
      times: ['07:00', '10:00', '14:00', '18:00'],
      maxSeats: 35
    },
    {
      title: 'Melaka Heritage Tour',
      description: 'Scenic route to historical Melaka city',
      from: 'Kuala Lumpur',
      to: 'Melaka',
      times: ['09:00', '13:00', '17:00'],
      maxSeats: 30
    },
    {
      title: 'Ipoh City Express',
      description: 'Fast and convenient service to Ipoh',
      from: 'Kuala Lumpur',
      to: 'Ipoh',
      times: ['08:30', '12:30', '16:30', '19:30'],
      maxSeats: 38
    },
    {
      title: 'East Coast Line',
      description: 'Journey to Kuantan with coastal views',
      from: 'Kuala Lumpur',
      to: 'Kuantan',
      times: ['07:00', '11:00', '15:00'],
      maxSeats: 32
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  localStorage.setItem('routes', JSON.stringify(defaultRoutes));
  localStorage.setItem('bookings', JSON.stringify([]));
}

let users = JSON.parse(localStorage.getItem('users')) || [
  { username: 'admin', password: 'admin123', role: 'admin' }
];

let routes = JSON.parse(localStorage.getItem('routes')) || [];
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
let currentUser = null;

function updateNavigation() {
  const adminLinks = document.querySelectorAll('.admin-only');
  const userLinks = document.querySelectorAll('.user-only');
  const guestUserLinks = document.querySelectorAll('.guest-user-only');
  const logoutBtn = document.getElementById('nav-logout-btn');
  
  if (!currentUser) {
    adminLinks.forEach(link => link.classList.add('hidden'));
    userLinks.forEach(link => link.classList.add('hidden'));
    guestUserLinks.forEach(link => link.classList.remove('hidden'));
    logoutBtn.classList.add('hidden');
  } else if (currentUser.role === 'admin') {
    adminLinks.forEach(link => link.classList.remove('hidden'));
    userLinks.forEach(link => link.classList.add('hidden'));
    guestUserLinks.forEach(link => link.classList.add('hidden'));
    logoutBtn.classList.remove('hidden');
  } else {
    adminLinks.forEach(link => link.classList.add('hidden'));
    userLinks.forEach(link => link.classList.remove('hidden'));
    guestUserLinks.forEach(link => link.classList.remove('hidden'));
    logoutBtn.classList.remove('hidden');
  }
}

function showPage(pageId) {
  const pages = ['landing-page', 'register-page', 'login-page', 'dashboard', 
                 'booking-page', 'mybookings-page', 'admin-page', 'info-page', 
                 'contact-page', 'report-page'];
  
  pages.forEach(page => {
    const element = document.getElementById(page);
    if (element) {
      element.classList.add('hidden');
    }
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  }
}

function showNotification(message, isError = false) {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.className = isError ? 'error' : '';
  notif.classList.remove('hidden');
  setTimeout(() => notif.classList.add('hidden'), 3000);
}

document.getElementById('go-register').addEventListener('click', () => showPage('register-page'));
document.getElementById('back-register').addEventListener('click', () => showPage('landing-page'));

document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  if (users.find(u => u.username === username)) {
    showNotification('Username already exists!', true);
    return;
  }

  users.push({ username, password, role: 'user' });
  localStorage.setItem('users', JSON.stringify(users));
  showNotification('Registration successful! Please login.');
  document.getElementById('register-form').reset();
  showPage('login-page');
});

document.getElementById('go-login').addEventListener('click', () => showPage('login-page'));
document.getElementById('back-login').addEventListener('click', () => showPage('landing-page'));

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    showNotification('Invalid username or password!', true);
    return;
  }

  currentUser = user;
  routes = JSON.parse(localStorage.getItem('routes')) || [];
  bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  updateNavigation();
  showNotification(`Welcome, ${user.username}!`);
  document.getElementById('login-form').reset();
  showPage('dashboard');
  loadRoutes();
});

document.getElementById('nav-logout-btn').addEventListener('click', () => {
  currentUser = null;
  updateNavigation();
  showPage('landing-page');
  showNotification('Logged out successfully.');
});

document.getElementById('nav-home').addEventListener('click', (e) => {
  e.preventDefault();
  if (currentUser) {
    showPage('dashboard');
    loadRoutes();
  } else {
    showPage('landing-page');
  }
});

document.getElementById('nav-info').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('info-page');
});

document.getElementById('nav-admin').addEventListener('click', (e) => {
  e.preventDefault();
  
  if (!currentUser || currentUser.role !== 'admin') {
    showNotification('Unauthorized access! Admin only.', true);
    showPage('dashboard');
    return;
  }
  
  showPage('admin-page');
  loadAdminRoutes();
});

document.getElementById('nav-mybookings').addEventListener('click', (e) => {
  e.preventDefault();
  
  if (!currentUser) {
    showNotification('Please login first!', true);
    showPage('login-page');
    return;
  }
  
  showPage('mybookings-page');
  loadMyBookings();
});

document.getElementById('nav-report').addEventListener('click', (e) => {
  e.preventDefault();
  
  if (!currentUser || currentUser.role !== 'admin') {
    showNotification('Unauthorized access! Admin only.', true);
    showPage('dashboard');
    return;
  }
  
  showPage('report-page');
  generateReports();
});

document.getElementById('nav-contact').addEventListener('click', (e) => {
  e.preventDefault();
  showPage('contact-page');
});

document.getElementById('back-from-info').addEventListener('click', () => {
  if (currentUser) showPage('dashboard');
  else showPage('landing-page');
});

document.getElementById('back-from-contact').addEventListener('click', () => {
  if (currentUser) showPage('dashboard');
  else showPage('landing-page');
});

document.getElementById('back-from-admin').addEventListener('click', () => showPage('dashboard'));
document.getElementById('back-from-mybookings').addEventListener('click', () => showPage('dashboard'));
document.getElementById('back-from-report').addEventListener('click', () => showPage('dashboard'));

document.getElementById('search-route').addEventListener('click', () => {
  const from = document.getElementById('from-location').value;
  const to = document.getElementById('to-location').value;

  if (!from || !to) {
    showNotification('Please select both departure and destination!', true);
    return;
  }

  if (from === to) {
    showNotification('Departure and destination cannot be the same!', true);
    return;
  }

  loadRoutes(from, to);
});

function loadRoutes(from = '', to = '') {
  routes = JSON.parse(localStorage.getItem('routes')) || [];
  
  const container = document.getElementById('routes-container');
  container.innerHTML = '';

  let filteredRoutes = routes;
  if (from && to) {
    filteredRoutes = routes.filter(r => r.from === from && r.to === to);
  }

  if (filteredRoutes.length === 0) {
    container.innerHTML = '<p style="color:white; text-align:center; font-size:18px;">No routes available for this selection.</p>';
    return;
  }

  filteredRoutes.forEach((route) => {
    const card = document.createElement('div');
    card.className = 'route-card';
    card.innerHTML = `
      <h4>${route.title}</h4>
      <p><strong>From:</strong> ${route.from} <strong>To:</strong> ${route.to}</p>
      <p>${route.description}</p>
      <p><strong>Available Times:</strong> ${route.times.join(', ')}</p>
      <p><strong>Max Seats:</strong> ${route.maxSeats}</p>
      <button class="btn primary" onclick="openBooking('${route.title.replace(/'/g, "\\'")}')">Book Now</button>
    `;
    container.appendChild(card);
  });
}

function openBooking(routeTitle) {
  if (!currentUser) {
    showNotification('Please login to book tickets!', true);
    showPage('login-page');
    return;
  }

  const route = routes.find(r => r.title === routeTitle);
  if (!route) return;

  document.getElementById('route-title').textContent = route.title;
  document.getElementById('route-desc').textContent = `${route.from} to ${route.to} - ${route.description}`;

  const timeSlotsDisplay = document.getElementById('time-slots-display');
  timeSlotsDisplay.innerHTML = '';
  const timeSelect = document.getElementById('selected-time-slot');
  timeSelect.innerHTML = '';

  route.times.forEach(time => {
    const badge = document.createElement('span');
    badge.className = 'time-slot-badge';
    badge.textContent = time;
    timeSlotsDisplay.appendChild(badge);

    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });

  showPage('booking-page');

  document.getElementById('booking-form').onsubmit = (e) => {
    e.preventDefault();
    const seats = parseInt(document.getElementById('book-seats').value);
    const timeSlot = document.getElementById('selected-time-slot').value;

    if (seats > route.maxSeats) {
      showNotification(`Maximum ${route.maxSeats} seats allowed!`, true);
      return;
    }

    bookings.push({
      username: currentUser.username,
      routeTitle: route.title,
      from: route.from,
      to: route.to,
      timeSlot: timeSlot,
      seats: seats,
      bookingDate: new Date().toLocaleDateString()
    });

    localStorage.setItem('bookings', JSON.stringify(bookings));
    showNotification('Booking confirmed successfully!');
    document.getElementById('booking-form').reset();
    showPage('dashboard');
    loadRoutes();
  };
}

document.getElementById('back-dashboard').addEventListener('click', () => showPage('dashboard'));

function loadMyBookings() {
  bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  
  const list = document.getElementById('my-bookings-list');
  const userBookings = bookings.filter(b => b.username === currentUser.username);

  if (userBookings.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#999;">You have no bookings yet.</p>';
    return;
  }

  list.innerHTML = '';
  userBookings.forEach((booking, index) => {
    const item = document.createElement('div');
    item.className = 'booking-item';
    item.innerHTML = `
      <h4>${booking.routeTitle}</h4>
      <p><strong>Route:</strong> ${booking.from} → ${booking.to}</p>
      <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
      <p><strong>Seats:</strong> ${booking.seats}</p>
      <p><strong>Booking Date:</strong> ${booking.bookingDate}</p>
      <button class="btn secondary" onclick="removeBooking('${booking.username}', ${index})">Remove Booking</button>
    `;
    list.appendChild(item);
  });
}

function removeBooking(username, bookingIndex) {
  if (!currentUser || currentUser.username !== username) {
    showNotification('Unauthorized action!', true);
    return;
  }

  if (confirm('Are you sure you want to remove this booking?')) {
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    const userBookings = bookings.filter(b => b.username === username);
    
    const bookingToRemove = userBookings[bookingIndex];
    
    const actualIndex = bookings.findIndex(b => 
      b.username === bookingToRemove.username &&
      b.routeTitle === bookingToRemove.routeTitle &&
      b.timeSlot === bookingToRemove.timeSlot &&
      b.bookingDate === bookingToRemove.bookingDate
    );
    
    if (actualIndex !== -1) {
      bookings.splice(actualIndex, 1);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      showNotification('Booking removed successfully.');
      loadMyBookings();
    }
  }
}

document.getElementById('admin-create-form').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!currentUser || currentUser.role !== 'admin') {
    showNotification('Unauthorized! Admin access required.', true);
    showPage('dashboard');
    return;
  }

  const title = document.getElementById('admin-title').value.trim();
  const description = document.getElementById('admin-description').value.trim();
  const from = document.getElementById('admin-from').value;
  const to = document.getElementById('admin-to').value;
  const timesInput = document.getElementById('admin-times').value;
  const times = timesInput.split(',').map(t => t.trim()).filter(t => t);
  const maxSeats = parseInt(document.getElementById('admin-seats').value);

  if (from === to) {
    showNotification('Departure and destination cannot be the same!', true);
    return;
  }

  if (times.length === 0) {
    showNotification('Please enter at least one time slot!', true);
    return;
  }

  if (routes.find(r => r.title === title)) {
    showNotification('Route with this title already exists!', true);
    return;
  }

  routes.push({ title, description, from, to, times, maxSeats });
  
  localStorage.setItem('routes', JSON.stringify(routes));

  showNotification('Route added successfully!');
  document.getElementById('admin-create-form').reset();
  
  loadAdminRoutes();
});

function loadAdminRoutes() {
  routes = JSON.parse(localStorage.getItem('routes')) || [];
  
  const list = document.getElementById('admin-routes-list');
  
  if (routes.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#999;">No routes created yet.</p>';
    return;
  }

  list.innerHTML = '';
  routes.forEach((route, index) => {
    const item = document.createElement('div');
    item.className = 'admin-route-item';
    item.innerHTML = `
      <h4>${route.title}</h4>
      <p><strong>Route:</strong> ${route.from} → ${route.to}</p>
      <p><strong>Description:</strong> ${route.description}</p>
      <p><strong>Time Slots:</strong> ${route.times.join(', ')}</p>
      <p><strong>Max Seats:</strong> ${route.maxSeats}</p>
      <button class="btn secondary" onclick="deleteRoute(${index})">Remove Route</button>
    `;
    list.appendChild(item);
  });
}

function deleteRoute(index) {
  if (!currentUser || currentUser.role !== 'admin') {
    showNotification('Unauthorized! Admin access required.', true);
    return;
  }

  routes = JSON.parse(localStorage.getItem('routes')) || [];

  if (confirm(`Are you sure you want to remove "${routes[index].title}"?`)) {
    routes.splice(index, 1);
    
    localStorage.setItem('routes', JSON.stringify(routes));
    
    showNotification('Route removed successfully.');
    
    loadAdminRoutes();
  }
}

function generateReports() {
  if (!currentUser || currentUser.role !== 'admin') {
    showNotification('Unauthorized! Admin access required.', true);
    showPage('dashboard');
    return;
  }

  bookings = JSON.parse(localStorage.getItem('bookings')) || [];

  if (bookings.length === 0) {
    document.getElementById('users-by-route').innerHTML = '<p style="text-align:center; color:#999;">No booking data available yet.</p>';
    
    const canvas1 = document.getElementById('bookings-chart');
    const canvas2 = document.getElementById('timeslots-chart');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    ctx1.font = '16px Arial';
    ctx1.fillStyle = '#999';
    ctx1.textAlign = 'center';
    ctx1.fillText('No booking data available', canvas1.width / 2, canvas1.height / 2);
    
    ctx2.font = '16px Arial';
    ctx2.fillStyle = '#999';
    ctx2.textAlign = 'center';
    ctx2.fillText('No booking data available', canvas2.width / 2, canvas2.height / 2);
    
    return;
  }

  const canvas1 = document.getElementById('bookings-chart');
  const canvas2 = document.getElementById('timeslots-chart');
  
  if (window.bookingsChartInstance) {
    window.bookingsChartInstance.destroy();
  }
  if (window.timesChartInstance) {
    window.timesChartInstance.destroy();
  }

  const routeBookingCounts = {};
  bookings.forEach(b => {
    routeBookingCounts[b.routeTitle] = (routeBookingCounts[b.routeTitle] || 0) + b.seats;
  });

  const ctx1 = canvas1.getContext('2d');
  window.bookingsChartInstance = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(routeBookingCounts),
      datasets: [{
        label: 'Total Seats Booked',
        data: Object.values(routeBookingCounts),
        backgroundColor: '#667eea',
        borderColor: '#5568d3',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          display: true,
          position: 'top'
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });

  const timeSlotCounts = {};
  bookings.forEach(b => {
    timeSlotCounts[b.timeSlot] = (timeSlotCounts[b.timeSlot] || 0) + 1;
  });

  const ctx2 = canvas2.getContext('2d');
  window.timesChartInstance = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(timeSlotCounts),
      datasets: [{
        data: Object.values(timeSlotCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF9999', '#66B3FF']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: {
            padding: 10
          }
        },
        title: {
          display: false
        }
      }
    }
  });

  const usersByRoute = {};
  bookings.forEach(b => {
    if (!usersByRoute[b.routeTitle]) {
      usersByRoute[b.routeTitle] = [];
    }
    usersByRoute[b.routeTitle].push(`${b.username} - ${b.seats} seat(s) at ${b.timeSlot} (${b.bookingDate})`);
  });

  const usersDiv = document.getElementById('users-by-route');
  usersDiv.innerHTML = '';
  
  if (Object.keys(usersByRoute).length === 0) {
    usersDiv.innerHTML = '<p style="text-align:center; color:#999;">No booking data available yet.</p>';
    return;
  }
  
  Object.keys(usersByRoute).forEach(routeTitle => {
    const section = document.createElement('div');
    section.className = 'route-user-section';
    section.innerHTML = `
      <h5>${routeTitle}</h5>
      <ul>${usersByRoute[routeTitle].map(u => `<li>${u}</li>`).join('')}</ul>
    `;
    usersDiv.appendChild(section);
  });
}

showPage('landing-page');
updateNavigation();
