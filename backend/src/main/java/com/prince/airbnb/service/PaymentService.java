package com.prince.airbnb.service;

import com.prince.airbnb.dto.PaymentOrderResponseDto;

public interface PaymentService {

    PaymentOrderResponseDto createPaymentOrder(Long bookingId);

    void handleWebhookEvent(String payload, String signature);
}