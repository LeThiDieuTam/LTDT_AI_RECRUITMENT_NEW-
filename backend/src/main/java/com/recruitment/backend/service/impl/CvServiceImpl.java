package com.recruitment.backend.service.impl;

import com.recruitment.backend.dto.request.CvRequest;
import com.recruitment.backend.dto.response.CvResponse;
import com.recruitment.backend.dto.response.CvTemplateResponse;
import com.recruitment.backend.entity.Cv;
import com.recruitment.backend.entity.User;
import com.recruitment.backend.exception.ResourceNotFoundException;
import com.recruitment.backend.repository.CvRepository;
import com.recruitment.backend.repository.UserRepository;
import com.recruitment.backend.service.CvService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CvServiceImpl implements CvService {

    private final CvRepository cvRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CvResponse> getMyCvs(String candidateEmail) {
        return cvRepository.findByCandidate_EmailOrderByUpdatedAtDesc(candidateEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CvResponse getCvById(Long id, String userEmail) {
        Cv cv = cvRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV với ID: " + id));

        // Nếu là candidate, kiểm tra quyền sở hữu
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        // Candidate chỉ được xem CV của mình, HR/Admin có thể xem CV
        if (user.getRole() != null && user.getRole().name().equals("CANDIDATE")) {
            if (!cv.getCandidate().getId().equals(user.getId())) {
                throw new SecurityException("Bạn không có quyền truy cập CV này.");
            }
        }

        return mapToResponse(cv);
    }

    @Override
    @Transactional
    public CvResponse createCv(String candidateEmail, CvRequest request) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Candidate not found: " + candidateEmail));

        long count = cvRepository.countByCandidate(candidate);
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || count == 0;

        if (shouldBeDefault) {
            cvRepository.resetDefaultCvForCandidate(candidate);
        }

        Cv cv = Cv.builder()
                .candidate(candidate)
                .title(request.getTitle())
                .fullName(request.getFullName())
                .email(request.getEmail() != null ? request.getEmail() : candidate.getEmail())
                .phone(request.getPhone() != null ? request.getPhone() : candidate.getPhone())
                .address(request.getAddress() != null ? request.getAddress() : candidate.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .targetTitle(request.getTargetTitle())
                .summary(request.getSummary())
                .skills(request.getSkills() != null ? request.getSkills() : candidate.getSkills())
                .experience(request.getExperience() != null ? request.getExperience() : candidate.getExperience())
                .education(request.getEducation() != null ? request.getEducation() : candidate.getEducation())
                .certificates(request.getCertificates())
                .resumeUrl(request.getResumeUrl() != null ? request.getResumeUrl() : "modern")
                .isDefault(shouldBeDefault)
                .build();

        Cv saved = cvRepository.save(cv);
        return mapToResponse(saved);
    }
    @Override
    @Transactional
    public CvResponse updateCv(Long id, String candidateEmail, CvRequest request) {
        Cv cv = cvRepository.findByIdAndCandidate_Email(id, candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV hoặc bạn không có quyền sửa CV này: " + id));

        User candidate = cv.getCandidate();

        if (Boolean.TRUE.equals(request.getIsDefault()) && !cv.isDefault()) {
            cvRepository.resetDefaultCvForCandidate(candidate);
            cv.setDefault(true);
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && cv.isDefault()) {
            cv.setDefault(false);
        }

        cv.setTitle(request.getTitle());
        cv.setFullName(request.getFullName());
        cv.setEmail(request.getEmail());
        cv.setPhone(request.getPhone());
        cv.setAddress(request.getAddress());
        cv.setAvatarUrl(request.getAvatarUrl());
        cv.setTargetTitle(request.getTargetTitle());
        cv.setSummary(request.getSummary());
        cv.setSkills(request.getSkills());
        cv.setExperience(request.getExperience());
        cv.setEducation(request.getEducation());
        cv.setCertificates(request.getCertificates());
        if (request.getResumeUrl() != null) {
            cv.setResumeUrl(request.getResumeUrl());
        }

        Cv updated = cvRepository.save(cv);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCv(Long id, String candidateEmail) {
        Cv cv = cvRepository.findByIdAndCandidate_Email(id, candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV hoặc bạn không có quyền xóa: " + id));

        boolean wasDefault = cv.isDefault();
        User candidate = cv.getCandidate();

        cvRepository.delete(cv);

        if (wasDefault) {
            List<Cv> remaining = cvRepository.findByCandidateOrderByUpdatedAtDesc(candidate);
            if (!remaining.isEmpty()) {
                Cv newDefault = remaining.get(0);
                newDefault.setDefault(true);
                cvRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public CvResponse setDefaultCv(Long id, String candidateEmail) {
        Cv cv = cvRepository.findByIdAndCandidate_Email(id, candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV: " + id));

        cvRepository.resetDefaultCvForCandidate(cv.getCandidate());
        cv.setDefault(true);
        Cv saved = cvRepository.save(cv);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CvResponse getCvForHr(Long cvId, String hrEmail) {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin CV với ID: " + cvId));
        return mapToResponse(cv);
    }
    @Override
    public List<CvTemplateResponse> getSampleCvTemplates() {
        List<CvTemplateResponse> list = new ArrayList<>();

        list.add(CvTemplateResponse.builder()
                .templateId("modern")
                .templateName("Mẫu Hiện Đại (Modern Blue)")
                .category("Công nghệ thông tin & Phát triển phần mềm")
                .description("Thiết kế 2 cột hiện đại, cấu trúc rõ ràng làm nổi bật kinh nghiệm và kỹ năng kỹ thuật.")
                .previewColor("#2563eb")
                .sampleTitle("CV Kỹ Sư Phần Mềm Fullstack")
                .sampleFullName("Nguyễn Văn An")
                .sampleEmail("an.nguyen@example.com")
                .samplePhone("0912 345 678")
                .sampleAddress("Cầu Giấy, Hà Nội")
                .sampleAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80")
                .sampleTargetTitle("Fullstack Developer (React & Spring Boot)")
                .sampleSummary("Kỹ sư phần mềm với hơn 3 năm kinh nghiệm phát triển các ứng dụng web quy mô lớn, thành thạo React, TypeScript, Spring Boot, MySQL và kiến trúc Microservices. Đam mê tối ưu hóa hiệu năng hệ thống và trải nghiệm người dùng.")
                .sampleSkills("Java, Spring Boot, React, TypeScript, MySQL, Docker, RESTful API, Redis, Git, CI/CD, AWS")
                .sampleExperience("• 2022 - Hiện tại: Senior Software Engineer tại TechNova Solutions\n- Thiết kế kiến trúc và phát triển hệ thống quản lý tuyển dụng xử lý hơn 50.000 ứng viên.\n- Tối ưu hóa truy vấn cơ sở dữ liệu giúp giảm thời gian phản hồi API xuống 40%.\n\n• 2020 - 2022: Java Developer tại VinaSoft Corp\n- Xây dựng các dịch vụ backend với Spring Boot và Spring Security.\n- Phối hợp chặt chẽ với đội ngũ Frontend để tích hợp RESTful API.")
                .sampleEducation("• 2016 - 2020: Cử nhân Công nghệ Thông tin - Đại học Bách Khoa Hà Nội (GPA: 3.6/4.0 - Loại Giỏi)")
                .sampleCertificates("• AWS Certified Solutions Architect - Associate (2023)\n• Oracle Certified Professional: Java SE 11 Developer (2021)\n• IELTS 7.0 (2022)")
                .build());

        list.add(CvTemplateResponse.builder()
                .templateId("classic")
                .templateName("Mẫu Cổ Điển & Trang Nhã (Classic Emerald)")
                .category("Kinh doanh, Tài chính & Quản lý")
                .description("Phong cách trang trọng, bố cục chuẩn mực phù hợp cho khối ngành kinh doanh, tài chính.")
                .previewColor("#059669")
                .sampleTitle("CV Chuyên Viên Phát Triển Kinh Doanh")
                .sampleFullName("Trần Thị Minh Tâm")
                .sampleEmail("tam.tran@example.com")
                .samplePhone("0988 123 456")
                .sampleAddress("Quận 1, TP. Hồ Chí Minh")
                .sampleAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80")
                .sampleTargetTitle("Business Development Manager")
                .sampleSummary("Chuyên viên phát triển kinh doanh giàu nhiệt huyết với 4 năm kinh nghiệm trong việc tìm kiếm khách hàng B2B, đàm phán hợp đồng và mở rộng thị trường. Từng đạt 140% chỉ tiêu doanh số năm 2023.")
                .sampleSkills("B2B Sales, Quản lý CRM, Đàm phán thương mại, Nghiên cứu thị trường, Kỹ năng thuyết trình, Lãnh đạo đội ngũ")
                .sampleExperience("• 2022 - Nay: Business Development Lead tại Global Trade Group\n- Quản lý danh mục 30+ khách hàng doanh nghiệp lớn và gia tăng doanh thu 35% qua 2 năm.\n- Đào tạo và dẫn dắt đội ngũ 6 chuyên viên kinh doanh.\n\n• 2020 - 2022: Sales Executive tại SmartCorp\n- Tìm kiếm và ký kết hợp đồng mới với hơn 50 đối tác chiến lược.")
                .sampleEducation("• 2016 - 2020: Cử nhân Quản trị Kinh doanh - Đại học Ngoại Thương (Loại Giỏi)")
                .sampleCertificates("• Certified Professional Sales Leader (CPSL)\n• TOEIC 850 (2023)")
                .build());

        list.add(CvTemplateResponse.builder()
                .templateId("creative")
                .templateName("Mẫu Sáng Tạo & Đột Phá (Creative Violet)")
                .category("Thiết kế UI/UX & Sáng tạo nội dung")
                .description("Điểm nhấn thị giác ấn tượng với tông màu tím sáng tạo dành cho các vị trí thiết kế và nghệ thuật.")
                .previewColor("#7c3aed")
                .sampleTitle("CV UI/UX Designer & Product Designer")
                .sampleFullName("Lê Hoàng Khang")
                .sampleEmail("khang.le@example.com")
                .samplePhone("0903 555 789")
                .sampleAddress("Thanh Xuân, Hà Nội")
                .sampleAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80")
                .sampleTargetTitle("Senior UI/UX Designer")
                .sampleSummary("UI/UX Designer với tư duy thiết kế tập trung vào người dùng và kinh nghiệm tạo ra các sản phẩm web/mobile hấp dẫn, trực quan. Thành thạo Figma, Design System, Prototyping và User Research.")
                .sampleSkills("Figma, Adobe XD, Design Systems, Wireframing, Prototyping, User Research, Usability Testing, HTML/CSS")
                .sampleExperience("• 2022 - Hiện tại: Product Designer tại Innovate Studio\n- Thiết kế lại toàn bộ trải nghiệm ứng dụng E-commerce giúp tăng tỷ lệ chuyển đổi 22%.\n- Xây dựng và duy trì hệ thống Design System phục vụ cho hơn 15 dự án.\n\n• 2020 - 2022: UI Designer tại CreativeLab\n- Tạo mẫu giao diện website và ứng dụng di động cho hơn 20 khách hàng quốc tế.")
                .sampleEducation("• 2016 - 2020: Cử nhân Thiết kế Đồ họa - Đại học Mỹ thuật Công nghiệp")
                .sampleCertificates("• Google UX Design Professional Certificate\n• Interaction Design Foundation (IxDF) Certified")
                .build());

        list.add(CvTemplateResponse.builder()
                .templateId("tech")
                .templateName("Mẫu Công Nghệ Cao Cấp (Tech Pro Dark)")
                .category("DevOps, Cloud & System Architecture")
                .description("Bố cục tối giản, sắc sảo dành riêng cho các kỹ sư DevOps, Cloud và kiến trúc sư giải pháp.")
                .previewColor("#0f172a")
                .sampleTitle("CV DevOps & Cloud Specialist")
                .sampleFullName("Phạm Quốc Bảo")
                .sampleEmail("bao.pham@example.com")
                .samplePhone("0977 888 999")
                .sampleAddress("Quận 7, TP. Hồ Chí Minh")
                .sampleAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80")
                .sampleTargetTitle("DevOps / SRE Engineer")
                .sampleSummary("Kỹ sư DevOps đam mê tự động hóa, CI/CD, Containerization và kiến trúc hạ tầng Cloud trên AWS/GCP. Có kinh nghiệm triển khai Kubernetes clusters cho các hệ thống có lưu lượng truy cập lớn.")
                .sampleSkills("Kubernetes, Docker, Terraform, AWS, Jenkins, GitLab CI, Prometheus, Grafana, Linux, Bash/Python")
                .sampleExperience("• 2022 - Hiện tại: DevOps Engineer tại CloudScale Tech\n- Xây dựng đường ống CI/CD tự động hóa 100% quy trình triển khai cho 20+ microservices.\n- Giảm thiểu thời gian downtime xuống 99.99% và tối ưu chi phí hạ tầng AWS 25%.\n\n• 2021 - 2022: System Administrator tại DataNet\n- Quản trị cụm máy chủ Linux và giám sát an toàn hệ thống.")
                .sampleEducation("• 2017 - 2021: Cử nhân Mạng máy tính & An toàn thông tin - Đại học Công nghệ Thông tin")
                .sampleCertificates("• Certified Kubernetes Administrator (CKA)\n• AWS Certified DevOps Engineer - Professional")
                .build());

        list.add(CvTemplateResponse.builder()
                .templateId("minimalist")
                .templateName("Mẫu Tối Giản Tinh Tế (Minimalist Clean)")
                .category("Marketing & Digital Growth")
                .description("Đường nét thanh lịch, tập trung vào số liệu thực tế và thành quả đạt được.")
                .previewColor("#0284c7")
                .sampleTitle("CV Digital Marketing Specialist")
                .sampleFullName("Vũ Mai Phương")
                .sampleEmail("phuong.vu@example.com")
                .samplePhone("0934 777 666")
                .sampleAddress("Đống Đa, Hà Nội")
                .sampleAvatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80")
                .sampleTargetTitle("Digital Marketing Specialist")
                .sampleSummary("Chuyên gia Digital Marketing với 3+ năm kinh nghiệm quản lý các chiến dịch Performance Marketing (Facebook Ads, Google Ads, SEO), phân tích dữ liệu và tối ưu chuyển đổi chiến dịch.")
                .sampleSkills("Facebook Ads, Google Ads, SEO/SEM, Google Analytics 4, Content Strategy, Email Marketing, Data Analysis")
                .sampleExperience("• 2022 - Nay: Digital Marketing Lead tại BrandGrow\n- Quản lý ngân sách quảng cáo hơn 500 triệu/tháng với ROAS trung bình đạt 4.5x.\n- Tối ưu SEO đưa hơn 50 từ khóa chiến lược lên Top 3 Google Search.\n\n• 2021 - 2022: Content & Ads Specialist tại EcomAgency\n- Lên chiến lược nội dung và chạy quảng cáo thu hút hơn 100.000 lượt khách hàng tiềm năng.")
                .sampleEducation("• 2017 - 2021: Cử nhân Marketing - Đại học Kinh tế Quốc dân")
                .sampleCertificates("• Google Ads Search & Display Certified\n• Meta Certified Digital Marketing Associate\n• HubSpot Inbound Marketing")
                .build());

        return list;
    }

    private CvResponse mapToResponse(Cv cv) {
        if (cv == null) return null;
        return CvResponse.builder()
                .id(cv.getId())
                .candidateId(cv.getCandidate() != null ? cv.getCandidate().getId() : null)
                .candidateName(cv.getCandidate() != null ? cv.getCandidate().getFullName() : null)
                .title(cv.getTitle())
                .fullName(cv.getFullName())
                .email(cv.getEmail())
                .phone(cv.getPhone())
                .address(cv.getAddress())
                .avatarUrl(cv.getAvatarUrl())
                .targetTitle(cv.getTargetTitle())
                .summary(cv.getSummary())
                .skills(cv.getSkills())
                .experience(cv.getExperience())
                .education(cv.getEducation())
                .certificates(cv.getCertificates())
                .resumeUrl(cv.getResumeUrl())
                .isDefault(cv.isDefault())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
}
