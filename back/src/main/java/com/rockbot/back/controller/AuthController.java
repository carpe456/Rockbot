package com.rockbot.back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rockbot.back.dto.request.auth.CheckCertificationRequestDto;
import com.rockbot.back.dto.request.auth.EmailCertificationRequestDto;
import com.rockbot.back.dto.request.auth.IdCheckRequestDto;
import com.rockbot.back.dto.request.auth.SignInRequestDto;
import com.rockbot.back.dto.request.auth.SignUpRequestDto;
import com.rockbot.back.dto.response.auth.CheckCertificationResponseDto;
import com.rockbot.back.dto.response.auth.EmailCertificationResponseDto;
import com.rockbot.back.dto.response.auth.IdCheckResponseDto;
import com.rockbot.back.dto.response.auth.SignInResponseDto;
import com.rockbot.back.dto.response.auth.SignUpResponseDto;
import com.rockbot.back.entity.UserEntity;
import com.rockbot.back.repository.UserRepository;
import com.rockbot.back.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/id-check")
    public ResponseEntity<? super IdCheckResponseDto> idCheck(
            @RequestBody @Valid IdCheckRequestDto requestBody) {
        ResponseEntity<? super IdCheckResponseDto> response = authService.idCheck(requestBody);
        return response;
    }

    @PostMapping("/email-certification")
    public ResponseEntity<? super EmailCertificationResponseDto> emailCertification(
            @RequestBody @Valid EmailCertificationRequestDto requestBody) {
        ResponseEntity<? super EmailCertificationResponseDto> response = authService.emailCertification(requestBody);
        return response;
    }

    @PostMapping("/check-certification")
    public ResponseEntity<? super CheckCertificationResponseDto> checkCertification(
            @RequestBody @Valid CheckCertificationRequestDto requestBody) {
        ResponseEntity<? super CheckCertificationResponseDto> response = authService.checkCertification(requestBody);
        return response;
    }

    @PostMapping("/sign-up")
    public ResponseEntity<? super SignUpResponseDto> signUp(
            @RequestBody @Valid SignUpRequestDto requestBody) {
        ResponseEntity<? super SignUpResponseDto> response = authService.signUp(requestBody);
        return response;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<? super SignInResponseDto> signIn(
            @RequestBody @Valid SignInRequestDto requestBody) {
        ResponseEntity<? super SignInResponseDto> response = authService.signIn(requestBody);
        return response;
    }

    // 가입회원 정보 띄우기
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

        return ResponseEntity.ok("부서가 업데이트되었습니다.");
    }
}
