package com.prince.airbnb.controller;

import com.prince.airbnb.dto.PaymentOrderResponseDto;
import com.prince.airbnb.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/bookings/{bookingId}/payments")
    public ResponseEntity<PaymentOrderResponseDto> createPaymentOrder(@PathVariable Long bookingId) {
        return new ResponseEntity<>(paymentService.createPaymentOrder(bookingId), HttpStatus.CREATED);
    }

    @PostMapping("/webhook/payment")
    public ResponseEntity<Void> handleWebhookEvent(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        paymentService.handleWebhookEvent(payload, signature);
        return ResponseEntity.ok().build();
    }
}