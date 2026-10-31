package com.recruitment.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Controller dùng chung để upload ảnh (logo/ảnh bìa công ty, avatar người dùng).
 * File được lưu trong thư mục uploads/ ở thư mục chạy ứng dụng.
 * Client có thể truy cập trực tiếp qua URL tĩnh: http://<host>:8080/uploads/<filename>
 */
@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload ảnh chung (avatar người dùng, logo/ảnh bìa công ty).
     */
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_HR', 'ROLE_ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(doUpload(file));
    }

    private Map<String, String> doUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 5MB");
        }

        try {
            Files.createDirectories(UPLOAD_DIR);
            String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) {
                ext = original.substring(dot).toLowerCase();
            }
            String filename = UUID.randomUUID() + ext;
            Path target = UPLOAD_DIR.resolve(filename);
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            String url = "/uploads/" + filename;
            return Map.of("url", url, "filename", filename);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }
}
