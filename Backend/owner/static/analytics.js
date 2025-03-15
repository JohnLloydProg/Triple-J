const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const numberOfMembers = document.getElementById('numberOfMembers')
const salesDaily = document.getElementById('daily')
const salesMonthly = document.getElementById('monthly')
const monthBtns = document.getElementById('month-btns')
const dailySalesDisplay = document.getElementById('dailySales')
const monthlySalesDisplay = document.getElementById('monthlySales')

for (let i = 0; i < 12; i++){
  monthBtns.insertAdjacentHTML('beforeend', `<a onclick="selectMonth(${i+1})">${months[i]}</a>`)   
}

async function initGraph(month) {
  salesDaily.innerHTML = ""
  salesMonthly.innerHTML = ""
  let monthlySales = 0
  let dailySales = 0

  peakHoursData = await myRequest.get(`api/analytics/peak/${month}/hours`)
  console.log(peakHoursData)
  new Chart("peakHours", {
      type: "line",
      data: {
          labels:peakHoursData['x'],
          datasets:[{
              fill:false,
              lineTension:0,
              backgroundColor: "rgba(234, 68, 68, 1.0)",
              borderColor: "rgba(234, 68, 68, 0.1)" ,
              data:peakHoursData['y']
          }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          }
        },
      }
    });

  peakDaysData = await myRequest.get(`api/analytics/peak/${month}/days`)
  console.log(peakDaysData)
  new Chart("peakDays", {
      type: "line",
      data: {
          labels:peakDaysData['x'],
          datasets:[{
              fill:false,
              lineTension:0,
              backgroundColor: "rgba(234, 68, 68, 1.0)",
              borderColor: "rgba(234, 68, 68, 0.1)" ,
              data:peakDaysData['y']
          }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          }
        },
      }
    });

    membersData = await myRequest.get('api/analytics/members/report')
    console.log(membersData)
    numberOfMembers.textContent = membersData['number']
    new Chart("demographics", {
        type: "pie",
        data: {
          labels: ['Male', 'Female'],
          datasets: [{
            backgroundColor: ["#EA4444", "#FF2626", "#EA9744", "#756A6A", "#B50000", "#360000"],
            data: [membersData['demographics']['M'], membersData['demographics']['F']]
          }]
        },
        options: {
          legend: {
            position: 'left',
            align: 'start', 
          },
          elements: {
            arc: {
              
            }
          }
        }
      });
    new Chart("memberships", {
        type: "pie",
        data: {
          labels: ['Monthly', 'Daily'],
          datasets: [{
            backgroundColor: ["#EA4444", "#FF2626", "#EA9744", "#756A6A", "#B50000", "#360000"],
            data: [membersData['memberships']['Monthly'], membersData['memberships']['Daily']]
          }]
        },
        options: {
          legend: {
            position: 'left',
            align: 'start', 
          }
        }
      });
    
    workoutsData = await myRequest.get('api/analytics/program/types')
    console.log(workoutsData)
    new Chart("workouts", {
        type: "pie",
        data: {
          labels: workoutsData['x'],
          datasets: [{
            backgroundColor: ["#EA4444", "#FF2626", "#EA9744", "#756A6A", "#B50000", "#360000"],
            data: workoutsData['y']
          }]
        },
        options: {
          legend: {
            position: 'left',
            align: 'start', 
          }
        }
      });
    
    salesReport = await myRequest.get(`api/analytics/sales/${month}`)
    console.log(salesReport)
    for (const [key, value] of Object.entries(salesReport['monthly'])) {
      monthlySales += value
      salesMonthly.insertAdjacentHTML('beforeend', `<tr><td style="widght: 70%; padding-left: 10px">${key}</td> <td style="width: 30%; text-align: right; padding-right: 10px;">${value}</td></tr>`)
    }
    monthlySalesDisplay.textContent = monthlySales

    for (const [key, value] of Object.entries(salesReport['daily'])) {
      dailySales += value
      salesDaily.insertAdjacentHTML('beforeend', `<tr><td style="widght: 70%; padding-left: 10px">${key}</td> <td style="width: 30%; text-align: right; padding-right: 10px;">${value}</td></tr>`)
    }
    dailySalesDisplay.textContent = dailySales
  }
  
async function selectMonth(month) {
  console.log(month)
  initGraph(parseInt(month))
}

let month = new Date().getMonth()+1

initGraph(month)

