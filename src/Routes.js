const Utilities = require('./Utilities');
const express = require('express');
const Route = express.Router();

const AuthController = require('./controllers/AuthController');
const CrudController = require('./controllers/CrudController')
const CRUDController1 = require('./controllers/CRUDController1')
/**
 * APIs V1 Routes
 */
Route.route('/')
	.get((req, res) =>
		Utilities.apiResponse(res, 200, 'Create MERN App', {
			By: 'Vijay Pratap Singh',
			postmanCollection: 'https://documenter.getpostman.com/view/9986684/UzJFuJBi'
		}),
	)
	.all(Utilities.send405);

Route.route('/api')
	.get((req, res) => Utilities.apiResponse(res, 200, 'Welcome API'))
	.all(Utilities.send405);

Route.route('/api/v1')
	.get((req, res) => Utilities.apiResponse(res, 200, 'APIs V1'))
	.all(Utilities.send405);

Route.route('/api/v1/login')
	.post(AuthController.login)
	.all(Utilities.send405);

Route.route('/api/v1/signup')
	.post(AuthController.signup)
	.all(Utilities.send405);

Route.route('/api/v1/users/:userId?')
	.post(CrudController.create)
	.get(CrudController.read)
	.put(CrudController.update)
	.delete(CrudController.delete)
	.all(Utilities.send405);

Route.route('/api/v1/user/add')
	.post(CRUDController1.addUser)
	.all(Utilities.send405);

Route.route('/api/v1/user/edit/:userId')
	.put(CRUDController1.updateUser)
	.all(Utilities.send405);

Route.route('/api/v1/user/delete/:userId')
	.delete(CRUDController1.deleteUser)
	.all(Utilities.send405);

Route.route('/api/v1/user/get/:userId')
	.get(CRUDController1.getUser)
	.all(Utilities.send405);

Route.route('/api/v1/user/get-all')
	.get(CRUDController1.getAllUsers)
	.all(Utilities.send405);

module.exports = Route;
