shortcut `ctrl+k v` 
How to start the backend App `npm run dev` (nodemon)


# Sign up - create a user

`http://localhost:5000/signup`

Payload - 
``` json
{
  "email": "john@example.com",
  "password" : "Hello@123",
  "confirmPassword" : "Hello@123"
}
```
output

# Login - a user

`http://localhost:5000/`

Payload - 
``` json
{
  "email": "john@example.com",
  "password" : "Hello@123",
  "confirmPassword" : "Hello@123"
}
```
Output-

(mardown format)

book-taxi-now

book-auto-now

booking-history

current-booking

cancel-booking

current-user-in-slot



Backend has Endpoint:
(call below number from EITHER postman or direct frontend)
/login
/signup
/book


user fill fomr on frontend --> data goes to backend --> backend send to database --> correct OR error
