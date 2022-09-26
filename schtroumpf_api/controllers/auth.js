import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import User from "../models/users.js";
import PasswordRequestToken from "../models/password_reset_tokens.js";





/* créer un compte */

export const signup = async(req, res) => {

	try {

		const user_check = await User.findOne({ email: req.body.email });

		if (user_check) return res.status(200).send({ "message": "Vous êtes déjà inscrit. Veuillez vous connecter pour continuer !" });

		if(!req.body.password) return res.status(404).send("Veuillez entrer un mot de passe pour continuer !");

		const salt = bcrypt.genSaltSync(10);
		const hashed_password = bcrypt.hashSync(req.body.password, salt);
			
		const newUser = new User({ ...req.body, password: hashed_password });

		await newUser.save();

		res.status(200).send({ "message": "Compte créé avec succès !" });

	}
	catch(err) {
		res.status(400).send("Erreur serveur: "+err);
	}
	
}






/* se connecter */

export const signing = async(req, res) => {

	const signing_user = await User.findOne({ email: req.body.email });

	if (!signing_user) return res.status(404).send("Erreur de connexion. Veuillez vérifier vos identifiants de connexion et réessayez !");
	
	const found_account = await bcrypt.compare(req.body.password, signing_user.password);	

	if (!found_account) return res.status(404).send("Erreur de connexion. Veuillez vérifier vos identifiants de connexion et réessayez !");
	
	const token = await jwt.sign({ id: signing_user._id }, process.env.jwt_secret_key);

	res.cookie("access_token", token, { httpOnly: true }).status(200).json(token);

}






/* déconnexion */

export const logout = async(req, res) => {

	/*if (!req.cookies.access_token) return res.status(401).send("Vous êtes déjà déconnecté(e) !");*/

	delete req.cookies.access_token;
    res.status(200).send({ "message": "Déconnexion réussie !" });

}




/* changer de mot de passe */

export const passwordUpdate = async(req, res)=> {

	if (req.params.id != req.logged_user_data.id) return res.status(401).send("Vous n'êtes pas autorisé(e) à changer le mot de passe de cet utilisateur !");

	const current_user = await User.findOne({ _id: req.params.id });

	const old_password_check = await bcrypt.compare(req.body.old_password, current_user.password);

	if (!old_password_check) return res.status(401).send("Veuillez vérifier votre ancien mot de passe et réessayez !");

	const salt = bcrypt.genSaltSync(10);
	const hashed_new_password = await bcrypt.hashSync(req.body.new_password, salt);

	try {
		const updated_password = await User.findByIdAndUpdate(req.params.id, { $set: { password: hashed_new_password } }, { new: true });
			
		res.status(200).send({ "message": "Votre mot de passe a été mis à jour avec succès !" });
	}
	catch(err) {
		res.status(401).send(err);
	}

}






/* demander un nouveau mot de passe */

export const passwordRecoveryRequest = async (req, res)=> {

	const email_check = await User.findOne({ email: req.body.email });

	if (!email_check) return res.status(401).send("Désolé, nous n'arrivons pas à trouver votre compte. Veuillez vérifier votre adresse e-mail et réessayer !");

	const reset_token = crypto.randomBytes(20).toString('hex');

	const passResetToken = new PasswordRequestToken({ user: email_check, token: reset_token })
	await passResetToken.save();

	const transporter = nodemailer.createTransport({
		port: process.env.email_port,
		host: process.env.email_host,
		secure: true,
		auth: {
			user: process.env.email_sender,
			pass: process.env.email_password,
		},
		secure: true,
	});

	const reset_url = process.env.front_end_link+"auth/"+req.body.email+"/"+reset_token

	const mail_message = " Bonjour "+email_check.last_name+",\n\n Nous avons généré un lien de réinitialisation de mot de passe suite à votre demande. Cliquez sur ce lien pour choisir un nouveau mot de passe : "+reset_url+"\n Si cette demande ne vient pas de vous, veuillez nous contacter immédiatement pour prendre les mesures nécessaires. \n\n Cordialement,";

	try {
		await transporter.sendMail({ from: process.env.email_sender, to: req.body.email, subject: 'Password reset', mail_message});
	}
	catch (error) {
		res.status(401).send("Nous n'avons pas réussi à envoyer le lien par e-mail ! \n "+error);
	}

	res.status(200).send("Un lien de réinitialisation du mot de passe a été envoyé à votre adresse électronique enregistrée !");

}






/* Réinitialiser le mot de passe */

export const ResetPassword = async (req, res) => {

	const user = await User.findOne({ email: req.params.email });

	if (!user) return res.status(404).send("Désolé, nous ne pouvons pas trouver votre compte !");

	const password_reset_token_check = await PasswordRequestToken({ user: user, token: req.params.password_reset_token });

	if (!password_reset_token_check) return res.status(404).send("Désolé, nous n'avons pas réussi à vérifier votre jeton de réinitialisation de mot de passe !");

	const salt = bcrypt.genSaltSync(10);
	const hashed_new_password = await bcrypt.hashSync(req.body.new_password, salt);

	try {
		const updated_password = await User.findByIdAndUpdate(user._id, { $set: { password: hashed_new_password } }, { new: true });
			
		res.status(200).send("Votre mot de passe a été mis à jour avec succès !");
	}
	catch(err) {
		res.status(401).send(err);
	}

}

