package com.prince.airbnb.service;


import com.prince.airbnb.dto.BookingDto;
import com.prince.airbnb.dto.BookingRequest;
import com.prince.airbnb.dto.GuestDto;
import com.prince.airbnb.dto.HotelReportDto;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingDto initialiseBooking(BookingRequest bookingRequest);

    BookingDto addGuests(Long bookingId, List<GuestDto> guestDtoList);

    BookingDto getBookingById(Long bookingId);

    List<BookingDto> getMyBookings();

    BookingDto forceConfirmBooking(Long bookingId);

    void cancelBooking(Long bookingId);

    List<BookingDto> getAllBookingsByHotelId(Long hotelId);

    HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate);


}