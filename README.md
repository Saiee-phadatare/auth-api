<h2>Project Overview</h2>
<p>This is a <strong>RESTful Authentication API</strong> that provides user authentication, email verification, and password reset functionalities. It also includes basic post management operations.</p>

<h2>Tech Stack Used</h2>
<ul>
    <li><strong>Backend:</strong> Node.js, Express.js</li>
    <li><strong>Database:</strong> MongoDB</li>
    <li><strong>Authentication:</strong> JWT, Session-based Authentication</li>
    <li><strong>Email Service:</strong> Nodemailer</li>
    <li><strong>Deployment:</strong> Render</li>
</ul>

<h2>Live API Deployment</h2>
<p><strong>Base URL:</strong> <a href="https://auth-api-u72n.onrender.com/">https://auth-api-u72n.onrender.com/</a></p>

<h2>API Documentation & Testing</h2>
<p>For easy testing, use the Postman collection linked below:</p>
<p><strong>Postman Collection:</strong> <a href="https://raw.githubusercontent.com/Saiee-phadatare/auth-api/refs/heads/main/Render.postman_collection.json">Click here to import</a></p>

<h2>Available Routes</h2>

<h3>🛠 Authentication Routes</h3>
<table border="1" cellpadding="5">
    <tr>
        <th>Method</th>
        <th>Route</th>
        <th>Description</th>
        <th>Body Parameters</th>
    </tr>
    <tr>
        <td>POST</td>
        <td>/api/auth/signup</td>
        <td>Register a new user</td>
        <td>{ "email": "example@gmail.com", "password": "yourpassword" }</td>
    </tr>
    <tr>
        <td>POST</td>
        <td>/api/auth/signin</td>
        <td>Login with email & password</td>
        <td>{ "email": "example@gmail.com", "password": "yourpassword" }</td>
    </tr>
    <tr>
        <td>PATCH</td>
        <td>/api/auth/send-verification-code</td>
        <td>Send email verification code</td>
        <td>{ "email": "example@gmail.com" }</td>
    </tr>
    <tr>
        <td>PATCH</td>
        <td>/api/auth/verify-verification-code</td>
        <td>Verify email with code</td>
        <td>{ "email": "example@gmail.com", "providedCode": "123456" }</td>
    </tr>
     <tr>
        <td>PATCH</td>
        <td>/api/auth/change-password</td>
        <td>Change password</td>
        <td>{ "oldPassword": "oldPass", "newPassword": "newPass" }</td>
    </tr>
     <tr>
        <td>PATCH</td>
        <td>/api/auth/send-forgetPassword-code</td>
        <td>Send password reset code</td>
        <td>{ "email": "example@gmail.com" }</td>
    </tr>
     <tr>
        <td>PATCH</td>
        <td>/api/auth/verify-forgetPassword-code</td>
        <td>Reset password with code</td>
        <td>{ "email": "example@gmail.com", "providedCode": "123456", "newPassword": "newPass" }</td>
    </tr>
</table>

<h3>Post Management Routes</h3>
<table border="1" cellpadding="5">
    <tr>
        <th>Method</th>
        <th>Route</th>
        <th>Description</th>
        <th>Body Parameters / Query Params</th>
    </tr>
    <tr>
        <td>GET</td>
        <td>/api/post/all-posts</td>
        <td>Fetch all posts</td>
        <td>-</td>
    </tr>
    <tr>
        <td>GET</td>
        <td>/api/post/single-post?_id={postId}</td>
        <td>Get a single post</td>
        <td>_id in query params</td>
    </tr>
    <tr>
        <td>POST</td>
        <td>/api/post/create</td>
        <td>Update a post</td>
        <td>{ "title": "Post Title", "description": "Post Description" }</td>
    </tr>
     <tr>
        <td>PUT</td>
        <td>/api/post/update?_id={postId}</td>
        <td>Create a new post</td>
        <td>_id in query params + Body { "title": "New Title", "description": "New Desc" }</td>
    </tr>
     <tr>
        <td>DELETE</td>
        <td>/api/post/delete?_id={postId}</td>
        <td>Delete a post</td>
        <td>_id in query param}</td>
    </tr>
</table>

<h2> How to Use?</h2>
<ol>
    <li>Import the Postman collection.</li>
    <li>Send requests to the provided API endpoints.</li>
    <li>Use the correct request body and query parameters where required.</li>
</ol>
