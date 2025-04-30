import mongoose from 'mongoose';

// Only create the model on the server side
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  imageCid: { type: String, required: false }, // Optional field to store Pinata CID
  stock: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Check if we're on the server (mongoose is properly defined) and if the model already exists
let ProductModel;
if (mongoose.models && typeof mongoose.models.Product !== 'undefined') {
  ProductModel = mongoose.models.Product;
} else if (mongoose.model) {
  // Only create the model if we're on the server side
  try {
    ProductModel = mongoose.model('Product', ProductSchema);
  } catch (error) {
    // If error because model already exists, use the existing model
    ProductModel = mongoose.models.Product;
  }
}

export default ProductModel; 