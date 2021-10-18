const userService = require("../services/user.service");
const STATUS = require("../constants/status");
const bcryptService = require("../services/bcrypt.service");
const jwtService = require("../services/jwt.service");

class AuthController {
  getAllUser = async (_, res) => {
    const users = await userService.findAll();
    return res.status(STATUS.OK).json({ code: STATUS.OK, success: true, message: "Here is users", users });
  };

  register = async (req, res) => {
    const { phone_number, password, name } = req.body;

    // Validate phone_number;
    if (!phone_number) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must be required!" });
    }

    if (phone_number.length !== 10) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must be 10 numbers" });
    }

    if (phone_number[0] != 0) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must begin with 0" });
    }

    // Validate password;
    if (!password || password.length === 0) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Password must be required!" });
    }

    // Validate name
    if (!name || name.length === 0) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Name must be required!" });
    }

    try {
      const user = await userService.findOneByPhoneNumber(phone_number);

      // Check user has already taken
      if (user) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ code: STATUS.BAD_REQUEST, success: false, message: "Phone number has already taken!" });
      }

      // Hash password & stored database
      const passwordHashed = await bcryptService.hash(password);
      const newUser = await userService.create({ phone_number, hash: passwordHashed, name });

      return res.status(STATUS.CREATED).json({
        code: STATUS.CREATED,
        success: true,
        message: "User is created",
        user: { id: newUser._id, phone_number, name: newUser.name },
      });
    } catch (e) {
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ code: STATUS.INTERNAL_SERVER_ERROR, success: false, message: "INTERNAL SERVER ERROR" });
    }
  };

  login = async (req, res) => {
    const { phone_number, password } = req.body;

    // Validate phone_number;
    if (!phone_number) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must be required!" });
    }

    if (phone_number.length !== 10) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must be 10 numbers" });
    }

    if (phone_number[0] != 0) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Phone number must begin with 0" });
    }

    // Validate password;
    if (!password || password.length === 0) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ code: STATUS.FORBIDDEN, success: false, message: "Password must be required!" });
    }

    const user = await userService.findOneByPhoneNumber(phone_number);

    // Check for existing user
    if (!user) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ code: STATUS.UNAUTHORIZED, success: false, message: "Phone number is incorrect" });
    }

    // Check password
    const isMatch = await bcryptService.compare(password, user.hash);
    if (!isMatch) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ code: STATUS.UNAUTHORIZED, success: false, message: "Password is incorrect" });
    }

    // Generate access_token
    const accessToken = jwtService.signAccessToken({ userId: user._id, name: user.name });

    return res.status(STATUS.OK).json({
      code: STATUS.OK,
      success: true,
      message: "Login successfully!",
      accessToken,
    });
  };
}

const authController = new AuthController();

module.exports = authController;
