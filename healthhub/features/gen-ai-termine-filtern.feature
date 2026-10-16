@gen-ai
Feature: HealthHub appointment status filter
  As a patient I want to filter my appointments by status so that I only see the appointments I am interested in.

  Background:
    Given I am signed in to HealthHub

  # Positiv
  Scenario Outline: Only appointments with the selected status are listed
    When I filter my appointments by the status "<status>"
    Then every appointment on all pages should have the status "<status>"

    Examples:
      | status    |
      | Scheduled |
      | Completed |
      | Cancelled |

  # Positiv
  Scenario: My cancelled appointment is shown in the "Cancelled" filter
    Given I have a scheduled general appointment for tomorrow
    And I cancel the appointment
    When I filter my appointments by the status "Cancelled"
    Then the appointment should have the status "Cancelled"

  # Übersehen – bekannter Fehler der App: Der Filter wird beim Neuladen zurückgesetzt.
  # @fail: Der Test ist grün, solange der Fehler besteht. Wird er rot, ist der Fehler behoben: Tag entfernen.
  @fail
  Scenario: The status filter is kept after reloading the page
    Given I filter my appointments by the status "Scheduled"
    When I reload the appointments page
    Then every appointment on all pages should have the status "Scheduled"
