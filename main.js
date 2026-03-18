// ==========================================
// 🔥 1. FIREBASE SETUP (ต้องอยู่บนสุดเสมอ)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  increment,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🚨 นำ firebaseConfig ของคุณมาวางทับตรงนี้ 🚨
const firebaseConfig = {
  apiKey: "ใส่_API_KEY_ของคุณ",
  authDomain: "ใส่_AUTH_DOMAIN_ของคุณ",
  projectId: "ใส่_PROJECT_ID_ของคุณ",
  storageBucket: "ใส่_STORAGE_BUCKET_ของคุณ",
  messagingSenderId: "ใส่_SENDER_ID_ของคุณ",
  appId: "ใส่_APP_ID_ของคุณ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// The Roastery By Roj - Main JavaScript
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  updateCartUI();
  initRevealAnimations();
  initNavbarScroll();
  fetchAndRenderProducts(); // 💡 สั่งให้ดึงข้อมูลสินค้าจาก Firebase ทันทีที่โหลดเว็บ
  trackPageView(); // 💡 Track page views
});

// --- 2. DYNAMIC RENDER SYSTEM ---
async function fetchAndRenderProducts() {
  const productGrid = document.getElementById("dynamic-product-grid");
  const productSlider = document.getElementById("dynamic-product-slider");

  if (!productGrid && !productSlider) return;

  const isThai = localStorage.getItem("roastery_lang") === "th";
  if (productGrid)
    productGrid.innerHTML = `<p class="text-center text-gray-400 col-span-full py-10">กำลังโหลดเมล็ดกาแฟ... ☕️</p>`;
  if (productSlider)
    productSlider.innerHTML = `<p class="text-center text-gray-400 py-10 w-full">กำลังโหลดเมล็ดกาแฟ... ☕️</p>`;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    products = products.filter((p) => p.visibility !== "draft");

    if (products.length === 0) {
      if (productGrid)
        productGrid.innerHTML = `<p class="text-center text-gray-400 col-span-full py-10">ยังไม่มีสินค้าในระบบ</p>`;
      if (productSlider)
        productSlider.innerHTML = `<p class="text-center text-gray-400 py-10 w-full">ยังไม่มีสินค้าในระบบ</p>`;
      return;
    }

    // =====================================
    // 🎨 ส่วนที่ 1: หน้า Grid (all_products.html)
    // =====================================
    if (productGrid) {
      const productsHTML = products
        .map((product, index) => {
          let badgeHTML =
            product.displayStatus === "new"
              ? `<div class="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-sm">NEW</div>`
              : "";
          return `
          <div onclick="window.location.href='product.html?id=${product.id}'" class="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer flex flex-col reveal active vis delay-${index}00">
            <div class="aspect-[4/5] bg-gray-50 p-8 relative flex justify-center items-center overflow-hidden">
              ${badgeHTML}
              <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-xl" />
            </div>
            <div class="p-6 flex flex-col flex-1">
              <p class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase mb-1">${product.category}</p>
              <h3 class="font-serif text-2xl mb-4 text-[#1c140f]">${product.name}</h3>
              <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                <span class="font-serif text-xl font-semibold text-gray-900">฿${product.price}</span>
                <button onclick="event.stopPropagation(); window.addToCart('${product.name}', ${product.price});" class="bg-black text-white px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-orange-600 transition-colors shadow-md">
                  ${isThai ? "หยิบใส่ตะกร้า" : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        `;
        })
        .join("");
      productGrid.innerHTML = productsHTML;
    }

    // =====================================
    // 🎨 ส่วนที่ 2: หน้าแรก (index.html) -> Highlight + Slider
    // =====================================
    if (productSlider) {
      // 1. แยกตัวที่เป็น "Highlight" ออกมา 1 ตัว
      const highlightProduct = products.find(
        (p) => p.displayStatus === "highlight",
      );

      // ดึงพื้นที่ที่จะแสดง Highlight (Wonder Eden เดิม)
      const highlightContainer = document.getElementById(
        "dynamic-highlight-product",
      );

      if (highlightContainer && highlightProduct) {
        // วาด UI ของตัว Highlight แบบ Real-time
        highlightContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="p-10 md:p-16 flex flex-col justify-center">
              <div class="inline-flex items-center gap-2 bg-[#F0FAD0] px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] text-[#4A7C35] uppercase mb-6 w-max">
                🌟 Signature Highlight
              </div>
              <p class="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mb-2">${highlightProduct.category}</p>
              <h3 class="font-serif text-4xl md:text-6xl mb-4 text-[#2C5220]">${highlightProduct.name}</h3>
              <p class="text-sm text-gray-600 font-light mb-8 max-w-md">
                ${highlightProduct.story?.description || "Discover our specially crafted coffee beans."}
              </p>
              <span class="text-xs font-bold tracking-[0.2em] uppercase text-orange-600 group-hover:text-[#4A7C35] transition-colors flex items-center gap-2">
                <span class="lang-en">Discover Product →</span><span class="lang-th">ดูรายละเอียด →</span>
              </span>
            </div>
            <div class="img-hover-zoom aspect-[4/3] md:aspect-auto flex items-center justify-center p-10 overflow-hidden relative" style="background-color: ${highlightProduct.themeColor}15">
              <img src="${highlightProduct.imageUrl}" class="w-full max-w-[320px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" alt="${highlightProduct.name}" />
            </div>
          </div>
        `;
        highlightContainer.onclick = () =>
          (window.location.href = `product.html?id=${highlightProduct.id}`);
      } else if (highlightContainer) {
        highlightContainer.style.display = "none"; // ปิดไปถ้าแอดมินไม่ได้ตั้ง highlight ไว้
      }

      // 2. จัดการตัวที่จะอยู่ใน Slider (เอา highlight ออกไป)
      let sliderProducts = products.filter(
        (p) => p.displayStatus !== "highlight",
      );

      // 3. เรียงลำดับให้ "New" ขึ้นมาอยู่หน้าสุด
      sliderProducts.sort((a, b) => {
        if (a.displayStatus === "new" && b.displayStatus !== "new") return -1;
        if (a.displayStatus !== "new" && b.displayStatus === "new") return 1;
        return 0;
      });

      // 4. บังคับให้แสดงแค่ 4 ตัวแรกเท่านั้น
      sliderProducts = sliderProducts.slice(0, 4);

      // วาด UI สำหรับ Slider
      let sliderHTML = sliderProducts
        .map((product) => {
          let titleClass = product.category.toLowerCase().includes("kombucha")
            ? "text-[#C1272D]"
            : "text-orange-600";
          let badgeHTML =
            product.displayStatus === "new"
              ? `<div class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">NEW</div>`
              : "";

          return `
            <div class="slider-item group reveal product-item transition-all duration-300 cursor-pointer active vis" data-title="${product.name.toLowerCase()}" onclick="window.location.href = 'product.html?id=${product.id}'">
              <div class="img-hover-zoom aspect-[4/5] rounded-xl overflow-hidden relative mb-6 shadow-sm flex items-center justify-center p-4" style="background-color: ${product.themeColor}15">
                ${badgeHTML}
                <img src="${product.imageUrl}" class="w-full h-full object-contain drop-shadow-md" alt="${product.name}" />
              </div>
              <p class="text-[10px] ${titleClass} font-bold tracking-[0.2em] uppercase mb-2">${product.category}</p>
              <h3 class="font-serif text-2xl mb-2 flex justify-between items-center">
                ${product.name}
                <button onclick="event.stopPropagation(); window.addToCart('${product.name}', ${product.price});" class="text-sm bg-black text-white px-4 py-1.5 rounded-full hover:bg-orange-600 transition-colors shadow-md">
                  <span class="lang-en">Add</span><span class="lang-th">หยิบ</span>
                </button>
              </h3>
            </div>
        `;
        })
        .join("");

      // ต่อด้วยปุ่ม ดูทั้งหมด ท้ายสุดเสมอ
      sliderHTML += `
            <div class="slider-item flex" onclick="window.location.href = 'all_products.html'">
              <div class="more-card w-full shadow-lg h-full">
                <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                  <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 class="font-serif text-2xl mb-2"><span class="lang-en">Explore More</span><span class="lang-th">ดูทั้งหมด</span></h3>
                <p class="text-sm text-gray-500 font-light underline"><span class="lang-en">View All Products</span><span class="lang-th">ดูสินค้าทั้งหมด</span></p>
              </div>
            </div>
      `;

      productSlider.innerHTML = sliderHTML;
    }
  } catch (error) {
    console.error("Error fetching products: ", error);
  }
}

