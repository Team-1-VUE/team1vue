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
        (acc, addon) => acc + addon.price * (addon.quantity ?? 1),
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

    // Compare addon sets by title only (not quantities)
    const addonTitles = new Set(selectedAddons.map((a) => a.title));
    const existingItem = items.value.find((item) => {
      if (
        item.id !== experience.id ||
        item.bookingDate !== bookingDate ||
        item.bookingTime !== bookingTime
      ) {
        return false;
      }
      
      // Compare addon titles only
      const itemAddonTitles = new Set(item.selectedAddons.map((a) => a.title));
      if (addonTitles.size !== itemAddonTitles.size) return false;
      
      for (const title of addonTitles) {
        if (!itemAddonTitles.has(title)) return false;
      }
      
      return true;
    });

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
      existingItem.bookingTime = bookingTime;
      
      // Merge addon quantities by title
      const addonMap = new Map<string, { title: string; price: number; quantity: number }>();
      
      // Add existing addons to map
      existingItem.selectedAddons.forEach((addon) => {
        addonMap.set(addon.title, { ...addon });
      });
      
      // Merge new addons (add quantities for matching titles)
      selectedAddons.forEach((addon) => {
        const existing = addonMap.get(addon.title);
        if (existing) {
          existing.quantity += addon.quantity;
        } else {
          addonMap.set(addon.title, { ...addon });
        }
      });
      
      // Convert map back to array
      existingItem.selectedAddons = Array.from(addonMap.values());
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
        bookingTime,
        guestCounts: { adults, children, seniors },
      });
    }
  }

  function updateCartItem(
    experience: any,
    index: number,
    bookingDate: string,
    adults: number,
    children: number,
    seniors: number,
    selectedAddons: Array<{
      title: string;
      price: number;
      quantity?: number;
    }>,
    bookingTime?: string
  ) {
    const item = items.value[index];
    if (!item) return;

    // Remove the item at this index
    items.value.splice(index, 1);

    // Normalize addon quantities
    const normalizedAddons = selectedAddons.map((addon) => ({
      title: addon.title,
      price: addon.price,
      quantity: addon.quantity ?? 1,
    }));

    // Add it back using addToCart which handles merging automatically
    addToCart(
      experience,
      normalizedAddons,
      bookingDate,
      adults,
      children,
      seniors,
      bookingTime
    );
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
