package com.prince.airbnb.repository;


import com.prince.airbnb.entity.Guest;
import com.prince.airbnb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByUser(User user);
}