// --- 3. LANGUAGE LOGIC ---
function initLanguage() {
  let currentLang = localStorage.getItem("roastery_lang") || "en";
  document.body.className = `selection:bg-orange-500 selection:text-white lang-${currentLang}`;
}

function toggleLang() {
  let currentLang = localStorage.getItem("roastery_lang") || "en";
  currentLang = currentLang === "en" ? "th" : "en";
  document.body.className = `selection:bg-orange-500 selection:text-white lang-${currentLang}`;
  localStorage.setItem("roastery_lang", currentLang);
  updateCartUI();
}

// --- 4. SMART CART LOGIC ---
let cart = JSON.parse(localStorage.getItem("roastery_cart")) || [];

cart = cart.map((item) => {
  if (item.quantity === undefined || item.quantity === null) {
    return { ...item, quantity: 1 };
  }
  return item;
});
localStorage.setItem("roastery_cart", JSON.stringify(cart));

const MAX_QUANTITY = 10;

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  const isThai = localStorage.getItem("roastery_lang") === "th";

  if (existingItem) {
    if (existingItem.quantity >= MAX_QUANTITY) {
      alert(
        isThai
          ? `สั่งซื้อได้สูงสุด ${MAX_QUANTITY} ชิ้นต่อรายการครับ`
          : `Maximum limit is ${MAX_QUANTITY} items per product.`,
      );
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  localStorage.setItem("roastery_cart", JSON.stringify(cart));
  updateCartUI();

  const btn = event.currentTarget || event.target;
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = isThai ? "หยิบแล้ว ✓" : "ADDED ✓";
    btn.classList.add("bg-green-600", "text-white");

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove("bg-green-600", "text-white");
    }, 1000);
  }

  const sidebar = document.getElementById("cart-sidebar");
  if (sidebar && sidebar.classList.contains("translate-x-full")) {
    toggleCart();
  }
}

