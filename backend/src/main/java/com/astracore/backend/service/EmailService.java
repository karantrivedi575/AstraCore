package com.astracore.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${astracore.mail.from}")
    private String fromEmail;

    @Value("${astracore.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("AstraCore Systems - Account Verification");
        
        String verificationLink = frontendUrl + "/verify?token=" + token;
        
        message.setText("Welcome to AstraCore Systems!\n\n" +
                "Please click the link below to verify your account and complete your registration:\n" +
                verificationLink + "\n\n" +
                "If you did not request this, please ignore this email.");
                
        mailSender.send(message);
    }
}