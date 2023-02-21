// here we get codes from 3rd party plugins/library
const express = require('express') // server code or to run our own server on localhost specified by port
const cors = require('cors') // this allows us to access our server on a different domain
const bodyParser = require("body-parser"); // this allows us to ready request data JSON object
const app = express() // initialize express server into a variable
const fs = require('fs') // use file system of windows or other OS to access local files
const request = require('request');
const requestAPI = request;
const formidable = require("formidable");
const { Sequelize } = require('sequelize');


const accountSid = "ACae9a7d93166fad595f7b0fa67801f00b";
const authToken = "0de6fb95fdb3efc9393c3b8939a9d2c2";
const client = require('twilio')(accountSid, authToken);



const sequelize = new Sequelize('palad','wd32p','7YWFvP8kFyHhG3eF', {
  host: '20.211.37.87',
  dialect: 'mysql'
});


let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

const User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING
    },
    full_name: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    profile_picture: {
        type: Sequelize.STRING
    }
},{
    tableName: 'user',
    timestamps: false,
});




const Student = sequelize.define('students', {
    std_Fname: {
        type: Sequelize.STRING
    },
    std_Lname: {
        type: Sequelize.STRING
    },
    std_Email: {
        type: Sequelize.STRING
    },
    std_Pass: {
        type: Sequelize.STRING
    },
    std_Phone: {
        type: Sequelize.STRING
    },
    std_Profile: {
        type: Sequelize.STRING
    }
},{
    tableName: 'students',
    timestamps: false,
});


const mClass = sequelize.define('events', {
    eventName: {
        type: Sequelize.STRING
    },
    eventDesc: {
        type: Sequelize.STRING
    },
    eventDate: {
        type: Sequelize.STRING
    },
    eventTime: {
        type: Sequelize.STRING
    },
    eventImage: {
        type: Sequelize.STRING
    }
},{
    tableName: 'events',
    timestamps: false,
});





let rawData = fs.readFileSync('data.json'); // read file from given path
let parsedData = JSON.parse(rawData); // parse rawData (which is a string into a JSON object)

app.use(cors()) // initialize cors plugin on express
app.use(bodyParser.urlencoded({ // initialize body parser plugin on express
    extended: true
}));
app.use(bodyParser.json());// initialize body parser plugin on express

let defaultData = [];

app.post('/api/v2/student-login', function (
    request, 
    response
) {
    let retVal = {success: false};
    console.log('req: ', request.body)

    Student.findOne({
        where: {
            std_Email: request.body.email
        }
    })
        .then((result)=>{
            if(result){
                return result.dataValues;
            }else{
                retVal.success = false;
                retVal.message = 'User Does not Exist!'
            }
        })
        .then((result)=>{
            console.log('result: ',result)
            if(result.std_Pass === request.body.password){
                retVal.success = true;
                delete result.password;
                retVal.userData = result;
                return true;
            }else{
                retVal.success = false;
                retVal.message = 'Invalid Password!';
                throw new Error('invalid password');
            }
        })
        .finally(()=>{
            response.send(retVal)
        })
        .catch((error)=>{
            console.log('error: ', error)
            // response.send(retVal)
        })
    // response.send(retVal)
})

app.post('/api/v2/login', function (
    request, 
    response
) {
    let retVal = {success: false};
    console.log('req: ', request.body)
    User.findOne({
        where: {
            username: request.body.username
        }
    })
        .then((result)=>{
            if(result){
                return result.dataValues;
            }else{
                retVal.success = false;
                retVal.message = 'User Does not Exist!'
            }
        })
        .then((result)=>{
            if(result.password === request.body.password){
                retVal.success = true;
                delete result.password;
                retVal.userData = result;
                return true;
            }else{
                retVal.success = false;
                retVal.message = 'Invalid Password!'
                throw new Error('invalid password')
            }
        })
        .finally(()=>{
            response.send(retVal)
        })
        .catch((error)=>{
            console.log('error: ', error)
            // response.send(retVal)
        })
    // response.send(retVal)
})






app.post('/api/v2/register', function (
    request,
    response
) {
    let retVal = {success: false}; 
    console.log('req2: ', request.body)
    Student.findOne({
        where: {
            std_Email: request.body.std_Email
        }
    })
    .then((result)=>{
        console.log('reqnew: ', result)
        if(result){
           retVal.success = false;
           retVal.message = 'email  is already taken'
           response.send(retVal);
        }else{
            Student.create({
                std_Fname: request.body.std_Fname,
                std_Lname: request.body.std_Lname,
                std_Email: request.body.std_Email,
                std_Pass: request.body.std_Pass,
                std_Phone: request.body.std_Phone,
            })
                .then((result)=>{
                    return result.dataValues;
                })
                .then((result)=>{
                    retVal.success = true;
                    delete result.password;
                    retVal.userData = null;
                    // retVal.userData = result; // for auto login after registration
                })
                .finally(()=>{
                    response.send(retVal)
                    client.messages
                    .create({body: 'You are now registed to K Luxe Lashes Masterclass '+ date, from: '+13394994947', to: '+639950151106'})
                    .then(message => console.log(message.sid));
                })
                .catch((error)=>{
                    console.log('error: ', error)
                })
        }
    })
})




app.post('/api/v2/upload', function ( request, response) {
    let retVal = {success: false};
    let form = new formidable.IncomingForm();
    form.parse(request, (error, fields, files)=>{
        const fileName = `uploaded_image_${Date.now()}_${files[""]["originalFilename"]}`;
        const outputDirectory = 'C:/kodego/react/public/assets/images/' +fileName;
        fs.rename(files[""]["filepath"], outputDirectory, (error)=>{
            console.log('error: ', error);
            console.log('outputDirectory: ', outputDirectory);
            if(error){
                retVal.message = "Something went wrong, failed to save the image.";
                response.send(retVal)
            }else{
                retVal.success = true;
                retVal.message = "successfully saved image!";
                User.update(
                    {
                        profile_picture: fileName
                    },
                    {
                        where: {
                            username: "jdoe"
                        }
                    }
                )
                    .then((result)=>{
                        console.log('result: ', result);
                        response.send(retVal)
                    })

            }
        })
        console.log('fileName: ', fileName);
    })
})


const runApp = async ()=>{
    try {
        // await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        app.listen(3000) // run app with this given port
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
runApp()

