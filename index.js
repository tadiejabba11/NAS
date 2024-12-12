
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const crypto = require('crypto');
const session = require('express-session');
const connection = require('./connection');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, connection);
app.set("views", path.join(__dirname, "views")); 
app.set('view engine', 'ejs');
app.use(session({
   key: 'session_cookie_name', 
   secret: 'session_cookie_secret', 
   store: sessionStore,
   resave: false, 
   saveUninitialized: false, 
   cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day }));
})
)
// Your other middleware (e.g., body-parser)
app.use(express.urlencoded({ extended: true }));
const moment = require('moment');
const multer = require('multer');
app.use('/public', express.static(path.join(__dirname, 'Public')));

const storage = multer.diskStorage({
  destination: './Public/Images/Uploaded_Images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1E9); // Generate a unique suffix
    const fileExtension = path.extname(file.originalname);
    const src =
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
}); // In-memory storage for demonstration
const upload = multer({ storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON bodies
app.set('view engine', 'ejs');
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));


function isAuthenticated(req, res, next) { if (req.session && (req.session.isLoggedIn || req.session.userType)) { return next(); // User is authenticated, proceed to the next middleware/route handler 
} else { res.redirect('/login'); // User is not authenticated, redirect to the login page
   } }
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send("Error logging out.");
      }
      // Redirect to login page
      res.redirect('/login');
  });
});

app.get('SignUp', (req, res) => {
  res.render('signup');
});
app.get('/login', (req, res) => {
  res.render('login')
});
app.get('/Anonymous', (req,res)=>{
    res.render('Anonymous')
}

)
app.get('/Programs_Desk', isAuthenticated,(req,res)=>{
  res.render('Programs_Desk')
})
app.get('/Requests', (req,res)=>{
    res.render('Requests')
})
app.get('/SignUp',(req,res)=>{
  res.render('SignUp')
})

app.get('/Personal',(req,res)=>{

  var RegNo = req.query.RegNo;
  res.render('Personal', { RegNo: RegNo });
})
app.get('/Personal2',(req,res)=>{
 
  var RegNo = req.query.RegNo;
  res.render('Personal2', { RegNo: RegNo });
})
app.get('/MoreInfo',(req,res)=>{
  res.render('MoreInfo')
})


