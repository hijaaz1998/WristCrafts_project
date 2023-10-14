const User = require('../model/userModel');
const Product = require('../model/productModel');

const addToCart = async (req, res) => {
  try {

    const productId = req.body.ProductId;
    const userId = res.locals.user;

    const product = await Product.findById(productId);

    const user = await User.findById(userId);

    const existingCartItem = user.cart.find(item =>
      String(item.products._id) === String(product._id)
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ products: product._id, quantity: 1 });
    }

    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.log(error.message);
  }
}

const loadCart = async (req, res) => {

  try {

    const userId = res.locals.user;
    const user = await User.findById(userId);

    const cartProducts = await User.findById(userId).populate('cart.products');

    console.log(cartProducts);

    res.render('cart', { cartProducts: cartProducts.cart, userId: userId });

  } catch (error) {
    console.log(error.message);
  }
}

const removeFromCart = async (req, res) => {

  try {

    const productId = req.params.productId;
    const userId = res.locals.user;


    const user = await User.findById(userId);

    const itemIndex = user.cart.findIndex(item => String(item.products) === productId);

    if (itemIndex !== -1) {
      user.cart.splice(itemIndex, 1);
      await user.save();
    }

    res.redirect('/cart');

  } catch (error) {
    console.log(error.message)
  }
}

const clearCart = async (req, res) => {
  try {

    const userId = res.locals.user;
    const user = await User.findById(userId).populate('cart');


    user.cart = [];
    await user.save();

    res.redirect('/cart');

  } catch (error) {
    console.log(error.message);
  }
}

const incrementItem = async (req, res) => {
  try {

    const user = res.locals.user;
    const productId = req.query.itemId;
    const quantity = req.query.qty;

    const cartItem = await user.cart.find((item) => item.products.equals(productId));

    if (cartItem) {
      cartItem.quantity += 1;

      await user.save();

      res.redirect('/cart')
    }

  } catch (error) {
    console.log(error.message)
  }
}

const updateCart = async (req, res) => {
  try {
    const user = res.locals.user;
    const { action, itemId } = req.query;

    if (action === 'increment' || action === 'decrement') {
      const cartItem = user.cart.find((item) => item.products.equals(itemId));
      const prod = await Product.findById(itemId);

      if (cartItem) {
        if (action === 'increment') {
          if (prod.quantity <= cartItem.quantity) {
            console.log('Cannot increment. Insufficient stock.');
          } else {
            cartItem.quantity += 1;
          }
        } else {
          if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
          }
        }


        await user.save();

        const subtotal = cartItem.quantity * prod.salePrice;

        const updatedCartData = {
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          price: cartItem.products.salePrice,
          subtotal: subtotal,
        };

        res.json(updatedCartData);
      } else {
        res.status(404).json({ error: 'Item not found in cart' });
      }
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const decrementItem = async (req, res) => {
  try {

    const user = res.locals.user;
    const productId = req.query.itemId;
    const quantity = req.query.qty;

    const cartItem = await user.cart.find((item) => item.products.equals(productId));

    if (cartItem) {
      cartItem.quantity -= 1;

      await user.save();

      res.redirect('/cart')
    }

  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  addToCart,
  loadCart,
  removeFromCart,
  clearCart,
  incrementItem,
  decrementItem,
  updateCart
}