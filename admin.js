// ============================================================
//  SOLEIL BOUTIQUE — Admin engine
//  Login, orders, prices, and product uploads.
// ============================================================
 
// The boutique's login — CHANGE THESE before publishing!
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "soleil2026";
 
// ---------- Login ----------
document.getElementById("login-btn").addEventListener("click", function () {
  const user = document.getElementById("field-user").value;
  const pass = document.getElementById("field-pass").value;
  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    document.getElementById("login-zone").classList.add("hidden");
    document.getElementById("admin-zone").classList.remove("hidden");
    renderOrders();
    renderPrices();
  } else {
    document.getElementById("login-message").textContent =
      "Incorrect username or password.";
  }
});
 
// ---------- Orders (copies kept in this browser) ----------
function renderOrders() {
  const zone = document.getElementById("orders-list");
  const orders = JSON.parse(localStorage.getItem("soleil-orders") || "[]");
  if (orders.length === 0) {
    zone.innerHTML = "<p>No orders recorded in this browser yet. " +
      "Customer orders also arrive on the boutique's WhatsApp.</p>";
    return;
  }
  zone.innerHTML = "";
  orders.slice().reverse().forEach(function (o) {
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = "<strong>" + o.date + "</strong><br>" +
      o.name + " — " + o.phone + "<br>" + o.address + "<br>" +
      o.items.replace(/\n/g, "<br>") +
      "<strong>Total: " + formatPrice(o.total) + "</strong>";
    zone.appendChild(card);
  });
}
 
// ---------- Prices ----------
function renderPrices() {
  const zone = document.getElementById("prices-list");
  zone.innerHTML = "";
  getCatalog().forEach(function (p) {
    const row = document.createElement("div");
    row.className = "price-row";
    let html =
      '<img class="thumb" src="' + p.photo + '" alt="">' +
      "<span>" + p.name + "</span>" +
      '<input type="number" min="0" step="0.01" id="price-' + p.id +
      '" value="' + currentPrice(p) + '">';
    if (p.id.charAt(0) === "c") {
      html += ' <button class="btn btn-light" onclick="deleteProduct(\'' +
        p.id + '\')">Delete</button>';
    }
    row.innerHTML = html;
    zone.appendChild(row);
  });
}
 
document.getElementById("save-prices-btn").addEventListener("click", function () {
  const mods = {};
  getCatalog().forEach(function (p) {
    mods[p.id] = Number(document.getElementById("price-" + p.id).value);
  });
  localStorage.setItem("soleil-prices", JSON.stringify(mods));
  document.getElementById("prices-message").textContent =
    "Prices saved in this browser. Use Download products.js to make them official for everyone.";
});
 
// ---------- Delete a product added from this page ----------
function deleteProduct(id) {
  const kept = getCustomProducts().filter(function (p) { return p.id !== id; });
  localStorage.setItem("soleil-custom", JSON.stringify(kept));
  renderPrices();
}
 
// ---------- Add a product, with photo upload ----------
document.getElementById("add-product-btn").addEventListener("click", function () {
  const name = document.getElementById("new-name").value.trim();
  const price = Number(document.getElementById("new-price").value);
  const file = document.getElementById("new-photo").files[0];
  const msg = document.getElementById("add-message");
 
  if (!name || !(price > 0) || !file) {
    msg.textContent = "Please add a name, a price and a photo.";
    return;
  }
 
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      // Shrink the photo so the browser storage stays light
      const canvas = document.createElement("canvas");
      const max = 800;
      let w = img.width;
      let h = img.height;
      if (w > max) {
        h = Math.round(h * max / w);
        w = max;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
 
      const custom = getCustomProducts();
      custom.push({
        id: "c" + Date.now(),
        name: name,
        price: price,
        photo: canvas.toDataURL("image/jpeg", 0.82)
      });
      localStorage.setItem("soleil-custom", JSON.stringify(custom));
 
      msg.textContent = "Product added. It now appears in the store on this browser.";
      document.getElementById("new-name").value = "";
      document.getElementById("new-price").value = "";
      document.getElementById("new-photo").value = "";
      renderPrices();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
 
// ---------- Download the official catalog (products.js) ----------
document.getElementById("download-btn").addEventListener("click", function () {
  const catalog = getCatalog().map(function (p) {
    return { id: p.id, name: p.name, price: currentPrice(p), photo: p.photo };
  });
 
  const lines = [];
  lines.push("function formatPrice(n) {");
  lines.push("  return \"$\" + Number(n).toFixed(2);");
  lines.push("}");
  lines.push("");
  lines.push("function getCatalog() {");
  lines.push("  return PRODUCTS;");
  lines.push("}");
  lines.push("");
  lines.push("function findProduct(id) {");
  lines.push("  for (let i = 0; i < PRODUCTS.length; i++) {");
  lines.push("    if (PRODUCTS[i].id === id) return PRODUCTS[i];");
  lines.push("  }");
  lines.push("  return null;");
  lines.push("}");
  lines.push("");
  lines.push("function currentPrice(product) {");
  lines.push("  let mods = {};");
  lines.push("  try {");
  lines.push("    mods = JSON.parse(localStorage.getItem(\"soleil-prices\") || \"{}\");");
  lines.push("  } catch (e) {");
  lines.push("    mods = {};");
  lines.push("  }");
  lines.push("  if (mods[product.id] != null) return Number(mods[product.id]);");
  lines.push("  return product.price;");
  lines.push("}");
 
  const content = "const PRODUCTS = " + JSON.stringify(catalog, null, 2) +
    ";\n\n" + lines.join("\n") + "\n";
  const blob = new Blob([content], { type: "text/javascript" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "products.js";
  link.click();
 
  document.getElementById("prices-message").textContent =
    "products.js downloaded with the full current catalog. Replace the old file with it (same name), then re-upload it to GitHub.";
});