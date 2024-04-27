import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Custom authorize function for Credentials provider.
       * This function is called by NextAuth to authenticate the user.
       *
       * @param credentials Credentials object received from the client
       * @returns User object if credentials are valid, otherwise throws an error
       */
      async authorize(credentials: any): Promise<any> {
        // Connect to MongoDB database
        await dbConnect();
        try {
          // Find a user whose username or email matches the identifier given by the client
          const user = await UserModel.findOne({
            $or: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          });

          // If no user is found, throw an error
          if (!user) {
            throw new Error("User not found");
          }

          // If the user is not verified, throw an error
          if (!user.isVerified) {
            throw new Error("User not verified, please verify your email");
          }

          // Compare the password given by the client with the hashed password stored in the database
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // If the passwords match, return the user object
          if (isPasswordCorrect) {
            return user;
          }

          // Otherwise, throw an error
          throw new Error("Incorrect password");
        } catch (error: any) {
          // If any error occurs during the authorization process, throw an error
          throw new Error(error);
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user?.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },
};
