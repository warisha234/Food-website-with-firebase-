import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ---------------- FIREBASE CONFIG ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyB1mYaXDcsB06TspEIznssu0drUoVJhWvk",
  authDomain: "phone-number-validation-9ad36.firebaseapp.com",
  projectId: "phone-number-validation-9ad36",
  storageBucket: "phone-number-validation-9ad36.firebasestorage.app",
  messagingSenderId: "1061212098244",
  appId: "1:1061212098244:web:649404d1a97df076cd4391",
  measurementId: "G-7S5YNRDX34"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------------- STATE ---------------- */
let userId = null;
let cart = {};

/* ---------------- PRODUCTS ---------------- */
const products = [
  { id: "p1", name: "Chicken Biryani", price: 350, image: "https://i.pinimg.com/736x/a2/be/00/a2be0042e23c190103fa268adb34c410.jpg" },
  { id: "p2", name: "Lasagna", price: 650, image: "https://i.pinimg.com/1200x/08/6e/99/086e9971d189d37e664f1c9086977e75.jpg" },
  { id: "p3", name: "Chicken Roll", price: 350, image: "https://i.pinimg.com/1200x/85/57/ac/8557ac8239a788b71ddf41bf7d63da69.jpg" },
  { id: "p4", name: "Fried Rice", price: 550, image: "https://i.pinimg.com/1200x/ef/6f/c6/ef6fc6ae6737c43d1df82d70b5f9c98f.jpg" },
  { id: "p5", name: "Chicken Tikka", price: 600, image: "https://i.pinimg.com/1200x/d7/83/4b/d7834b4123a9615867031dce44662d69.jpg" },
  { id: "p6", name: "Zinger Burger", price: 500, image: "https://i.pinimg.com/736x/e2/29/ef/e229efd0283d5f4d8df255d10fc9833f.jpg" },
  { id: "p7", name: "Chicken Club Sandwich", price: 450, image: "https://i.pinimg.com/1200x/43/b3/0f/43b30f84931035ff67c0166772393f26.jpg" },
  { id: "p8", name: "Fajita Pizza", price: 800, image: "https://i.pinimg.com/736x/36/71/41/367141e4039961967051d02dfa02431c.jpg" },
  { id: "p9", name: "Chicken Haleem", price: 350, image: "https://i.pinimg.com/736x/93/55/15/935515c64ee57be64161b1eb15f75943.jpg" },
  { id: "p10", name: "Broast", price: 550, image: "https://i.pinimg.com/736x/87/b7/2f/87b72f604683068871da12868bfa0e00.jpg" },
  { id: "p11", name: "Spicy Dumplings", price: 350, image: "https://i.pinimg.com/736x/1b/12/f3/1b12f32842cbb5cd67f79a0822dd877c.jpg" },
  { id: "p12", name: "Tikka Roll", price: 450, image: "https://i.pinimg.com/736x/f0/77/e7/f077e70250805654b38a7dbcf74c8e74.jpg" }
];

const familyDeals = [
  { id: "f1", name: "2 person Burger Pack", price: 1200, image: "https://i.pinimg.com/736x/49/56/ea/4956eab9dcc963b5b31b478f3619586a.jpg" },
  { id: "f2", name: "Family Pizza Combo", price: 2000, image: "https://i.pinimg.com/736x/7c/0b/02/7c0b0219253013c644592ccb6f63d93b.jpg" },
  { id: "f1", name: "Spicy platers.", price: 2900, image: "https://i.pinimg.com/736x/59/51/20/59512012f9486f43ac27420fcf3e4d9a.jpg" },
  { id: "f2", name: "Family Pizza Combo 2", price: 2500, image: "https://i.pinimg.com/1200x/c0/e3/73/c0e373e5f19e982532701f96e57c4fab.jpg" },
  { id: "f1", name: "Flying Burger Pack", price: 1800, image: "https://i.pinimg.com/1200x/0b/2b/21/0b2b21de0f6282b6c22a3e2d3d1d851d.jpg" },
 

];

/* ---------------- DOM ---------------- */
const items = document.getElementById("products");
const familyContainer = document.getElementById("familyDeals");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotal = document.getElementById("subtotal");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const buyNow = document.getElementById("buyNow");
const invoiceModal = document.getElementById("invoiceModal");
const invoiceBody = document.getElementById("invoiceBody");
const closeInvoice = document.getElementById("closeInvoice");

/* ---------------- GENERIC CARD RENDER ---------------- */
function renderCards(arr, container) {
  container.innerHTML = "";
  arr.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <div class="price">PKR ${p.price}</div>
    `;
    const btn = document.createElement("button");
    btn.className = "btn btn-accent";
    btn.textContent = "Add to Cart";
    btn.onclick = () => addToCart(p.id, p);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

/* ---------------- CART LOGIC ---------------- */
function addToCart(id, product) {
  if (!cart[id]) cart[id] = { qty: 1, product };
  else cart[id].qty++;
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0, count = 0;
  for (let id in cart) {
    const item = cart[id];
    const price = item.qty * item.product.price;
    total += price;
    count += item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.product.image}">
      <div>
        <strong>${item.product.name}</strong> x ${item.qty}<br>
        PKR ${price}<br>
        <button class="btn" onclick="changeQty('${id}',1)">+</button>
        <button class="btn" onclick="changeQty('${id}',-1)">-</button>
        <button class="btn" onclick="removeItem('${id}')">Remove</button>
      </div>
    `;
    cartItems.appendChild(div);
  }
  cartCount.textContent = count;
  subtotal.textContent = total;
}

/* ---------------- STORAGE ---------------- */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  if (userId) setDoc(doc(db, "carts", userId), { items: cart });
}

function loadCart() {
  if (!userId) {
    cart = JSON.parse(localStorage.getItem("cart") || "{}");
    renderCart();
    return;
  }
  getDoc(doc(db, "carts", userId)).then(snap => {
    cart = snap.exists() ? snap.data().items || {} : {};
    renderCart();
  });
}

/* ---------------- BUY NOW ---------------- */
function onBuyNow() {
  if (!Object.keys(cart).length) return Swal.fire({
    title: 'Cart is Empty!',
    text: 'Please add some items to your cart before proceeding.',
    icon: 'warning',
    confirmButtonText: 'OK',
    background: '#411d08ff',
    color: '#fff8cc',
    confirmButtonColor: '#ff8c1a'
  });

  let text = "", total = 0;
  for (let id in cart) {
    let it = cart[id];
    let p = it.qty * it.product.price;
    total += p;
    text += `${it.product.name} x ${it.qty} = PKR ${p}\n`;
  }

  invoiceBody.innerHTML = text.replace(/\n/g, "<br>");
  invoiceModal.classList.add("open");

  addDoc(collection(db, "orders"), { uid: userId, items: cart, total, created: new Date() });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text(text + `\nTotal: PKR ${total}`, 20, 20);
  pdf.save("invoice.pdf");

  cart = {};
  saveCart();
  renderCart();
}

/* ---------------- AUTH ---------------- */
onAuthStateChanged(auth, user => {
  if (user) {
    userId = user.uid;
    loadCart();
  } else signInAnonymously(auth);
});

/* ---------------- EVENTS ---------------- */
openCart.onclick = () => cartPanel.classList.add("open");
closeCart.onclick = () => cartPanel.classList.remove("open");
buyNow.onclick = onBuyNow;
closeInvoice.onclick = () => invoiceModal.classList.remove("open");

/* ---------------- INIT ---------------- */
renderCards(products, items);
renderCards(familyDeals, familyContainer); 
loadCart();

window.changeQty = changeQty;
window.removeItem = removeItem;
