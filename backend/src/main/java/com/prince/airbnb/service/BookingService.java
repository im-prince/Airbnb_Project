package com.prince.airbnb.service;


import com.prince.airbnb.dto.BookingDto;
import com.prince.airbnb.dto.BookingRequest;
import com.prince.airbnb.dto.GuestDto;

import java.util.List;

public interface BookingService {

    BookingDto initialiseBooking(BookingRequest bookingRequest);

    BookingDto addGuests(Long bookingId, List<GuestDto> guestDtoList);
}
