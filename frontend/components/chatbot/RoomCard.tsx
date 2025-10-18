"use client";

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  amenities: string[];
  available: boolean;
}

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export default function RoomCard({ room, onBook }: RoomCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{room.roomType} Room</h3>
          <p className="text-sm text-gray-600">Room {room.roomNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">Rs {room.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500">per night</p>
        </div>
      </div>
      
      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Amenities:</p>
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Book button */}
      <button
        onClick={() => onBook(room)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
      >
        Book This Room
      </button>
    </div>
  );
}
