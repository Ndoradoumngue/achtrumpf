import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import AuthRoute from "./routes/auth.js";
import UsersRoute from "./routes/user.js";

const app = express();
dotenv.config();

const connect = () => {
	mongoose.connect(process.env.db_connection_string).then(() => {
		console.log('Connexion à mongodb réussie!');
	}).catch((err) => {
		throw err;
	})
}

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use((err, req, res, next)=> {
	const status = err.status || 500;
	const message = err.message || "Erreur de serveur";

	res.status(status).json({
		status: status,
		message: message
	})
})

app.use("/api/auth", AuthRoute);
app.use("/api/users", UsersRoute);

app.listen(8800, () => {
	connect();
	console.log('Application lancée!');
});
