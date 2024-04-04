# Blog API Notes

## Assignment
> Ref: https://www.theodinproject.com/lessons/nodejs-blog-api

1. Begin by designing your back end models and schemas. How you design it is up to you, but you might want to think through a few things:
   - For a blog with only a single author you might not need a user model, but you might want to set up authentication so that you can protect the editing functions with a username and password. In that case, it might make sense to set up a minimal user model, even if you are the only user.
   - Your blog should have posts and comments, so think about the fields you are going to want to include for each of those.
   - Are you going to require users to leave a username or email with their comments?
   - Are you going to display a date or a timestamp for posts and comments?
Posts should probably have a title, but should comments?
   - A useful feature for a blog is the ability to have posts that are in the database but not published for the public to read. How might you designate published vs unpublished posts in your DB?
2. Set up your express app, and define the models in mongoose.
3. Set up your routes and controllers! Think about RESTful organization for this one. Most of the examples in the previous lesson were centered around posts and comments so this shouldn’t be too tricky.
   - You can test your routes however you want. Using curl in a terminal is one handy way, but it can be just as effective to use a web browser. There are some platforms that allow you to send PUT and POST requests without needing to set up and fill out HTML forms. Postman is probably the most popular.
4. Once your API is working you can focus on your front-end code. Really, how you go about this is up to you. If you are comfortable with a front-end framework then go for it! If you’re happier using plain HTML and CSS that’s fine too. All you should have to do to get your posts into a website is to fetch the correct API endpoint and then display the results. Working with fetch and APIs from a front-end perspective is covered in this lesson
5. Create a second website for authoring and editing your posts. You can set this up however you like but the following features might be useful:
   - A list of all posts that shows whether or not they have been published.
   - A button to publish unpublished posts, or to unpublish published ones!
   - A ‘NEW POST’ form. If you want to get fancy, you could use a rich text editor such as TinyMCE.
   - The ability to manage comments (i.e. delete or edit them).
6. How much work you want to put into the front-end code on this one is up to you. - Technically this is a back-end focused course so if you don’t actually need or want a blog on your website feel free to focus mainly on getting a REST API up and running.

## 4/2/24

To do:
- [x] [Create a new Express app](https://gist.github.com/matthewaubert/c7b652d2c25be2b09cc9c82316d9652c)

## 4/3/24

To do:
- [x] Design my back end models and schemas
  - User
    - first name: string
    - last name: string
    - username: string
    - slug: string
    - email: string
    - password: string
    - isAuthor: boolean (false by default) - must confirm email
    - isAdmin: boolean (false by default) - only me
  - Post - must be an author to create, update, delete own posts; admin to update, delete any posts
    - title: string
    - slug: string
    - text: string
    - createdAt: Date (use Mongoose [`timestamps: true`](https://mongoosejs.com/docs/timestamps.html) option)
    - updatedAt: Date (use Mongoose `timestamps: true` option)
    - user: ObjectId (references User)
    - isPublished: boolean (false by default)
    - category: ObjectId (references Category)
    - tags: array of strings
    - imgId: string
  - Comment - must be a User to comment; author to update, delete comments on own post; admin to update, delete comments on any post
    - text: string
    - createdAt: Date (use Mongoose `timestamps: true` option)
    - updatedAt: Date (use Mongoose `timestamps: true` option)
    - user: ObjectId (references User)
    - post: ObjectId (references Post)
  - Category
    - name: string
    - slug: string
- [x] Define models in Mongoose
- [x] Write func to generate unique slugs

## 4/4/24

To do:
- [x] Set up routes and controller skeletons
  - [x] Review previous lessons
  - [x] Set up routes
  - [x] Set up controller skeletons
- [ ] Implement controllers
  - [ ] User controllers
    - [x] GET one
    - [x] GET all
    - [x] POST
      - [x] Write basic controller
      - [x] Validate and sanitize
      - [x] Hash password w/ bcrypt
    - [ ] PUT
    - [ ] DELETE
  - [ ] Post controllers
    - [ ] GET one
    - [ ] GET all
    - [ ] POST
    - [ ] PUT
    - [ ] DELETE
  - [ ] Comment controllers
    - [ ] GET one
    - [ ] GET all
    - [ ] POST
    - [ ] PUT
    - [ ] DELETE
  - [ ] Category controllers
    - [ ] GET one
    - [ ] GET all
    - [ ] POST
    - [ ] PUT
    - [ ] DELETE
- Limit results?
- Sort results?
- Filter results?
- Implement user authentication using JWT
