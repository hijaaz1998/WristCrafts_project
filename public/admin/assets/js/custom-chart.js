const apiUrl = '/admin/loadChart';
const apiUrl1 = '/admin/loadBarChart';

const fetchDataAndUpdateChart = () => {
  fetch(apiUrl)
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => updateChart(data))
    .catch(error => console.error('Fetch error:', error));
};

const fetchDataAndUpdateBarChart = () => {
    fetch(apiUrl1)
      .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
      .then(data => updateBarChart(data))
      .catch(error => console.error('Fetch error:', error));
};

const updateChart = (data) => {
  if ($('#myChart').length) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        datasets: [{
          label: 'Sales',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(44, 120, 220, 0.2)',
          borderColor: 'rgba(44, 120, 220)',
          data: data,   
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          }
        }
      }
    });
  }
};


  

// Fetch data and update chart when the page reloads
window.addEventListener('load', () => {
    console.log("here");
  fetchDataAndUpdateChart();
  fetchDataAndUpdateBarChart();
});
