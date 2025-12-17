import Order from "../models/orderModel.js";
import Item from "../models/itemModel.js";

export const createOrder = async (req, res) => {
    try {
        const { clientId, selectedItems, eventDate, eventTime, address } = req.body;

        // Find vendor of each selected item  
        const itemsWithVendor = await Promise.all(
            selectedItems.map(async (item) => {
                const itemData = await Item.findById(item.itemId);

                return {
                    vendorId: itemData.vendorId,
                    itemDetails: {
                        itemId: itemData._id,
                        name: itemData.name,
                        price: itemData.price,
                    },
                };
            })
        );

        // Group items by vendor  
        const ordersGrouped = {};

        itemsWithVendor.forEach(({ vendorId, itemDetails }) => {
            if (!ordersGrouped[vendorId]) {
                ordersGrouped[vendorId] = [];
            }
            ordersGrouped[vendorId].push(itemDetails);
        });

        // Save separate order for each vendor  
        const savedOrders = [];

        for (const vendorId in ordersGrouped) {
            const newOrder = await Order.create({
                vendorId,
                clientId,
                items: ordersGrouped[vendorId],
                eventDate,
                eventTime,
                address,
            });

            savedOrders.push(newOrder);
        }

        res.status(201).json({
            success: true,
            message: "Order created successfully for related vendors",
            orders: savedOrders,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
