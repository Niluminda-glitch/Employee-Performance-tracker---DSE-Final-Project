// src/services/chartConfig.js
import { Chart, registerables } from 'chart.js';
import { ArcElement } from 'chart.js';

// Register all necessary components
Chart.register(...registerables, ArcElement);