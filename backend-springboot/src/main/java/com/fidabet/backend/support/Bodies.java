package com.fidabet.backend.support;

import java.util.Map;

/**
 * Small helpers for reading loosely-typed JSON request bodies, matching the permissive parsing of
 * the original Express handlers (which used {@code req.body || {}} and {@code parseFloat}).
 */
public final class Bodies {

    private Bodies() {
    }

    public static double toDouble(Map<String, Object> body, String key, double fallback) {
        if (body == null) return fallback;
        return toDouble(body.get(key), fallback);
    }

    public static double toDouble(Object value, double fallback) {
        if (value == null) return fallback;
        if (value instanceof Number n) return n.doubleValue();
        try {
            return Double.parseDouble(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    public static String toStr(Map<String, Object> body, String key, String fallback) {
        if (body == null) return fallback;
        Object v = body.get(key);
        return v == null ? fallback : String.valueOf(v);
    }
}
