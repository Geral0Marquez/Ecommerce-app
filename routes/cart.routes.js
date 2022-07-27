const express = require('express')

// Controllers
const {
    addProductCart,
    /*getUserOrdersbyId,*/
    purchaseCart,
    removeProductFromCart,
    updateProductCart,
    /*getUserAllOrders,*/
} = require('../controllers/cart.controllers')


// Middlewares
const { protectToken } = require('../middlewares/user.middleware')
/*const { orderExists } = require('../middlewares/order.middleware')*/

//Routers
const router = express.Router()
router.use(protectToken)

/*
router.get('/orders', getUserAllOrders) 
router.get('/orders/:id', orderExists, getUserOrdersbyId)*/
// cart routers
router.post('/add-product',  addProductCart)
router.patch('/update-cart', updateProductCart)
router.post('/purchase', purchaseCart)
router.delete('/:productId',  removeProductFromCart)

module.exports = { CartRouter: router }
