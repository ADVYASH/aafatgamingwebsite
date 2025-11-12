const userCookie = document.cookie.split("; ").find(c => c.startsWith("user="));
if (userCookie) {
  const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
  if (document.getElementById("username")) {
    document.getElementById("username").textContent = user.username;
    document.getElementById("avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  }

  if (document.getElementById("name")) {
    document.getElementById("name").textContent = user.username;
    document.getElementById("userid").textContent = user.id;
    document.getElementById("mention").textContent = `<@${user.id}>`;
    document.getElementById("email").textContent = user.email || "N/A";
    document.getElementById("avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  }
}
