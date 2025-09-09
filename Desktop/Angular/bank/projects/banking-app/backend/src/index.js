import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/schema.js";
import { authMiddleware } from "./Middleware/auth.js";

dotenv.config();
const app = express();

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    });
  })
  .catch((err) => console.error("MongoDB error:", err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();

  app.use(
    "/graphql",
    cors(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        authMiddleware(req, res, () => {});
        return { user: req.user };
      },
    })
  );
};

startServer();
