package com.prince.airbnb.repository;

import com.prince.airbnb.entity.Booking;
import com.prince.airbnb.entity.Hotel;
import com.prince.airbnb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPaymentSessionId(String paymentSessionId);

    List<Booking> findByUser(User user);

    List<Booking> findByHotel(Hotel hotel);

    List<Booking> findByHotelAndCreatedAtBetween(Hotel hotel, LocalDateTime startDateTime, LocalDateTime endDateTime);
}