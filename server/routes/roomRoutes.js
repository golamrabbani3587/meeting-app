const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const roomControllers = require('../controllers/roomController');

router.route('/', authMiddleware).post(roomControllers.createRoom);
router.route('/', authMiddleware).get(roomControllers.getRooms);

module.exports = router