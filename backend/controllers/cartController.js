const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');

// Get cart by Order ID
exports.getCart = async (req, res) => {
    try {
        const { orderId } = req.params;
        const cart = await Cart.findOne({ orderId });

        if (!cart) {
            return res.json({ medicines: [] });
        }

        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

// Add or Update medicine in cart
exports.addToCart = async (req, res) => {
    try {
        const { orderId, patientId, medicines } = req.body;

        if (!orderId || !medicines || medicines.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // We process one update at a time typically, but handling array to be safe
        // For the specific requirement: "If medicine exists, update quantity; else insert new."

        let cart = await Cart.findOne({ orderId });

        if (!cart) {
            cart = new Cart({
                orderId,
                patientId,
                medicines: []
            });
        }

        // For each medicine coming in request
        for (const item of medicines) {
            const medicineDetails = await Medicine.findById(item.medicineId);
            if (!medicineDetails) {
                continue; // Skip invalid medicines
            }

            const existingItemIndex = cart.medicines.findIndex(
                m => m.medicineId.toString() === item.medicineId
            );

            if (existingItemIndex > -1) {
                // Update quantity if aleady exists
                // If the frontend sends the *new total* quantity, we use that. 
                // However, the prompt says "Prevent duplicates -> if a medicine already exists, increase its quantity".
                // But generally for a cart API, usually we set specific quantity or increment. 
                // Let's assume the frontend sends the ADDITION unless clearly replacing.
                // Wait, requirements say: "Check if cart exists... If medicine exists, update quantity"
                // Let's assume the payload contains the DELTA or the FINAL state. 
                // Given "quantity counter + and - buttons", it is safer to treat the payload as the "Item to be added" or "Updated Item".
                // ACTUALLY: "Prevent duplicates -> if a medicine already exists, increase its quantity instead of re-adding." 
                // This implies if I click "Add" on search result, it increments. 
                // But the UI has + and - buttons. 
                // Let's support both: specific set or increment. 
                // Simplest for "Autosave" is usually overriding the item's state with the new state from frontend, 
                // OR handling purely additive logic.

                // DECISION: The most robust way for this specific requirement "Quantity counter (+ and - buttons)" 
                // is that the frontend manages the state and sends the specific item status.
                // However, the prompt says "POST /cart/add ... { medicines: [ { medicineId, quantity: 2 } ] }".
                // If I send quantity: 2, does it mean Add 2 or Set to 2? 
                // "If medicine exists, update quantity; else insert new." -> ambiguous.
                // I will interpret this as: Look for item. If found, add the *incoming quantity* to existing? 
                // OR REPLACE? 
                // "Prevent duplicates -> if a medicine already exists, increase its quantity" usually applies to the 'Add from Search' action.
                // But for '+/-' buttons, we probably want to Set Quantity.

                // Let's implement smart logic:
                // If it's a new addition (search result click), frontend sends +1.
                // If it's a +/- button click, frontend sends the new total? 
                // Let's stick to: The backend will ADD the quantity passed to existing. 
                // The frontend can send 1 to increment.
                // BUT, to handle exact updates (like typing a number), this is tricky.

                // RE-READING: "Option to remove... When quantity changes: Update UI instantly. Make API call..."
                // Use a simpler approach: Upsert. The incoming payload IS the item state desired for that medicine.
                // If I have 5, and I click +, I have 6. I send { quantity: 6 }. 
                // Backend sets it to 6.

                // WAIT. "Prevent duplicates -> if a medicine already exists, increase its quantity instead of re-adding."
                // This refers to the SEARCH -> SELECT action.
                // So if I select Paracetamol, and it's already there (qty 1), it becomes qty 2.
                // This logic can be frontend side. The frontend calculates new state -> calls API.
                // So Backend just needs to UPSERT (Replace/Set) the item in the array.

                cart.medicines[existingItemIndex].quantity = item.quantity;
                // Also update price reference just in case
                cart.medicines[existingItemIndex].price = medicineDetails.price;
                cart.medicines[existingItemIndex].name = medicineDetails.name;
            } else {
                // Add new
                cart.medicines.push({
                    medicineId: item.medicineId,
                    name: medicineDetails.name,
                    price: medicineDetails.price,
                    quantity: item.quantity
                });
            }
        }

        await cart.save();
        res.json(cart);

    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Error updating cart' });
    }
};

// Remove medicine
exports.removeFromCart = async (req, res) => {
    try {
        const { orderId, medicineId } = req.params;

        const cart = await Cart.findOne({ orderId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.medicines = cart.medicines.filter(
            item => item.medicineId.toString() !== medicineId
        );

        await cart.save();
        res.json(cart);

    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Error removing item' });
    }
};
