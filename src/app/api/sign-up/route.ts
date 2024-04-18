import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcyprt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

/**
 * Function to handle the POST request for user sign-up.
 *
 * @param {Request} request - The incoming request object.
 * @return {Promise<Response>} Promise that resolves once the sign-up process is complete.
 */
export async function POST(request: Request): Promise<Response> {
  // Connect to MongoDB
  await dbConnect();

  // Deconstruct the request body
  const { username, email, password } = await request.json();

  // Check if a user with the same username already exists and is verified
  const existingUserVerifiedByUsername = await UserModel.findOne({
    username,
    isVerifed: true,
  });

  // If a user with the same username exists and is verified, return an error response
  if (existingUserVerifiedByUsername) {
    return Response.json(
      {
        success: false,
        message: "Username already exists",
      },
      { status: 400 }
    );
  }

  // Check if a user with the same email already exists
  const existingUserByEmail = await UserModel.findOne({
    email,
  });

  // If a user with the same email exists, assign the verification code and expiry date to it
  // Otherwise, create a new user
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  if (existingUserByEmail) {
    if (existingUserByEmail.isVerifed) {
      return Response.json(
        {
          success: false,
          message: "Email already exists",
        },
        {
          status: 400,
        }
      );
    } else {
      const hashedPassword = await bcyprt.hash(password, 10);
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.verifyCode = verifyCode;
      existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
      await existingUserByEmail.save();
    }
  } else {
    const hashedPassword = await bcyprt.hash(password, 10);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      verifyCode: verifyCode,
      verifyCodeExpiry: expiryDate,
      isVerifed: false,
      isAcceptingMessage: true,
      messages: [],
    });
    await newUser.save();
  }

  // Send verification email
  const emailResponse = await sendVerificationEmail(
    email,
    username,
    verifyCode
  );

  // If there is an error sending the verification email, return an error response
  if (!emailResponse.success) {
    return Response.json(
      {
        success: false,
        message: emailResponse.message,
      },
      { status: 500 }
    );
  }

  // Return a success response if the user is created/updated successfully
  return Response.json(
    {
      success: true,
      message: "User registered successfully. Please verify your email",
    },
    { status: 201 }
  );
}
