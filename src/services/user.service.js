const userModel = require("../models/user");

class UserService {
  async findAll() {
    return await userModel.find();
  }

  async create(user) {
    const newUser = new userModel(user);
    return await newUser.save();
  }

  async findOneByPhoneNumber(phone_number) {
    return await userModel.findOne({ phone_number });
  }

  async findOneById(id) {
    return await userModel.findOne({ _id: id });
  }

  async delete(id) {
    return await userModel.findByIdAndRemove(id);
  }

  async update(id, user) {
    return await userModel.findByIdAndUpdate(id, user, { new: true });
  }
}

const userService = new UserService();

module.exports = userService;
