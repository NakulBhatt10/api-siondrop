shortcut `ctrl+k v` 
How to start the backend App `npm run dev` (nodemon)


# Sign up - create a user

`https://api-siondrop.onrender.com/signup`

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

`https://api-siondrop.onrender.com`

Payload - 
``` json
{
  "email": "john@example.com",
  "password" : "Hello@123",
  "confirmPassword" : "Hello@123"
}
```
Output-


# booking-history

1. API - `https://api-siondrop.onrender.com/current-booking`

2. Payload - auth token (user-token)

3. Reponse - 
```js
{
    "booking": {
        "_id": "68b320653e9930820b4931bb",
        "taxiId": "20250830-945pm",
        "vehicleType": "taxi",
        "users": [
            {
                "userId": "685682239f6e589b4fb4a447",
                "name": "Jenny Don",
                "email": "jennydon44@example.com",
                "_id": "68b320653e9930820b4931bc"
            }
        ],
        "time": "2025-08-30T16:15:00.000Z",
        "maxCapacity": 4,
        "createdAt": "2025-08-30T16:01:41.837Z",
        "updatedAt": "2025-08-30T16:01:41.837Z",
        "__v": 0
    }
}

```
(mardown format)

book-taxi-now

book-auto-now

current-booking

cancel-booking

current-user-in-slot



Backend has Endpoint:
(call below number from EITHER postman or direct frontend)
/login
/signup
/book


user fill fomr on frontend --> data goes to backend --> backend send to database --> correct OR error
