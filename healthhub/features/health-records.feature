Feature: HealthHub health records
  As a patient
  I want to view my health records
  So that I can review my recorded information

  Background:
    Given I am signed in to HealthHub

  Scenario: View health records
    When I open Health Records
    Then I should see the Health Records page and an existing record
