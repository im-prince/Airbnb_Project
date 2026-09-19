package com.prince.airbnb.controller;

import com.prince.airbnb.dto.BookingDto;
import com.prince.airbnb.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
@Profile("dev")
public class DevController {

    private final BookingService bookingService;

    @PostMapping("/bookings/{bookingId}/force-confirm")
    public ResponseEntity<BookingDto> forceConfirmBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.forceConfirmBooking(bookingId));
    }
}