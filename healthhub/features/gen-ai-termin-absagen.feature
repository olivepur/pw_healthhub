@gen-ai
Feature: HealthHub appointment cancellation
  As a patient
  I want to cancel an appointment
  So that I free the slot when I cannot attend

  Background:
    Given I am signed in to HealthHub
    And I have a scheduled general appointment for tomorrow

  # Positiv
  Scenario: Cancel an upcoming appointment
    When I cancel the appointment
    Then I should see the appointment confirmation "Appointment updated successfully"
    And the appointment should have the status "Cancelled"

  # Negativ
  Scenario: Keep the appointment when the cancellation is aborted
    When I start to cancel the appointment but discard the change
    Then the appointment should have the status "Scheduled"

  # Übersehen
  Scenario: The cancellation is kept after reloading the page
    When I cancel the appointment
    And I reload the appointments page
    Then the appointment should have the status "Cancelled"
