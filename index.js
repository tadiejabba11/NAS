const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const crypto = require('crypto');
const session = require('express-session');
const pool = require('./connection'); // Ensure this is correct
const MySQLStore = require('express-mysql-session')(session);

// Use connection pool if you want better scalability
const sessionStore = new MySQLStore({}, pool); // Or use `pool` if you're using a pool

const app = express();

app.set("views", path.join(__dirname, "views")); 
app.set('view engine', 'ejs');
console.log(`Views Directory: ${path.join(__dirname, 'views')}`);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
   key: 'session_cookie_name', 
   secret: 'session_cookie_secret', 
   store: sessionStore, // Store session in MySQL
   resave: false, 
   saveUninitialized: false, 
   cookie: {
     maxAge: 24 * 60 * 60 * 1000, // 1 day
     secure: true, // Set to true in production if using HTTPS
   }
}));


// Define your routes here

// Start the server


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
app.get('/Programs_Desk',(req,res)=>{
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
  var Fullname = req.body.Fullname; // Get the full name from the request body
  var Email = req.body.Email; // Get the Email from the request body
  var Password = req.body.Password;
  
  function generateID() {
    // Generate a random 8-digit hexadecimal string
    const randomDigits = crypto.randomBytes(4).toString('hex');
    
    // Construct the ID with the desired format
    const id = `nas${randomDigits}s`;
    
    return id;
  }
  
  const generatedID = generateID();
  var RegNo = generatedID;

  connection.getConnection((error, connection) => {
    if (error) {
      console.error('Error getting connection:', error);
      res.status(500).send("Database connection error.");
      return;
    } else {
      var sql = "INSERT INTO users(Fullname, Email, RegNo, Password) VALUES (?, ?, ?, ?)";
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

app.post('/login', async (req, res) => {
  const Email = req.body.Email;
  const Password = req.body.Password;

  // Check for Secretary credentials first
  if (Email === 'NasSecretary@gmail.com' && Password === 'S3C@nas2024') {
    return res.redirect('/Secretary');
  }
  if (Email === 'NasProgramsDesk@gmail.com' && Password === 'Prog@546!!') {
    return res.redirect('/Programs_Desk');
  }
  if (Email === 'NASPRO@gmail.com' && Password === '@NA$PRO2024') {
    return res.redirect('/PROs_Desk');
  }
  if (Email === 'NASDLD@gmail.com' && Password === 'DLD@NAS#123') {
    return res.redirect('/DLDs_Desk');
  }

  try {
    const sql = "SELECT * FROM users WHERE Email = ? AND Password = ?";
    const [result] = await connection.promise().query(sql, [Email, Password]);

    if (result.length > 0) {
      // Store RegNo in session
      req.session.RegNo = result[0].RegNo;  // Save RegNo in session
      res.redirect('/UserPage');  // Redirect to UserPage
    } else {
      res.send("Invalid email or password");
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});

app.post('/Personal2', upload.single('Image'), async (req, res) => {
  const RegNo = req.body.RegNo;
  const DOB = req.body.DOB;
  const Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
  const Gender = req.body.Gender;

  try {
    const sql = "INSERT INTO personal2 (RegNo, DOB, Image, Gender) VALUES (?, ?, ?, ?)";
    await pool.promise().execute(sql, [RegNo, DOB, Image, Gender]);
    res.redirect('/Personal?RegNo=' + RegNo);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


       
  
  
app.get('/', async (req, res) => {
  try {
    // Modify SQL to fetch only the latest flyer
    const SQl = "SELECT * FROM flyers ORDER BY ID_No DESC LIMIT 1";
    const [result] = await pool.promise().execute(SQl);
    
    res.render('HomePage', { flyer: result[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send("Query execution error.");
  }
});


app.post('/Anonymous', async (req, res) => {
  var Anonymous_text = req.body.Anonymous_text;

  try {
    // Use the promise-based execute method directly
    const sql = "INSERT INTO anonymous(Anonymous_text) VALUES (?)";
    await pool.promise().execute(sql, [Anonymous_text]);

    res.redirect('Anonymous');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});

app.post('/Requests', async (req, res) => {
  const Request = req.body.Request;

  try {
    const sql = "INSERT INTO prayer_requests (Request) VALUES (?)";
    await pool.promise().execute(sql, [Request]);
    res.redirect('Requests');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/PROs_Desk', async (req, res) => {
  try {
    const sql = "SELECT * FROM anonymous";
    const [result] = await pool.promise().execute(sql);
    
    res.render('PROs_Desk', { anonymous: result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.post('/PROs_Desk', upload.single('Image'), async (req, res) => {
  var Image = `Public/Images/Uploaded_Images/${req.file.filename}`;

  try {
    const sql = "INSERT INTO flyers (Image) VALUES (?)";
    await pool.promise().execute(sql, [Image]);
    res.redirect('HomePage');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});




app.get('/DLDs_Desk', async (req, res) => {
  try {
    const sql = "SELECT * FROM prayer_requests";
    const [result] = await pool.promise().execute(sql);
    
    res.render('DLDs_Desk', { requests: result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/Secretary', async (req, res) => {
  try {
    const SQl = "SELECT personal.Phone_No FROM personal JOIN users ON users.RegNo = personal.RegNo";
    const sql2 = "SELECT users.RegNo, users.Fullname, personal2.Gender FROM users JOIN personal2 ON users.RegNo = personal2.RegNo";
    
    const [result1] = await pool.promise().execute(SQl);
    const [result] = await pool.promise().execute(sql2);
    
    res.render('Secretary', { Users: result, Phone_No: result1 });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.post('/Secretary', async (req, res) => {
  const Fullname = req.body.Fullname;
  const Gender = req.body.Gender;

  try {
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

    // Execute the first query
    const [result] = await pool.promise().execute(SQl, params);
    
    // Execute the second query
    const [result1] = await pool.promise().execute(SQL);

    // Render the Secretary page
    res.render('Secretary', { Users: result, Phone_No: result1 });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Internal Server Error");
  }
});





app.get('/birthdays', async (req, res) => {
  try {
    const SQl = `
      SELECT users.Fullname, personal2.Image 
      FROM users 
      JOIN personal2 ON users.RegNo = personal2.RegNo 
      WHERE DATE_FORMAT(DOB, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')`;

    const [result1] = await pool.promise().execute(SQl);
    res.render('birthdays', { Birthdays: result1 });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/Search', async (req, res) => {
  const Fullname = req.query.Fullname;

  try {
    const SQl = `
      SELECT users.RegNo, users.Fullname, personal2.Image 
      FROM users 
      JOIN personal2 ON users.RegNo = personal2.RegNo 
      WHERE Fullname LIKE ?`;
    
    const [result1] = await pool.promise().execute(SQl, [`%${Fullname}%`]);
    res.render('Search', { Search: result1 });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.post('/Secretary', async (req, res) => {
  const RegNo = req.body.RegNo;

  try {
    const Sql = "SELECT Fullname FROM users";
    const sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";

    const [result] = await pool.promise().execute(sql, [RegNo]);

    const [result1] = await pool.promise().execute(Sql);

    res.render('SecViewMore', { Personal: result[0], Name: result1[0] });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});






app.post('/Programs_Desk', async (req, res) => {
  const Day = req.body.Day;
  const Date = req.body.Date;
  const Month = req.body.Month;
  const Activity = req.body.Activity;

  try {
    const sql = "INSERT INTO programs_desk (Activity, Day, Date, Month) VALUES (?, ?, ?, ?)";
    await pool.promise().execute(sql, [Activity, Day, Date, Month]);
    res.redirect('/Events_Calender');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/Events_Calender', async (req, res) => {
  const Month = req.query.Month;

  try {
    const SQl = "SELECT * FROM programs_desk WHERE month = ?";
    const [result] = await pool.promise().execute(SQl, [Month]);
    
    res.render('Events_Calender', { Event: result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/UserPage', async (req, res) => {
  const RegNo = req.session.RegNo;
  if (!RegNo) {
    return res.redirect('/login');  // Redirect to login if no session
  }

  try {
    const sql = "SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, personal.Address, personal.Level, personal.Programme, personal.Phone_No FROM personal JOIN personal2 ON personal2.RegNo = personal.RegNo WHERE personal.RegNo = ?";
    const Sql = "SELECT Fullname FROM users";

    const [result] = await pool.promise().execute(sql, [RegNo]);
    const [result1] = await pool.promise().execute(Sql);

    res.render('UserPage', { Personal: result[0], Name: result1[0] });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});

  
app.get('/Exec', async (req, res) => {
  const Year = req.query.Year;

  try {
    const SQl = "SELECT Name, Position, Image FROM exec WHERE Year = ? ORDER BY ID_NO";
    const [result] = await pool.promise().execute(SQl, [Year]);
    
    res.render('Exec', { Executive: result });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});



  
app.post('/Update', upload.single('Image'), async (req, res) => {
  let Image;
  if (req.file) {
    Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
  } else {
    Image = req.body.Image2; // Use the existing image if no new image is uploaded 
  }

  const Phone_No = req.body.Phone_No;
  const Address = req.body.Address;
  const Level = req.body.Level;
  const RegNo = req.body.RegNo;

  try {
    const sql = "UPDATE personal SET `Phone_No`=?, `Level`=?, `Address`=? WHERE RegNo=?";
    const SQL = "UPDATE personal2 SET `Image`=? WHERE RegNo=?";

    await pool.promise().execute(sql, [Phone_No, Level, Address, RegNo]);
    await pool.promise().execute(SQL, [Image, RegNo]);

    res.redirect(`/Update?RegNo=${RegNo}`); // Redirect to the specific profile page
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});

app.get('/Update', async (req, res) => {
  const RegNo = req.query.RegNo;

  try {
    const SQL = "SELECT * FROM personal WHERE RegNo = ?";
    const Sql = "SELECT * FROM personal2 WHERE RegNo = ?";

    const [result] = await pool.promise().execute(SQL, [RegNo]);
    const [result1] = await pool.promise().execute(Sql, [RegNo]);

    if (result.length > 0) {
      res.render('Update', { Update: result[0], ImageUpdate: result1[0], RegNo });
    } else {
      console.log("No data found for RegNo:", RegNo);
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/ViewMore', async (req, res) => {
  const RegNo = req.query.RegNo;

  try {
    const sql = `
      SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, 
             personal.Address, personal.Level, personal.Programme, personal.Phone_No 
      FROM personal 
      JOIN personal2 ON personal2.RegNo = personal.RegNo 
      WHERE personal.RegNo = ?`;

    const [result] = await pool.promise().execute(sql, [RegNo]);

    console.log(result); // Log the result to check the data

    if (result.length > 0) {
      res.render('ViewMore', { Personal: result[0] });
    } else {
      res.send('No records found');
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});


app.get('/SecViewMore', async (req, res) => {
  const RegNo = req.query.RegNo;

  try {
    const sql = `
      SELECT personal2.DOB, personal2.Gender, personal2.Image, personal2.RegNo, 
             personal.Address, personal.Level, personal.Programme, personal.Phone_No 
      FROM personal 
      JOIN personal2 ON personal2.RegNo = personal.RegNo 
      WHERE personal.RegNo = ?`;
    const Sql = "SELECT Fullname FROM users";

    const [result] = await pool.promise().execute(sql, [RegNo]);
    const [result1] = await pool.promise().execute(Sql);

    res.render('SecViewMore', { Personal: result[0], Name: result1[0] });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});

app.get('/ChangePassword', async (req, res) => {
  const RegNo = req.query.RegNo;

  try {
    const Sql = "SELECT Password FROM users WHERE RegNo = ?";
    const [result] = await pool.promise().execute(Sql, [RegNo]);

    res.render('ChangePassword', { Personal: result[0] });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});




app.post('/ChangePassword', async (req, res) => {
  const currentPassword = req.body.Current;
  const currentPasswordInput = req.body.Current1;
  const newPassword = req.body.Password;
  const confirmPassword = req.body.Password1;
  const regNo = req.body.RegNo;

  if (currentPasswordInput === currentPassword) {
    if (newPassword === confirmPassword) {
      try {
        const sql = "UPDATE users SET `Password` = ? WHERE RegNo = ?";
        await pool.promise().execute(sql, [newPassword, regNo]);
        res.send('Password Changed Successfully');
        console.log('Password changed for:', regNo);
      } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send("Internal Server Error");
      }
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

app.post('/Photo_Link', upload.single('Image'), async (req, res) => {
  var Image = `Public/Images/Uploaded_Images/${req.file.filename}`;
  var Link = req.body.Link;
  var Title = req.body.Title;

  try {
    const sql = "INSERT INTO photo_link (Link, Title, Image) VALUES (?, ?, ?)";
    await pool.promise().execute(sql, [Link, Title, Image]);
    res.redirect('Gallery');
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});




app.get('/Gallery', async (req, res) => {
  try {
    const SQl = "SELECT Link, Title, Image FROM photo_link";
    const [result1] = await pool.promise().execute(SQl);

    res.render('Gallery', { Gallery: result1 });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).send("Query execution error.");
  }
});



port = 2330
app.listen(port, () => {
  console.log(`we are cruising nicely on port ${port}`)
})



