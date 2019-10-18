package com.tericcabrel.osiris.controllers;

import com.tericcabrel.osiris.models.Response;
import com.tericcabrel.osiris.services.FileStorageService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class FingerprintController {
    private FileStorageService fileStorageService;

    public FingerprintController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/api/fingerprints")
    public Response uploadFile(
            @RequestParam("picture") MultipartFile picture,
            @RequestParam("fingerprint") MultipartFile fingerprint,
            @RequestParam("uid") String uid
    ) {
        String fileName = fileStorageService.storeFile(uid, picture, fingerprint);

        return new Response(fileName, picture.getContentType(), picture.getSize());
    }
}
