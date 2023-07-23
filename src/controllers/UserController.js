const Utilities = require('../Utilities');
const User = require('../models/User');
const profileImageBasePath = `${process.env.DOMAIN}/static/profile_images`

// Function to handle the file input change event
function handleFileInputChange(event) {
	const file = event.target.files[0]; // Get the selected file
	const maxSizeInBytes = 5 * 1024 * 1024; // Maximum file size in bytes (e.g., 5MB)

	// Check if the file size exceeds the limit
	if (file.size > maxSizeInBytes) {
		alert('File size exceeds the limit. Please choose a smaller file.');
		event.target.value = ''; // Reset the file input value to clear the selection
	} else {
		// The file size is within the limit, you can proceed with uploading or further processing
		// Your code here...
	}
}

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
			await User.find({ _id: req.params.userId }).remove().exec();
			Utilities.apiResponse(res, 200, 'User Deleted Successfully')
		} catch (error) {
			Utilities.apiResponse(res, 500, error)
		}
	}

}

module.exports = new UserController(); 
