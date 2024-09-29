broken access control:
routes/app.js 
	line 42-router.get('/admin/usersapi', authHandler.isAuthenticated, appHandler.listUsersAPI)
	line 43:   router.get('/admin/users', authHandler.isAuthenticated, function(req, res){

this function does not check for the role of the requesting user , whether its an admin or not , where as this functionality is only available to admin
fix:
1.authandler.js line 15 . create a new function
module.exports.isAdmin = function (req, res, next){
    if(req.user.role=='admin')
        next()
    else
        res.status(401).send('Unauthorized')
}

#
appHandler 164 
- anyone can change any user's password if they know their id. attackers can change the id parameters using burp suite or any other similar tools .
db.User.find({
		where: {
			'id': req.body.id
		}		
	}).then(user =>{
if(req.body.password.length>0){
			
			if(req.body.password.length>0){
				if (req.body.password == req.body.cpassword) {
					user.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null)
				}else{
					req.flash('warning', 'Passwords dont match')
					res.render('app/useredit', {
						userId: req.user.id,
						userEmail: req.user.email,
						userName: req.user.name,
					})
					return		
				}


fix :
1. added an additional form item in the frontend to get the old password from the user. 
view/useredit.ejs-- line 47
-introduce a form input field to collect old user password
<div class="form-group ">
                        <label class="  control-label" for="editUser_passwordConfirmation">Old password </label>
                        <div class="  controls">

                            <input type="password" name="opassword" id="editUser_Oldpassword" class="form-control" placeholder="Enter Old password " />
                        </div>
                    </div>

2.appHandler.js line 166
- here server finds the user data using id generated using session cookie , so that user cannot manipulate another user's password by changing the req.body.id using tools like burp suite
-Also, the old password provided by the user is hashed and matched with the hash of the old password used in the database and if it matches, password change would be allowed
- also, rather than finding the user using the id parameter provided in the req.body.id, the user is found using the id present in the session cookie which cannot be manipulated like the other
db.User.find({
		where: {
			'id': req.user.id
		}	
appHandler.js line 170 
-compare old password provided by the user with old password retrieved from the database ,if true , password change would be allowed .
module.exports.userEditSubmit = function (req, res) {
	console.log(req.body)
	db.User.find({
		where: {
			'id': req.body.id
		}		
	}).then(user =>{
		if(req.body.password.length>0){
			const passwordMatches = bCrypt.compareSync(req.body.opassword, user.password);
			if(req.body.password == req.body.cpassword){
				if (passwordMatches) {
					user.password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null)
				}else{
					req.flash('warning', 'Invalid Old Password')
					res.render('app/useredit', {
					userId: req.user.id,
					userEmail: req.user.email,
					userName: req.user.name,
					
					})
					return		
				}
			}else{
				req.flash('warning', 'Passwords dont match')
					res.render('app/useredit', {
						userId: req.user.id,
						userEmail: req.user.email,
						userName: req.user.name,
				})
				return
			}
		}else{
			req.flash('warning','password legth should be longer than 0')
			res.render('app/useredit', {
				userId: req.user.id,
				userEmail: req.user.email,
				userName: req.user.name,
			})
			return
		}
		user.email = req.body.email
		user.name = req.body.name
		user.save().then(function () {
			req.flash('success',"Updated successfully")
			res.render('app/useredit', {
				userId: req.body.id,
				userEmail: req.body.email,
				userName: req.body.name,
			})
		})
	})
}
