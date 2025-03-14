const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const numberOfMembers = document.getElementById('numberOfMembers')
const salesDaily = document.getElementById('daily')
const salesMonthly = document.getElementById('monthly')
const monthsSelect = document.getElementById('months')
for (let i = 0; i < 12; i++){
    monthsSelect.insertAdjacentHTML('beforeend', `<option value="${i+1}">${months[i]}</option>`)   
}

async function initGraph(month) {
    salesDaily.innerHTML = ""
    salesMonthly.innerHTML = ""

    peakHoursData = await myRequest.get(`api/analytics/peak/${month}/hours`)
    console.log(peakHoursData)
    new Chart("peakHours", {
        type: "line",
        data: {
            labels:peakHoursData['x'],
            datasets:[{
                fill:false,
                lineTension:0,
                backgroundColor: "rgba(0, 0, 255, 1.0)",
                borderColor: "rgba(0, 0, 255, 0.1)" ,
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
                  backgroundColor: "rgba(0, 0, 255, 1.0)",
                  borderColor: "rgba(0, 0, 255, 0.1)" ,
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
        numberOfMembers.textContent = `Number of Members: ${membersData['number']}`
        new Chart("demographics", {
            type: "pie",
            data: {
              labels: ['Male', 'Female'],
              datasets: [{
                backgroundColor: ["#8080FF", "#FC0FC0"],
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
                  borderColor: '#EA4444'
                }
              }
            }
          });
        new Chart("memberships", {
            type: "pie",
            data: {
              labels: ['Monthly', 'Daily'],
              datasets: [{
                backgroundColor: ["#8080FF", "#FC0FC0"],
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
                backgroundColor: ["#FFF1C9", "#F7B7A3", "#EA5F89", "#9B3192", "#57167E", "#2B0B3F"],
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
            salesMonthly.insertAdjacentHTML('beforeend', `<tr><td style="widght: 70%;">${key}</td> <td style="width: 30%;">${value}</td></tr>`)
        }
        for (const [key, value] of Object.entries(salesReport['daily'])) {
            salesDaily.insertAdjacentHTML('beforeend', `<tr><td style="widght: 70%;">${key}</td> <td style="width: 30%;">${value}</td></tr>`)
        }
}

async function selectMonth() {
    console.log(monthsSelect.value)
    initGraph(parseInt(monthsSelect.value))
}

let month = new Date().getMonth()+1

initGraph(month)
monthsSelect.value = month

