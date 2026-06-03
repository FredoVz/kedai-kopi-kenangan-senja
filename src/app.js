document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    selectedItem: null,

    items: [
      {
        id: 1,
        name: "Robusta Brazil",
        img: "1.jpg",
        price: 20000,
        description: "Kopi berkualitas tinggi dengan aroma lembut.",
      },
      {
        id: 2,
        name: "Arabica Blend",
        img: "2.jpg",
        price: 25000,
        description: "Kopi arabica premium.",
      },
      {
        id: 3,
        name: "Primo Passo",
        img: "3.jpg",
        price: 30000,
        description: "Kopi Kenangan Senja adalah kopi berkualitas tinggi dengan aroma yang lembut dan cita rasa yang khas.",
      },
      {
        id: 4,
        name: "Aceh Gayo",
        img: "4.jpg",
        price: 35000,
        description: "Kopi berkualitas tinggi dengan aroma yang khas.",
      },
      {
        id: 5,
        name: "Sumatra Mandheling",
        img: "5.jpg",
        price: 40000,
        description: "Kopi berkualitas tinggi dengan aroma yang khas.",
      },
    ],

    openModal(item) {
      this.selectedItem = item;
      const itemDetailModal = document.querySelector("#item-detail-modal");
      itemDetailModal.style.display = "flex";
    },

    closeModal() {
      const itemDetailModal = document.querySelector("#item-detail-modal");
      itemDetailModal.style.display = "none";
    },
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada vbarang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada / cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        //Ini untuk menghitung quantity dari keseluruhan barang yang ada di cart
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          // jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            // Ini untuk menghitung quantity dari sebuah item
            item.quantity++;
            item.total = item.price * item.quantity;
            //Ini untuk menghitung quantity dari keseluruhan barang yang ada di cart
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },
    remove(id) {
      // ambil item yang mau diremove berdasarkan id nya
      const cartItem = this.items.find((item) => item.id === id);

      // jika item lebih dari 1
      if (cartItem.quantity > 1) {
        //telusuri 1 1
        this.items = this.items.map((item) => {
          //jika bukan barang yang diklik
          if (item.id !== id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            // Ini untuk menghitung quantity dari sebuah item
            item.quantity--;
            item.total = item.price * item.quantity;
            //Ini untuk menghitung quantity dari keseluruhan barang yang ada di cart
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity == 1) {
        // jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        //Ini untuk menghitung quantity dari keseluruhan barang yang ada di cart
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// Form Validation
//Checkout Button WA
const checkoutButtonWa = document.querySelector("#checkout-button-wa");
checkoutButtonWa.disabled = true;

//Checkout Button Snap
const checkoutButtonSnap = document.querySelector("#checkout-button-snap");
checkoutButtonSnap.disabled = true;

const form = document.querySelector("#checkoutForm");
form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    // cek jika ada salah satu form element yang masih kosong maka button tetap disabled
    if (form.elements[i].value.length !== 0) {
      //Checkout Button WA
      checkoutButtonWa.classList.remove("disabled");
      checkoutButtonWa.classList.add("disabled");

      //Checkout Button Snap
      checkoutButtonSnap.classList.remove("disabled");
      checkoutButtonSnap.classList.add("disabled");
    } else {
      // Jika salah satu form terisi maka skip
      return false;
    }
  }

  //Jika semua inputan sudah terisi
  //Checkout Button WA
  checkoutButtonWa.disabled = false;
  checkoutButtonWa.classList.remove("disabled");

  //Checkout Button Snap
  checkoutButtonSnap.disabled = false;
  checkoutButtonSnap.classList.remove("disabled");
});

// Kirim data ketika tombol checkout WA diklik
checkoutButtonWa.addEventListener("click", function (e) {
  e.preventDefault();
  const formData = new FormData(form);

  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);

  // Kirim data ke Whatsapp
  sendToWa(objData);
});

// Kirim data ketika tombol checkout Snap diklik
checkoutButtonSnap.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);

  const data = new URLSearchParams(formData);

  //minta transactiontoken menggunakan ajax / fetch
  try {
    const response = await fetch("./php/placeOrder.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    if (!token) {
      alert("Terjadi kesalahan, silahkan coba lagi.");
    }
    //Kirim data ke snap
    // window.snap.embed(token, {
    //   embedId: "snap-container",
    // });
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

const sendToWa = (objData) => {
  const message = formatMessage(objData);
  window.open("http://wa.me/6285326607347?text=" + encodeURIComponent(message));
};

// Format pesan Whatsapp
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`)}
Total: ${rupiah(obj.total)}
Terima Kasih.`;
};

// Konveris ke Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
