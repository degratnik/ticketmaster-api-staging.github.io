Meta:

Narrative:
As a test enfineer
I want to test Ticket Master Developer's site
So that I test Tutorials Widgets Page of Ticket Master Developer's site

Scenario: 20_1 (/products-and-docs/tutorials/widgets/) Verification for general page's elements
Given open Tutorials Widgets page
Then check general page elements for Tutorials Widgets Page, where DISQUS = false and LeftMenu = true

Scenario: 20_2 (/products-and-docs/tutorials/widgets/)
Given open Tutorials Widgets page
Given Feedback widget is not shown

Scenario: 20_3 (/products-and-docs/tutorials/widgets/) Verification for all the page's links
Given open Tutorials Widgets page
When check visibility and click <elementKey> element of Tutorials Widgets page
Then check that new page opened from Tutorials Widgets page has <pageURL> and <pageTitle>
Examples:
|               elementKey           |                            pageURL                                   |           pageTitle         |
|Adding Event Discovery Widget Button|{url}/products-and-docs/tutorials/widgets/Event_Discovery_Widget.html |ADDING EVENT DISCOVERY WIDGET|
