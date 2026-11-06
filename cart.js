// ============================================================
//  SOLEIL BOUTIQUE — Cart page engine
//  Reviews the cart with photos, then takes the order.
// ============================================================
 
// The customer's cart (kept in the browser)
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("soleil-cart") || "[]");
} catch (e) {
  cart = [];
}
 
function saveCart() {
  localStorage.setItem("soleil-cart", JSON.stringify(cart));
}
 
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCartPage();
}
 
// Empty the whole cart at once (asks first, to avoid accidents)
function clearCart() {
  if (cart.length === 0) return;
  if (!confirm("Empty your cart?")) return;
  cart = [];
  saveCart();
  renderCartPage();
}
 
// The little crocodile, shown when the cart is empty
const CROCO_MINI = '<svg class="croco-mini" viewBox="0 0 220 185" aria-hidden="true"><ellipse cx="110" cy="108" rx="80" ry="56" fill="#7C9070"/><circle cx="76" cy="62" r="17" fill="#7C9070"/><circle cx="144" cy="62" r="17" fill="#7C9070"/><path d="M76 70 C69 62 63 58 63 52 C63 47 66 44 70 44 C73 44 75 46 76 48 C77 46 79 44 82 44 C86 44 89 47 89 52 C89 58 83 62 76 70 Z" fill="#5B0F1A"/><path d="M144 70 C137 62 131 58 131 52 C131 47 134 44 138 44 C141 44 143 46 144 48 C145 46 147 44 150 44 C154 44 157 47 157 52 C157 58 151 62 144 70 Z" fill="#5B0F1A"/><ellipse cx="110" cy="130" rx="58" ry="32" fill="#A9BC9B"/><path class="croco-tongue" d="M97 143 C95 163 99 178 110 178 C121 178 125 163 123 143 Q110 151 97 143 Z" fill="#D96C7B"/><path d="M68 138 Q110 160 152 138" fill="none" stroke="#3B2A24" stroke-width="4" stroke-linecap="round"/></svg>';
// ---------- Render the cart, one line per item, with photos ----------
function renderCartPage() {
  const zone = document.getElementById("cart-items");
  zone.innerHTML = "";
  if (cart.length === 0) {
    zone.innerHTML = '<div class="croco-empty">' + CROCO_MINI +
      "<p>Your cart is empty — our little crocodile is keeping a sunny spot warm for your first pair.</p></div>";
  }
  let total = 0;
  cart.forEach(function (id, index) {
    const p = findProduct(id);
    if (!p) return;
    const price = currentPrice(p);
    total += price;
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML =
      '<img src="' + p.photo + '" alt="' + p.name + '">' +
      '<span class="cart-name">' + p.name + "</span>" +
      "<span>" + formatPrice(price) + "</span>" +
      ' <button onclick="removeFromCart(' + index + ')">Remove</button>';
    zone.appendChild(line);
  });
  document.getElementById("cart-total").textContent = formatPrice(total);
  document.getElementById("cart-count").textContent = cart.length;
}
 
// ============================================================
//  ORDER — the form sends everything to the boutique's
//  WhatsApp, and keeps a copy for the Admin page.
// ============================================================
 
// The boutique's WhatsApp number (same as script.js)
const BOUTIQUE_WHATSAPP = "+13059040859";
 
// Instant notification on the boutique phone (same topic as script.js)
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
  renderCartPage();
});
 
// ---------- Page start ----------
document.getElementById("year").textContent = new Date().getFullYear();
renderCartPage();