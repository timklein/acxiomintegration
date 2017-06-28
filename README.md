# Acxiom Integration Testing
Acxiom API Data Retrieval and Infusionsoft Update Proof of Concept.

## Installation
Clone repository to the desired server location. `cd` into the installation directory and run `npm install`

Remove `.sample` extension from `config/configVars.json.sample` and replace the descriptions with valid configuration values.

## Update a Contact Record with LifeStage Data
### Sending Account (from) Side
1. http POST (required) - To address must include the path `/incoming`
    * `accessKey` = Access Key for this application. Must match key in `config/configVars.json`
    * `contactId` = Infusionsoft Merge Field Code `~Contact.Id~`
    * `email` = Infusionsoft Merge Field Code `~Contact.Email~`
    * `firstName` = Infusionsoft Merge Field Code `~Contact.FirstName~`
    * `lastName` = Infusionsoft Merge Field Code `~Contact.LastName~`
    * `address` = Infusionsoft Merge Field Code `~Contact.StreetAddress1~`
    * `city` = Infusionsoft Merge Field Code `~Contact.City~`
    * `state` = Infusionsoft Merge Field Code `~Contact.State~`
    * `zip` = Infusionsoft Merge Field Code `~Contact.PostalCode~`

### Receiving Account (to) Side
1. Receiving account must have custom fields created to accept Life Stage Group & Life Stage Cluster
