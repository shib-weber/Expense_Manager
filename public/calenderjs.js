
const daysElement = document.getElementById('days');
const monthYearElement = document.getElementById('monthYear');
const prevButton = document.querySelector('#prev');
const nextButton = document.getElementById('next');

const cm=new Date().getMonth();
const cy=new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let m=0;
let y=0;

function formatNumber(num) {
  return num.toString().padStart(2, '0');
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const renderCalendar = (month, year) => {
  daysElement.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  m=month;
  y=year
  
  let m1=formatNumber(m+1);
  monthYearElement.innerText = `${months[month]} ${year}`;
  
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    daysElement.appendChild(emptyDiv);
  }
  if(m==cm&& y==cy){
    console.log('t')
    let p=new Date().toISOString().split('T')[0].split('-')[2]
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.className='containdate'
      if(i==p){
        dayDiv.id='tday'
      }
      dayDiv.innerText = i;
      daysElement.appendChild(dayDiv);
    }
    calenderdate(m1)
  }
  else{
      for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className='containdate'
        dayDiv.innerText = i;
        daysElement.appendChild(dayDiv);
      }
      calenderdate(m1)
    }
  }

function calenderdate(m1){
  const contains=document.querySelectorAll('.containdate')
  contains.forEach(contain=>{
    contain.addEventListener('click',async()=>{
    const cd=y+'-'+m1+'-'+contain.innerText
    const response = await fetch('/manager', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: cd })
    });
  
    if (response.ok) {
      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    } else {
      console.error('Error:', response.statusText);
    }

    })
  })
}


prevButton.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextButton.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

renderCalendar(cm, cy);

document.querySelector('#home').addEventListener('click',()=>{
  window.location.href='/manager'
})

document.querySelector('#today').addEventListener('click',()=>{
  document.location.reload();
})


document.querySelector('.go').addEventListener('click',()=>{
  const togo=document.querySelector('#togo').value.split('-').map(Number)
  console.log(togo)
  renderCalendar(togo[1]-1,togo[0])
})




