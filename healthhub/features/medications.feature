Feature: HealthHub medications
  As a patient
  I want to add a medication
  So that I can track my medication list

  Background:
    Given I am signed in to HealthHub

  Scenario: Add a medication successfully
    When I add a sample medication
    Then I should see the medication in my list
