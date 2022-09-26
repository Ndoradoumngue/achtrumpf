import User from "../models/users.js";




/* liste des utilisateurs */

export const usersList = async(req, res)=>{

	const filter = {};

	const users_list = await User.find(filter);

	res.status(200).json(users_list);
}






/* voir un utilisateur */

export const userDetails = async(req, res)=> {

	const returned_user = await User.findById(req.params.id);

	if (!returned_user) return res.status(404).send("Désolé, nous n'avons pas réussi à trouver le compte demandé !");
	
	res.status(200).json(returned_user);
}






/* mettre à jour des données de l'utilisateur */

export const userUpdate = async(req, res)=> {

	const user_to_update_user = await User.findOne({ _id: req.params.id });

	if (!user_to_update_user) return res.status(404).send("Désolé, nous n'avons pas réussi à trouver le compte à mettre à jour !");

	if (req.logged_user_data.id != req.params.id) return res.status(401).send("Désolé, vous n'êtes pas autorisé à mettre à jour ce compte !");

	const updated_user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

	res.status(200).json(updated_user);

}






/* ajouter un(e) ami(e) */

export const addFriend = async(req, res)=> {

	const user_to_add = await User.findOne({ _id: req.params.id });

	if (!user_to_add) return res.status(404).send({ "message": "Désolé, nous n'avons pas réussi à trouver le compte à ajouter comme ami !" });

	if (req.logged_user_data.id === req.params.id) return res.status(401).send({ "message": "Vous ne pouvez pas vous ajouter vous-même comme ami !" });

	const current_user = await User.findOne({ _id: req.logged_user_data.id });

	if (current_user.friends.includes(req.params.id)) return res.status(401).send({ "message": "Vous êtes déjà amis !" });

	await current_user.updateOne( { $push: { friends: req.params.id } });
	await user_to_add.updateOne( { $push: { friends: req.logged_user_data.id } });

	const current_user_new_data = await User.findById(req.logged_user_data.id);

	res.status(200).json(current_user_new_data);

}







/* retirer un(e) ami(e) */

export const removeFriend = async(req, res)=> {

	const friend_to_remove = await User.findOne({ _id: req.params.id });

	if (!friend_to_remove) return res.status(404).send({ "message": "Désolé, nous n'avons pas réussi à trouver le compte ami à retirer !" });
	
	const current_user = await User.findOne({ _id: req.logged_user_data.id });

	if (!current_user.friends.includes(req.params.id)) return res.status(401).send({ "message": "Vous n'êtes pas amis !" });

	await current_user.updateOne( { $pull: { friends: req.params.id } });
	await friend_to_remove.updateOne( { $pull: { friends: req.logged_user_data.id } });

	const current_user_new_data = await User.findById(req.logged_user_data.id);

	res.status(200).json(current_user_new_data);

}

