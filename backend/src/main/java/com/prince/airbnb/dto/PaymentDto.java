package com.prince.airbnb.dto;

import com.prince.airbnb.entity.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentDto {

    private Long id;
    private String transactionId;
    private PaymentStatus paymentStatus;
    private BigDecimal amount;
}