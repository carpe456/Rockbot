package com.rockbot.back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PutMapping("/{userId}/department")
    public ResponseEntity<String> updateDepartment(@PathVariable String userId,
            @RequestBody Map<String, Integer> request) {
        int newDepartmentId = request.get("departmentId");

        // 사용자 ID로 사용자 검색
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // 부서 ID 업데이트
        user.setDepartmentId(newDepartmentId);
        userRepository.save(user);

        return ResponseEntity.ok("부서가 성공적으로 업데이트되었습니다.");
    }

    @GetMapping("/aa")
    public String aa() {
        return "aa";
    }
}