app.get('/Contact_Us', (req,res)=>{
  res.render('Contact_Us')
})
app.post('/SignUp', (req, res) => {
  const Fullname = req.body.Fullname; // Get the full name from the request body
  const Email = req.body.Email; // Get the Email from the request body
  const Password = req.body.Password;

  function generateID() {
    // Generate a random 8-digit hexadecimal string
    const randomDigits = crypto.randomBytes(4).toString('hex');

    // Construct the ID with the desired format
    const id = `nas${randomDigits}s`;

    return id;
  }

  const generatedID = generateID();
  const RegNo = generatedID;

  connection.getConnection((error, connection) => {
    if (error) {
      console.error('Error getting connection:', error);
      res.status(500).send("Database connection error.");
      return;
    } else {
      const sql = "INSERT INTO Users (Fullname, Email, RegNo, Password) VALUES (?, ?, ?, ?)";
      connection.query(sql, [Fullname, Email, RegNo, Password], (error, result) => {
        // Ensure the connection is released back to the pool
        connection.release();

        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send("Query execution error.");
        } else {
          res.redirect('/Personal2?RegNo=' + RegNo);
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  const Email = req.body.Email;
  const Password = req.body.Password;
  
  // Check for Secretary credentials first
  if (Email === 'NasSecretary@gmail.com' && Password === 'S3C@nas2024') {
    req.session.isLoggedIn = true; 
    req.session.userType = 'Secretary';
    return res.redirect('/Secretary');
  }
  if (Email === 'NasProgramsDesk@gmail.com' && Password === 'Prog@546!!') {
    req.session.isLoggedIn = true; req.session.userType = 'Programs_Desk';
    return res.redirect('/Programs_Desk');
  }
  if (Email === 'NASPRO@gmail.com' && Password === '@NA$PRO2024') {
     req.session.isLoggedIn = true; req.session.userType = 'PROs_Desk'
    return res.redirect('/PROs_Desk');
  }
  if (Email === 'NASDLD@gmail.com' && Password === 'DLD@NAS#123') {
    req.session.isLoggedIn = true; req.session.userType = 'DLDs_Desk';
    return res.redirect('/DLDs_Desk');
  }

  connection.getConnection((error,connection) => {
    if (error) {
      throw error;
    } else {
      const sql = "SELECT * FROM users WHERE Email = ? AND Password = ?";
      connection.query(sql, [Email, Password], (error, result) => {
        connection.release();
        if (error) {
          throw error;
        }
      

        if (result.length > 0) {
          // Store RegNo in session
          req.session.RegNo = result[0].RegNo;  // Save RegNo in session
          res.redirect('/UserPage');  // Redirect to UserPage
        } else {
          res.redirect('/login');
        }
      });
    }
  });
});


app.post('/Personal2', upload.single('Image'), (req, res) => {
  var RegNo = req.body.RegNo;
  var DOB = req.body.DOB;
   var Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
   var Gender=req.body.Gender;
  connection.getConnection((error,connection) => {
    if (error) {
      throw error
    }
    else {
      var sql = "INSERT INTO personal2(RegNo,DOB,Image,Gender)values(?,?,?,?)";
      connection.query(sql, [RegNo,DOB,Image,Gender], (error, result) => {
        connection.release();
        if (error) {
          throw error
        }
        else {
          res.redirect('/Personal?RegNo=' + RegNo)
        }
       
      })
    }
  })


});
app.post('/Personal', (req, res) => {
 
  var RegNo = req.body.RegNo;
  var Programme = req.body.Programme;
  var Phone_No = req.body.Phone_No;
  var Level=req.body.Level;
  var Address=req.body.Address
  connection.getConnection((error,connection) => {
    if (error) {
      throw error
    }
    else {
      var sql = "INSERT INTO personal(Level, RegNo,Programme,Phone_No,Address)values(?,?,?,?,?)";
      connection.query(sql, [Level, RegNo,Programme,Phone_No,Address], (error, result) => {
        connection.release();
        if (error) {
          throw error
        }
        else {
          res.redirect('/login')
        }
       
      })
    }
  })


});

       
  
  
app.get('/', (req, res) => {
  connection.getConnection((error, connection) => {
    if (error) {
      console.log(error);
      res.status(500).send("Database connection error.");
    } else {
      // Modify SQL to fetch only the latest flyer
      const SQl = "SELECT * FROM flyers ORDER BY ID_No DESC LIMIT 1";
      connection.query(SQl, (error, result) => {
        connection.release(); // Ensure the connection is released back to the pool

        if (error) {
          console.log(error);
          res.status(500).send("Query execution error.");
        } else {
          res.render('HomePage', { flyer: result });
        }
      });
    }
  });
});



app.post('/Anonymous',(req,res)=>{
    var Anonymous_text=req.body.Anonymous_text;
    connection.getConnection((error,connection) => {
        if (error) {
          throw error
        }
        else {
          var sql = "INSERT INTO anonymous(Anonymous_text)values(?)";
          connection.query(sql, [Anonymous_text], (error, result) => {
            connection.release();
            if (error) {
              throw error
            }
            else {
              res.redirect('Anonymous')
            }
          })
        }
      })
})
app.post('/Requests',(req,res)=>{
    var Request=req.body.Request;
    connection.getConnection((error,connection) => {

        if (error) {
          throw error
        }
        else {
          var sql = "INSERT INTO prayer_requests(Request)values(?)";
          connection.query(sql, [Request], (error, result) => {
            connection.release();
            if (error) {
              throw error
            }
            else {
             res.redirect('Requests')
            }
          })
        }
      })
})

app.get('/PROs_Desk', isAuthenticated, async (req, res) => {
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error)
    }
    else {

     var SQl= "SELECT * from anonymous";
      connection.query(SQl, (error, result) => {
        connection.release();
        if (error) 
        throw (error)
          else {
            res.render('PROs_Desk', { anonymous: result });
          }
        


      })

    }
  })
});

app.post('/PROs_Desk', upload.single('Image'), (req, res) => {

   var Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
 
  connection.getConnection((error,connection) => {
    if (error) {
      throw error
    }
    else {
      var sql = "INSERT INTO flyers(Image)values(?)";
      connection.query(sql, [Image], (error, result) => {
        connection.release();
        if (error) {
          throw error
        }
        else {
          res.redirect('/')
        }
      })
    }
  })
})




app.get('/DLDs_Desk', isAuthenticated, async (req, res) => {
    connection.getConnection((error,connection) => {
      if (error) {
        console.log(error)
      }
      else {
  
       var SQl= "SELECT * from prayer_requests";
        connection.query(SQl, (error, result) => {
          connection.release();
          if (error) 
          throw (error)
            else {
              res.render('DLDs_Desk', { requests: result });
            }
          
  
  
        })
  
      }
    })
  });

  app.get('/Secretary', isAuthenticated, (req, res) => { connection.getConnection((error, connection) => {
     if (error) { console.log(error); res.status(500).send("Database connection error.");

      } else {
         var sql2 = "SELECT users.RegNo, users.Fullname, personal2.Gender FROM users JOIN personal2 ON users.RegNo = personal2.RegNo"; 
         var SQl = "SELECT personal.Phone_No FROM personal JOIN users ON users.RegNo = personal.RegNo"; 
         connection.query(SQl, (error, result1) => { 
          if (error) { console.log(error); connection.release(); res.status(500).send("Query execution error."); 
    return; } connection.query(sql2, (error, result) => {
       connection.release(); // Ensure the connection is released back to the pool 
  if (error) { 
    console.log(error); 
    res.status(500).send("Query execution error."); 
  } else { res.render('Secretary', { Users: result, Phone_No: result1 });
 } 
}); 
}); 
}
 });
 });

app.post('/Secretary', (req, res) => {
  const Fullname = req.body.Fullname;
  const Gender = req.body.Gender;

  connection.getConnection((error, conn) => {
    if (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    } else {
      // Base query
      let SQl = `
        SELECT users.RegNo, users.Fullname, personal2.Gender 
        FROM users 
        JOIN personal2 ON users.RegNo = personal2.RegNo 
        WHERE 1=1`;
      let params = [];

      // Add conditions based on provided inputs
      if (Fullname) {
        SQl += ' AND Fullname LIKE ?';
        params.push(`%${Fullname}%`);
      }
      if (Gender) {
        SQl += ' AND Gender LIKE ?';
        params.push(`%${Gender}%`);
      }

      const SQL = `
        SELECT personal.Phone_No 
        FROM personal 
        JOIN users ON users.RegNo = personal.RegNo`;

      // First query
      conn.query(SQl, params, (error, result) => {
        if (error) {
          console.log(error);
          res.status(500).send("Internal Server Error");
        } else {
          // Second query
          conn.query(SQL, (error, result1) => {
            if (error) {
              console.log(error);
              res.status(500).send("Internal Server Error");
            } else {
              res.render('Secretary', { Users: result, Phone_No: result1 });
            }
            conn.release(); // Release the connection
          });
        }
      });
    }
  });
});




app.get('/birthdays',(req,res)=>{
  connection.getConnection((error,connection) => {
  if (error) {
    console.log(error)
  }
  else {

  var SQl = "SELECT users.Fullname,personal2.Image FROM users join personal2 on users.RegNo=personal2.RegNo WHERE DATE_FORMAT(DOB,'%m-%d')= DATE_FORMAT(CURDATE(), '%m-%d')";
    connection.query(SQl, (error, result1) => {
      connection.release()
      if (error) 
      throw (error)
      res.render('birthdays', { Birthdays: result1 });
})

  }
})
});

app.get('/Search',(req,res)=>{
Fullname=req.query.Fullname;
connection.getConnection((error,connection) => {
  if (error) {
    console.log(error)
  }
  else {

  var SQl = "SELECT users.RegNo,users.Fullname,personal2.Image FROM users join personal2 on users.RegNo=personal2.RegNo where Fullname like '%"+ Fullname +"%'";
    connection.query(SQl, (error, result1) => {
      connection.release()
      if (error) 
      throw (error)
      res.render('Search', { Search: result1 });
})

  }
})
})

app.post('/Secretary', (req,res)=>{
  const RegNo = req.body.RegNo;
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error);
    } else {
      var Sql="select Fullname from users"
      var sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";
      connection.query(sql, [RegNo], (error, result) => {
        connection.release()
        if (error) throw (error)
        connection.query(Sql, [RegNo],(error, result1) =>{
          connection.release()
          if (error)
            throw error
          else{
            res.render('SecViewMore', { Personal: result[0], Name: result1[0]});
          }
        })
      
      });
    }
  });

})




