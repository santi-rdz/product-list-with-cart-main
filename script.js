const productsContainer = document.querySelector(".products-list");
const cartContainer = document.querySelector(".cart-container");
const overlay = document.querySelector(".overlay");

let myProducts = [];

fetch("data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Error al cargar data.json");
    return response.json();
  })
  .then(displayProducts)
  .catch((error) => console.error("Error al obtener los datos:", error));

productsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".btn-add")) handleAddProduct(e);
  if (e.target.closest(".btn-control")) handleControlClick(e);
  updateCart();
});

cartContainer.addEventListener("click", (e) => {
  if (e.target.closest(".remove-item")) handleRemoveItem(e);
  if (e.target.classList.contains("btn-confirm")) {
    overlay.classList.add("active");
    document.body.classList.add("overflow-hidden");
    updateOrder();
  }
});

overlay.addEventListener("click", closeModal);

document.querySelector(".new-order").addEventListener("click", () => {
  myProducts = [];
  clearActiveControls();
  updateCart();
  updateOrder();
  closeModal();
});

document.querySelector(".confirm-order").addEventListener("click", (e) => {
  e.stopPropagation();
});

function handleAddProduct(e) {
  const productEl = e.target.closest(".product");
  const productId = +productEl.dataset.id;
  const quantityEl = productEl.querySelector(".control-quantity");
  const existingProduct = myProducts.find((p) => p.id === productId);

  if (existingProduct) {
    existingProduct.quantity++;
    quantityEl.textContent = existingProduct.quantity;
  } else {
    productEl.classList.add("controls-active");
    quantityEl.textContent = 1;

    myProducts.push({
      id: productId,
      img: productEl.dataset.img,
      category: productEl.dataset.category,
      name: productEl.dataset.name,
      price: productEl.dataset.price,
      quantity: 1,
    });
  }
}

function handleControlClick(e) {
  const clickedBtn = e.target.closest(".btn-control");
  const productEl = e.target.closest(".product");
  const productId = +productEl.dataset.id;
  const quantityEl = clickedBtn.closest(".controls").querySelector(".control-quantity");
  let current = +quantityEl.textContent;

  clickedBtn.classList.contains("btn-decrement") ? current-- : current++;
  quantityEl.textContent = current;

  myProducts = myProducts.map((product) => (product.id === productId ? { ...product, quantity: current } : product));

  if (current === 0) {
    productEl.classList.remove("controls-active");
    myProducts = myProducts.filter((product) => product.id !== productId);
  }
}

function handleRemoveItem(e) {
  const productId = +e.target.closest(".cart-item").dataset.id;
  const productEl = productsContainer.querySelector(`[data-id="${productId}"]`);
  productEl?.classList.remove("controls-active");

  myProducts = myProducts.filter((product) => product.id !== productId);
  updateCart();
}

function clearActiveControls() {
  const activeControls = productsContainer.querySelectorAll(".controls-active");
  activeControls.forEach((el) => el.classList.remove("controls-active"));
}

function closeModal() {
  overlay.classList.remove("active");
  document.body.classList.remove("overflow-hidden");
}

function displayProducts(data) {
  let id = 0;
  productsContainer.innerHTML = data
    .map(({ image: { desktop: img }, name, category, price }) => {
      return `
     <article class="product " data-category="${category}" data-name="${name}" data-price=${price.toFixed(2)} data-img="${img}" data-id=${id++}>
        <div class="group relative rounded-lg controls-active:shadow-[0_0_0_2px_#c73b0f]">
          <div class="h-64 overflow-hidden rounded-lg">
            <img
              class="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-110"
              src="${img}"
              alt=""
            />
          </div>
          <button
            class="controls-active:hidden btn-add text-4 hover:text-red-burnt absolute right-1/2 bottom-0 flex w-40 translate-x-1/2 translate-y-1/2 scale-100 cursor-pointer items-center justify-center gap-2 rounded-full border border-rose-400 bg-white py-3 font-bold text-nowrap opacity-100 transition-[opacity_transform_color_shadow] duration-300 hover:shadow-sm hover:border-red-burnt"
          >
            <img src="assets/images/icon-add-to-cart.svg" alt="" />Add to cart
          </button>
          <div
            class="controls text-4 bg-red-burnt controls-active:flex absolute right-1/2 bottom-0 hidden w-40 translate-x-1/2 translate-y-1/2 scale-100 cursor-pointer items-center justify-between gap-2 rounded-full px-4 py-3 font-bold text-nowrap opacity-100 transition-[opacity_transform_color_shadow] duration-300 hover:shadow-xs hover:shadow-red-burnt"
          >
            <button
              class="btn-control btn-decrement group/controls flex size-5 cursor-pointer items-center justify-center rounded-full border border-white transition-colors duration-300 hover:bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2">
                <path
                  class="group-hover/controls:fill-red-burnt transition-colors duration-300"
                  fill="#fff"
                  d="M0 .375h10v1.25H0V.375Z"
                />
              </svg></button
            ><span class="control-quantity text-white">1</span
            ><button
              class="btn-control btn-increment group/controls flex size-5 cursor-pointer items-center justify-center rounded-full border border-white transition-colors duration-300 hover:bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                <path
                  class="group-hover/controls:fill-red-burnt transition-colors duration-300"
                  fill="#fff"
                  d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="product-content mt-9 space-y-[3px]">
          <p class="category text-4 text-rose-500">${category}</p>
          <p class="name text-3 font-bold text-rose-900">${name}</p>
          <span class="price text-red-burnt font-semibold">$${price.toFixed(2)}</span>
        </div>
      </article>`;
    })
    .join("");
}

