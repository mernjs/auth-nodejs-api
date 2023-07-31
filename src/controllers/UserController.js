const _ = require("lodash")
const fs = require('fs')
const path = require('path')
const Utilities = require('../Utilities');
const User = require('../models/User');
const profileImageBasePath = `${process.env.DOMAIN}/static/profile_images`

class UserController {

	async addUser(req, res) {
		let errors = {}
		if (!req.body.name) {
			errors.name = "Name is required."
		}
		if (!req.body.email) {
			errors.email = "Email is required."
		}
		if (!req.body.password) {
			errors.password = "Password is required."
		}
		if (!req.body.gender) {
			errors.gender = "Gender is required."
		}
		if (!req.body.skills || req.body.skills.lenght === 0) {
			errors.skills = "Skills is required."
		}
		if (!req.body.profilePic) {
			errors.profilePic = "Profile image is required."
		}

		if (!_.isEmpty(errors)) {
			return Utilities.apiResponse(res, 422, "Validation Errors", errors)
		}

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
				createdAt: user.createdAt,
				profilePic: savedUser.profilePic ? `${profileImageBasePath}/${savedUser.profilePic}` : ""
			}
			Utilities.apiResponse(res, 200, 'User Created Successfully!', data)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async getUser(req, res) {
		try {
			if (!req.params.userId) return Utilities.apiResponse(res, 422, "User id is required.")
			const user = await User.findOne({ _id: req.params.userId })
			let data = {
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				createdAt: user.createdAt,
				profilePic: user.profilePic ? `${profileImageBasePath}/${user.profilePic}` : ""
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
				limit: req.query?.limit || 1000,
				// sort: { createdAt: -1 }
			};
			const users = await User.paginate({}, options)
			let updatedUsers = []
			users.docs.map(user => updatedUsers.push({
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				createdAt: user.createdAt,
				profilePic: user.profilePic ? `${profileImageBasePath}/${user.profilePic}` : ""
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
			let errors = {}
			if (!req.body.name) {
				errors.name = "Name is required."
			}
			if (!req.body.email) {
				errors.email = "Email is required."
			}
			if (!req.body.gender) {
				errors.gender = "Gender is required."
			}
			if (!req.body.skills || req.body.skills.lenght === 0) {
				errors.skills = "Skills is required."
			}

			if (!_.isEmpty(errors)) {
				return Utilities.apiResponse(res, 422, "Validation Errors", errors)
			}

			const doesExist = await User.findOne({ email: req.body.email })
			if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
			let profilePic = ""
			if (req.body.profilePic) {
				profilePic = await Utilities.uploadImage(req.body.profilePic, 'profile_images')
			}
			let updateddata = { ...req.body }
			if (profilePic !== "") updateddata = { ...updateddata, profilePic }
			const user = await User.findOneAndUpdate({ _id: req.params.userId }, updateddata)
			if (!user) return Utilities.apiResponse(res, 422, 'User Not Found')
			let data = {
				id: user._id,
				name: user.name,
				email: user.email,
				skills: user.skills,
				gender: user.gender,
				createdAt: user.createdAt,
				profilePic: user.profilePic ? `${profileImageBasePath}/${user.profilePic}` : ""
			}
			Utilities.apiResponse(res, 200, 'User Has Been Updated Successfully', data)
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

	async deleteUser(req, res) {
		try {
			if (!req.params.userId) return Utilities.apiResponse(res, 422, "User ID is required.")
			if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) return Utilities.apiResponse(res, 422, "Invalid user id.")
			const user = await User.findOne({ _id: req.params.userId })
			if (!user) return Utilities.apiResponse(res, 404, "User not found.")
			await User.find({ _id: req.params.userId }).remove().exec();
			if (user.profilePic) {
				const basePath = path.join(__dirname, '..', '..', 'public', 'profile_images', user.profilePic)
				fs.unlinkSync(basePath);
			}
			Utilities.apiResponse(res, 200, 'User Deleted Successfully')
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

}

module.exports = new UserController(); 