app.post('/Programs_Desk',(req,res)=>{
  var Day=req.body.Day;
  var Date=req.body.Date;
  var Month=req.body.Month;
  var Activity=req.body.Activity;
  connection.getConnection((error,connection) => {
      if (error) {
        throw error
      }
      else {
        var sql = "INSERT INTO programs_desk(Activity,Day,Date,Month)values(?,?,?,?)";
        connection.query(sql, [Activity,Day,Date,Month], (error, result) => {
          connection.release()
          if (error) {
            throw error
          }
          else {
            res.redirect('/Events_Calender')
          }
        })
      }
    })
})

app.get('/Events_Calender',(req,res)=>{
  Month=req.query.Month;
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error)
    }
    else {
  
    var SQl = "SELECT * FROM programs_desk where month=?";
      connection.query(SQl,[Month], (error, result) => {
        connection.release()
        if (error)
        throw (error)
        res.render('Events_Calender', { Event: result});
  })
  
    }
  })
  })

  app.get('/UserPage', (req, res) => {
    const RegNo = req.session.RegNo;
    if (!RegNo) {
      return res.redirect('/login');  // Redirect to login if no session
    }

  
    connection.getConnection((error,connection) => {
      if (error) {
        console.log(error);
      } else {
        var Sql="select Fullname from users"
        var sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";
        connection.query(sql, [RegNo], (error, result) => {
          connection.release()
          if (error) throw (error)
          connection.query(Sql, [RegNo],(error, result1) =>{
            connection.release()
            if (error)
              throw error
            else{
              res.render('UserPage', { Personal: result[0], Name: result1[0]});
            }
          })
        
        });
      }
    });
  });
  

