const express = require('express')

// Controllers
const {
    createUser,
    userlogin,
    updateUser,
    desactiveUser,
    getUser,
    getUserAllOrders,
    getUserOrderById
} = require('../controllers/user.controller')

//Middlewares
const {
    createUserValidations,
    checkValidations,
} = require('../middlewares/validation.middlewares')
const {
protectToken,userExist,
} = require('../middlewares/user.middleware')
const { orderExists } = require('../middlewares/order.middleware')

//Routers
const router = express.Router()

router.post('/', createUser, createUserValidations, checkValidations)
router.post('/login', userlogin)
router.patch('/:id', protectToken, userExist, updateUser)
router.delete('/:id', protectToken, desactiveUser)
router.get('/me', protectToken, getUser)
router.get('/orders', getUserAllOrders) 
router.get('/orders/:id', orderExists,getUserOrderById)

module.exports = { UserRouter: router }
