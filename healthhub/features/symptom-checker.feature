Feature: HealthHub symptom checker
  As a patient
  I want to assess my symptoms
  So that I can review the recommendation and book an appointment

  Background:
    Given I am signed in to HealthHub

  Scenario: Assess mild symptoms and request an appointment
    When I open the Symptom Checker
    And I select the symptoms "Fever, Headache, Fatigue, Cough"
    And I specify mild symptoms lasting 2 to 3 days
    And I report a fever and recent travel
    And I submit the symptom assessment
    Then I should see the symptom recommendation "Your symptoms appear mild."
    When I choose to book an appointment from the symptom results
