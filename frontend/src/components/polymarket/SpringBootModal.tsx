import React, { useState } from 'react';
import { X, Server, Copy, Check, ExternalLink, Code2, Layers, Cpu, Database } from 'lucide-react';

interface SpringBootModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpringBootModal: React.FC<SpringBootModalProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'controller' | 'service' | 'dto' | 'config'>('controller');

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard?.writeText?.(code);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const codeSnippets = {
    controller: `package com.polymarket.backend.controller;

import com.polymarket.backend.dto.PolymarketEventDto;
import com.polymarket.backend.service.PolymarketGammaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/polymarket")
@CrossOrigin(origins = "*")
public class PolymarketController {

    private final PolymarketGammaService gammaService;

    public PolymarketController(PolymarketGammaService gammaService) {
        this.gammaService = gammaService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<PolymarketEventDto>> getEvents(
            @RequestParam(defaultValue = "24") int limit,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "volume24hr") String order) {
        List<PolymarketEventDto> events = gammaService.getEvents(limit, tag, order);
        return ResponseEntity.ok(events);
    }
}`,
    service: `package com.polymarket.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polymarket.backend.dto.PolymarketEventDto;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;

@Service
public class PolymarketGammaService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PolymarketGammaService(ObjectMapper objectMapper) {
        this.restClient = RestClient.builder()
                .baseUrl("https://gamma-api.polymarket.com")
                .build();
        this.objectMapper = objectMapper;
    }

    @Cacheable(value = "gammaEvents", key = "#limit + '-' + #tag")
    public List<PolymarketEventDto> getEvents(int limit, String tag, String order) {
        String uri = String.format("/events?order=%s&ascending=false&limit=%d&active=true&closed=false",
                order, limit);
        if (tag != null && !tag.equalsIgnoreCase("All")) {
            uri += "&tag_slug=" + tag.toLowerCase();
        }
        String rawJson = restClient.get().uri(uri).retrieve().body(String.class);
        // Deserialization & mapping logic...
        return parseEvents(rawJson);
    }
}`,
    dto: `package com.polymarket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolymarketEventDto {
    private String id;
    private String title;
    private String slug;
    private String category;
    private String volume;
    private String avatarUrl;
    private String displayType;
    private List<MarketOutcomeDto> outcomes;
}`,
    config: `# Spring Boot 3 - application.yml
server:
  port: 8080

spring:
  application:
    name: polymarket-spring-backend
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=15s

polymarket:
  gamma:
    base-url: https://gamma-api.polymarket.com
    timeout-ms: 5000`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-3xl text-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">
                  Spring Boot Backend Architecture
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                  Java 17 / Spring Boot 3
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Polymarket Gamma API proxy microservice with Caffeine caching & DTO mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Badges */}
        <div className="px-5 py-3 bg-neutral-100/60 border-b border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-700">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>RestClient / WebClient</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Caffeine Cache</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Clean DTO Layers</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>CORS Enabled</span>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-neutral-200 bg-white">
          {(['controller', 'service', 'dto', 'config'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer uppercase tracking-wider ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab === 'controller' && 'PolymarketController.java'}
              {tab === 'service' && 'PolymarketGammaService.java'}
              {tab === 'dto' && 'PolymarketEventDto.java'}
              {tab === 'config' && 'application.yml'}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="p-4 bg-neutral-900 text-neutral-100 flex-1 overflow-auto font-mono text-xs leading-relaxed relative">
          <button
            onClick={() => handleCopy(codeSnippets[activeTab], activeTab)}
            className="absolute top-3 right-3 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            {copiedTab === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <pre className="p-2 select-text">{codeSnippets[activeTab]}</pre>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
          <span className="font-medium">
            Files stored in: <code className="text-neutral-900 bg-neutral-200 px-1 py-0.5 rounded">/backend-springboot/</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
