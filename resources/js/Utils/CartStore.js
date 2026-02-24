const CART_KEY_PREFIX = "restoration_cart_";

export const CartStore = {
    getCart: (tableNumber) => {
        const data = localStorage.getItem(CART_KEY_PREFIX + tableNumber);
        return data ? JSON.parse(data) : [];
    },

    // Update addItem untuk menyimpan 'selectedVariantsMap'
    addItem: (tableNumber, product, qty, note, selectedVariantIds) => {
        const cart = CartStore.getCart(tableNumber);

        // Susun detail varian untuk tampilan (Teks)
        const variantDetails = [];
        let variantTotalPrice = 0;

        if (product.variants) {
            product.variants.forEach(v => {
                const selectedItemId = selectedVariantIds[v.id];
                if (selectedItemId) {
                    const selectedItem = v.items.find(i => i.id === selectedItemId);
                    if (selectedItem) {
                        variantDetails.push({
                            group_name: v.name,
                            item_name: selectedItem.name,
                            price: parseFloat(selectedItem.price)
                        });
                        variantTotalPrice += parseFloat(selectedItem.price);
                    }
                }
            });
        }

        const variantSignature = JSON.stringify(selectedVariantIds);
        const uniqueCartId = `${product.id}-${variantSignature}`;

        const existingItemIndex = cart.findIndex(item => item.cart_id === uniqueCartId);

        const newItemData = {
            cart_id: uniqueCartId,
            product_id: product.id,
            name: product.name,
            image_url: product.image_url,
            base_price: parseFloat(product.price),
            variant_price: variantTotalPrice,
            total_price_per_item: parseFloat(product.price) + variantTotalPrice,
            qty: qty,
            note: note,
            variants: variantDetails,
            // PENTING: Simpan peta ID ini untuk keperluan EDIT nanti
            selectedVariantsMap: selectedVariantIds 
        };

        if (existingItemIndex > -1) {
            // Kalau update qty (tanpa edit varian), kita update qty-nya saja
            // Tapi kalau dari Edit Mode (replace), logic-nya nanti pakai removeItem dulu baru addItem
             cart[existingItemIndex].qty += qty;
             cart[existingItemIndex].note = note; // Update note terbaru
        } else {
            cart.push(newItemData);
        }

        localStorage.setItem(CART_KEY_PREFIX + tableNumber, JSON.stringify(cart));
        return cart;
    },

    updateQty: (tableNumber, cartId, delta) => {
        let cart = CartStore.getCart(tableNumber);
        const index = cart.findIndex(item => item.cart_id === cartId);

        if (index > -1) {
            const newQty = cart[index].qty + delta;
            if (newQty <= 0) {
                cart.splice(index, 1);
            } else {
                cart[index].qty = newQty;
            }
            localStorage.setItem(CART_KEY_PREFIX + tableNumber, JSON.stringify(cart));
        }
        return cart;
    },

    // FITUR BARU: Hapus item spesifik (Dipakai saat Edit: Hapus Lama -> Simpan Baru)
    removeItem: (tableNumber, cartId) => {
        let cart = CartStore.getCart(tableNumber);
        const newCart = cart.filter(item => item.cart_id !== cartId);
        localStorage.setItem(CART_KEY_PREFIX + tableNumber, JSON.stringify(newCart));
        return newCart;
    },

    getSummary: (tableNumber) => {
        const cart = CartStore.getCart(tableNumber);
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        const totalPrice = cart.reduce((acc, item) => acc + (item.total_price_per_item * item.qty), 0);
        return { totalQty, totalPrice };
    },
    
    clearCart: (tableNumber) => {
        localStorage.removeItem(CART_KEY_PREFIX + tableNumber);
    }
};