package com.recruitment.backend.repository;

import com.recruitment.backend.entity.Company;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CompanySpecification implements Specification<Company> {

    private final String keyword;
    private final String city;
    private final String industry;

    public CompanySpecification(String keyword, String city, String industry) {
        this.keyword = keyword;
        this.city = city;
        this.industry = industry;
    }

    @Override
    public Predicate toPredicate(jakarta.persistence.criteria.Root<Company> root, jakarta.persistence.criteria.CriteriaQuery<?> query, jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder) {
        List<Predicate> predicates = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            String likeKeyword = "%" + keyword.toLowerCase() + "%";
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), likeKeyword),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("website")), likeKeyword)
            ));
        }

        if (city != null && !city.trim().isEmpty()) {
            predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.toLowerCase()));
        }

        if (industry != null && !industry.trim().isEmpty()) {
            predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("industry")), industry.toLowerCase()));
        }

        // Bạn không có trường 'active' trong Company entity. Nếu cần, hãy thêm nó vào.
        // predicates.add(criteriaBuilder.isTrue(root.get("active")));

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }
}