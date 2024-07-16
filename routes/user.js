const express = require('express')
const dns = require('dns');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { User, Expense } = require('../models/user')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')



const router = express.Router();
router.use(bodyParser.json());
router.use(cookieParser());

function TokenVerify(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/home')
    }
    const key = process.env.secret_key;

    jwt.verify(token, key, (err, decoded) => {
        if (err) {
            res.redirect('/home')
        }
        req.user = decoded;
        next();
    })
}

router.get('/', TokenVerify, (req, res) => {
    res.redirect('/manager')
})

router.get('/home', (req, res) => {
    res.render('home')
})


function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateEmailDomain(email, callback) {
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

router.get('/signup', (req, res) => {
    return res.render('signup')
})

router.post('/signup', async(req, res) => {
    const email = req.body.email;

    if (!validateEmailFormat(email)) {
        return res.render('signup', { message: 'Invalid email format' });
    }

    validateEmailDomain(email, (isValidDomain) => {
        if (!isValidDomain) {
            return res.render('signup', { message: 'Invalid email domain' });
        }

    });

    const password = req.body.password
    if(password.length<8){
        return res.render('signup', { message: 'Minimum 8 digit password required' });
    }

    try {
        const result = await User.create({
            Email: email,
            Password: password
        });
        return res.render('login', { message: "Try Logging in" });
    } catch (err) {
        return res.render('signup', { message: 'Email already exists' });
    }
});

router.get('/login', (req, res) => {
    return res.render('login')
})

router.post('/login', async(req, res) => {
    const alluser = await User.find({});
    const ruser = await alluser.find(user => (user.Email == req.body.email && user.Password == req.body.password))
    if (!ruser) {
        return res.render('login', { message: 'Incorrect Email or Password' })
    } else {
        const key = process.env.secret_key;
        const token = jwt.sign({ username: ruser.Email, userid: ruser._id }, key, { expiresIn: '30d' })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        return res.redirect('/manager')
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/home')
})

router.get('/manager', TokenVerify, (req, res) => {
    const dd = new Date().toISOString().split('T')[0]
    res.render('manager', { name: req.user.username, dd })
})

router.post('/manager', TokenVerify, (req, res) => {
    const cd = req.body.date;
    res.render('manager', { name: req.user.username, dd: cd })
})

router.post('/expenses', async(req, res) => {
    const expense = new Expense(req.body);
    await expense.save();
    res.send(expense);
});

router.get('/expenses', TokenVerify, async(req, res) => {
    const dateString = req.query.date;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);;
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    const expenses = await Expense.find({
        Name: req.user.username,
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).sort({ date: 1 });


    var monthlyTotal = 0;
    const tmexpenses = expenses.filter(expenses => {
        return ((expenses.category != 'Income'));
    })
    

    const texpenses = expenses.filter(expenses => {
        return ((expenses.date == req.query.date) && (expenses.category != 'Income'));
    })
    for (i = 0; i < tmexpenses.length; i++) {
        monthlyTotal = monthlyTotal + tmexpenses[i].amount;
    }
    res.send({ texpenses, monthlyTotal });
});


router.delete('/expenses/:id', async(req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.send({ message: 'Expense deleted' });
});

router.get('/calender', TokenVerify, (req, res) => {
    return res.render('calender')
})

router.get('/planning', TokenVerify, async(req, res) => {
    const expenditured = req.query.expenditure
    const dateString = expenditured.split(',')[1];
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);;
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    const expenses = await Expense.find({
        Name: req.user.username,
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).sort({ date: 1 });

    const cuser = await expenses.filter(expense => {
        return expense.category == 'Income'
    })
    var Limit = 0;
    for (i = 0; i < cuser.length; i++) {
        Limit += cuser[i].amount;
    }
    const expenditure = expenditured.split(',')[0]
    const savings = Limit - expenditure
    return res.render('planning', { cuser, name: req.user.username, Limit, expenditure, savings, dateString })
})

router.get('/chartdata',TokenVerify,async(req,res)=>{
    const pdate=req.query.date;
    const dateString = pdate;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);;
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

    const categorizedExpenses = await Expense.aggregate([
        {
          $match: { Name: req.user.username,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            } } 
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $project: {
            category: '$_id',
            totalAmount: 1,
            _id: 0
          }
        }
      ]);
  
      const formattedData = categorizedExpenses.map(item => `${item.category}: ${item.totalAmount}`);
      res.send(formattedData)
})

module.exports = router