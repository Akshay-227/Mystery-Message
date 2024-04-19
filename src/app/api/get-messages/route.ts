import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

/**
 * Gets a user's message status
 *
 * ## Endpoint
 * `GET /api/get-messages`
 *
 * ## Params
 * *None*
 *
 * ## Authentication
 * Must be authenticated to access this endpoint.
 *
 * ## Response
 * * `success: boolean` - whether the user was found successfully
 * * `message: string` - a message describing the result of the query
 * * `isAcceptingMessage: boolean` - whether the user is accepting messages
 *
 * ## Errors
 * * `401 Unauthorized` - if not authenticated
 * * `401 Unauthorized` - if user not found
 * * `500 Internal Server Error` - if there was an error querying the database
 */
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
  const userId = new mongoose.Types.ObjectId(user._id);
  // Try to find the user with the given ID
  try {
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: {
          "messages.createdAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
    ]);

    if(!user || user.length===0) { 
         return Response.json(
           { success: false, message: "User not found" }, {status: 404}
         )
    }
    return Response.json(
      { success: true, messages: user[0].messages, message: "User found" },
    )
  } catch (error) {
    // Log the error and return a 500 internal server error
    console.log("Failed to find user: ", error);
    return Response.json(
      { success: false, message: "Failed to find user" },
      { status: 500 }
    );
  }
}
