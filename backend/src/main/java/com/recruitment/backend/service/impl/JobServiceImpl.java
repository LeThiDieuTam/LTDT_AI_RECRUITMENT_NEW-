package com.recruitment.backend.service.impl;

import com.recruitment.backend.dto.request.JobRequest;
import com.recruitment.backend.dto.response.JobResponse;
import com.recruitment.backend.entity.Company;
import com.recruitment.backend.entity.Job;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.exception.CompanyNotFoundException;
import com.recruitment.backend.exception.JobNotFoundException;
import com.recruitment.backend.exception.UserNotFoundException;
import com.recruitment.backend.repository.CompanyRepository;
import com.recruitment.backend.repository.JobRepository;
import com.recruitment.backend.repository.JobSpecification;
import com.recruitment.backend.repository.UserRepository;
import com.recruitment.backend.service.JobService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Override
    public JobResponse createJob(String hrEmail, JobRequest jobRequest) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        Long targetCompanyId = jobRequest.getCompanyId() != null ? jobRequest.getCompanyId() : hrCompany.getId();
        if (!hrCompany.getId().equals(targetCompanyId)) {
            throw new IllegalArgumentException(
                    "Job must be created for the HR's associated company."
            );
        }

        // Kiểm tra company tồn tại
        Company company = companyRepository.findById(targetCompanyId)
                .orElseThrow(() ->
                        new CompanyNotFoundException(
                                "Company not found with ID: " + targetCompanyId
                        )
                );

        Job job = Job.builder()
                .title(jobRequest.getTitle())
                .description(jobRequest.getDescription())
                .company(company)
                .location(jobRequest.getLocation())
                .salary(jobRequest.getSalary())
                .experience(jobRequest.getExperience())
                .employmentType(
                        jobRequest.getEmploymentType() != null
                                ? Job.EmploymentType.valueOf(jobRequest.getEmploymentType().toUpperCase())
                                : null
                )
                .jobType(
                        jobRequest.getJobType() != null
                                ? Job.JobType.valueOf(jobRequest.getJobType().toUpperCase())
                                : null
                )
                .jobLevel(jobRequest.getJobLevel()) // Đảm bảo JobRequest có getter cho jobLevel
                .status(
                        jobRequest.getStatus() != null
                                ? jobRequest.getStatus()
                                : Job.JobStatus.OPEN
                )
                .build();

        Job savedJob = jobRepository.save(job);

        return mapJobToJobResponse(savedJob);
    }

    @Override
    public JobResponse updateJob(
            String hrEmail,
            Long id,
            JobRequest request
    ) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobNotFoundException(
                                "Job not found with ID: " + id
                        )
                );

        // Kiểm tra job có thuộc công ty của HR hay không
        if (!existingJob.getCompany().getId().equals(hrCompany.getId())) {
            throw new SecurityException(
                    "HR does not have permission to update this job."
            );
        }

        // HR chỉ được cập nhật tin của công ty mình. Không nhận companyId từ form edit
        // để tránh null và không cho phép chuyển tin sang công ty khác.
        existingJob.setTitle(request.getTitle());
        existingJob.setDescription(request.getDescription());
        existingJob.setLocation(request.getLocation());
        existingJob.setSalary(request.getSalary());
        existingJob.setExperience(request.getExperience());
        existingJob.setEmploymentType(
                request.getEmploymentType() != null
                        ? Job.EmploymentType.valueOf(request.getEmploymentType().toUpperCase())
                        : null
        );
        existingJob.setJobType(
                request.getJobType() != null
                        ? Job.JobType.valueOf(request.getJobType().toUpperCase())
                        : null
        );
        existingJob.setJobLevel(request.getJobLevel());

        if (request.getStatus() != null) {
            existingJob.setStatus(request.getStatus());
        }

        Job updatedJob = jobRepository.save(existingJob);

        return mapJobToJobResponse(updatedJob);
    }

    @Override
    public JobResponse updateJobStatus(Long id, String status) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobNotFoundException(
                                "Job not found with ID: " + id
                        )
                );

        try {
            existingJob.setStatus(
                    Job.JobStatus.valueOf(status.toUpperCase())
            );
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid job status: " + status
            );
        }

        Job updatedJob = jobRepository.save(existingJob);

        return mapJobToJobResponse(updatedJob);
    }

    @Override
    public void deleteJob(String hrEmail, Long id) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobNotFoundException(
                                "Job not found with ID: " + id
                        )
                );

        // Kiểm tra quyền của HR
        if (!existingJob.getCompany().getId().equals(hrCompany.getId())) {
            throw new SecurityException(
                    "HR does not have permission to delete this job."
            );
        }

        jobRepository.delete(existingJob);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(String hrEmail, Long id) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobNotFoundException(
                                "Job not found with ID: " + id
                        )
                );

        // Kiểm tra HR có quyền truy cập job này không
        if (!job.getCompany().getId().equals(hrCompany.getId())) {
            throw new SecurityException(
                    "HR does not have access to this job."
            );
        }

        return mapJobToJobResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getAllJobs(Pageable pageable) {

        return jobRepository.findAll(pageable)
                .map(this::mapJobToJobResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getOpenJobs(Pageable pageable) {
        return jobRepository.findByStatus(Job.JobStatus.OPEN, pageable)
                .map(this::mapJobToJobResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(
            String keyword,
            String location,
            Pageable pageable
    ) {

        Specification<Job> spec = Specification
                .where(new JobSpecification(keyword, location))
                .and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), Job.JobStatus.OPEN));

        return jobRepository.findAll(spec, pageable)
                .map(this::mapJobToJobResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getPublicJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .filter(item -> item.getStatus() == Job.JobStatus.OPEN)
                .orElseThrow(() -> new JobNotFoundException("Job not found or no longer open: " + jobId));
        return mapJobToJobResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByHrCompany(String hrEmail) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        return jobRepository.findByCompany(hrCompany)
                .stream()
                .map(this::mapJobToJobResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobByIdForHrCompany(
            String hrEmail,
            Long jobId
    ) {

        Company hrCompany = getCompanyOfHr(hrEmail);

        Job job = jobRepository.findByIdAndCompany(
                        jobId,
                        hrCompany
                )
                .orElseThrow(() ->
                        new JobNotFoundException(
                                "Job not found or not associated with HR's company: "
                                        + jobId
                        )
                );

        return mapJobToJobResponse(job);
    }

    /**
     * Lấy Company của HR dựa vào email.
     */
    @Override
    public Company getCompanyOfHr(String hrEmail) {

        User hrUser = userRepository.findByEmailWithCompany(hrEmail)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "HR user not found with email: " + hrEmail
                        )
                );

        if (hrUser.getCompany() == null) {
            throw new CompanyNotFoundException(
                    "HR user is not associated with any company."
            );
        }

        return hrUser.getCompany();
    }

    /**
     * Chuyển Job Entity thành JobResponse DTO.
     */
    private JobResponse mapJobToJobResponse(Job job) {

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLogo(job.getCompany().getLogo())
                .location(job.getLocation())
                .salary(job.getSalary())
                .experience(job.getExperience())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .jobType(job.getJobType() != null ? job.getJobType().name() : null)
                .jobLevel(job.getJobLevel())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .build();
    }
}