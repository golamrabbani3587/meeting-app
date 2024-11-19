const Room = require('../models/Room');
const authMiddleware = require('../middlewares/authMiddleware');

const createRoom = async (req, res) => {
    try {
      const { title, desc } = req.body;
      const room = new Room({ title, desc });
      await room.save();
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }};
  
  const getRooms = async (req, res) => {
    try {
      const rooms = await Room.find().sort({ createdAt: -1 });
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  module.exports = { createRoom, getRooms}