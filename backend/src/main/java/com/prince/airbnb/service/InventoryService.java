package com.prince.airbnb.service;



import com.prince.airbnb.dto.HotelPriceDto;
import com.prince.airbnb.dto.HotelSearchRequest;
import com.prince.airbnb.dto.RoomAvailabilityDto;
import com.prince.airbnb.entity.Inventory;
import com.prince.airbnb.entity.Room;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface InventoryService {

    void initializeRoomForAYear(Room room);

    void deleteFutureInventories(Room room);

    void deleteAllInventories(Room room);

    Page<HotelPriceDto> searchHotels(HotelSearchRequest hotelSearchRequest);

    BigDecimal calculateTotalPrice(List<Inventory> inventoryList, Integer roomsCount);

    List<RoomAvailabilityDto> getRoomAvailability(Long hotelId, LocalDate startDate, LocalDate endDate);

}