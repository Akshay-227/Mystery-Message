import dbConnect from "@/lib/dbConnect";
import UserModel from '@/model/User';
import { usernameValidation } from "@/schemas/signupSchema";
import { z } from "zod";

//create query schema
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export const dynamic = 'force-dynamic'
//GET method to check if username is unique - fast process (in FE use debouncing)
export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
        username: searchParams.get("username"),
    }

    //validate with zod
    const result = UsernameQuerySchema.safeParse(queryParams);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameErrors.join(",") || "Invalid query parameters",
        },
        { status: 400 }
      );
    }
    console.log(result)
    const username = result.data.username;
    const exisitingUserVerified = await UserModel.findOne({
        username,
        isVerified: true,
      });
    if (exisitingUserVerified) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
