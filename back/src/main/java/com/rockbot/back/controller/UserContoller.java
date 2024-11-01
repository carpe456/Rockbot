package com.rockbot.back.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rockbot.back.entity.UserEntity;
import com.rockbot.back.repository.UserRepository;

@RestController
@RequestMapping("/api/v1/user")
public class UserContoller {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/aa")
    public String aa() {
        return "aa";
    }
}
