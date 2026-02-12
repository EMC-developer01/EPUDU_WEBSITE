export default function ItemCard({ image, name, price }) {

    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

    const IMAGE_BASE_URL = `${MEDIA_URL}/uploads/vendorItems/`;

    const finalPrice = (price * 1.5).toFixed(2);

    return (
        <div className="w-40 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100">

            {/* Image */}
            <div className="h-28 w-full overflow-hidden rounded-t-2xl">
                <img
                    src={IMAGE_BASE_URL + image}
                    alt={name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-3">

                {/* Item Name */}
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {name}
                </h3>

                {/* Price */}
                <p className="text-xs font-bold text-pink-600 mt-1">
                    ₹ {finalPrice}
                </p>

            </div>
        </div>
    );
}
