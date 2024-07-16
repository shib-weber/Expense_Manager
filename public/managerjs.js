var pdate = new Date().toISOString().split('T')[0];
let total = 0;

document.getElementById('expense-form').addEventListener('submit', async(e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value
    const description = document.getElementById('description').value;
    const Name = document.querySelector('.name').innerHTML.trim()

    const response = await fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Name, date: pdate, amount, category, description })
    });

    const data = await response.json();
    displayExpense(data);
    const mtv = document.querySelector('.mtv');
    const newmtv = mtv.innerHTML - (-amount);
    mtv.innerHTML = newmtv;
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
});

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}
document.querySelector('#prev').addEventListener('click', () => {
    let da = (pdate.split('-'))
    let ld = da[2] - 1;
    if (ld < 1) {
        da[1] = formatNumber(--da[1]);
        if (da[1] < 0) {
            da[1] = 12;
            da[0] = da[0] - 1;
        }
        const daysInMonth = new Date(da[0], da[1], 0).getDate();
        ld = daysInMonth;
    }
    let cdate = da[0] + '-' + da[1] + '-' + ld
    pdate = cdate;
    fetchExpenses(cdate);
})

document.querySelector('#next').addEventListener('click', () => {
    let da = (pdate.split('-'))
    const daysInMonth = new Date(da[0], da[1], 0).getDate();
    let ld = da[2] - (-1);
    if (ld > daysInMonth) {
        ld = 1;
        da[1] = formatNumber(++da[1]);
        if (da[1] > 12) {
            da[1] = 1
            da[1] = formatNumber(da[1]);
            da[0]++;
        }
    }
    cdate = da[0] + '-' + da[1] + '-' + ld
    pdate = cdate
    fetchExpenses(cdate);
})

async function fetchExpenses(date) {
    total = 0;
    if (date == (new Date().toISOString().split('T')[0])) {
        document.querySelector('.dt').innerHTML = "Today's Expense";
    } else {
        document.querySelector('.dt').innerHTML = date;
    }
    pdate = date
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = ""
    const response = await fetch(`/expenses?date=${date}`);
    const data = await response.json();
    document.querySelector('.tm').innerHTML = total
    document.querySelector('.mtv').innerHTML = data.monthlyTotal;
    data.texpenses.forEach(expense => displayExpense(expense));
}

function displayExpense(expense) {
    const expenseList = document.getElementById('expense-list');
    const l = document.createElement('div')
    l.className = 'listt'
    const p = document.createElement('div');
    p.className = 'amt'
    const pca = document.createElement('div')
    pca.className = 'cat'
    const p1 = document.createElement('div');
    p1.className = 'des'
    const p2 = document.createElement('div');
    p2.className = 'del'
    p.innerHTML = `${expense.amount}`
    pca.innerHTML = `${expense.category}`
    p1.innerHTML = `${expense.description}`
    p2.innerHTML = `<button id='delbt' onclick="deleteExpense('${expense._id}')">Delete</button>`
    l.appendChild(p)
    l.appendChild(pca)
    l.appendChild(p1)
    l.appendChild(p2)
    expenseList.appendChild(l);
    total += expense.amount;
    document.querySelector('.tm').innerHTML = total
}

async function deleteExpense(id) {
    await fetch(`/expenses/${id}`, { method: 'DELETE' });
    document.location.reload();
}

fetchExpenses(document.querySelector('.cd').innerHTML.trim());


const lout = document.querySelector('#out').addEventListener('click', () => {
    fetch('/logout').then(response => {
            return response.text();
        })
        .then(html => {
            document.open();
            document.close();
        })
})

document.querySelector('#calender').addEventListener('click', () => {
    window.location.href = '/calender';
})

document.querySelector('#openlogout').addEventListener('click', () => {
    document.querySelector('.logout').classList.toggle('logouts')
})

document.querySelector('#planning').addEventListener('click', () => {
    const expenditure = document.querySelector('.mtv').innerHTML
    const date = document.querySelector('.dt').innerHTML
    var cdate = new Date().toISOString().split('T')[0];
    if (date != "Today's Expense") {
        cdate = date;
    }
    window.location.href = `/planning?expenditure=${expenditure},${cdate}`
})