function updateCartUI() {
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const cartItemsDiv = document.getElementById("cart-items");

  if (!cartCountEl || !cartTotalEl || !cartItemsDiv) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  cartCountEl.innerText = totalItems;
  cartTotalEl.innerText = "฿" + totalPrice;

  const isThai = localStorage.getItem("roastery_lang") === "th";

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<p class="text-gray-400 text-sm font-light text-center mt-10">${isThai ? "ตะกร้าว่างเปล่า" : "Your cart is empty."}</p>`;
    return;
  }

  cartItemsDiv.innerHTML = cart
    .map((item, index) => {
      const isMin = item.quantity <= 1;
      const isMax = item.quantity >= MAX_QUANTITY;

      return `
    <div class="flex justify-between items-center bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 transition-all">
        <div class="flex-1">
          <p class="font-bold text-sm tracking-wider uppercase text-[#1c140f]">${item.name}</p>
          <div class="flex items-center gap-3 mt-2">
              <div class="flex items-center border border-gray-200 rounded-full bg-gray-50 shadow-inner">
                  <button ${isMin ? "disabled" : ""} onclick="window.decreaseQuantity(${index})" class="w-7 h-7 flex items-center justify-center rounded-full transition-colors pb-0.5 text-lg ${isMin ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-[#d35400] hover:bg-orange-100"}">-</button>
                  <span class="text-xs font-bold text-gray-800 w-6 text-center">${item.quantity}</span>
                  <button ${isMax ? "disabled" : ""} onclick="window.increaseQuantity(${index})" class="w-7 h-7 flex items-center justify-center rounded-full transition-colors pb-0.5 text-lg ${isMax ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-[#d35400] hover:bg-orange-100"}">+</button>
              </div>
              <p class="text-[10px] text-gray-400">x ฿${item.price}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 ml-4">
            <p class="font-serif text-lg text-[#d35400] font-bold">฿${item.price * item.quantity}</p>
            <button onclick="window.removeItem(${index})" class="text-gray-300 text-[10px] hover:text-red-500 uppercase tracking-widest transition-colors">Remove</button>
        </div>
    </div>
  `;
    })
    .join("");
}

function increaseQuantity(index) {
  if (cart[index].quantity < MAX_QUANTITY) {
    cart[index].quantity += 1;
    localStorage.setItem("roastery_cart", JSON.stringify(cart));
    updateCartUI();
  }
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
    localStorage.setItem("roastery_cart", JSON.stringify(cart));
    updateCartUI();
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("roastery_cart", JSON.stringify(cart));
  updateCartUI();
}

function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("translate-x-full");
  document.getElementById("cart-overlay").classList.toggle("opacity-0");
  document
    .getElementById("cart-overlay")
    .classList.toggle("pointer-events-none");
}

async function checkout() {
  if (cart.length === 0) {
    const isThai = localStorage.getItem("roastery_lang") === "th";
    alert(
      isThai ? "ตะกร้าสินค้ายังว่างเปล่าอยู่ครับ ☕️" : "Your cart is empty.",
    );
    return;
  }

  // เปลี่ยนปุ่มเป็นสถานะกำลังโหลด
  const checkoutBtn = event.currentTarget || event.target;
  const originalText = checkoutBtn.innerHTML;
  checkoutBtn.innerHTML = "กำลังสร้างออเดอร์... ⏳";
  checkoutBtn.disabled = true;

  try {
    let totalPrice = 0;
    cart.forEach((item) => {
      totalPrice += item.price * item.quantity;
    });

    // 1. 💾 บันทึกออเดอร์ลง Firestore
    const orderData = {
      items: cart,
      totalPrice: totalPrice,
      status: "pending", // สถานะเริ่มต้นคือรอดำเนินการ
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    const shortOrderId = docRef.id.slice(0, 5).toUpperCase(); // สร้างรหัสออเดอร์สั้นๆ 5 ตัวอักษร

    // 2. 💬 สร้างข้อความส่งเข้า LINE
    let orderText = `🛒 *NEW ORDER #${shortOrderId}* \n---------------------------\n`;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      orderText += `${index + 1}. ${item.name} (x${item.quantity}) - ฿${itemTotal}\n`;
    });
    orderText += "---------------------------\n";
    orderText += `💰 *ยอดชำระทั้งหมด: ฿${totalPrice}*\n`;
    orderText +=
      "---------------------------\nรบกวนแอดมินสรุปยอดและขอ QR Code ด้วยครับ/ค่ะ ☕️✨";

    // 3. 🧹 เคลียร์ตะกร้าเมื่อสั่งซื้อสำเร็จ
    cart = [];
    localStorage.setItem("roastery_cart", JSON.stringify(cart));
    updateCartUI();
    toggleCart(); // ปิดหน้าต่างตะกร้า

    // 4. เด้งไปหน้า LINE
    let encodedText = encodeURIComponent(orderText);
    let lineId = "@024hpqkw";
    window.open(
      `https://line.me/R/oaMessage/${lineId}/?${encodedText}`,
      "_blank",
    );
  } catch (error) {
    console.error("Error creating order:", error);
    alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
  } finally {
    checkoutBtn.innerHTML = originalText;
    checkoutBtn.disabled = false;
  }
}

