// ============================================================
//  SOLEIL BOUTIQUE — Product catalog
//  Names, prices and photos live HERE, and nowhere else.
//  To change a price: edit the number, save, and re-upload
//  this file (or use the Admin page — see admin.js).
// ============================================================
 
const PRODUCTS = [
  { id: "p1", name: "Georgie Toulimen", price: 15, photo: "glasses.jpeg" },
  { id: "p2", name: "Riviera Gold", price: 15, photo: "glasses1.jpeg" }
];
 
// Display a price the boutique way: 15 becomes "$15.00"
function formatPrice(n) {
  return "$" + Number(n).toFixed(2);
}
 
// Products added from the Admin page (stored in this browser)
function getCustomProducts() {
  try {
    return JSON.parse(localStorage.getItem("soleil-custom") || "[]");
  } catch (e) {
    return [];
  }
}
 
/ The full catalog: the Admin-saved catalog if there is one,
// otherwise the official list above + admin-added products.
function getCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem("soleil-catalog") || "null");
    if (saved) return saved;
  } catch (e) {
    // fall through to the default catalog below
  }
  return PRODUCTS.concat(getCustomProducts());
}
 
// Find one product by its id
function findProduct(id) {
  const all = getCatalog();
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === id) return all[i];
  }
  return null;
}
 
// The price to use: an Admin-page change wins over the catalog
function currentPrice(product) {
  let mods = {};
  try {
    mods = JSON.parse(localStorage.getItem("soleil-prices") || "{}");
  } catch (e) {
    mods = {};
  }
  if (mods[product.id] != null) return Number(mods[product.id]);
  return product.price;
}