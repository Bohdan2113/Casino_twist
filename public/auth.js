// Перемикач форм
const loginFormDiv = document.getElementById("login-form");
const registerFormDiv = document.getElementById("register-form");

document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginFormDiv.style.display = "none";
  registerFormDiv.style.display = "block";
  clearMessages();
});

document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerFormDiv.style.display = "none";
  loginFormDiv.style.display = "block";
  clearMessages();
});

// Функція для показу/приховання пароля для будь-якої форми
function setupTogglePassword(formDiv) {
  const toggleBtns = formDiv.querySelectorAll(".toggle-password");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
        btn.setAttribute("aria-label", "Сховати пароль");
      } else {
        input.type = "password";
        btn.textContent = "👁️";
        btn.setAttribute("aria-label", "Показати пароль");
      }
    });
  });
}
setupTogglePassword(loginFormDiv);
setupTogglePassword(registerFormDiv);

// Елемент для повідомлень
function createMessageElem(formDiv) {
  let elem = formDiv.querySelector(".message");
  if (!elem) {
    elem = document.createElement("p");
    elem.className = "message";
    elem.style.textAlign = "center";
    elem.style.marginTop = "1rem";
    elem.style.fontWeight = "bold";
    elem.style.color = "red";
    formDiv.querySelector("form").appendChild(elem);
  }
  return elem;
}

function clearMessages() {
  [loginFormDiv, registerFormDiv].forEach((div) => {
    const msg = div.querySelector(".message");
    if (msg) msg.textContent = "";
    div.querySelector("form").reset();
  });
}

// Обробка submit логіну
loginFormDiv.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = createMessageElem(loginFormDiv);
  msg.style.color = "red";
  msg.textContent = "";

  const username = loginFormDiv.querySelector("#login-username").value.trim();
  const password = loginFormDiv.querySelector("#login-password").value.trim();

  if (!username || !password) {
    msg.textContent = "Будь ласка, введіть ім’я користувача та пароль.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Помилка при вході.";
      return;
    }

    msg.style.color = "limegreen";
    msg.textContent = data.message || "Вхід успішний!";

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/user.html";
    }
  } catch {
    msg.textContent = "Помилка мережі. Спробуйте пізніше.";
  }
});

// Обробка submit реєстрації
registerFormDiv.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = createMessageElem(registerFormDiv);
  msg.style.color = "red";
  msg.textContent = "";

  const username = registerFormDiv
    .querySelector("#register-username")
    .value.trim();
  const password = registerFormDiv
    .querySelector("#register-password")
    .value.trim();

  if (!username || !password) {
    msg.textContent = "Будь ласка, введіть ім’я користувача та пароль.";
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Помилка при реєстрації.";
      return;
    }

    msg.style.color = "limegreen";
    msg.textContent = data.message || "Реєстрація успішна! Тепер увійдіть.";

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/user.html";
    }
    setTimeout(() => {
      registerFormDiv.style.display = "none";
      loginFormDiv.style.display = "block";
      clearMessages();
    }, 200);
  } catch {
    msg.textContent = "Помилка мережі. Спробуйте пізніше.";
  }
});
