const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs')
const path = require('path')
const filePath = path.join('db.json')
const data = fs.readFileSync(filePath, "utf-8");
const db = JSON.parse(data);
const router = jsonServer.router(db)
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(jsonServer.rewriter({
    '/ims/api/users': '/users',
    '/ims/api/users/:id': '/users/:id',
}));
// Function to write changes back to db.json
const writeDbToFile = (db) => {
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
};
router.render = (req, res) => {
    const method = req.method;
    const resource = 'user';
    if (method === 'POST' && res.statusCode === 201) {
        db.users.push(res.locals.data);  // Update in-memory database
        writeDbToFile(db);
        res.jsonp({
            message: `${resource.charAt(0).toUpperCase() + resource.slice(1)} created successfully`,
            // data: res.locals.data
        });
    } else if (method === 'PUT' && res.statusCode === 200) {
        // Update record in db
        const index = db.users.findIndex(user => user.id === res.locals.data.id);
        if (index !== -1) {
            db.users[index] = res.locals.data;
            writeDbToFile(db);  // Write changes to file
        }
        res.jsonp({
            message: `${resource.charAt(0).toUpperCase() + resource.slice(1)} updated successfully`,
            // data: res.locals.data
        });
    } else if (method === 'DELETE' && res.statusCode === 200) {
        const id = parseInt(req.params.id, 10);
        db.users = db.users.filter(user => user.id !== id);  // Remove from db
        writeDbToFile(db);
        res.jsonp({
            message: `${resource.charAt(0).toUpperCase() + resource.slice(1)} deleted successfully`,
        });
    } else {
        res.jsonp({
            users: res.locals.data,
        });
    }
    if (res.statusCode === 404) {
        res.status(404).jsonp({
            message: `${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`
        });
    }
};
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running');
});
module.exports = server;