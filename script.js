function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}
document.getElementById('signupForm').addEventListener('submit', (event) => {
  event.preventDefault();
  window.location.href = 'dashboard.html';
});


let expenses = getFromLocalStorage("expenses") || [];
let monthlyBudget = getFromLocalStorage("monthlyBudget") || 0;

function updateDashboard() {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = monthlyBudget - totalExpenses;

  document.getElementById("total-expenses").textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById("remaining-budget").textContent = `$${remainingBudget.toFixed(2)}`;
  populateRecentTransactions();
}
function populateRecentTransactions() {
  const transactionsTable = document.querySelector("#transactions tbody");
  transactionsTable.innerHTML = ""; 
  expenses.slice(-5).forEach((exp) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${exp.date}</td>
          <td>${exp.name}</td>
          <td>$${exp.amount.toFixed(2)}</td>
          <td>${exp.category}</td>
      `;
      transactionsTable.appendChild(row);
  });
}
function addExpense(event) {
  event.preventDefault();

  const date = document.getElementById("date").value;
  const name = document.getElementById("name").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!date || !name || isNaN(amount) || !category) {
      alert("Please fill out all fields correctly.");
      return;
  }
  
  const newExpense = { date, name, amount, category };
  expenses.push(newExpense);
  saveToLocalStorage("expenses", expenses);

  alert("Expense added successfully!");
  document.getElementById("addExpenseForm").reset();
  updateDashboard();
}
function generateReports() {
  const categoryData = {};
  expenses.forEach((exp) => {
      categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
  });
  const categoryChart = new Chart(document.getElementById("categoryChart"), {
      type: "pie",
      data: {
          labels: Object.keys(categoryData),
          datasets: [{
              data: Object.values(categoryData),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          }],
      },
  });
  const trendData = {};
  expenses.forEach((exp) => {
      const month = exp.date.slice(0, 7);
      trendData[month] = (trendData[month] || 0) + exp.amount;
  });

  const trendChart = new Chart(document.getElementById("trendChart"), {
      type: "line",
      data: {
          labels: Object.keys(trendData),
          datasets: [{
              label: "Spending Trends",
              data: Object.values(trendData),
              fill: false,
              borderColor: "#36A2EB",
              tension: 0.1,
          }],
      },
  });
}

function saveBudget() {
  const budgetInput = document.getElementById("budgetInput");
  const budget = parseFloat(budgetInput.value);

  if (isNaN(budget) || budget <= 0) {
      alert("Please enter a valid budget.");
      return;
  }

  monthlyBudget = budget;
  saveToLocalStorage("monthlyBudget", budget);
  alert("Monthly budget saved!");
  updateDashboard();
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  document.getElementById("toggleTheme").textContent = isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
}
function resetData() {
  if (confirm("Are you sure you want to reset all data?")) {
      localStorage.clear();
      expenses = [];
      monthlyBudget = 0;
      alert("All data has been reset.");
      updateDashboard();
      location.reload(); 
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("add-expense.html")) {
      document.getElementById("addExpenseForm").addEventListener("submit", addExpense);
  }

  if (path.includes("dashboard.html")) {
      updateDashboard();
  }

  if (path.includes("reports.html")) {
      generateReports();
  }

  if (path.includes("settings.html")) {
      document.getElementById("saveBudget").addEventListener("click", saveBudget);
      document.getElementById("toggleTheme").addEventListener("click", toggleTheme);
      document.getElementById("resetData").addEventListener("click", resetData);
  }
});



