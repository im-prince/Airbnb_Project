package com.prince.airbnb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomAvailabilityDto {
    private Long roomId;
    private String type;
    private Integer capacity;
    private String[] photos;
    private BigDecimal basePrice;
    private BigDecimal price;
    private Integer availableCount;
}