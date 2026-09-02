package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sports")
public class Sport {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    public Sport() {}

    public Sport(String id, String name, String icon, Integer displayOrder) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public static SportBuilder builder() {
        return new SportBuilder();
    }

    public static class SportBuilder {
        private String id;
        private String name;
        private String icon;
        private Integer displayOrder = 0;

        public SportBuilder id(String id) { this.id = id; return this; }
        public SportBuilder name(String name) { this.name = name; return this; }
        public SportBuilder icon(String icon) { this.icon = icon; return this; }
        public SportBuilder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }

        public Sport build() {
            return new Sport(id, name, icon, displayOrder);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