app.get('/Exec',(req,res)=>{
  var Year=req.query.Year;
 connection.getConnection((error,connection) => {
   if (error) {
     console.log(error)
   }
   else {
 
    var SQl="SELECT Name, Position, Image FROM exec WHERE Year = ? ORDER BY ID_NO;" 
     
     connection.query(SQl,[Year], (error, result) => {
      connection.release()
       if (error)
       throw (error)
      res.render('Exec',{Executive:result})
 })
 
   }
 })
})



  
app.post('/Update', upload.single('Image'), (req, res) => {
   let Image; if (req.file) { Image = `Public/Images/Uploaded_Images/${req.file.filename}`; }
    else { Image = req.body.Image2; // Use the existing image if no new image is uploaded 
      } 
      const Phone_No = req.body.Phone_No; 
      const Address = req.body.Address; 
      const Level = req.body.Level; 
      const RegNo = req.body.RegNo; 
      connection.getConnection((error,connection) => {
         if (error) {
           throw error; } else {
             const sql = "UPDATE personal SET `Phone_No`=?, `Level`=?, `Address`=? WHERE RegNo=?";
              const SQL = "UPDATE personal2 SET `Image`=? WHERE RegNo=?"; 
              connection.query(sql, [Phone_No, Level, Address, RegNo], (error, result) => {
                connection.release()
                 if (error) { throw error; } 
                 else { connection.query(SQL, [Image, RegNo], (error, result) => {
                  connection.release() 
                  if (error) { throw error; } 
                  else { res.redirect(`/Update?RegNo=${RegNo}`); // Redirect to the specific profile page
                   } }); } }); } })});

