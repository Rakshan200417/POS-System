package com.possystem.backend.controller;

import com.possystem.backend.model.StoreSettings;
import com.possystem.backend.repository.StoreSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/settings")
public class StoreSettingsController {

    @Autowired
    private StoreSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<StoreSettings> getSettings() {
        StoreSettings settings = settingsRepository.findAll().stream().findFirst().orElseGet(() -> {
            StoreSettings def = new StoreSettings();
            def.setStoreName("SuperPOS Retail Hub");
            def.setEmail("store@superpos.com");
            def.setPhone("+1 (555) 019-2834");
            def.setAddress("100 Innovation Blvd, Tech City, CA 94016");
            def.setCurrency("$");
            def.setTaxRate(10.0);
            def.setReceiptHeader("THANK YOU FOR SHOPPING AT SUPERPOS!\nVisit us online: www.superpos.com");
            def.setReceiptFooter("Returns accepted within 14 days with receipt.\nHave a wonderful day!");
            return settingsRepository.save(def);
        });
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StoreSettings> updateSettings(@RequestBody StoreSettings newSettings) {
        StoreSettings settings = settingsRepository.findAll().stream().findFirst().orElseGet(StoreSettings::new);
        
        if (newSettings.getStoreName() != null) settings.setStoreName(newSettings.getStoreName());
        if (newSettings.getEmail() != null) settings.setEmail(newSettings.getEmail());
        if (newSettings.getPhone() != null) settings.setPhone(newSettings.getPhone());
        if (newSettings.getAddress() != null) settings.setAddress(newSettings.getAddress());
        if (newSettings.getCurrency() != null) settings.setCurrency(newSettings.getCurrency());
        if (newSettings.getTaxRate() != null) settings.setTaxRate(newSettings.getTaxRate());
        if (newSettings.getExchangeRate() != null) settings.setExchangeRate(newSettings.getExchangeRate());
        if (newSettings.getReceiptHeader() != null) settings.setReceiptHeader(newSettings.getReceiptHeader());
        if (newSettings.getReceiptFooter() != null) settings.setReceiptFooter(newSettings.getReceiptFooter());
        if (newSettings.getEnableSound() != null) settings.setEnableSound(newSettings.getEnableSound());
        if (newSettings.getBarcodeAutoAdd() != null) settings.setBarcodeAutoAdd(newSettings.getBarcodeAutoAdd());
        if (newSettings.getAutoPrintReceipt() != null) settings.setAutoPrintReceipt(newSettings.getAutoPrintReceipt());

        return ResponseEntity.ok(settingsRepository.save(settings));
    }
}
