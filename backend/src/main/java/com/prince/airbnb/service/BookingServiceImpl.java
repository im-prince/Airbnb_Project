package com.prince.airbnb.service;


import com.prince.airbnb.dto.BookingDto;
import com.prince.airbnb.dto.BookingRequest;
import com.prince.airbnb.dto.GuestDto;
import com.prince.airbnb.dto.HotelReportDto;
import com.prince.airbnb.entity.*;
import com.prince.airbnb.entity.enums.BookingStatus;
import com.prince.airbnb.entity.enums.PaymentStatus;
import com.prince.airbnb.exception.ResourceNotFoundException;
import com.prince.airbnb.exception.UnAuthorisedException;
import com.prince.airbnb.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService{
    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public BookingDto initialiseBooking(BookingRequest bookingRequest) {

        log.info("Initialising booking for hotel : {}, room: {}, date {}-{}", bookingRequest.getHotelId(),
                bookingRequest.getRoomId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());

        Hotel hotel = hotelRepository.findById(bookingRequest.getHotelId()).orElseThrow(() ->
                new ResourceNotFoundException("Hotel not found with id: "+bookingRequest.getHotelId()));

        Room room = roomRepository.findById(bookingRequest.getRoomId()).orElseThrow(() ->
                new ResourceNotFoundException("Room not found with id: "+bookingRequest.getRoomId()));

        List<Inventory> inventoryList = inventoryRepository.findAndLockAvailableInventory(room.getId(),
                bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate(), bookingRequest.getRoomsCount());

        long daysCount = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate())+1;

        if (inventoryList.size() != daysCount) {
            throw new IllegalStateException("Room is not available anymore");
        }

        for(Inventory inventory: inventoryList) {
            inventory.setReservedCount(inventory.getReservedCount() + bookingRequest.getRoomsCount());
        }

        inventoryRepository.saveAll(inventoryList);

        BigDecimal totalAmount = inventoryService.calculateTotalPrice(inventoryList, bookingRequest.getRoomsCount());

        LocalDateTime now = LocalDateTime.now();

        Booking booking = Booking.builder()
                .bookingStatus(BookingStatus.RESERVED)
                .hotel(hotel)
                .room(room)
                .checkInDate(bookingRequest.getCheckInDate())
                .checkOutDate(bookingRequest.getCheckOutDate())
                .user(getCurrentUser())
                .roomsCount(bookingRequest.getRoomsCount())
                .amount(totalAmount)
                .expiresAt(now.plusMinutes(10))
                .build();

        booking = bookingRepository.save(booking);
        return mapToBookingDto(booking);
    }

    @Override
    @Transactional
    public BookingDto addGuests(Long bookingId, List<GuestDto> guestDtoList) {

        log.info("Adding guests for booking with id: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new ResourceNotFoundException("Booking not found with id: "+bookingId));
        User user = getCurrentUser();

        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        if (hasBookingExpired(booking)) {
            throw new IllegalStateException("Booking has already expired");
        }

        if(booking.getBookingStatus() != BookingStatus.RESERVED) {
            throw new IllegalStateException("Booking is not under reserved state, cannot add guests");
        }

        for (GuestDto guestDto: guestDtoList) {
            Guest guest = modelMapper.map(guestDto, Guest.class);
            guest.setUser(user);
            guest = guestRepository.save(guest);
            booking.getGuests().add(guest);
        }

        booking.setBookingStatus(BookingStatus.GUESTS_ADDED);
        booking = bookingRepository.save(booking);
        return mapToBookingDto(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long bookingId) {
        log.info("Fetching booking with id: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new ResourceNotFoundException("Booking not found with id: "+bookingId));

        User user = getCurrentUser();
        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        return mapToBookingDto(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User user = getCurrentUser();
        log.info("Fetching bookings for user with id: {}", user.getId());

        List<Booking> bookings = bookingRepository.findByUser(user);

        return bookings.stream()
                .map(this::mapToBookingDto)
                .toList();
    }

    @Override
    @Transactional
    public BookingDto forceConfirmBooking(Long bookingId) {
        log.warn("DEV ONLY: force-confirming booking with id: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new ResourceNotFoundException("Booking not found with id: "+bookingId));

        if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
            return mapToBookingDto(booking);
        }

        booking.setBookingStatus(BookingStatus.CONFIRMED);

        List<Inventory> inventoryList = inventoryRepository.findByRoomAndDateBetween(
                booking.getRoom(), booking.getCheckInDate(), booking.getCheckOutDate());

        for (Inventory inventory : inventoryList) {
            inventory.setReservedCount(inventory.getReservedCount() - booking.getRoomsCount());
            inventory.setBookedCount(inventory.getBookedCount() + booking.getRoomsCount());
        }
        inventoryRepository.saveAll(inventoryList);

        Payment payment = Payment.builder()
                .transactionId("DEV_FORCE_" + System.currentTimeMillis())
                .paymentStatus(PaymentStatus.CONFIRMED)
                .amount(booking.getAmount())
                .booking(booking)
                .build();
        booking.setPayment(payment);

        booking = bookingRepository.save(booking);
        return mapToBookingDto(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        log.info("Cancelling booking with id: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new ResourceNotFoundException("Booking not found with id: "+bookingId));

        User user = getCurrentUser();
        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        BookingStatus status = booking.getBookingStatus();
        if (status == BookingStatus.CANCELLED || status == BookingStatus.EXPIRED) {
            throw new IllegalStateException("Booking is already cancelled or expired");
        }

        List<Inventory> inventoryList = inventoryRepository.findByRoomAndDateBetween(
                booking.getRoom(), booking.getCheckInDate(), booking.getCheckOutDate());

        for (Inventory inventory : inventoryList) {
            if (status == BookingStatus.CONFIRMED) {
                inventory.setBookedCount(inventory.getBookedCount() - booking.getRoomsCount());
            } else {
                inventory.setReservedCount(inventory.getReservedCount() - booking.getRoomsCount());
            }
        }
        inventoryRepository.saveAll(inventoryList);

        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingDto mapToBookingDto(Booking booking) {
        BookingDto dto = modelMapper.map(booking, BookingDto.class);

        if (booking.getExpiresAt() != null) {
            long seconds = Duration.between(LocalDateTime.now(), booking.getExpiresAt()).getSeconds();
            dto.setSecondsUntilExpiry(Math.max(seconds, 0));
        }

        dto.setHotelName(booking.getHotel().getName());
        dto.setHotelCity(booking.getHotel().getCity());
        dto.setRoomType(booking.getRoom().getType());

        return dto;
    }

    public boolean hasBookingExpired(Booking booking) {
        return booking.getCreatedAt().plusMinutes(10).isBefore(LocalDateTime.now());
    }

    public User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Override
    public List<BookingDto> getAllBookingsByHotelId(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() ->
                new ResourceNotFoundException("Hotel not found with ID: "+hotelId));
        User user = getCurrentUser();

        log.info("Getting all bookings for the hotel with ID: {}", hotelId);

        if (!user.equals(hotel.getOwner())) {
            throw new UnAuthorisedException("This user does not own this hotel with id: "+hotelId);
        }

        List<Booking> bookings = bookingRepository.findByHotel(hotel);

        return bookings.stream()
                .map((element) -> modelMapper.map(element, BookingDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() ->
                new ResourceNotFoundException("Hotel not found with ID: "+hotelId));
        User user = getCurrentUser();

        log.info("Generating report for hotel with ID: {}", hotelId);

        if (!user.equals(hotel.getOwner())) {
            throw new UnAuthorisedException("This user does not own this hotel with id: "+hotelId);
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Booking> bookings = bookingRepository.findByHotelAndCreatedAtBetween(hotel, startDateTime, endDateTime);

        Long totalConfirmedBookings = bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .count();

        BigDecimal totalRevenue = bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgRevenue = totalConfirmedBookings == 0 ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(totalConfirmedBookings), RoundingMode.HALF_UP);

        return new HotelReportDto(totalConfirmedBookings, totalRevenue, avgRevenue);
    }
}