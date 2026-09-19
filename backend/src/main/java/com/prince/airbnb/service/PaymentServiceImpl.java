package com.prince.airbnb.service;

import com.prince.airbnb.dto.PaymentOrderResponseDto;
import com.prince.airbnb.entity.Booking;
import com.prince.airbnb.entity.Inventory;
import com.prince.airbnb.entity.Payment;
import com.prince.airbnb.entity.User;
import com.prince.airbnb.entity.enums.BookingStatus;
import com.prince.airbnb.entity.enums.PaymentStatus;
import com.prince.airbnb.exception.ResourceNotFoundException;
import com.prince.airbnb.exception.UnAuthorisedException;
import com.prince.airbnb.repository.BookingRepository;
import com.prince.airbnb.repository.InventoryRepository;
import com.prince.airbnb.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public PaymentOrderResponseDto createPaymentOrder(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: " + user.getId());
        }

        if (booking.getBookingStatus() != BookingStatus.GUESTS_ADDED
                && booking.getBookingStatus() != BookingStatus.PAYMENTS_PENDING) {
            throw new IllegalStateException("Guests must be added before payment can be initiated");
        }

        long amountInPaise = booking.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + booking.getId());

            Order order = razorpayClient.orders.create(orderRequest);

            booking.setPaymentSessionId(order.get("id"));
            booking.setBookingStatus(BookingStatus.PAYMENTS_PENDING);

            log.info("Created Razorpay order {} for booking {}", order.get("id"), bookingId);

            return new PaymentOrderResponseDto(
                    order.get("id"),
                    razorpayKeyId,
                    amountInPaise,
                    "INR"
            );

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for booking {}", bookingId, e);
            throw new RuntimeException("Unable to initiate payment. Please try again.");
        }
    }

    @Override
    @Transactional
    public void handleWebhookEvent(String payload, String signature) {

        boolean isValidSignature;
        try {
            isValidSignature = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        } catch (RazorpayException e) {
            log.error("Webhook signature verification failed", e);
            throw new RuntimeException("Invalid webhook signature");
        }

        if (!isValidSignature) {
            log.warn("Received webhook with invalid signature");
            throw new RuntimeException("Invalid webhook signature");
        }

        JSONObject payloadJson = new JSONObject(payload);
        String event = payloadJson.getString("event");

        log.info("Received Razorpay webhook event: {}", event);

        if (!"payment.captured".equals(event)) {
            log.info("Ignoring unhandled event type: {}", event);
            return;
        }

        JSONObject paymentEntity = payloadJson
                .getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String razorpayOrderId = paymentEntity.getString("order_id");
        String razorpayPaymentId = paymentEntity.getString("id");
        long amountInPaise = paymentEntity.getLong("amount");

        Booking booking = bookingRepository.findByPaymentSessionId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with payment session id: " + razorpayOrderId));

        if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
            log.info("Booking {} already confirmed, ignoring duplicate webhook", booking.getId());
            return;
        }

        Payment payment = Payment.builder()
                .transactionId(razorpayPaymentId)
                .paymentStatus(PaymentStatus.CONFIRMED)
                .amount(BigDecimal.valueOf(amountInPaise).divide(BigDecimal.valueOf(100)))
                .booking(booking)
                .build();

        paymentRepository.save(payment);

        booking.setBookingStatus(BookingStatus.CONFIRMED);

        List<Inventory> inventoryList = inventoryRepository.findByRoomAndDateBetween(
                booking.getRoom(), booking.getCheckInDate(), booking.getCheckOutDate());

        for (Inventory inventory : inventoryList) {
            inventory.setReservedCount(inventory.getReservedCount() - booking.getRoomsCount());
            inventory.setBookedCount(inventory.getBookedCount() + booking.getRoomsCount());
        }

        inventoryRepository.saveAll(inventoryList);

        log.info("Booking {} confirmed via payment {}", booking.getId(), razorpayPaymentId);
    }
}