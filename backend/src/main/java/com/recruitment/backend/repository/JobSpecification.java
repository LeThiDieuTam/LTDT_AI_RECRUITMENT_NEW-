package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Job;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification implements Specification<Job> {

    private final String keyword;
    private final String location;

    public JobSpecification(String keyword, String location) {
        this.keyword = keyword;
        this.location = location;
    }

    @Override
    public Predicate toPredicate(jakarta.persistence.criteria.Root<Job> root, jakarta.persistence.criteria.CriteriaQuery<?> query, jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        List<Predicate> predicates = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            String likeKeyword = "%" + keyword.toLowerCase() + "%";
            Join<Job, Company> companyJoin = root.join("company");
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("experience")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("employmentType")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(companyJoin.get("name")), likeKeyword)
            ));
        }

        if (location != null && !location.trim().isEmpty()) {
            String likeLocation = "%" + location.toLowerCase() + "%";
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), likeLocation));
        }

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }
}