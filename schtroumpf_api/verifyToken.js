import jwt from "jsonwebtoken";

export const tokenVerification = async (req, res, next) => {
	
	let token = req.cookies.access_token;

	if ((token == undefined)||(token == 'undefined')) {

		const authHeader = req.headers.authorization;

		if (authHeader != undefined) {

			const bearer = authHeader.split(' ');
			token = bearer[1].replaceAll('"', '');;
		}
	}

	if(!token) return res.status(401).send({ "message": "Veuillez vous connecter pour continuer !" });

	await jwt.verify(token, process.env.jwt_secret_key, (err, logged_user) => {

		if(!token) return res.status(403).send({ "message": "Veuillez vous connecter pour continuer !" });

		req.logged_user_data = logged_user;

	});

	next();

}
