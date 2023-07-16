const Utilities = require('../Utilities');
const User = require('../models/User');
const fs = require('fs')
const path = require('path')

const profileImageBasePath = 'http://localhost:8080/static/profile_images'

function getImageExtension(base64Data) {
	const dataUrlRegex = /^data:image\/(\w+);base64,/;
	const match = base64Data.match(dataUrlRegex);
	if (match && match[1]) {
		return match[1];
	}
	return null;
}

const uploadImage = async (base64image) => {
	return new Promise((resolve, reject) => {
		var matches = base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
			response = {};
		if (matches.length !== 3) {
			reject('Invalid input string')
			return;
		}
		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');
		let decodedImg = response;
		let imageBuffer = decodedImg.data;
		let fileName = `profile_pic_${Math.floor(Date.now() / 1000)}.${getImageExtension(base64image)}`;
		try {
			const folderPath = path.resolve("public", "profile_images", fileName);
			fs.writeFileSync(folderPath, imageBuffer, 'utf8');
			resolve(fileName)
		} catch (e) {
			reject(e);
		}
	})
}

class CrudController {

	async addUser(req, res) {
		try {
			const doesExist = await User.findOne({ email: req.body.email })
			if (doesExist) return Utilities.apiResponse(res, 422, 'Email is already been registered')
			const profilePic = await uploadImage(req.body.profilePic)
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

module.exports = new CrudController(); 
