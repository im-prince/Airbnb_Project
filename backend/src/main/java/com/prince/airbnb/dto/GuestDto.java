package com.prince.airbnb.dto;



import com.prince.airbnb.entity.User;
import com.prince.airbnb.entity.enums.Gender;
import lombok.Data;

@Data
public class GuestDto {
    private Long id;
    private User user;
    private String name;
    private Gender gender;
    private Integer age;
}
