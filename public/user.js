const API = `${window.location.origin}/api/user`;

const usernameEl = document.getElementById("username");
const pointsEl = document.getElementById("points");
const betInput = document.getElementById("bet");
const betSection = document.querySelector(".bet-section");

const MAX_BET = 100;
const MIN_BET = 1;

async function loadUserData() {
  try {
    const res = await fetch(`${API}`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });

    const userData = await res.json();
    if (!userData || !userData.success) {
      alert(userData.message || "Помилка завантаження даних");
      return;
    }

    return userData.data;
  } catch (err) {
    console.error("Error loading user data:", err);
    alert("Не вдалося завантажити дані користувача");
  }
}
async function startGame(bet) {
  try {
    const res = await fetch(`${API}/game/start`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
      },
      body: JSON.stringify({ bet }),
    });

    const data = await res.json();
    if (!data || !data.success) {
      alert(data.message || "Помилка");
      return false;
    }

    localStorage.setItem("lastBet", data.bet);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
async function displayUserInfo() {
  const userData = await loadUserData();
  if (!userData) window.location.href = "auth.html";

  const maxBet = Math.min(userData.points, MAX_BET);
  // Оновлюємо інтерфейс
  usernameEl.textContent = userData.username;
  pointsEl.textContent = userData.points;
  betInput.max = maxBet;
  betSection.title = `Мінімальна ставка: ${MIN_BET}, Максимальна ставка: ${MAX_BET}`;
}

document.getElementById("startGameBtn").addEventListener("click", async () => {
  const bet = parseInt(betInput.value);
  const maxPoints = parseInt(betInput.max);

  if (maxPoints < MIN_BET) {
    alert(`Мінімальна ставка ${MIN_BET}. У вас недостатньо поінтів`);
    return;
  }

  if (bet < MIN_BET || bet > maxPoints) {
    alert(`Ставка має бути від ${MIN_BET} до ${maxPoints}`);
    return;
  }
  try {
    const result = await startGame(bet);
    if (result) {
      window.location.href = "/game.html";
    }
  } catch (err) {
    console.log(err);
  }
});
document.getElementById("signOutBtn").addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  window.location.href = "auth.html";
});

const payoutMessage = localStorage.getItem("payout");
if (payoutMessage) {
  alert(payoutMessage);
  localStorage.removeItem("payout");
}

displayUserInfo();
