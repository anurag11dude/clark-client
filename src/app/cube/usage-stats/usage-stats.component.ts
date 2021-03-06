import { Component, OnInit } from '@angular/core';
import { UsageStats, LearningObjectStats, UserStats } from '../shared/types/usage-stats';
import { CounterStat } from './counter-block/counter-block.component';
import { PieChart } from './types';
import { UsageStatsService } from '../core/usage-stats/usage-stats.service';

// This variable is used to decided whether or not percentages should be rendered.
// If CHART_HOVERED, tooltips are visible and we do not want to render percentages over tooltips
let CHART_HOVERED = false;
@Component({
  selector: 'cube-usage-stats',
  templateUrl: 'usage-stats.component.html',
  styleUrls: ['usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  outcomeDistributionReady = false;
  lengthDistributionReady = false;

  // Default values are set to -1 (invalid value) to trigger loading spinner
  usageStats: UsageStats = {
    objects: {
      released: -1,
      review: -1,
      downloads: -1,
      collections: { number: -1 },
      lengths: {
        nanomodule: -1,
        micromodule: -1,
        module: -1,
        unit: -1,
        course: -1
      },
      outcomes: {
        remember_and_understand: -1,
        apply_and_analyze: -1,
        evaluate_and_synthesize: -1
      }
    },
    users: {
      accounts: -1,
      organizations: -1
    }
  };

  outcomeDistributionChart: PieChart;
  outcomeLearnMoreLink = 'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy';

  lengthDistributionChart: PieChart;
  lengthLearnMoreLink = 'http://about.clark.center/tutorial/#Uploading';

  counterStats: CounterStat[] = [];

  objectStats: LearningObjectStats;
  userStats: UserStats;

  constructor(private statsService: UsageStatsService) {}

  ngOnInit() {
    this.buildCounterStats();
    this.statsService.getLearningObjectStats().then(stats => {
      this.usageStats.objects.released = stats.released;
      this.usageStats.objects.review = stats.review;
      this.usageStats.objects.downloads = stats.downloads;
      this.usageStats.objects.collections = stats.collections;
      this.usageStats.objects.lengths = {
        nanomodule: stats.lengths.nanomodule,
        micromodule: stats.lengths.micromodule,
        module: stats.lengths.module,
        unit: stats.lengths.unit,
        course: stats.lengths.course
      };

      this.usageStats.objects.outcomes = stats.outcomes;

      this.buildCounterStats();
      this.buildOutcomeDistributionChart();
      this.buildLengthDistributionChart();
    });

    this.statsService.getUserStats().then(stats => {
      this.usageStats.users.accounts = stats.accounts;
      this.usageStats.users.organizations = stats.organizations;
      this.buildCounterStats();
    });
  }

  /**
   * Adds CounterStat for (Learning Objects Released, Learning Objects Under Review, Users, Affiliated Organizations, and Downloads)
   * to array of counter stats
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildCounterStats() {
    // Empty the array to avoid pushing duplicates
    this.counterStats = [
        {
          title: 'Learning Objects Released',
          value: this.usageStats.objects.released
        },
        {
          title: 'Learning Objects Under Review',
          value: this.usageStats.objects.review
        },
        {
          title: 'Quality-Assured Collections',
          value: this.usageStats.objects.collections.number
        },
        {
          title: 'Users',
          value: this.usageStats.users.accounts
        },
        {
          title: 'Affiliated Organizations',
          value: this.usageStats.users.organizations
        },
        {
          title: 'Downloads',
          value: this.usageStats.objects.downloads
        }
      ];
  }

  /**
   * Constructs chart for Learning Object length distribution
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildLengthDistributionChart() {
    this.lengthDistributionChart = {
      title: 'Learning Objects By Length',
      type: 'doughnut',
      labels: ['Nanomodule', 'Micromodule', 'Module', 'Unit', 'Course'],
      data: [
        this.usageStats.objects.lengths.nanomodule,
        this.usageStats.objects.lengths.micromodule,
        this.usageStats.objects.lengths.module,
        this.usageStats.objects.lengths.unit,
        this.usageStats.objects.lengths.course
      ],
      legend: true,
      options: {
        responsive: true,
        legend: {
          position: 'bottom'
        },
        hover: {
          onHover: () => {
            CHART_HOVERED = true;
          }
        },
        animation: {
          onComplete: generatePieSliceLabels
        }
      },
      colors: [
        {
          backgroundColor: [
            '#3b788b',
            '#3b8b80',
            '#3b8b6c',
            '#236b2d',
            '#1e4b25'
          ]
        }
      ]
    };
    this.lengthDistributionReady = true;
  }
  /**
   * Constructs chart for Outcome bloom distribution
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildOutcomeDistributionChart() {
    this.outcomeDistributionChart = {
      title: 'Outcomes By Bloom',
      type: 'pie',
      labels: [
        'Apply and Analyze',
        'Remember and Understand',
        'Evaluate and Synthesize'
      ],
      data: [
        this.usageStats.objects.outcomes.apply_and_analyze,
        this.usageStats.objects.outcomes.remember_and_understand,
        this.usageStats.objects.outcomes.evaluate_and_synthesize
      ],
      legend: true,
      options: {
        responsive: true,
        legend: {
          position: 'bottom'
        },
        hover: {
          onHover: () => {
            CHART_HOVERED = true;
          }
        },
        // @ts-ignore
        animation: {
          onComplete: generatePieSliceLabels
        }
      },
      colors: [
        {
          backgroundColor: ['#21aba5', '#1d566e', '#163a5f']
        }
      ]
    };
    this.outcomeDistributionReady = true;
  }

  /**
   * Sets CHART_HOVERED to true
   *
   * @memberof UsageStatsComponent
   */
  handleChartNotHovered() {
    CHART_HOVERED = false;
  }
}

/**
 * Renders percentages on pie slices
 *
 */
function generatePieSliceLabels() {
  const ctx = this.chart.ctx;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  // If user is not hovering over chart (meaning tooltips are visible), render percentage slices
  if (!CHART_HOVERED) {
    this.data.datasets.forEach(function(dataset) {
      // Sum of data values
      const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
      for (let i = 0; i < dataset.data.length; i++) {
        // Info about Pie Slice
        const model =
          dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
        // Calc midpoint of radius
        const mid_radius =
          model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
        const start_angle = model.startAngle;
        const end_angle = model.endAngle;
        // Calc midpoint of angle
        const mid_angle = start_angle + (end_angle - start_angle) / 2;
        // Calc x coordinate of angle midpoint
        const x = mid_radius * Math.cos(mid_angle);
        // Calc y coordinate of angle midpoint
        const y = mid_radius * Math.sin(mid_angle);

        ctx.fillStyle = '#fff';
        const percent = Math.round((dataset.data[i] / total) * 100);
        // Don't Display If value is zero or percent is less than 10
        if (dataset.data[i] !== 0 && percent >= 10) {
          // Display percentage
          ctx.fillText(`${percent}%`, model.x + x, model.y + y);
        }
      }
    });
  }
}
