injection:

        1.SQL injection
        apphandler .js :line 10	var query = "SELECT name,id FROM Users WHERE login='" + req.body.login + "'";
                        ->This line concatenates user input to the query . this results in treating user input as part of the query,executed with the original query.
                         eg: if we provide ' UNION SELECT password,1 from Users where login=' ' OR '1'='1' -- // in the input, we will get a hashed password of the user with id=1
                        ->fix:
                        const values = [req.body.login];
                        var query = "SELECT name,id FROM Users WHERE login=?";
                        console.log(values)
                        db.sequelize.query(query, {
                                model: db.User,
                                replacements: values

        2. command injection:
        apphandler.js :line 43 : exec('ping -n 2 ' + req.body.address, function (err, stdout, stderr) {
        		-> This line directly concatenates user input the ping command . also the function exec() is a 	module which is used to run shell command , so this directly executes command as if its directly run in the shell
                          eg: if we provide "1.1.1.1&&dir" in the input field , the system will provide all files and folders in the pwd.
        		->fix :
        			1. sanitize user input only to include safe characters , in this case , ip addresses.
        			2. instead of using exec() module use others which doesn't spawn a shell , so that users cannot provide shell command , rather treat user input as binary like execFile
                        ->solution:
                		 const address = req.body.address;
                    		if (net.isIP(address)) {
                	                execFile('ping', ['-n', '2', address], function (err, stdout, stderr) {
                		        output = stdout + stderr
                		        console.log(output)
                		        res.render('app/ping', {
                			output: output
                		        })
                	        })
                	        }
                	        else{
                		        output="invalid input"
                		        console.log(output)
                		        res.render('app/ping', {
                			output: output
                		        })
                	        }
        
