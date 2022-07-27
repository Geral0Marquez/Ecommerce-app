const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Models
const { User } = require('../models/user.model')
const { Product } = require('../models/product.model')

// Utils
const { catchAsync } = require('../utils/catchAsync.util')
const { AppError } = require('../utils/app.Error.util')
const { Email } = require('../utils/email.util')

// POST crear usuario
const createUser = catchAsync(async (req, res, next) => {
    const { userName, email, password} = req.body

    const salt = await bcrypt.genSalt(12)
    const encryptPass = await bcrypt.hash(password, salt)

    const newUser = await User.create({
        userName,
        email,
        password: encryptPass,
       
    })

    newUser.password = undefined

    await new Email(email).sendWelcome(userName)

    res.status(201).json({
        status: 'success',
        newUser,
    })
})

// POST iniciar sesión
const userlogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    const user = await User.findOne({
        where: {
            email,
            status: 'active',
        },
    })

    if (!user) {
        return next(new AppError('Credentials invalid', 400))
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return next(new AppError('Credentials invalid', 400))
    }

    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })

    res.status(200).json({
        status: 'success',
        token,
    })
})

//PATCH /:id Actualizar perfil de usuario (solo username y email)
const updateUser = catchAsync(async (req, res, next) => {
    const { user } = req
    const { userName, email } = req.body

    await user.update({ userName, email })

    res.status(201).json({ status: 'success' })
})

// DELETE /:id Deshabilitar cuenta de usuario
const desactiveUser = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const user = await User.findOne({ where: { id } })
    await user.update({ status: 'inactive' })

    res.status(201).json({ status: 'success' })
})

// GET /me Obtener los productos que el usuario ha creado
const getUser = catchAsync(async (req, res, next) => {
    const { sessionUser } = req

    const products = await User.findAll({
        where: {
            id: sessionUser.id,
        },
        include: [
            {
                model: Product,
            },
        ],
    })

    res.json({
        status: 'success',
        products,
    })
})

///orders  obtener todas las compras hechas por el usuario
const getUserAllOrders = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const userOrders = await Order.findAll({
      include: [
        {
          model: Cart,
          required: false,
          include: {
            model: ProductInCart,
            required: false,
            include: { model: Cart, required: false },
          },
        },
      ],
      where: { userId: sessionUser.id, status: 'purchased' },
    });
  
    if (!userOrders) {
      return next(new AppError('No orders to show', 400));
    }
  
    res.status(201).json({
      status: 'success',
      userOrders,
    });
  });

// GET   /orders/:id obtener detalles de una sola orden dado un ID
  const getUserOrderById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userOrders = await Order.findOne({
      include: [],
      where: { id, status: 'purchased' },
    });
  
    if (!userOrders) {
      return next(new AppError('No orders to show', 400));
    }
  
    res.status(201).json({
      status: 'success',
      userOrders,
    });
  });

module.exports = {
    createUser,
    userlogin,
    updateUser,
    desactiveUser,
    getUser,
    getUserAllOrders,
    getUserOrderById
}
