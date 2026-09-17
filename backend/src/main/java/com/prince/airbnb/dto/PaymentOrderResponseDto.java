package com.prince.airbnb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentOrderResponseDto {

    private String orderId;
    private String razorpayKeyId;
    private Long amount;
    private String currency;
}