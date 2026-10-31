package com.recruitment.backend.service;

import com.recruitment.backend.dto.request.CvRequest;
import com.recruitment.backend.dto.response.CvResponse;
import com.recruitment.backend.dto.response.CvTemplateResponse;

import java.util.List;

public interface CvService {
    List<CvResponse> getMyCvs(String candidateEmail);

    CvResponse getCvById(Long id, String userEmail);

    CvResponse createCv(String candidateEmail, CvRequest request);

    CvResponse updateCv(Long id, String candidateEmail, CvRequest request);

    void deleteCv(Long id, String candidateEmail);

    CvResponse setDefaultCv(Long id, String candidateEmail);

    List<CvTemplateResponse> getSampleCvTemplates();

    CvResponse getCvForHr(Long cvId, String hrEmail);
}
