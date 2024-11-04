package com.rockbot.back.repository;

import com.rockbot.back.entity.TravelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelRequestRepository extends JpaRepository<TravelEntity, Long> {
}
