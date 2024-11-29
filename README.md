# Group5_COMPS350F

## 👥 Project Information
Project Name: Rescue Tails
Group info:
  Group No. 5
  1) SHAH, Pooja Zenit - 13125135
  2) Li Xilin - 12815806
  3) Ahmad Muhammad Taha - 13667329
  4) Awais Sarfraz - 13675772
  5) Ke Yankai - 12979014

## 🗳️ Project File Introduction
- `server.js`: A brief summary of functionalities provided

  User Authentication 
  - Login System: Users may choose to log in using a simple username and password method or through Facebook OAuth.
  - Session Management: By utilising express-session, user sessions are maintained, allowing users to stay logged in.
  
  Data Retrieval
  - Database Queries: By connecting to MongoDB database, animal information based on user-defined criteria can be fetched
  - RESTFUL API: API endpoints are provided to interact with animal data
 
  Logging and Monitoring
  - Request Logging: Mddleware logs have incoming requests for monitoring and debugging uses
  - Error Handling: There are 404 error pages present for unknown routes and features for handling internal server errors. 

  Animal Management 
  1. `findAllAnimals(db, criteria)`: Queries the database for all the animals within the database  
  2. `handle_FindAll(res)`: Connects to the database and retrieves all the animal records and renders onto the `history` page.
  3. `findOneAnimalDocument(db, criteria)`:  Finds animals based on given criteria. Animal quantity returned may vary based on criteria. 
  4. `handle_FindOne(req, res)`: Processes the request to find animals based on specific user input and renders the results. 
  5. `passAnimalDocument(req, res)`: Retrieves and passes a specific animal document criteria for editing and update
  6. `updateDocument(db, criteria, updateData)`: Updates an animal document using updateData in the database based on the given criteria 
  7. `handle_UpdateSaveView(req, res)`: Handles saving updates to an animal after editing by passing it to #6.
  8. `insertDocument(db, doc)`: Inserts a new animal document into the database
  11. `handle_Create(req, res)`: Prepare to create a new animal record based on its type (provided by user input)
  12. `handle_Create1(req, res)`:  Adds more animal attributes to the same record created in `handle_Create(req,res)`
  9. `deleteDocument(db, criteria)`: Deletes documents from the database based on the given criteria
  10. `handle_Delete(req, res)`: Processes the delete requests for animals
      