// --- 5. UI & ANIMATIONS ---
function initRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active", "vis");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initNavbarScroll() {
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    if (nav.classList.contains("mix-blend-difference")) {
      if (window.scrollY > 50) {
        nav.classList.add("bg-black/90", "backdrop-blur-md", "shadow-sm");
        nav.classList.remove("mix-blend-difference");
      } else {
        nav.classList.remove("bg-black/90", "backdrop-blur-md", "shadow-sm");
        nav.classList.add("mix-blend-difference");
      }
    }
  });
}

function scrollSlider(direction) {
  const slider = document.querySelector(".product-slider");
  if (!slider) return;
  const scrollAmount = 344;
  if (direction === "left") {
    slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
}

// ==========================================
// 💡 6. EXPORT FUNCTIONS TO GLOBAL (จำเป็นสำหรับการใช้ Module)
// ==========================================
window.toggleLang = toggleLang;
window.addToCart = addToCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeItem = removeItem;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.scrollSlider = scrollSlider;

// --- 7. ANALYTICS (PAGE VIEWS) ---
async function trackPageView() {
  try {
    let pagePath = window.location.pathname.split("/").pop() || "index.html";
    pagePath = pagePath.replace(".html", "") || "index";

    // Ignore URL params and hash fragments
    pagePath = pagePath.split("?")[0].split("#")[0];
    if (pagePath === "") pagePath = "index";

    const pageRef = doc(db, "page_views", pagePath);
    await setDoc(
      pageRef,
      {
        views: increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error tracking page view: ", error);
  }
}
