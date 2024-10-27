package com.rockbot.back.dto.response.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.rockbot.back.dto.response.ResponseDto;

import lombok.Getter;

@Getter
public class SignInResponseDto extends ResponseDto {

    private String token;
    private int expirationTime;

    private String UserId; // 사용자 아이디
    private String name; // 사용자 이름

    private SignInResponseDto(String token, String UserId, String name) {
        this.token = token;
        this.expirationTime = 3600;
        this.UserId = UserId;
        this.name = name;
    }

    public static ResponseEntity<SignInResponseDto> success(String token, String userId, String name) {
        SignInResponseDto responseBody = new SignInResponseDto(token, userId, name);
        return ResponseEntity.status(HttpStatus.OK).body(responseBody);
    }

    public static ResponseEntity<ResponseDto> signInFail() {
        ResponseDto responseBody = new ResponseDto("SF", "Login information mismatch.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseBody);
    }
}
