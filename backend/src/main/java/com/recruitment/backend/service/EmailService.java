package com.recruitment.backend.service;

import com.recruitment.backend.entity.Application;
import com.recruitment.backend.entity.Interview;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;

/**
 * Service gửi email cho ứng viên, hiện tại dùng cho:
 * - Thông báo lịch phỏng vấn khi HR lên lịch.
 * - Thông báo khi lịch phỏng vấn được cập nhật / hủy.
 * Gửi async để không chặn request của HR nếu SMTP chậm.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@hirehub.local}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM);

    /**
     * Gửi email mời phỏng vấn tới ứng viên.
     * Được gọi sau khi Interview được lưu thành công.
     */
    @Async
    public void sendInterviewInvitation(Application application, Interview interview, boolean isUpdate) {
        if (application == null || application.getCandidate() == null)
            return;

        String to = application.getCandidate().getEmail();
        String candidateName = application.getCandidate().getFullName();
        String jobTitle = application.getJob() != null ? application.getJob().getTitle() : "vị trí bạn ứng tuyển";
        String companyName = application.getJob() != null && application.getJob().getCompany() != null
                ? application.getJob().getCompany().getName()
                : "Nhà tuyển dụng";

        String subject = (isUpdate ? "[CẬP NHẬT] Thư mời phỏng vấn - " : "Thư mời phỏng vấn - ")
                + jobTitle + " tại " + companyName;

        StringBuilder body = new StringBuilder();
        body.append("<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto;")
                .append("border:1px solid #e2e8f0;border-radius:12px;overflow:hidden\">")
                .append("<div style=\"background:linear-gradient(120deg,#0f172a,#1e293b);color:#fff;padding:24px 32px\">")
                .append("<h2 style=\"margin:0\">HireHub - Hệ thống tuyển dụng thông minh</h2>")
                .append("</div><div style=\"padding:32px\">");

        if (interview.getResult() == Interview.InterviewResult.CANCELLED) {
            body.append("<p>Xin chào <b>").append(escape(candidateName)).append("</b>,</p>")
                    .append("<p>Rất tiếc, buổi phỏng vấn cho vị trí <b>").append(escape(jobTitle))
                    .append("</b> đã bị <b style=\"color:#dc2626\">hủy</b>.</p>")
                    .append("<p>Chúng tôi sẽ liên hệ lại với bạn để sắp xếp thời gian khác. Cảm ơn bạn đã hiểu biết!</p>");
        } else {
            body.append("<p>Xin chào <b>").append(escape(candidateName)).append("</b>,</p>")
                    .append("<p>")
                    .append(isUpdate ? "Lịch phỏng vấn của bạn vừa được cập nhật."
                            : "Chúc mừng bạn đã được mời phỏng vấn!")
                    .append(" Dưới đây là thông tin chi tiết:</p>")
                    .append("<table style=\"width:100%;border-collapse:collapse;margin:16px 0\">")
                    .append(row("Vị trí", jobTitle))
                    .append(row("Công ty", companyName))
                    .append(row("Thời gian",
                            interview.getScheduledAt() != null ? DATE_FMT.format(interview.getScheduledAt()) : "N/A"))
                    .append(row("Thời lượng",
                            interview.getDurationMinutes() != null ? interview.getDurationMinutes() + " phút"
                                    : "60 phút"))
                    .append(row("Người phỏng vấn",
                            interview.getInterviewer() != null ? interview.getInterviewer() : "Sẽ thông báo sau"));
            if (interview.getMeetingUrl() != null && !interview.getMeetingUrl().isBlank()) {
                body.append(
                        "<tr><td style=\"padding:8px 12px;background:#f8fafc;font-weight:700;color:#475569\">Link họp</td>")
                        .append("<td style=\"padding:8px 12px;border-bottom:1px solid #e2e8f0\"><a href=\"")
                        .append(escape(interview.getMeetingUrl())).append("\">")
                        .append(escape(interview.getMeetingUrl()))
                        .append("</a></td></tr>");
            }
            body.append("</table>");
            if (interview.getNotes() != null && !interview.getNotes().isBlank()) {
                body.append("<p><b>Ghi chú từ nhà tuyển dụng:</b></p>")
                        .append("<div style=\"background:#f8fafc;border-left:4px solid #c9a227;padding:12px 16px;border-radius:4px\">")
                        .append(escape(interview.getNotes())).append("</div>");
            }
            body.append(
                    "<p style=\"margin-top:24px\">Vui lòng có mặt đúng giờ. Nếu cần thay đổi lịch, hãy trả lời email này để liên hệ với chúng tôi.</p>");
        }

        body.append("<p style=\"margin-top:32px;color:#64748b\">Trân trọng,<br/><b>Phòng Tuyển dụng - ")
                .append(escape(companyName)).append("</b></p>")
                .append("</div><div style=\"background:#f1f5f9;padding:16px 32px;color:#94a3b8;font-size:12px\">")
                .append("Email này được gửi tự động từ hệ thống HireHub. Vui lòng không trả lời trực tiếp.")
                .append("</div></div>");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body.toString(), true);
            mailSender.send(message);
            log.info("✉ Interview {} email sent to {}", isUpdate ? "update" : "invitation", to);
        } catch (MessagingException | MailException e) {
            // Không ném exception để không ảnh hưởng lưu lịch - chỉ log
            log.error("Failed to send interview email to {}: {}", to, e.getMessage());
        }
    }

    private String row(String label, String value) {
        return "<tr><td style=\"padding:8px 12px;background:#f8fafc;font-weight:700;color:#475569;width:140px\">"
                + escape(label) + "</td><td style=\"padding:8px 12px;border-bottom:1px solid #e2e8f0\">"
                + escape(value) + "</td></tr>";
    }

    private String escape(String input) {
        if (input == null)
            return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
