package com.prince.airbnb.service;


import com.prince.airbnb.dto.ProfileUpdateRequestDto;
import com.prince.airbnb.dto.UserDto;
import com.prince.airbnb.entity.User;

public interface UserService {

    User getUserById(Long id);

    void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto);

    UserDto getMyProfile();

}
