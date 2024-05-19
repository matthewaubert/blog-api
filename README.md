# Blog API

A RESTful API utilizing JWT authentication to power a blogging platform.

**Live link to the API: https://blog-api-ma.fly.dev/**

## Key Features

- **RESTful Architecture:** This API maintains the principles of RESTful architecture, ensuring that resources are easily accessible in a consistent format, and enabling efficient communication between client and server.
- **JWT Authentication:** JSON web tokens are issued via the `/login` route to allow persistent authentication. They are also re-issued upon update of a User resource. Tokens expire after 24 hours.
- **User Authorization:** Certain routes and resources that contain sensitive information are protected, and only users with the proper authorization may access them.

# Documentation

## Resources

There are 4 resources in this API:
- Users
- Posts
- Comments
- Categories

### User fields

- `_id`: MongoDB ObjectId, automatically generated
- `firstName`: string, required
- `lastName`: string, required
- `username`: string, required, unique
- `slug`: string, unique, automatically generated by given `username`
- `email`: string, required, unique, min length: 6, max length: 100
- `password`: string (a hash of the provided password), min length: 8, max length: 100
- `isVerified`: string, defaults to `false`
- `isAdmin`: string, defaults to `false`, currently only able to be set to `true` by directly accessing the database

### Post fields

- `_id`: MongoDB ObjectId
- `title`: string, required, max length: 100
- `slug`: string, unique, automatically generated by given `title`
- `content`: string, required
- `user`: MongoDB ObjectId (references a `User`), generated by ID in JWT payload provided in `"Authorization"` header
- `isPublished`: boolean, defaults to `false`
- `category`: MongoDB ObjectId (references a `Category`)
- `tags`: array of strings, optional
- `createdAt`: MongoDB Timestamp, automatically generated
- `updatedAt`: MongoDB Timestamp, automatically generated

### Comment fields

- `_id`: MongoDB ObjectId
- `text`: string, required
- `user`: MongoDB ObjectId (references a `User`), generated by ID in JWT payload provided in `"Authorization"` header
- `post`: MongoDB ObjectId (references a `Post`)
- `createdAt`: MongoDB Timestamp, automatically generated
- `updatedAt`: MongoDB Timestamp, automatically generated

### Category fields

- `_id`: MongoDB ObjectId
- `name`: string, required, unique, max length: 100
- `slug`: string, unique, automatically generated by given `name`
- `description`: string, optional

## How to Use

You can obtain resources from the API using various means. For example:

- JavaScript Fetch API
  ```javascript
  fetch('https://blog-api-ma.fly.dev/api/posts')
    .then((res) => res.json())
    .then((json) => console.log(json));
  ```
- Postman
  ```
  GET https://blog-api-ma.fly.dev/api/posts
  ```
- cURL
  ```
  curl https://blog-api-ma.fly.dev/api/posts
  ```

### Obtain JWT via `login` route

Depending on the resource, you may need to attach a valid JSON web token (JWT) in the `Authorization` header of the request. e.g. `Authorization: Bearer <json-web-token>`

In order to obtain a JWT, make a `POST` request on the `/api/login` endpoint with valid user credentials.

e.g. `POST /api/login` with the following body
```json
{
  "email": "example@email.com",
  "password": "example-password"
}
```
will return
```jsonc
{
  "success": true,
  "message": "You are now authenticated",
  "token": "<json-web-token>" // your valid JWT would be here
}
```
assuming there is a valid user with those credentials in the database.

