@gen-ai
Feature: HealthHub appointment deletion
  As a patient I want to delete an appointment so that it no longer appears in my appointment list.

  Background:
    Given I am signed in to HealthHub
    And I have a scheduled general appointment for tomorrow that I want to delete

  # Positiv
  Scenario: Delete an appointment
    When I delete the appointment
    Then I should see the appointment confirmation "Appointment deleted successfully"
    And the appointment should no longer be in my appointment list

  # Negativ
  Scenario: Keep the appointment when the deletion is aborted
    When I start to delete the appointment but cancel the confirmation
    Then the appointment should still be in my appointment list
