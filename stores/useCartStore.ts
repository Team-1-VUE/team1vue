import { defineStore } from "pinia";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  duration: string;
  owner: string;
  description?: string;
  selectedAddons: Array<{
    slug: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  quantity: number;
  bookingDate?: string;
  bookingTime?: string;
  guestCounts?: {
    adults: number;
    children: number;
    seniors: number;
  };
  categoryPrices?: {
    adults: number;
    children: number;
    seniors: number;
  };
};

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  // Track if we've initialized from localStorage
  const initialized = ref(false);

  // Initialize from localStorage - this runs on mount
  onMounted(() => {
    if (!initialized.value) {
      const stored = localStorage.getItem("cart-items");
      if (stored) {
        try {
          items.value = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cart items:", e);
        }
      }
      initialized.value = true;
    }
  });

  // Watch for changes and save to localStorage
  watch(
    items,
    (newItems) => {
      if (import.meta.client && initialized.value) {
        localStorage.setItem("cart-items", JSON.stringify(newItems));
      }
    },
    { deep: true }
  );

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => {
      const guestCounts = item.guestCounts || {
        adults: item.quantity,
        children: 0,
        seniors: 0,
      };

      const cp = item.categoryPrices;
      const adultPrice = cp?.adults ?? item.price;
      const childPrice = cp?.children ?? item.price;
      const seniorPrice = cp?.seniors ?? item.price;

      const adultsTotal = guestCounts.adults * adultPrice;
      const childrenTotal = guestCounts.children * childPrice;
      const seniorsTotal = guestCounts.seniors * seniorPrice;

      const guestsTotal = adultsTotal + childrenTotal + seniorsTotal;

      const addonsPerGuest = item.selectedAddons.reduce(
        (acc, addon) => acc + addon.price,
        0
      );
      const totalGuests =
        guestCounts.adults + guestCounts.children + guestCounts.seniors;
      const addonsTotal = addonsPerGuest * totalGuests;

      return sum + guestsTotal + addonsTotal;
    }, 0)
  );

  const cartItemCount = computed(() => items.value.length);

  function addToCart(
    experience: any,
    selectedAddons: Array<{
      slug: string;
      title: string;
      price: number;
      quantity: number;
    }> = [],
    bookingDate?: string,
    adults: number = 1,
    children: number = 0,
    seniors: number = 0,
    bookingTime?: string
  ) {
    const totalGuests = adults + children + seniors;

    if (totalGuests === 0) return;

    // Find existing item with same experience, addons, and booking date
    const existingItem = items.value.find(
      (item) =>
        item.id === experience.id &&
        JSON.stringify(item.selectedAddons) ===
          JSON.stringify(selectedAddons) &&
        item.bookingDate === bookingDate
    );

    if (existingItem) {
      // Update existing item's guest counts
      if (existingItem.guestCounts) {
        existingItem.guestCounts.adults += adults;
        existingItem.guestCounts.children += children;
        existingItem.guestCounts.seniors += seniors;
      } else {
        existingItem.guestCounts = { adults, children, seniors };
      }
      existingItem.quantity =
        existingItem.guestCounts.adults +
        existingItem.guestCounts.children +
        existingItem.guestCounts.seniors;
    } else {
      // Create new cart item with guest counts
      items.value.push({
        id: experience.id,
        title: experience.title,
        price: experience.price,
        image: experience.image,
        duration: experience.duration,
        owner: experience.owner,
        selectedAddons,
        quantity: totalGuests,
        bookingDate,
        guestCounts: { adults, children, seniors },
      });
    }
  }

  function removeFromCart(index: number) {
    items.value.splice(index, 1);
  }

  function updateQuantity(index: number, quantity: number) {
    const item = items.value[index];
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      item.quantity = quantity;
    }
  }

  function updateCartItem(
    index: number,
    bookingDate: string,
    adults: number,
    children: number,
    seniors: number,
    selectedAddons: Array<{
      slug: string;
      title: string;
      price: number;
      quantity: number;
    }> = []
  ) {
    const item = items.value[index];
    if (!item) return;

    // Update item properties - no merging
    item.bookingDate = bookingDate;
    item.guestCounts = { adults, children, seniors };
    item.quantity = adults + children + seniors;
    item.selectedAddons = selectedAddons;
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalItems,
    totalPrice,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartItem,
    clearCart,
  };
});