- package.json: List of Dependencies
  - [body-parser](https://www.npmjs.com/package/body-parser)
  - [ejs](https://www.npmjs.com/package/ejs)
  - [express](https://www.npmjs.com/package/express)
  - [express-session](https://www.npmjs.com/package/express-session)
  - [mongodb](https://www.npmjs.com/package/mongodb)
  - [mongoose](https://www.npmjs.com/package/mongoose)
  - [passport](https://www.npmjs.com/package/passport)
  - [passport-facebook](https://www.npmjs.com/package/passport-facebook)
  - [express-formidable](https://www.npmjs.com/package/express-formidable)
  - [nodemon](https://www.npmjs.com/package/nodemon)
  - [multer](https://www.npmjs.com/package/multer)
  
- Public:
  - Consisting of [images](/public) to utilise in the ejs files.
  
- Views: 
  - [help.ejs](/views/help.ejs)
  - [history.ejs](/views/history.ejs)
  - [info.ejs](/views/info.ejs)
  - [information.ejs](/views/information.ejs)
  - [loggedIn.ejs](/views/loggedIn.ejs)
  - [login.ejs](/views/login.ejs)
  - [register.ejs](/views/register.ejs)
  - [report.ejs](/views/report.ejs)
  - [report_enter.ejs](/views/report_enter.ejs)
  - [view1.ejs](/views/view1.ejs)
  - [view.ejs](/views/view.ejs)
  - [view_update.ejs](/views/view_update.ejs)

- Models:
  - [animal.js](/models/animal.js) to define the animalSchema 
  
## ☁️ Cloud URL - left to do 
- [Cloud URL](https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/view) https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/view
  
## ⚙️ Operation Guides
1. If you have access to PJ's Facebook Account, you may log in and utilise the _**Sign in with Facebook**_ option. If not you may utilise:
```{Username: test1, Password: abc}``` or ```{Username: test2, Password: def}```
2. Once you have successfully logged in, you may click on _click to continue_ which shall redirect you to the portal.
3. The portal has 4 tabs with subtabs respectively.
   <br/>
     <br/>3.1 View
         <br/> -- If you would like to view a specific animal or animals with specific criteria, you may submit your requirements in the form and click on the submit button. 
         <br/> -- For instance:
   ```
   Search District : Kai Tak
   Animal Type: Street Dog
   ```
   or
   ```
   Search District: Ho Man Tin
   Animal Type: Street Cat
   Breed: Bombay Cat
   Gender: Female
   Prominent Features: black
   Disabilities: Two Brains
   Adopted: No
   ```
     <br/> -- Once the animal detail has been shown, you may update the details by clicking on the update button
     <br/> -- Similarly, you may wish to update any attribute you like and click on the update button again. Once updated, you may click on _**Go back to content**_ which will redirect you to the history
   
     <br/><br/>3.2 Report
     <br/> -- The purpose of this page is to report any street animals seen
   <br/> -- You may begin by entering the type of animal seen. For instance ``` Street Dog```
   <br/> -- You can enter further details about the animal seen. For instance:
```
Upload Image: Image taken by you
Breed: Border-Collie
Name: Stella (Any name you wish)
Location: Ho Man Tin
Prominent Features: Brown and White
Disabilities: None
Gender: Unknown
---Note: You can leave any fields empty as well. ---
``` 
  <br/> 3.3 History
<br/> -- You can view all the animals here and have the option to delete by pressing on the delete button. 

   <br/> 3.4 Help
<br/> -- This page is intended to allow users to ask for help when using this interface by sending an email to the group leader. 

   <br/> 3.5 Information
<br/> -- This page acts as an About Us Page to recognise the developers behind this web application. 

<br/>Once you are satisifed, you may press on the logout icon on the bottom left corner 

<br/>4. RESTful CRUD Services

<br/> 4.1 Post/Create an Animal
    <br/>HTTP Request Type: POST
    <br/>Path URI: /api/animals/name/:Animal_name
<br/>Example Testing Command:
```
curl -X POST https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/api/animals/Lion -H "Content-Type: application/json" -d "{\"Gender\":\"Male\"}"
```
<br/> 4.2 Read ALL Animals in the Database
    <br/>HTTP Request Type: GET
    <br/>Path URI: /api/animals
<br/>Example Testing Command:
```
curl -X GET https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/api/animals
```
<br/> 4.3 Read specific animals in the Database
    <br/>HTTP Request Type: GET
    <br/>Path URI: /api/animals/name/:Animal_name
<br/>Example Testing Command: 
```
curl -X GET https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/api/animals/name/Lion
```
<br/> 4.4 Update specific animal in the database
    <br/>HTTP Request Type: PUT
    <br/>Path URI: /api/animals/name/:Animal_name

<br/>Example Testing Command:
```
curl -X PUT https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/api/animals/name/Lion -H "Content-Type: application/json" -d "{\"Type\": \"Street Dog\", \"Animal_name\": \"Lion\", \"Breed\": \"Serbian\", \"Gender\": \"female\", \"Location\": \"Ho Man Tin\", \"Prominent_Features\": \"White Fur\", \"Disabilities\": \"\", \"Adopted\": \"No\"}"
```
<br/> 4.5 Delete an Animal
    <br/>HTTP Request Type: DELETE
    <br/>Path URI: /api/animals/name/:Animal_name

<br/>Example Testing Command:
```
curl -X DELETE https://381project-group5-h7gucfdreybjfyc6.eastus-01.azurewebsites.net/api/animals/name/Lion
```
