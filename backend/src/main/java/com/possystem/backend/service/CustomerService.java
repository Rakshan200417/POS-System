package com.possystem.backend.service;

import com.possystem.backend.model.Customer;
import com.possystem.backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    public Optional<Customer> findByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }

    public void addLoyaltyPoints(Long customerId, int points) {
        customerRepository.findById(customerId).ifPresent(customer -> {
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
            customerRepository.save(customer);
        });
    }
}
