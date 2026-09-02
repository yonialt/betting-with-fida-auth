package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "leagues")
public class League {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "sport_id", nullable = false, length = 50)
    private String sportId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String country;

    @Column(length = 255)
    private String logo;

    public League() {}

    public League(String id, String sportId, String name, String country, String logo) {
        this.id = id;
        this.sportId = sportId;
        this.name = name;
        this.country = country;
        this.logo = logo;
    }

    public static LeagueBuilder builder() {
        return new LeagueBuilder();
    }

    public static class LeagueBuilder {
        private String id;
        private String sportId;
        private String name;
        private String country;
        private String logo;

        public LeagueBuilder id(String id) { this.id = id; return this; }
        public LeagueBuilder sportId(String sportId) { this.sportId = sportId; return this; }
        public LeagueBuilder name(String name) { this.name = name; return this; }
        public LeagueBuilder country(String country) { this.country = country; return this; }
        public LeagueBuilder logo(String logo) { this.logo = logo; return this; }

        public League build() {
            return new League(id, sportId, name, country, logo);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSportId() { return sportId; }
    public void setSportId(String sportId) { this.sportId = sportId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
}
