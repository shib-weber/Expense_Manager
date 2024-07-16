document.getElementById('planner').addEventListener('submit', async(e) => {
    e.preventDefault();
    const pdate = document.querySelector('.dt').innerText
    const amount = document.getElementById('limit').value;
    const category = 'Income'
    const description = 'Income'
    const Name = document.querySelector('.name').innerText

    const response = await fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Name, date: pdate, amount, category, description })
    });

    const data = await response.json();
    const p = document.createElement('div')
    p.className = 'Ili'
    const p1 = document.createElement('div')
    p1.className = 'amt'
    const p2 = document.createElement('div')
    p2.className = 'cat'
    const p3 = document.createElement('div')
    p3.className = 'del'

    p1.innerHTML = amount;
    p2.innerHTML = 'Income';
    p3.innerHTML = 'Delete';
    p3.onclick = function() {
        deleteExpense(data._id);
    };
    p.appendChild(p1)
    p.appendChild(p2)
    p.appendChild(p3)

    document.querySelector('.Incomes').appendChild(p)

    document.getElementById('limit').value = ''
    const mgv = document.querySelector('.mGv');
    const nmgv = mgv.innerText - (-amount);
    mgv.innerHTML = nmgv
    const save = document.querySelector('.mSv')
    save.innerHTML = nmgv - (document.querySelector('.mEv').innerText)
    init()

});



async function deleteExpense(id) {
    await fetch(`/expenses/${id}`, { method: 'DELETE' });
    document.location.reload();
}

let myPieChart;

async function fetchChartData() {
  try {
    const date = document.querySelector('.dt').innerHTML.trim();
    const response = await fetch(`/chartdata?date=${date}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

function renderPieChart(data) {
  const labels = [];
  const amounts = [];
  
  data.forEach(item => {
    const [label, value] = item.split(': ');
    labels.push(label.trim());
    amounts.push(parseFloat(value));
  });

  const ctx = document.getElementById('pieChart').getContext('2d');
  
  if (myPieChart) {
    myPieChart.destroy();
  }

  myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses',
        data: amounts,
        backgroundColor: [
            'yellow',
            'orange',
            'purple',
            'skyblue',
            'aqua',
            'blue',
            'white',
            'red',
          'rgba(255, 99, 132, 0.2)', 
          'rgba(54, 162, 235, 0.2)'   
        ],
        borderColor: [
            'yellow',
            'orange',
            'purple',
            'skyblue',
            'aqua',
            'blue',
            'white',
            'red',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false, 
      maintainAspectRatio: false, 
      plugins: {
        legend: {
          labels:{
            color:'white',
          },
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: Rs.${value}`;
            }
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      }
    }
  });
}

async function init() {
  const data = await fetchChartData();
  renderPieChart(data);
}

document.addEventListener('DOMContentLoaded', init);

