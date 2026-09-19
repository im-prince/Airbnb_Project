package com.prince.airbnb.repository;

import com.prince.airbnb.entity.Booking;
import com.prince.airbnb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPaymentSessionId(String paymentSessionId);

    List<Booking> findByUser(User user);
}