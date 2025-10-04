const roomService = require('../services/roomService');
const { validationResult } = require('express-validator');

/**
 * Room Controller
 * Handles HTTP requests for room management
 */
class RoomController {
  
  /**
   * Create a new room (admin only)
   * POST /rooms
   */
  async createRoom(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const room = await roomService.createRoom(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create room'
      });
    }
  }
  
  /**
   * Get all rooms
   * GET /rooms
   */
  async getAllRooms(req, res) {
    try {
      const filters = req.query;
      const rooms = await roomService.getAllRooms(filters);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error getting rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rooms'
      });
    }
  }
  
  /**
   * Get room by ID
   * GET /rooms/:id
   */
  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);
      
      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Room not found'
      });
    }
  }
  
  /**
   * Get room by room number
   * GET /rooms/number/:roomNumber
   */
  async getRoomByNumber(req, res) {
    try {
      const { roomNumber } = req.params;
      const room = await roomService.getRoomByNumber(roomNumber);
      
      res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Error getting room by number:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Room not found'
      });
    }
  }
  
  /**
   * Update room (admin only)
   * PUT /rooms/:id
   */
  async updateRoom(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const { id } = req.params;
      const room = await roomService.updateRoom(id, req.body);
      
      res.json({
        success: true,
        message: 'Room updated successfully',
        data: room
      });
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update room'
      });
    }
  }
  
  /**
   * Delete room (admin only)
   * DELETE /rooms/:id
   */
  async deleteRoom(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const { id } = req.params;
      await roomService.deleteRoom(id);
      
      res.json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete room'
      });
    }
  }
  
  /**
   * Update room status (admin only)
   * PUT /rooms/:id/status
   */
  async updateRoomStatus(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const { id } = req.params;
      const { status } = req.body;
      
      const room = await roomService.updateRoomStatus(id, status);
      
      res.json({
        success: true,
        message: 'Room status updated successfully',
        data: room
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update room status'
      });
    }
  }
  
  /**
   * Get available rooms
   * GET /rooms/available
   */
  async getAvailableRooms(req, res) {
    try {
      const filters = req.query;
      const rooms = await roomService.getAvailableRooms(filters);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error getting available rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available rooms'
      });
    }
  }
  
  /**
   * Get room statistics (admin only)
   * GET /rooms/stats
   */
  async getRoomStats(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      
      const stats = await roomService.getRoomStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting room stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get room statistics'
      });
    }
  }
  
  /**
   * Get rooms by type
   * GET /rooms/type/:roomType
   */
  async getRoomsByType(req, res) {
    try {
      const { roomType } = req.params;
      const rooms = await roomService.getRoomsByType(roomType);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error getting rooms by type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rooms by type'
      });
    }
  }
  
  /**
   * Search rooms
   * GET /rooms/search
   */
  async searchRooms(req, res) {
    try {
      const searchCriteria = req.query;
      const rooms = await roomService.searchRooms(searchCriteria);
      
      res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error searching rooms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search rooms'
      });
    }
  }

  /**
   * Upload room image (admin only)
   * POST /rooms/:id/upload-image
   */
  async uploadRoomImage(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const room = await roomService.addRoomImage(id, imageUrl);
      
      res.json({
        success: true,
        message: 'Room image uploaded successfully',
        data: {
          room: room,
          imageUrl: imageUrl
        }
      });
    } catch (error) {
      console.error('Error uploading room image:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload room image'
      });
    }
  }

  /**
   * Remove room image (admin only)
   * DELETE /rooms/:id/images/:imageIndex
   */
  async removeRoomImage(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const { id, imageIndex } = req.params;
      const room = await roomService.removeRoomImage(id, parseInt(imageIndex));
      
      res.json({
        success: true,
        message: 'Room image removed successfully',
        data: room
      });
    } catch (error) {
      console.error('Error removing room image:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove room image'
      });
    }
  }
}

module.exports = new RoomController();
