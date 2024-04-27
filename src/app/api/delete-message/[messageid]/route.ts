import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(req: Request, { params }: { params: { messageid: string } }) {
  // Connect to the database if not already connected
  const messageId = params.messageid
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
  try {
    const updatedResult = await UserModel.updateOne({ _id: user._id },
      {
        $pull: {
          messages: {
            _id: new mongoose.Types.ObjectId(messageId)

          }
        }
      })
      if(updatedResult.modifiedCount == 0){
        return Response.json(
          { success: false, message: "Message not found or already deleted" },
          { status: 404 }
        );
      }else{
        return Response.json(
          { success: true, message: "Message deleted successfully" },
          { status: 200 }
        );
      }
  } catch (error) {
    return Response.json(
      { success: false, message: "Error deleting message" },
      { status: 500 }
    );
  }
}
