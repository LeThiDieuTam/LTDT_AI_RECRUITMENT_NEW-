package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.JobRequest;
import com.recruitment.backend.dto.response.JobResponse;
import com.recruitment.backend.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {
    JobResponse createJob(String hrEmail, JobRequest jobRequest);
    JobResponse updateJob(String hrEmail, Long id, JobRequest request);
    JobResponse updateJobStatus(Long id, String status);
    void deleteJob(String hrEmail, Long id);
    JobResponse getJobById(String hrEmail, Long id);
    Page<JobResponse> getAllJobs(Pageable pageable);
    Page<JobResponse> getOpenJobs(Pageable pageable);
    Page<JobResponse> searchJobs(String keyword, String location, Pageable pageable);
    List<JobResponse> getJobsByHrCompany(String hrEmail);
    JobResponse getJobByIdForHrCompany(String hrEmail, Long jobId);
    JobResponse getPublicJobById(Long jobId);
    Company getCompanyOfHr(String hrEmail);
}