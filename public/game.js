const API = `${window.location.origin}/api/user/game`;

let lastBet;
let symbols;

async function loadUserData() {
  try {
    const res = await fetch(`${window.location.origin}/api/user`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });

    const userData = await res.json();
    if (!userData || !userData.success) {
      alert(userData.message || "Помилка");
      return;
    }

    return userData.data;
  } catch (err) {
    console.error("Error loading user data:", err);
    alert("Не вдалося завантажити дані користувача");
  }
}
async function loadSymbols() {
  try {
    const res = await fetch(`${API}/symbols`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });

    const symbols = await res.json();
    if (!symbols || !symbols.success) {
      alert(symbols.message || "Помилка");
      return;
    }

    return symbols.data;
  } catch (err) {
    console.error("Error loading user data:", err);
    alert("Не вдалося завантажити дані користувача");
  }
}

async function dispalyData() {
  document.getElementById("rollBtn").disabled = true;

  lastBet = localStorage.getItem("lastBet");
  document.getElementById("credits").textContent = lastBet;

  const userData = await loadUserData();
  if (!userData) window.location.href = "user.html";

  document.getElementById("username").textContent =
    userData.username || "Player";

  symbols = await loadSymbols();
  if (!symbols) window.location.href = "user.html";
  document.getElementById("rollBtn").disabled = false;
}

function startSpinning(slot) {
  const container = slot.querySelector(".symbols-container");

  if (!container) {
    console.warn("No symbols container inside slot");
    return;
  }

  let position = 0;
  const stepHeight = slot.clientHeight;
  let animationId;

  function spinStep() {
    if (!slot.classList.contains("spinning")) {
      cancelAnimationFrame(animationId);
      container.style.transform = "translateY(0)";
      return;
    }

    position -= 5; 

    if (position <= -stepHeight * symbols.length) {
      position = 0; 
    }

    container.style.transform = `translateY(${position}px)`;
    animationId = requestAnimationFrame(spinStep);
  }

  animationId = requestAnimationFrame(spinStep);
}

async function spinSlots() {
  const slots = document.querySelectorAll(".slot");

  slots.forEach((slot) => {
    let container = slot.querySelector(".symbols-container");

    container.innerHTML = "";

    for (let i = 0; i < symbols.length * 3; i++) {
      const span = document.createElement("span");
      span.textContent = symbols[i % symbols.length];
      span.style.height = slot.clientHeight + "px";
      span.style.display = "block";
      span.style.textAlign = "center";
      container.appendChild(span);
    }

    slot.classList.add("spinning");

    startSpinning(slot);
  });
}

async function roll() {
  try {
    document.getElementById("rollBtn").disabled = true;
    document.getElementById("cashoutBtn").disabled = true;
    lastBet = Math.max(0, lastBet - 1);
    localStorage.setItem("lastBet", lastBet);
    document.getElementById("credits").textContent = lastBet;

    spinSlots();
    const res = await fetch(`${API}/spin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const data = await res.json();
    const slots = [
      document.getElementById("slot1"),
      document.getElementById("slot2"),
      document.getElementById("slot3"),
    ];

    if (!data || !data.success) {
      alert(data.message || "Помилка");
      slots.forEach((slot) => {
        slot.classList.remove("spinning");
      });
      document.getElementById("rollBtn").disabled = false;
      document.getElementById("cashoutBtn").disabled = false;
      return;
    }

    slots.forEach((slot, i) => {
      setTimeout(() => {
        slot.classList.remove("spinning");
        let container = slot.querySelector(".symbols-container");
        container.innerHTML = data.result[i];

        if (i === 2) {
          document.getElementById("credits").textContent = data.payout;
          lastBet = data.payout;
          document.getElementById("rollBtn").disabled = false;
          document.getElementById("cashoutBtn").disabled = false;
        }
      }, (i + 1) * 1000);
    });
  } catch (err) {
    console.log(err);
  }
}

async function cashOut() {
  try {
    const res = await fetch(`${API}/cashout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });

    const data = await res.json();
    if (!data || !data.success) {
      alert(data.message || "Помилка");
    } else {
      localStorage.setItem("payout", data.message);
      window.location.href = "/user.html";
    }
  } catch (err) {
    console.log(err);
  }
}

document.getElementById("rollBtn").addEventListener("click", roll);
document.getElementById("cashoutBtn").addEventListener("click", cashOut);

dispalyData();
