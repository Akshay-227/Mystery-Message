import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        {
          status: 404,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = user.verifyCodeExpiry > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();
      return Response.json(
        { success: true, message: "User verified successfully" },
        { status: 200 }
      );
    }
    if (!isCodeNotExpired) {
      return Response.json(
        { success: false, message: "Verification code expired" },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      { success: false, message: "Invalid code" },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.log("Error verifying code: ", error);
    return Response.json(
      { success: false, message: "Error verifying code" },
      {
        status: 500,
      }
    );
  }
}
