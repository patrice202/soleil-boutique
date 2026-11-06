// ============================================================
//  SOLEIL BOUTIQUE — Store engine
//  Renders the catalog, runs the cart, sends the orders.
// ============================================================
 
// The customer's cart (kept in the browser)
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("soleil-cart") || "[]");
} catch (e) {
  cart = [];
}
 
// ---------- Render the catalog into the grid ----------
function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  getCatalog().forEach(function (p) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<img src="' + p.photo + '" alt="' + p.name + '">' +
      "<h3>" + p.name + "</h3>" +
      '<p class="price">' + formatPrice(currentPrice(p)) + "</p>" +
      '<button class="btn" onclick="addToCart(\'' + p.id + '\')">Add to Cart</button>';
    grid.appendChild(card);
  });
}
 
// ---------- Cart ----------
function addToCart(id) {
  cart.push(id);
  saveCart();
  renderCart();
  alert("Added to your cart.");
}
 
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}
 
function saveCart() {
  localStorage.setItem("soleil-cart", JSON.stringify(cart));
}
 
function renderCart() {
  const zone = document.getElementById("cart-items");
  zone.innerHTML = "";
  let total = 0;
  cart.forEach(function (id, index) {
    const p = findProduct(id);
    if (!p) return;
    const price = currentPrice(p);
    total += price;
    const line = document.createElement("p");
    line.innerHTML = p.name + " — " + formatPrice(price) +
      ' <button onclick="removeFromCart(' + index + ')">Remove</button>';
    zone.appendChild(line);
  });
  document.getElementById("cart-total").textContent = formatPrice(total);
  document.getElementById("cart-count").textContent = cart.length;
}
 
// The Cart button shows or hides the cart zone
document.getElementById("cart-btn").addEventListener("click", function () {
  document.getElementById("cart-zone").classList.toggle("hidden");
});
 
// ---------- Page start ----------
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
// ============================================================
//  ORDER — the form sends everything to the boutique's
//  WhatsApp, and keeps a copy for the Admin page.
// ============================================================
 
// The boutique's WhatsApp number — country code + number,
// digits only, no +, no spaces. Examples: 
// USA 1XXXXXXXXXX. REPLACE the number below!
const BOUTIQUE_WHATSAPP = "+13059040859";
// ---------- Instant notification on the boutique phone ----------
// Uses the free ntfy app: every order sends a push notification.
// 1) Install the "ntfy" app on the boutique phone.
// 2) In the app, tap + and subscribe to the topic below.
// Keep this topic name SECRET: anyone who knows it can read the alerts.
const NOTIFY_TOPIC = "soleil-boutique-cmd-9x7k2";
 
function notifyBoutique(title, message) {
  fetch("https://ntfy.sh/" + NOTIFY_TOPIC, {
    method: "POST",
    headers: { "Title": title, "Tags": "shopping_bags" },
    body: message
  }).catch(function () {
    // If the alert fails, the WhatsApp order still goes through.
  });
}
 
document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
 
  const name = document.getElementById("field-name").value;
  const phone = document.getElementById("field-phone").value;
  const address = document.getElementById("field-address").value;
 
  let total = 0;
  let lines = "";
  cart.forEach(function (id) {
    const p = findProduct(id);
    if (!p) return;
    total += currentPrice(p);
    lines += "- " + p.name + " (" + formatPrice(currentPrice(p)) + ")\n";
  });
 
  // The copy for the Admin page
  const previous = JSON.parse(localStorage.getItem("soleil-orders") || "[]");
  previous.push({
    date: new Date().toLocaleString(),
    name: name,
    phone: phone,
    address: address,
    items: lines,
    total: total
  });
  localStorage.setItem("soleil-orders", JSON.stringify(previous));
 
  // The WhatsApp message, fully written
  const text = "Hello Soleil Boutique! I would like to order:\n" + lines +
    "Total: " + formatPrice(total) +
    "\nName: " + name + "\nPhone: " + phone + "\nAddress: " + address;
    // Instant alert on the boutique phone
  notifyBoutique(
    "Soleil Boutique - New order",
    name + " - " + formatPrice(total) + "\n" + lines + "Phone: " + phone
  );
  window.open("https://wa.me/" + BOUTIQUE_WHATSAPP + "?text=" + encodeURIComponent(text), "_blank");
 
  document.getElementById("order-message").textContent =
    "Thank you, " + name + "! WhatsApp is opening with your order ready to send.";
 
  cart = [];
  saveCart();
  renderCart();
});