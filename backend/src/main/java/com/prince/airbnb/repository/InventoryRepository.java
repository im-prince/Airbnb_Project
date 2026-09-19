package com.prince.airbnb.repository;

import com.prince.airbnb.dto.RoomAvailabilityDto;
import com.prince.airbnb.entity.Hotel;
import com.prince.airbnb.entity.Inventory;
import com.prince.airbnb.entity.Room;
import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    void deleteByRoom(Room room);

    List<Inventory> findByHotelAndDateBetween(Hotel hotel, LocalDate startDate, LocalDate endDate);

    List<Inventory> findByRoomAndDateBetween(Room room, LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT DISTINCT i.hotel
            FROM Inventory i
            WHERE i.city = :city
                AND i.date BETWEEN :startDate AND :endDate
                AND i.closed = false
                AND (i.totalCount - i.bookedCount - i.reservedCount) >= :roomsCount
           GROUP BY i.hotel, i.room
           HAVING COUNT(i.date) = :dateCount
           """)
    Page<Hotel> findHotelsWithAvailableInventory(
            @Param("city") String city,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomsCount") Integer roomsCount,
            @Param("dateCount") Long dateCount,
            Pageable pageable
    );

    @Query("""
            SELECT i
            FROM Inventory i
            WHERE i.room.id = :roomId
                AND i.date BETWEEN :startDate AND :endDate
                AND i.closed = false
                AND (i.totalCount - i.bookedCount - i.reservedCount) >= :roomsCount
            """)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<Inventory> findAndLockAvailableInventory(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("roomsCount") Integer roomsCount
    );


    @Query("""
        SELECT new com.prince.airbnb.dto.RoomAvailabilityDto(
            i.room.id, i.room.type, i.room.capacity, i.room.photos,
            i.room.basePrice, MIN(i.price), MIN(i.totalCount - i.bookedCount - i.reservedCount)
        )
        FROM Inventory i
        WHERE i.hotel.id = :hotelId
            AND i.date BETWEEN :startDate AND :endDate
            AND i.closed = false
        GROUP BY i.room
        HAVING COUNT(i.date) = :dateCount
        """)
    List<RoomAvailabilityDto> findRoomAvailability(
            @Param("hotelId") Long hotelId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dateCount") Long dateCount
    );
}