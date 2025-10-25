'use client';

import { useEffect, useState } from 'react';
import type { ChartType } from 'chart.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

type ChartInstance = Chart<ChartType>;
interface VoteResponse {
  votes: {
    yes: number;
    maybe: number;
    no: number;
  };
}

export default function Survey() {
  const [chart, setChart] = useState<ChartInstance | null>(null);

  async function vote(option) {
    // Check for previous vote
    if (localStorage.getItem('voted-nature')) {
      alert("You already voted — thank you!");
      return;
    }

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option })
      });

      localStorage.setItem('voted-nature', 'true');
      disableButtons();
      updateDisplay();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote. Please try again.');
    }
  }

  async function updateDisplay() {
    try {
      const response = await fetch('/api/vote');
      const { votes } = await response.json();

      const total = votes.yes + votes.maybe + votes.no;
      const resultsDiv = document.getElementById('results');
      resultsDiv.textContent =
        total === 0
          ? "No votes yet."
          : `${total} ${total === 1 ? "person has" : "people have"} voted so far.`;

      if (chart) chart.destroy();
      const canvas = document.getElementById('chart') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Yes', 'Not sure', 'No'],
          datasets: [{
            data: [votes.yes, votes.maybe, votes.no],
            backgroundColor: ['#4caf50', '#ffcc00', '#f44336']
          }]
        },
        options: {
          plugins: {
            legend: { position: 'bottom' },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 14 },
              formatter: (value: number) => {
                const dataArr = [votes.yes, votes.maybe, votes.no];
                const sum = dataArr.reduce((a, b) => a + b, 0);
                const percentage = sum === 0 ? "0%" : ((value / sum) * 100).toFixed(1) + "%";
                return percentage;
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
      setChart(newChart);
    } catch (error) {
      console.error('Error updating display:', error);
    }
  }

  function disableButtons() {
    document.querySelectorAll('button').forEach(btn => btn.disabled = true);
  }

  useEffect(() => {
    // Check for previous vote on component mount
    if (localStorage.getItem('voted-nature')) {
      disableButtons();
    }
    updateDisplay();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      textAlign: 'center'
    }}>
      <h2>Do you believe that nature photography can help raise awareness about environmental protection?</h2>
      <p>(This survey is anonymous – no personal data is collected or stored.)</p>

      <div id="buttons">
        <button onClick={() => vote('yes')} style={{
          margin: '8px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          background: '#0066cc',
          color: 'white',
          cursor: 'pointer'
        }}>Yes</button>
        <button onClick={() => vote('maybe')} style={{
          margin: '8px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          background: '#0066cc',
          color: 'white',
          cursor: 'pointer'
        }}>Not sure</button>
        <button onClick={() => vote('no')} style={{
          margin: '8px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          background: '#0066cc',
          color: 'white',
          cursor: 'pointer'
        }}>No</button>
      </div>

      <div id="results"></div>
      <canvas id="chart" width="400" height="200"></canvas>

      <p style={{ marginTop: '20px' }}>
        <a href="/">Back to home</a>
      </p>
    </div>
  );
}