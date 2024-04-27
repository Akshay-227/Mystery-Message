import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

/**
 * Updates a user's message accepting status
 *
 * ## Endpoint
 * `POST /api/accept-messages`
 *
 * ## Params
 * *None*
 *
 * ## Authentication
 * Must be authenticated to access this endpoint.
 *
 * ## Response
 * * `success: boolean` - whether the status update was successful
 * * `message: string` - a message describing the result of the status update
 * * `updatedUser: User` - the updated user record
 *
 * ## Errors
 * * `401 Unauthorized` - if not authenticated
 * * `401 Unauthorized` - if user not found
 * * `500 Internal Server Error` - if there was an error updating the user status
 */
export async function POST(request: Request) {
  // Connect to the database if not already connected
  await dbConnect();
  // Get the authenticated user session
  const session = await getServerSession(authOptions);
  // If no session or no user, return 401 unauthorized
  const user = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  // Get the user's ID from the session and parse it as a string
  const userId = user._id?.toString();
  // Get the new message accepting status from the request body
  const { isAcceptingMessages } = await request.json();
  // Try to update the user with the new message accepting status
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages },
      { new: true }
    );
    // If the user was updated, return a success response
    if (updatedUser) {
      return Response.json(
        {
          success: true,
          message: "Message accepting status updated",
          updatedUser,
        },
        { status: 200 }
      );
    }
    // If the user was not updated, return a 401 unauthorized error
    return Response.json(
      { success: false, message: "Failed to update user status" },
      { status: 401 }
    );
  } catch (error) {
    // Log the error and return a 500 internal server error
    console.log("Failed to update user status to accepting messages: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accepting messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // Connect to the database if not already connected
  await dbConnect();
  // Get the authenticated user session
  const session = await getServerSession(authOptions);
  // If no session or no user, return 401 unauthorized
  const user = session?.user as User;
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  // Get the user's ID from the session and parse it as a string
  const userId = user._id?.toString();
  // Try to find the user with the given ID
  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User found",
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error and return a 500 internal server error
    console.log("Failed to find user: ", error);
    return Response.json(
      { success: false, message: "Failed to find user" },
      { status: 500 }
    );
  }
}
