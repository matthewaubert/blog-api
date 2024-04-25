# Blog API

A RESTful API utilizing JWT authentication to power a blogging platform.

## Key Features

- **RESTful Architecture:** This API maintains the principles of RESTful architecture, ensuring that resources are easily accessible in a consistent format, and enabling efficient communication between client and server.
- **JWT Authentication:** JSON web tokens are issued via the `/login` route to allow persistent authentication. They are also re-issued upon update of a User resource. Tokens expire after 24 hours.
- **User Authorization:** Certain routes and resources that contain sensitive information are protected, and only users with the proper authorization may access them.

# Documentation

## Resources
There are 5 resources in this API:
- Users
- Posts
- Comments
- Categories
- Login

## How to Use

You can obtain resources from the API using various means. For example:
- JavaScript Fetch API
  ```javascript
  fetch('http://<domain-name>/api/posts')
    .then((res) => res.json())
    .then((json) => console.log(json));
  ```
- Postman
  ```
  GET http://<domain-name>/api/posts
  ```
- cURL
  ```
  curl http://<domain-name>/api/posts
  ```

Depending on the resource, you may need to attach a valid JSON web token (JWT) in the `Authorization` header with the proper authorization in the payload. e.g. `Authorization: Bearer <jwt-token-here>`

### Get all resource instances
Making a `GET` request on an API endpoint without a resource ID will return a list of all available instances of that resource.

e.g. `GET /api/posts` will return:
```jsonc
{
  "success": true,
  "message": "Posts fetched from database",
  "count": 5,
  "data": [
    {
      "_id": "661ed5e44e9bbfd5772851eb",
      "title": "First Post",
      // other resource properties
    },
    // 4 other resource instances
  ]
}
```

### Get one resource instance

Making a `GET` request on an API endpoint with a resource ID will return the one resource instance with a matching ID.

e.g. `GET /api/posts/661ed5e44e9bbfd5772851eb` will return:
```jsonc
{
  "success": true,
  "message": "Post 'First Post' fetched from database",
  "data": {
    "_id": "661ed5e44e9bbfd5772851eb",
    "title": "First Post",
    // other resource properties
  }
}
```

### Create a resource instance

Making a `POST` request on an API endpoint without a resource ID will create and return a new resource instance.

In the case of a Post or Comment resource, The user ID in the JWT payload sent in the `Authorization` header will be included in the resource's `user` field.

e.g. `POST /api/posts` with the following body
```json
{
  "title": "New Post",
  "text": "This is the text of a new post!",
  "tags": ["new", "post"]
}
```
will return:
```json
{
  "success": true,
  "message": "Post 'New Post' saved to database",
  "data": {
    "title": "New Post",
    "slug": "new-post",
    "text": "This is the text of a new post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": [
      "new",
      "post"
    ],
    "_id": "662ab91421be18d008e14500",
    "createdAt": "2024-04-25T20:12:04.150Z",
    "updatedAt": "2024-04-25T20:12:04.150Z",
  }
}
```

### Fully replace a resource instance

Making a `PUT` request on an API endpoint with a resource ID will fully replace the resource instance with the matching ID, using the fields supplied in the `body` of the request, and then return the updated resource instance. You must update all fields.

In the case of a Post or Comment resource, The user ID in the JWT payload sent in the `Authorization` header will be included in the resource's `user` field.

e.g. `PUT /api/posts/662ab91421be18d008e14500` with the following body
```json
{
  "title": "New Post Replaced",
  "text": "This is the text of a replaced post!",
  "tags": ["replaced", "post"]
}
```
will return:
```json
{
  "success": true,
  "message": "Post 'New Post Replaced' replaced in database",
  "data": {
    "_id": "662ab91421be18d008e14500",
    "title": "New Post Replaced",
    "slug": "new-post-replaced",
    "text": "This is the text of a replaced post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": [
      "replaced",
      "post"
    ],
    "createdAt": "2024-04-25T20:18:47.161Z",
    "updatedAt": "2024-04-25T20:18:47.161Z"
  }
}
```

### Partially update a resource instance

Making a `PATCH` request on an API endpoint with a resource ID will make a partial update on the resource instance with the matching ID, using the fields supplied in the `body` of the request, and then return the updated resource instance. You may update any number of fields.

e.g. `PATCH /api/posts/662ab91421be18d008e14500` with the following body
```json
{
  "title": "New Post Replaced, edited"
}
```
will return:
```json
{
  "success": true,
  "message": "Post 'New Post Replaced, edited' updated in database",
  "data": {
    "_id": "662ab91421be18d008e14500",
    "title": "New Post Replaced, edited",
    "slug": "new-post-replaced-edited",
    "text": "This is the text of a replaced post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": [
      "replaced",
      "post"
    ],
    "createdAt": "2024-04-25T20:22:38.188Z",
    "updatedAt": "2024-04-25T20:24:54.736Z"
  }
}
```

### Delete a resource instance

Making a `DELETE` request on an API endpoint with a resource ID will delete and return the resource instance with the matching ID.

e.g. `DELETE /api/posts/662ab91421be18d008e14500` will return:
```json
{
  "success": true,
  "message": "Post 'New Post Replaced, edited' deleted from database",
  "data": {
    "_id": "662ab91421be18d008e14500",
    "title": "New Post Replaced, edited",
    "slug": "new-post-replaced-edited",
    "text": "This is the text of a replaced post!",
    "user": {
      "_id": "661d55e453a14e1c7458e23a",
      "firstName": "Sam",
      "lastName": "Smith",
      "username": "sam.smith",
      "slug": "sam-smith"
    },
    "isPublished": false,
    "tags": [
      "replaced",
      "post"
    ],
    "createdAt": "2024-04-25T20:22:38.188Z",
    "updatedAt": "2024-04-25T20:24:54.736Z"
  }
}
```

# Project Information

## Project Objectives

This project was built in order to practice implementing the following skills:
- Build an API-only back end using REST architecture in Node.js/Express
- Implement user authentication with [JSON web tokens](https://github.com/auth0/node-jsonwebtoken)
- Secure passwords (hashing and salting) with [bcrypt](https://www.npmjs.com/package/bcryptjs)

## Technologies Used

### Languages
- JavaScript

### Frameworks and Tools
- Node.js
- Express
- MongoDB, Mongoose
- Git (obviously)

### Libraries and Middleware
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) – an implementation of JSON web tokens for Node.js
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) – for securing passwords by hashing and salting
- [express-async-handler](https://www.npmjs.com/package/express-async-handler) – asynchronous exception-handling middleware for Express
- [express-validator](https://www.npmjs.com/package/express-validator) – user input validation middleware for Express
- [http-errors](https://www.npmjs.com/package/http-errors) – for creating HTTP errors for Express
- [Dotenv](https://www.npmjs.com/package/dotenv) – for keeping my database connection strings and JWT key secret
- [He](https://www.npmjs.com/package/he) – for encoding HTML entities
- [limax](https://github.com/lovell/limax) – for generating URL slugs
