document.addEventListener('DOMContentLoaded', () => {
  
// ======== AUTH CHECK FUNCTION ========
function checkAuth() {
  if (!loggedInUser) {
    alert('Please login first to use this feature!');
    authModal.classList.add('show');
    return false;
  }
  return true;
}

  // ======== GLOBAL VARIABLES ========
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const sidebarLinks = document.querySelectorAll('.sidebar .side-btn, .sidebar .side-link');
  const transactionTableBody = document.querySelector('#transactionsTable tbody');
  const EXPENSE_CATEGORIES = ['Food', 'Beauty', 'Transport', 'Utilities'];

  // ===== CATEGORY BREAKDOWN =====
  const categoryList = document.querySelectorAll('#categoryBreakdownList li');

  const categoryMap = {
    "Food": 0,
    "Beauty": 1,
    "Transport": 2,
    "Utilities": 3
  };

  // ADD TRANSACTION FORM
  const addTransactionForm = document.getElementById('addTransactionForm');
  const addDate = document.getElementById('addDate');
  const addDesc = document.getElementById('addDesc');
  const addAmount = document.getElementById('addAmount');
  const addCategory = document.getElementById('addCategory');

  // ===== STAR RATING & POPUP =====
  const openPopupBtn = document.querySelector('.open-review-btn');
  const reviewPopup = document.getElementById('reviewPopup');
  const closePopupBtn = document.getElementById('closeReviewPopup');
  const reviewForm = document.getElementById('reviewForm');
  const stars = document.querySelectorAll('#starRating .star');
  const selectedRatingInput = document.getElementById('selectedRating');
  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewCountEl = document.getElementById('reviewCount');

  const editSection = document.getElementById('editTransactionSection');
  const editForm = document.getElementById('editTransactionForm');
  const editDate = document.getElementById('editDate');
  const editDesc = document.getElementById('editDesc');
  const editAmount = document.getElementById('editAmount');
  const editCategory = document.getElementById('editCategory');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let currentEditIndex = null;
  let categoryChartInstance = null;

  // CALENDAR STATE
  let currentCalendarDate = new Date();

  cancelEditBtn.onclick = () => {
    editSection.style.display = 'none';
    currentEditIndex = null;
  };

  // ======== PAGE NAVIGATION ========
  function showPage(id) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    sidebarLinks.forEach(l => l.classList.remove('active'));

    const page = document.getElementById(id);
    if (page) page.classList.add('active');

    document.querySelectorAll(`[data-page="${id}"]`).forEach(el => el.classList.add('active'));

    if (id === 'transactions') renderTransactionsTable();
    if (id === 'budgetbook') {
      renderBudgetSummary();
      renderCalendar();
    }
    if (id === 'reports') {
      renderReports();
      renderChart();
      updateCategoryBreakdown();
    }
  }

  // NAV TOP LINKS
  navLinks.forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  }));

  // SIDEBAR LINKS
  sidebarLinks.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    showPage(btn.dataset.page);
  }));

  // SIDEBAR LOGO CLICK - Navigate to Budget Book
  const sidebarLogo = document.querySelector('.sidebar-logo');
  if (sidebarLogo) {
    sidebarLogo.addEventListener('click', () => showPage('budgetbook'));
  }

  // ======== SEARCH FUNCTIONALITY ========
  const searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
      renderTransactionsTable();
      return;
    }
    
    const filteredTransactions = transactions.filter(txn => 
      txn.description.toLowerCase().includes(searchTerm) ||
      txn.category.toLowerCase().includes(searchTerm) ||
      txn.date.includes(searchTerm)
    );
    
    if (filteredTransactions.length > 0) {
      showPage('transactions');
      renderFilteredTransactions(filteredTransactions);
    } else {
      showPage('transactions');
      transactionTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No transactions found for "' + searchTerm + '"</td></tr>';
    }
  });

  let selectedRating = 0;

  // Hover & select stars
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      stars.forEach(s => s.classList.remove('hovered'));
      for(let i=0;i<star.dataset.rating;i++) stars[i].classList.add('hovered');
    });
    star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hovered')));
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      selectedRatingInput.value = selectedRating;
      stars.forEach(s => s.classList.remove('selected'));
      for(let i=0;i<selectedRating;i++) stars[i].classList.add('selected');
    });
  });

  // Open / Close Popup
  openPopupBtn.onclick = () => reviewPopup.style.display = 'flex';
  closePopupBtn.onclick = () => reviewPopup.style.display = 'none';

  // ===== REVIEW DATA =====
  let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  reviewCountEl.textContent = reviews.length;

  function addReviewToCarousel(review) {
    const div = document.createElement('div');
    div.className = 'review-card';
    div.innerHTML = `
      <h4>${review.name}</h4>
      <div class="stars">${'⭐'.repeat(review.rating)}</div>
      <p>${review.comment}</p>
    `;
    reviewsTrack.appendChild(div);
  }

  reviews.forEach(addReviewToCarousel);

  // ===== SUBMIT REVIEW =====
  reviewForm.onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('reviewerName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();

    if(selectedRating === 0){
      alert('Please select a star rating!');
      return;
    }
    if(!name || !comment){
      alert('Please fill all fields!');
      return;
    }

    const review = { name, rating: selectedRating, comment };
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    addReviewToCarousel(review);
    reviewCountEl.textContent = reviews.length;

    reviewForm.reset();
    stars.forEach(s => s.classList.remove('selected'));
    selectedRating = 0;
    reviewPopup.style.display = 'none';
  };

  // ===== CAROUSEL SCROLL =====
  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');

  leftBtn.onclick = () => {
    const cardWidth = reviewsTrack.querySelector('.review-card')?.offsetWidth + 20 || 260;
    if (reviewsTrack.scrollLeft <= 0) {
      reviewsTrack.scrollLeft = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
    } else {
      reviewsTrack.scrollLeft -= cardWidth;
    }
  };

  rightBtn.onclick = () => {
    const cardWidth = reviewsTrack.querySelector('.review-card')?.offsetWidth + 20 || 260;
    if (reviewsTrack.scrollLeft + reviewsTrack.clientWidth >= reviewsTrack.scrollWidth - 5) {
      reviewsTrack.scrollLeft = 0;
    } else {
      reviewsTrack.scrollLeft += cardWidth;
    }
  };

  // ======== ADD TRANSACTION FORM ========
  if (addTransactionForm) {
    addTransactionForm.onsubmit = e => {
      e.preventDefault();
      
      const date = addDate.value || today();
      const description = addDesc.value.trim();
      const amount = parseFloat(addAmount.value);
      const category = addCategory.value;

      if (!description || isNaN(amount) || amount <= 0 || !category) {
        alert('Please fill all fields correctly');
        return;
      }

      addTransaction(date, description, amount, category);
      
      // Reset form
      addTransactionForm.reset();
      
      // Show success feedback
      alert('Transaction added successfully!');
    };
  }
  
  // Function to render filtered transactions
  function renderFilteredTransactions(filteredList) {
    if (!transactionTableBody) return;
    transactionTableBody.innerHTML = '';

    filteredList.forEach((txn) => {
      const originalIdx = transactions.findIndex(t => 
        t.date === txn.date && 
        t.description === txn.description && 
        t.amount === txn.amount
      );
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${txn.date}</td>
        <td>${txn.description}</td>
        <td style="text-align:right;">MYR ${txn.amount.toFixed(2)}</td>
        <td>${txn.category}</td>
        <td>
          <button class="edit-btn" data-index="${originalIdx}">Edit</button>
          <button class="delete-btn" data-index="${originalIdx}">Delete</button>
        </td>
      `;
      transactionTableBody.appendChild(tr);
    });
    
    // Re-attach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        currentEditIndex = Number(btn.dataset.index);
        const txn = transactions[currentEditIndex];
        editDate.value = txn.date;
        editDesc.value = txn.description;
        editAmount.value = txn.amount;
        editCategory.value = txn.category;
        editSection.style.display = 'block';
        editSection.scrollIntoView({ behavior: 'smooth' });
      };
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const delIndex = Number(btn.dataset.index);
        if (confirm('Are you sure you want to delete this transaction?')) {
          transactions.splice(delIndex, 1);
          saveTransactions();
          searchInput.value = '';
          renderTransactionsTable();
          renderBudgetSummary();
          renderReports();
          renderChart();
          updateCategoryBreakdown();
          renderCalendar();
          if (currentEditIndex === delIndex) {
            editSection.style.display = 'none';
            currentEditIndex = null;
          }
        }
      };
    });
  }
    
  // ======== TRANSACTIONS TABLE ========
  function renderTransactionsTable() {
    if (!transactionTableBody) return;
    transactionTableBody.innerHTML = '';

    transactions.forEach((txn, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${txn.date}</td>
        <td>${txn.description}</td>
        <td style="text-align:right;">MYR ${txn.amount.toFixed(2)}</td>
        <td>${txn.category}</td>
        <td>
          <button class="edit-btn" data-index="${idx}">Edit</button>
          <button class="delete-btn" data-index="${idx}">Delete</button>
        </td>
      `;
      transactionTableBody.appendChild(tr);
    });
    
    // Handle Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        currentEditIndex = Number(btn.dataset.index);
        const txn = transactions[currentEditIndex];
        editDate.value = txn.date;
        editDesc.value = txn.description;
        editAmount.value = txn.amount;
        editCategory.value = txn.category;
        editSection.style.display = 'block';
        editSection.scrollIntoView({ behavior: 'smooth' });
      };
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const delIndex = Number(btn.dataset.index);
        if (confirm('Are you sure you want to delete this transaction?')) {
          transactions.splice(delIndex, 1);
          saveTransactions();
          renderTransactionsTable();
          renderBudgetSummary();
          renderReports();
          renderChart();
          updateCategoryBreakdown();
          renderCalendar();
          if (currentEditIndex === delIndex) {
            editSection.style.display = 'none';
            currentEditIndex = null;
          }
        }
      };
    });
  }

  // ======== ADD TRANSACTION ========
  function addTransaction(date, description, amount, category) {
    transactions.push({ date, description, amount, category });
    saveTransactions();
    renderTransactionsTable();
    renderBudgetSummary();
    renderReports();
    renderChart();
    updateCategoryBreakdown();
    renderCalendar();
  }

  function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  // Function to calculate total income and total expense
  function calculateTotals() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const cat = t.category.trim();

      // Income categories
      if (cat === "Income") {
        income += amt;
      } 
      // All expense categories
      else if (["Food", "Beauty", "Transport", "Utilities"].includes(cat)) {
        expense += amt;
      }
    });

    return { income, expense };
  }

  // ======== REPORTS ========
  function renderReports() {
    const insightsEl = document.getElementById('financialInsights');
    if (!insightsEl) return;

    const { income, expense } = calculateTotals();

    if (income === 0 && expense === 0) {
      insightsEl.innerHTML = 'No data yet. Add transactions to see insights.';
    } else {
      insightsEl.innerHTML = `
        <strong>Total Income:</strong> MYR ${income.toFixed(2)}<br>
        <strong>Total Expense:</strong> MYR ${expense.toFixed(2)}<br>
        <strong>Balance:</strong> MYR ${(income - expense).toFixed(2)}<br><br>
        ${income - expense >= 0
          ? '✅ You are managing your budget well.'
          : '⚠️ Your expenses exceed income. Consider reviewing spending.'}
      `;
    }
  }

  // Category breakdown: Food, Beauty, Transport, Utilities
  function updateCategoryBreakdown() {
    const totals = { Food: 0, Beauty: 0, Transport: 0, Utilities: 0 };

    transactions.forEach(t => {
      const cat = t.category.trim();
      const amt = Number(t.amount);
      if (totals.hasOwnProperty(cat)) totals[cat] += amt;
    });

    Object.keys(totals).forEach((cat, idx) => {
      const li = categoryList[idx];
      if (li) li.querySelector('.category-amount').textContent = `MYR ${totals[cat].toFixed(2)}`;
    });
  }

  // ======== BUDGET SUMMARY ========
  function renderBudgetSummary() {
    const { income, expense } = calculateTotals();

    document.getElementById('walletIncome').textContent = `MYR ${income.toFixed(2)}`;
    document.getElementById('walletExpense').textContent = `MYR ${expense.toFixed(2)}`;
    document.getElementById('walletAmount').textContent = `MYR ${(income - expense).toFixed(2)}`;

    const summary = document.getElementById('transactionSummary');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let monthlyTransactions = 0;

    transactions.forEach(t => {
      const txnDate = new Date(t.date);
      const txnMonth = txnDate.getMonth();
      const txnYear = txnDate.getFullYear();

      if (txnMonth === currentMonth && txnYear === currentYear) {
        monthlyTransactions++;
      }
    });

    if (transactions.length > 0) {
      summary.innerHTML = `
        <strong>Total Transactions:</strong> ${transactions.length}<br>
        <strong>${monthNames[currentMonth]} ${currentYear}:</strong> ${monthlyTransactions} transactions
      `;
    } else {
      summary.textContent = 'No transactions yet';
    }
  }

  // ======== CHART PIE ========
  function renderChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const { income, expense } = calculateTotals();

    // if no transactions yet
    if (income === 0 && expense === 0) {
      if (categoryChartInstance) categoryChartInstance.destroy();
      return;
    }

    const data = [income, expense];

    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data,
          backgroundColor: ['#f1c240ff', '#7c3b99ff'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: MYR ${context.raw.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  editForm.onsubmit = e => {
    e.preventDefault();
    if (currentEditIndex !== null) {
      transactions[currentEditIndex] = {
        date: editDate.value,
        description: editDesc.value,
        amount: parseFloat(editAmount.value),
        category: editCategory.value
      };
      saveTransactions();
      renderTransactionsTable();
      renderBudgetSummary();
      renderReports();
      renderChart();
      updateCategoryBreakdown();
      renderCalendar();
      editSection.style.display = 'none';
      currentEditIndex = null;
    }
  };

  // ======== CALENDAR WITH NAVIGATION ========
  function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    calendarEl.innerHTML = '';

    // Header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('calendar-header');

    headerDiv.innerHTML = `
      <button id="prevMonth" style="background:#596549; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">◀</button>
      <span style="font-weight:bold;">${monthNames[month]} ${year}</span>
      <button id="nextMonth" style="background:#596549; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">▶</button>
    `;
    calendarEl.appendChild(headerDiv);

    // Navigation buttons
    document.getElementById('prevMonth').onclick = () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar();
    };

    document.getElementById('nextMonth').onclick = () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar();
    };

    // Grid
    const grid = document.createElement('div');
    grid.classList.add('calendar-grid');

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(d => {
      const dayEl = document.createElement('div');
      dayEl.classList.add('calendar-day-name');
      dayEl.textContent = d;
      grid.appendChild(dayEl);
    });

    // Blank days
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.classList.add('calendar-day', 'blank');
      grid.appendChild(blank);
    }

    // Days
    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('div');
      dayEl.classList.add('calendar-day');
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasTxn = transactions.some(t => t.date === dateStr);

      if (hasTxn) dayEl.classList.add('has-transaction', 'clickable');
      dayEl.textContent = d;

      dayEl.onclick = () => {
        const dayTxns = transactions.filter(t => t.date === dateStr);
        if (dayTxns.length > 0) {
          alert(`Transactions on ${dateStr}:\n` +
            dayTxns.map(t => `${t.category}: MYR ${t.amount.toFixed(2)} - ${t.description}`).join('\n'));
        }
      };

      grid.appendChild(dayEl);
    }
    calendarEl.appendChild(grid);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // ======== AUTH SYSTEM ======== 
  // *** BAHAGIAN NI JE YANG DIUBAH ***
  const authModal = document.getElementById('authModal');
  const profileIcon = document.getElementById('profileIcon');
  const profileNameEl = document.getElementById('profileName');
  const authForm = document.getElementById('authForm');
  const toggleAuth = document.getElementById('toggleAuth');
  const toggleAuthText = document.getElementById('toggleAuthText');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const authBtn = document.getElementById('authBtn');
  const ctaSignupBtn = document.getElementById('ctaSignupBtn');

  const loginFields = document.getElementById('loginFields');
  const registerFields = document.getElementById('registerFields');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  let isLogin = true;
  
  let users = [];
  let loggedInUser = null;

  // ===== OPEN MODAL FROM PROFILE ICON =====
  if (profileIcon) {
    profileIcon.onclick = () => {
      if (loggedInUser) {
        if (confirm('Log out from SmartBudget?')) {
          loggedInUser = null;
          profileNameEl.textContent = '';
          alert('Logged out successfully!');
        }
      } else {
        authModal.classList.add('show');
      }
    };
  }

  // ===== OPEN MODAL FROM SIGNUP BUTTON =====
  if (ctaSignupBtn) {
    ctaSignupBtn.onclick = () => {
      // Switch to register mode
      isLogin = false;
      loginFields.style.display = 'none';
      registerFields.style.display = 'block';
      modalTitle.textContent = 'Create Account';
      modalSubtitle.textContent = 'Sign up to start managing your budget';
      authBtn.textContent = 'Register';
      toggleAuthText.textContent = 'Already have an account?';
      toggleAuth.textContent = 'Log In';

      authModal.classList.add('show');
    };
  }

  // ===== TOGGLE LOGIN / REGISTER =====
  toggleAuth.onclick = e => {
    e.preventDefault();
    isLogin = !isLogin;

    loginFields.style.display = isLogin ? 'block' : 'none';
    registerFields.style.display = isLogin ? 'none' : 'block';

    modalTitle.textContent = isLogin ? 'Welcome back' : 'Create Account';
    modalSubtitle.textContent = isLogin
      ? 'Log in to pick up where you left off'
      : 'Sign up to start managing your budget';

    authBtn.textContent = isLogin ? 'Log In' : 'Register';
    toggleAuthText.textContent = isLogin
      ? 'Not Registered?'
      : 'Already have an account?';
    toggleAuth.textContent = isLogin
      ? 'Create an Account'
      : 'Log In';
  };

  // ===== SUBMIT LOGIN / REGISTER =====
  authForm.onsubmit = e => {
    e.preventDefault();

    // ===== LOGIN =====
    if (isLogin) {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        alert('Please fill in all fields');
        return;
      }

      const user = users.find(
        u =>
          (u.username === username || u.email === username) &&
          u.password === password
      );

      if (!user) {
        alert('Invalid username or password');
        return;
      }

      loggedInUser = user;
      authModal.classList.remove('show');
      updateProfileUI();
      alert(`Welcome back, ${user.firstName}!`);

      // Reset form
      authForm.reset();
    }
    // ===== REGISTER =====
    else {
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;

      if (!firstName || !lastName || !username || !email || !pass || !confirmPass) {
        alert('Please fill in all fields');
        return;
      }

      if (pass !== confirmPass) {
        alert('Passwords do not match');
        return;
      }

      if (!document.getElementById('agreeTerms').checked) {
        alert('You must agree to the Terms & Privacy Policy');
        return;
      }

      // Check if username or email already exists
      if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
      }

      if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
      }

      const newUser = {
        firstName,
        lastName,
        username,
        email,
        password: pass
      };

      users.push(newUser);

      // Auto login after registration
      loggedInUser = newUser;
      authModal.classList.remove('show');
      updateProfileUI();
      alert(`Account created successfully! Welcome, ${firstName}!`);

      // Reset form
      authForm.reset();
    }
  };

  // ===== FORGOT PASSWORD (DEMO FLOW) =====
  if (forgotPasswordLink) {
    forgotPasswordLink.onclick = e => {
      e.preventDefault();
      loginFields.innerHTML = `
        <div class="forgot-message">
          For security reasons, password recovery is handled via registered email.
          <br><br>
          <strong>Demo Version:</strong> Please re-register or contact support.
        </div>
        <button type="button" class="auth-submit-btn" id="backToLogin">
          Back to Login
        </button>
      `;

      document.getElementById('backToLogin').onclick = () => location.reload();
    };
  }

  // ===== TOGGLE PASSWORD VISIBILITY =====
  const togglePassword = document.getElementById('togglePassword');
  const toggleRegPassword = document.getElementById('toggleRegPassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

  if (togglePassword) {
    togglePassword.onclick = () => {
      const passwordInput = document.getElementById('password');
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    };
  }

  if (toggleRegPassword) {
    toggleRegPassword.onclick = () => {
      const passwordInput = document.getElementById('regPassword');
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    };
  }

  if (toggleConfirmPassword) {
    toggleConfirmPassword.onclick = () => {
      const passwordInput = document.getElementById('confirmPassword');
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    };
  }

  // ===== UPDATE PROFILE UI =====
  function updateProfileUI() {
    if (loggedInUser && profileNameEl) {
      profileNameEl.textContent = loggedInUser.firstName;
    }
  }

  // ===== AUTO LOGIN ON REFRESH =====
  updateProfileUI();
 

  // ===== FAQ ACCORDION =====
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      // Close other FAQs
      faqItems.forEach(i => {
        if (i !== item) {
          i.classList.remove("active");
        }
      });

      // Toggle current
      item.classList.toggle("active");
    });
  });

  // ======== INIT ========
  showPage('home');
  renderTransactionsTable();
  renderBudgetSummary();
  renderCalendar();
  renderChart();
  updateCategoryBreakdown();
});