const Utilities = require('../Utilities');
const User = require('../models/User');
const profileImageBasePath = `${process.env.DOMAIN}/static/profile_images`

class UserController {

	async addUser(req, res) {
		try {
			const doesExist = await User.findOne({ email: req.body.email })
			if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
			const profilePic = await Utilities.uploadImage(req.body.profilePic, 'profile_images')
			const user = new User({ ...req.body, profilePic })
			const savedUser = await user.save()
			let data = {
				id: savedUser._id,
				name: savedUser.name,
				email: savedUser.email,
				skills: savedUser.skills,
				gender: savedUser.gender,
				profilePic: `${profileImageBasePath}/${savedUser.profilePic}`
			}
			Utilities.apiResponse(res, 200, 'User Created Successfully!', data)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async getUser(req, res) {
		try {
			const user = await User.findOne({ _id: req.params.userId })
			let data = {
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				profilePic: `${profileImageBasePath}/${user.profilePic}`
			}
			Utilities.apiResponse(res, 200, 'Get Users Successfully', data)
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
			let updatedUsers = []
			users.docs.map(user => updatedUsers.push({
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				profilePic: `${profileImageBasePath}/${user.profilePic}`
			}))
			const data = {
				users: updatedUsers,
				pagination: {
					"totalDocs": users.totalDocs,
					"limit": users.limit,
					"totalPages": users.totalPages,
					"page": users.page,
				}
			}
			Utilities.apiResponse(res, 200, 'Get Users Successfully', data)
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
			let data = {
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				profilePic: `${profileImageBasePath}/${user.profilePic}`
			}
			Utilities.apiResponse(res, 200, 'User Has Been Updated Successfully', data)
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

module.exports = new UserController(); 
