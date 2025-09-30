const Room = require('../models/Room');

/**
 * Room Service
 * Contains all business logic for room management
 */
class RoomService {
  
  /**
   * Create a new room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>} Created room
   */
  async createRoom(roomData) {
    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
    if (existingRoom) {
      throw new Error('Room number already exists');
    }
    
    const room = new Room(roomData);
    await room.save();
    return room;
  }
  
  /**
   * Get all rooms with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of rooms
   */
  async getAllRooms(filters = {}) {
    const query = {};
    
    if (filters.roomType) {
      query.roomType = filters.roomType;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.minCapacity) {
      query.capacity = { $gte: filters.minCapacity };
    }
    
    if (filters.maxPrice) {
      query.pricePerNight = { $lte: filters.maxPrice };
    }
    
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    return rooms;
  }
  
  /**
   * Get room by ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Room details
   */
  async getRoomById(roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }
  
  /**
   * Get room by room number
   * @param {string} roomNumber - Room number
   * @returns {Promise<Object>} Room details
   */
  async getRoomByNumber(roomNumber) {
    const room = await Room.findOne({ roomNumber });
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  }
  
  /**
   * Update room information
   * @param {string} roomId - Room ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated room
   */
  async updateRoom(roomId, updateData) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    // Check if room number is being changed and if it already exists
    if (updateData.roomNumber && updateData.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber: updateData.roomNumber });
      if (existingRoom) {
        throw new Error('Room number already exists');
      }
    }
    
    Object.assign(room, updateData);
    await room.save();
    return room;
  }
  
  /**
   * Delete room
   * @param {string} roomId - Room ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRoom(roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    // Check if room has any active reservations
    const Reservation = require('../models/Reservation');
    const activeReservations = await Reservation.find({
      roomId: roomId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeReservations.length > 0) {
      throw new Error('Cannot delete room with active reservations');
    }
    
    await Room.findByIdAndDelete(roomId);
    return true;
  }
  
  /**
   * Update room status
   * @param {string} roomId - Room ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated room
   */
  async updateRoomStatus(roomId, status) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    await room.updateStatus(status);
    return room;
  }
  
  /**
   * Get available rooms
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Available rooms
   */
  async getAvailableRooms(filters = {}) {
    const query = { status: 'available' };
    
    if (filters.roomType) {
      query.roomType = filters.roomType;
    }
    
    if (filters.minCapacity) {
      query.capacity = { $gte: filters.minCapacity };
    }
    
    if (filters.maxPrice) {
      query.pricePerNight = { $lte: filters.maxPrice };
    }
    
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    return rooms;
  }
  
  /**
   * Get room statistics
   * @returns {Promise<Object>} Room statistics
   */
  async getRoomStats() {
    const stats = await Room.aggregate([
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          availableRooms: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          reservedRooms: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] }
          },
          occupiedRooms: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          },
          singleRooms: {
            $sum: { $cond: [{ $eq: ['$roomType', 'Single'] }, 1, 0] }
          },
          doubleRooms: {
            $sum: { $cond: [{ $eq: ['$roomType', 'Double'] }, 1, 0] }
          },
          suiteRooms: {
            $sum: { $cond: [{ $eq: ['$roomType', 'Suite'] }, 1, 0] }
          },
          averagePrice: { $avg: '$pricePerNight' }
        }
      }
    ]);
    
    return stats[0] || {
      totalRooms: 0,
      availableRooms: 0,
      reservedRooms: 0,
      occupiedRooms: 0,
      singleRooms: 0,
      doubleRooms: 0,
      suiteRooms: 0,
      averagePrice: 0
    };
  }
  
  /**
   * Get rooms by type
   * @param {string} roomType - Room type
   * @returns {Promise<Array>} Rooms of specified type
   */
  async getRoomsByType(roomType) {
    const rooms = await Room.find({ roomType }).sort({ roomNumber: 1 });
    return rooms;
  }
  
  /**
   * Search rooms by criteria
   * @param {Object} searchCriteria - Search criteria
   * @returns {Promise<Array>} Matching rooms
   */
  async searchRooms(searchCriteria) {
    const query = {};
    
    if (searchCriteria.roomNumber) {
      query.roomNumber = { $regex: searchCriteria.roomNumber, $options: 'i' };
    }
    
    if (searchCriteria.roomType) {
      query.roomType = searchCriteria.roomType;
    }
    
    if (searchCriteria.status) {
      query.status = searchCriteria.status;
    }
    
    if (searchCriteria.minPrice && searchCriteria.maxPrice) {
      query.pricePerNight = {
        $gte: searchCriteria.minPrice,
        $lte: searchCriteria.maxPrice
      };
    } else if (searchCriteria.minPrice) {
      query.pricePerNight = { $gte: searchCriteria.minPrice };
    } else if (searchCriteria.maxPrice) {
      query.pricePerNight = { $lte: searchCriteria.maxPrice };
    }
    
    if (searchCriteria.amenities && searchCriteria.amenities.length > 0) {
      query.amenities = { $in: searchCriteria.amenities };
    }
    
    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    return rooms;
  }
}

module.exports = new RoomService();
