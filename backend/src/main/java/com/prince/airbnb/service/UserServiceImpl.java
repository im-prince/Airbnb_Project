package com.prince.airbnb.service;


import com.prince.airbnb.dto.ProfileUpdateRequestDto;
import com.prince.airbnb.dto.UserDto;
import com.prince.airbnb.entity.User;
import com.prince.airbnb.exception.ResourceNotFoundException;
import com.prince.airbnb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.prince.airbnb.dto.ProfileUpdateRequestDto;
import com.prince.airbnb.dto.UserDto;
import com.prince.airbnb.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: "+id));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username).orElse(null);
    }

    @Override
    public void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (profileUpdateRequestDto.getName() != null) user.setName(profileUpdateRequestDto.getName());
        if (profileUpdateRequestDto.getDateOfBirth() != null) user.setDateOfBirth(profileUpdateRequestDto.getDateOfBirth());
        if (profileUpdateRequestDto.getGender() != null) user.setGender(profileUpdateRequestDto.getGender());

        userRepository.save(user);
    }

    @Override
    public UserDto getMyProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("Getting the profile for user with id: {}", user.getId());
        return modelMapper.map(user, UserDto.class);
    }
}
