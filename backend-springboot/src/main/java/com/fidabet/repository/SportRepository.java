package com.fidabet.repository;

import com.fidabet.model.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends JpaRepository<Sport, String> {
    List<Sport> findAllByOrderByDisplayOrderAsc();
}
