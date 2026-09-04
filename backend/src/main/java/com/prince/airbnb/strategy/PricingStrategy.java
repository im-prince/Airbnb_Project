package com.prince.airbnb.strategy;



import com.prince.airbnb.entity.Inventory;

import java.math.BigDecimal;
public interface PricingStrategy {

    BigDecimal calculatePrice(Inventory inventory);
}
