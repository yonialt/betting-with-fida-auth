package com.fidabet.model;

import jakarta.persistence.*;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "sport_id", nullable = false, length = 50)
    private String sportId;

    @Column(length = 255)
    private String logo;

    public Team() {}

    public Team(String id, String name, String sportId, String logo) {
        this.id = id;
        this.name = name;
        this.sportId = sportId;
        this.logo = logo;
    }

    public static TeamBuilder builder() {
        return new TeamBuilder();
    }

    public static class TeamBuilder {
        private String id;
        private String name;
        private String sportId;
        private String logo;

        public TeamBuilder id(String id) { this.id = id; return this; }
        public TeamBuilder name(String name) { this.name = name; return this; }
        public TeamBuilder sportId(String sportId) { this.sportId = sportId; return this; }
        public TeamBuilder logo(String logo) { this.logo = logo; return this; }

        public Team build() {
            return new Team(id, name, sportId, logo);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSportId() { return sportId; }
    public void setSportId(String sportId) { this.sportId = sportId; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
}