This JWT will provide more access to different resources in the API (for example, creating and editing Posts) if the user in the payload has been verified (i.e. the user's `"isVerified"` field is set to `true`).

### Get all resource instances

Making a `GET` request on an API endpoint without a resource ID or slug will return a list of all available instances of that resource.

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
  ],
}
```

This resource supports any combination of the following query parameters
- `sort` to sort resource instances by a field in ascending or descending order
  - e.g. `GET /api/posts?sort[title]=asc` will sort Post resource instances by title in ascending order
  - e.g. `GET /api/posts?sort[content]=desc` will sort Post resource instances by content in descending order
  - Note: By default, resource instances are sorted by ID in ascending order
- `offset` to skip resource instances
  - e.g. `GET /api/posts?offset=2` will skip the first 2 Post resource instances and return the rest
- `limit` to limit the number of resource instances returned
  - e.g. `GET /api/posts?limit=3` will only return the first 3 Post resource instances
- Query parameters can be chained
  - e.g. `GET /api/posts?sort[title]=asc&offset=2&limit=3` will sort Post resource instances by title in ascending order, skip the first 2, and finally return the next 3
  - Note: Parameter order matters!

### Get one resource instance

Making a `GET` request on an API endpoint with a resource ID or slug will return the one resource instance with a matching ID or slug.

e.g. `GET /api/posts/661ed5e44e9bbfd5772851eb` OR `GET /api/posts/first-post` will return:
```jsonc
{
  "success": true,
  "message": "Post 'First Post' fetched from database",
  "data": {
    "_id": "661ed5e44e9bbfd5772851eb",
    "title": "First Post",
    "slug": "first-post",
    // other resource properties
  },
}
```

### Create a resource instance

Making a `POST` request on an API endpoint without a resource ID will create and return a new resource instance.

In the case of a Post or Comment resource, the user ID in the JWT payload sent in the `Authorization` header will be included in the resource's `user` field.

e.g. `POST /api/posts` with the following body
```json
{
  "title": "New Post",
  "content": "This is the content of a new post!",
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
    "content": "This is the content of a new post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": ["new", "post"],
    "_id": "662ab91421be18d008e14500",
    "createdAt": "2024-04-25T20:12:04.150Z",
    "updatedAt": "2024-04-25T20:12:04.150Z"
  }
}
```

### Fully replace a resource instance

Making a `PUT` request on an API endpoint with a resource ID or slug will fully replace the resource instance with the matching ID or slug, using the fields supplied in the `body` of the request, and then return the updated resource instance. You must update all fields.

In the case of a Post or Comment resource, The user ID in the JWT payload sent in the `Authorization` header will be included in the resource's `user` field.

e.g. `PUT /api/posts/662ab91421be18d008e14500` with the following body
```json
{
  "title": "New Post Replaced",
  "content": "This is the content of a replaced post!",
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
    "content": "This is the content of a replaced post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": ["replaced", "post"],
    "createdAt": "2024-04-25T20:22:38.188Z",
    "updatedAt": "2024-04-25T20:22:38.188Z"
  }
}
```

### Partially update a resource instance

Making a `PATCH` request on an API endpoint with a resource ID or slug will make a partial update on the resource instance with the matching ID or slug, using the fields supplied in the `body` of the request, and then return the updated resource instance. You may update any number of fields.

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
    "content": "This is the content of a replaced post!",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": ["replaced", "post"],
    "createdAt": "2024-04-25T20:22:38.188Z",
    "updatedAt": "2024-04-25T20:24:54.736Z"
  }
}
```

### Delete a resource instance

Making a `DELETE` request on an API endpoint with a resource ID or slug will delete and return the resource instance with the matching ID or slug.

e.g. `DELETE /api/posts/662ab91421be18d008e14500` will return:
```json
{
  "success": true,
  "message": "Post 'New Post Replaced, edited' deleted from database",
  "data": {
    "_id": "662ab91421be18d008e14500",
    "title": "New Post Replaced, edited",
    "slug": "new-post-replaced-edited",
    "content": "This is the content of a replaced post!",
    "user": {
      "_id": "661d55e453a14e1c7458e23a",
      "firstName": "Sam",
      "lastName": "Smith",
      "username": "sam.smith",
      "slug": "sam-smith"
    },
    "isPublished": false,
    "tags": ["replaced", "post"],
    "createdAt": "2024-04-25T20:22:38.188Z",
    "updatedAt": "2024-04-25T20:24:54.736Z"
  }
}
```

### Error Messages

All responses include a `"success"` field – a boolean value to tell you whether the request succeeded – and `"message"` field – a string providing you more information about the request. Most failed requests will also provide an `"error"` field – an array of objects describing the error(s).

e.g. `POST /api/posts` without a body will return:
```json
{
  "success": false,
  "message": "400 Bad Request",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Title must not be empty.",
      "path": "title",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "Content must not be empty.",
      "path": "content",
      "location": "body"
    }
  ],
  "data": {
    "title": "",
    "slug": "",
    "content": "",
    "user": "661d55e453a14e1c7458e23a",
    "isPublished": false,
    "tags": [],
    "_id": "663190f901b3f9d205c8656f"
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
