const Router = require('express')
const userController = require('../controller/user.controller')
const router = new Router()
const authMiddleware = require('../middleware/authMiddleware')

router.post('/signin', userController.create)
router.post('/login', userController.login)
router.post('/logout',authMiddleware, userController.logout)
router.get('/user',authMiddleware, userController.get)
router.put('/user',authMiddleware, userController.update)
router.delete('/user',authMiddleware, userController.delete)



module.exports = router