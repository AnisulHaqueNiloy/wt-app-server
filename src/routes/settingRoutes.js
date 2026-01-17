const express = require('express')
const { protect } = require('../middlewares/authMiddleware')
const { updateSetting } = require('../controllers/userController')
const router = express.Router()

router.patch('/setting',protect,updateSetting)

module.exports = router