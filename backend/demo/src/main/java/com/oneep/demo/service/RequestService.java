package com.oneep.demo.service;

import com.oneep.demo.model.Request;
import com.oneep.demo.model.User;
import com.oneep.demo.repository.RequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserService userService;

    public RequestService(RequestRepository requestRepository, UserService userService) {
        this.requestRepository = requestRepository;
        this.userService = userService;
    }

    public Request createRequest(Request request, String email) {
        User user = userService.findByEmail(email);
        request.setUser(user);
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    public List<Request> findRequestsByUser(String email) {
        User user = userService.findByEmail(email);
        return requestRepository.findByUserId(user.getId());
    }
}