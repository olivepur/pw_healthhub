Feature: HealthHub appointments
  As a patient
  I want to manage appointments
  So that I can keep track of upcoming care

  Background:
    Given I am signed in to HealthHub

  Scenario: Create an appointment successfully
    When I create a general appointment for tomorrow
    Then I should see the appointment confirmation "Appointment created successfully"