function updateCart() {
  if (myProducts.length === 0) {
    cartContainer.innerHTML = `
      <h1 class="text-2 text-red-burnt font-bold" id="cart-quantity">Your cart (0)</h1>
      <img class="mt-10 self-center" src="assets/images/illustration-empty-cart.svg" alt="" />
      <p class="text-4 mt-5 text-center font-bold text-rose-500">Your added items will appear here</p>
    `;
    return;
  }

  const totalProducts = myProducts.reduce((acc, p) => acc + p.quantity, 0);
  const totalAmount = myProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);

  cartContainer.innerHTML = `
    <div class="space-y-6">
      <h1 class="text-2 text-red-burnt font-bold" id="cart-quantity">Your cart (${totalProducts})</h1>
      <ul class="cart-list mt-6 space-y-4 scrollbar-thin scrollbar-thumb-rose-400 scrollbar-track-transparent max-h-96 overflow-y-auto"></ul>
      <p class="text-3 flex justify-between">
        Order Total<span class="text-2 font-bold text-rose-900">$${totalAmount.toFixed(2)}</span>
      </p>
      <p class="flex items-center justify-center gap-2 rounded-lg bg-rose-50 p-4 text-rose-900">
        <img src="assets/images/icon-carbon-neutral.svg" alt="" />
        <span>This is a <strong class="font-semibold">carbon-neutral</strong> delivery</span>
      </p>
      <button
        class="btn-confirm bg-red-burnt w-full cursor-pointer rounded-full p-3 text-white transition-opacity duration-300 hover:opacity-90"
      >
        Confirm Order
      </button>
    </div>`;

  const cartList = cartContainer.querySelector(".cart-list");
  cartList.innerHTML = myProducts
    .map(
      ({ id, name, quantity, price }) => `
      <li class="cart-item text-3 flex items-start justify-between border-b border-rose-100 pb-4" data-id=${id}>
        <div>
          <p class="font-semibold text-rose-900">${name}</p>
          <p class="flex gap-4">
            <span class="product-quantity text-red-burnt font-semibold">${quantity}x</span>
            <span class="product-price text-rose-500">@ $${price}</span>
            <span class="product-total font-semibold text-rose-500">$${(quantity * price).toFixed(2)}</span>
          </p>
        </div>
        <button
          class="remove-item group cursor-pointer rounded-full border border-rose-400 p-1 transition-colors duration-300 hover:border-rose-900"
          aria-label="delete product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
            <path
              class="transition-colors duration-300 group-hover:fill-rose-900"
              fill="#CAAFA7"
              d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
            />
          </svg>
        </button>
      </li>
    `,
    )
    .join("");
}

function updateOrder() {
  const OrderList = document.querySelector(".order-list");
  const totalAmount = myProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);

  OrderList.innerHTML = myProducts
    .map(
      ({ img, name, quantity, price }) => `
      <li class="order-item text-3 flex items-center gap-4 border-b border-rose-100 pb-4">
        <img class="size-14 rounded-sm" src="${img}" alt="" />
        <div class="over grow">
          <p class="font-semibold text-rose-900">${name}</p>
          <p class="flex gap-4">
            <span class="product-quantity text-red-burnt font-semibold">${quantity}x</span>
            <span class="product-price text-rose-500">@ $${(+price).toFixed(2)}</span>
          </p>
        </div>
        <p class="text-3 font-semibold text-rose-900">$${(price * quantity).toFixed(2)}</p>
      </li>
    `,
    )
    .join("");

  document.querySelector(".order-total").textContent = `$${totalAmount.toFixed(2)}`;
}
