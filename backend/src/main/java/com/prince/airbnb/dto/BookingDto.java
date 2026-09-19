package com.prince.airbnb.dto;


import com.prince.airbnb.entity.enums.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class BookingDto {
    private Long id;
    private Integer roomsCount;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private Long secondsUntilExpiry;
    private BookingStatus bookingStatus;
    private BigDecimal amount;
    private Set<GuestDto> guests;
    private PaymentDto payment;
    private String hotelName;
    private String hotelCity;
    private String roomType;
}