app.get('/Update', (req, res) => {
  var RegNo = req.query.RegNo;
  connection.getConnection((error,connection) => {
      if (error) {
          console.log(error);
      } else {
          var SQL = "SELECT * from personal where RegNo=?";
          var Sql="select * from personal2 where RegNo=?"
          connection.query(SQL, [RegNo], (error, result) => {
            connection.release()
              if (error) {
                  throw (error);
              }
                  connection.query(Sql, [RegNo], (error, result1) => {
                    connection.release()
                    if (error) {
                        throw (error);
                    }
                    if (result.length > 0) {
                        res.render('Update', { Update: result[0], ImageUpdate:result1[0],RegNo  });
              } else {
                  console.log("No data found for RegNo:", RegNo);
                 
              }
          });
      }
    )}
  });
});

app.get('/ViewMore', (req, res) => {
  var RegNo = req.query.RegNo;
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error);
    } else {
      var sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";
      connection.query(sql, [RegNo], (error, result) => {
        connection.release()
        if (error) throw error;
        
        console.log(result); // Log the result to check the data
        
        if (result.length > 0) {
          res.render('ViewMore', { Personal: result[0] });
        } else {
          res.send('No records found');
        }
      });
    }
  });
});

app.get('/SecViewMore',(req,res)=>{
  const RegNo=req.query.RegNo;


  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error);
    } else {
      var Sql="select Fullname from users"
      var sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";
      connection.query(sql, [RegNo], (error, result) => {
        connection.release()
        if (error) throw (error)
        connection.query(Sql, [RegNo],(error, result1) =>{
          connection.release()
          if (error)
            throw error
          else{
            res.render('SecViewMore', { Personal: result[0], Name: result1[0]});
          }
        })
      
      });
    }
})
})
app.get('/ChangePassword',(req,res)=>{
  RegNo=req.query.RegNo
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error);
    } else {
      var Sql="select Password from users WHERE RegNo=?"
     connection.query(Sql, [RegNo],(error, result) =>{
      connection.release()
          if (error)
            throw error
          else{
            res.render('ChangePassword', { Personal: result[0]});
          }
        })
      
    }
})


})



app.post('/ChangePassword', (req, res) => {
  const currentPassword = req.body.Current;
  const currentPasswordInput = req.body.Current1;
  const newPassword = req.body.Password;
  const confirmPassword = req.body.Password1; // Corrected from `Level` to `Password1`
  const regNo = req.body.RegNo;

  if (currentPasswordInput === currentPassword) {
    if (newPassword === confirmPassword) {
      connection.getConnection((error, conn) => {
        if (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
        } else {
          const sql = "UPDATE users SET `Password` = ? WHERE RegNo = ?";
          conn.query(sql, [newPassword, regNo], (error, result) => {
            if (error) {
              console.error(error);
              res.status(500).send("Internal Server Error");
            } else {
              res.send('Password Changed Successfully');
              console.log('Password changed for:', regNo);
            }
            conn.release(); // Release the connection
          });
        }
      });
    } else {
      res.send('Passwords do not match');
    }
  } else {
    res.send('Invalid entry');
    console.log('Current password does not match:', currentPasswordInput, currentPassword);
  }
});

app.get('/Photo_Link',(req,res)=>{
  res.render('Photo_Link')
})

app.post('/Photo_Link', upload.single('Image'), (req, res) => {

  var Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
  var Link=req.body.Link;
  var Title=req.body.Title;


 connection.getConnection((error,connection) => {
   if (error) {
     throw error
   }
   else {
     var sql = "INSERT INTO photo_link(Link,Title,Image)values(?,?,?)";
     connection.query(sql, [Link,Title,Image], (error, result) => {
      connection.release()
       if (error) {
         throw error
       }
       else {
         res.redirect('Gallery')
       }
     })
   }
 })
})



app.get('/Gallery',(req,res)=>{
  
  connection.getConnection((error,connection) => {
    if (error) {
      console.log(error)
    }
    else {
  
    var SQl = "SELECT Link,Title,Image FROM photo_link";
      connection.query(SQl, (error, result1) => {
        connection.release()
        if (error) 
        throw (error)
        res.render('Gallery', { Gallery: result1 });
  })
  
    }
  })
  })



port = 2330
app.listen(port, () => {
  console.log(`we are cruising nicely on port ${port}`)
})


