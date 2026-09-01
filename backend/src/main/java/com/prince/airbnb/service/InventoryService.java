package com.prince.airbnb.service;


import com.prince.airbnb.dto.HotelDto;
import com.prince.airbnb.dto.HotelSearchRequest;
import com.prince.airbnb.entity.Room;
import org.springframework.data.domain.Page;

public interface InventoryService {

    void initializeRoomForAYear(Room room);

    void deleteFutureInventories(Room room);

    void deleteAllInventories(Room room);

    Page<HotelDto> searchHotels(HotelSearchRequest hotelSearchRequest);


}
