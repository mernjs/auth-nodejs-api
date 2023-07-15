const Utilities = require('../Utilities');
const User = require('../models/User');

class CrudController {

	async addUser(req, res) {
		try {
			const doesExist = await User.findOne({ email: req.body.email })
			if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
			const user = new User(req.body)
			const savedUser = await user.save()
			let data = {
				_id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
				skills: savedUser.skills,
				gender: savedUser.gender,
			}
			Utilities.apiResponse(res, 200, 'User Created Successfully!', data)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async getUser(req, res) {
		try {
			const user = await User.findOne({ _id: req.params.userId })
			Utilities.apiResponse(res, 200, 'Get Users Successfully', user)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async getAllUsers(req, res) {
		try {
			const options = {
				page: req.query?.page || 1,
				limit: req.query?.limit || 10,
				sort: { createdAt: -1 }
			};
			const users = await User.paginate({}, options)
			Utilities.apiResponse(res, 200, 'Get Users Successfully', users)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async updateUser(req, res) {
		try {
			const doesExist = await User.findOne({ email: req.body.email })
			if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
			const user = await User.findOneAndUpdate({ _id: req.params.userId }, req.body)
			if (!user) return Utilities.apiResponse(res, 422, 'User Not Found')
			Utilities.apiResponse(res, 200, 'User Has Been Updated Successfully', user)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async deleteUser(req, res) {
		try {
			await User.find({ _id: req.params.userId }).remove().exec();
			Utilities.apiResponse(res, 200, 'User Deleted Successfully')
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

}

module.exports = new CrudController(); 
