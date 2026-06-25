import { Injectable } from '@nestjs/common';
import { Insight } from '../interfaces/recommendation-result.interface';
import { CareerMatchWithDetails } from '../interfaces/career-match.interface';

@Injectable()
export class InsightGeneratorService {
  generateInsights(
    topMatches: CareerMatchWithDetails[],
    selectedSkills: string[],
    interest: string,
  ): Insight[] {
    const insights: Insight[] = [];

    if (topMatches.length > 0) {
      const best = topMatches[0];
      insights.push({
        type: 'strength',
        message: `Your strongest career match is ${best.career} with a ${best.matchPercentage}% compatibility score based on your skills and interests.`,
        category: 'Career Match',
      });
    }

    const commonGaps = this.findCommonGaps(topMatches);
    for (const gap of commonGaps.slice(0, 3)) {
      insights.push({
        type: 'weakness',
        message: `Developing ${gap} would improve your match scores across multiple career paths.`,
        category: 'Skill Gap',
      });
    }

    const highGrowthCareers = topMatches
      .filter((c) => (c.growthRate || 0) >= 20)
      .map((c) => `${c.career} (${c.growthRate}% growth)`);

    if (highGrowthCareers.length > 0) {
      insights.push({
        type: 'opportunity',
        message: `High-growth career opportunities include ${highGrowthCareers.slice(0, 3).join(', ')}. These fields are expected to see significant demand increases.`,
        category: 'Growth Opportunity',
      });
    }

    if (interest) {
      const interestBased = topMatches.filter(
        (c) =>
          c.reason.toLowerCase().includes('interest') ||
          c.reason.toLowerCase().includes('match'),
      );
      if (interestBased.length > 0) {
        insights.push({
          type: 'suggestion',
          message: `Your interest in "${interest}" aligns well with ${interestBased.length} career path(s). Consider exploring ${interestBased.slice(0, 2).map((c) => c.career).join(' and ')}.`,
          category: 'Career Suggestion',
        });
      }
    }

    const highSalaryCareers = topMatches
      .filter((c) => {
        const salary = c.averageSalary || '';
        const match = salary.match(/\$([\d,]+)/);
        return match && parseInt(match[1].replace(/,/g, '')) >= 130000;
      })
      .map((c) => c.career);

    if (highSalaryCareers.length > 0) {
      insights.push({
        type: 'suggestion',
        message: `The highest earning potential among your matches is in ${highSalaryCareers[0]}, with typical salaries ranging ${topMatches.find((c) => c.career === highSalaryCareers[0])?.averageSalary}.`,
        category: 'Salary Insight',
      });
    }

    const avgMatch =
      topMatches.reduce((sum, c) => sum + c.matchPercentage, 0) /
      topMatches.length;

    if (avgMatch < 50 && topMatches.length > 0) {
      insights.push({
        type: 'weakness',
        message: `Your average match score is ${Math.round(avgMatch)}%. Consider broadening your skill set in ${selectedSkills.slice(0, 2).join(' and ')} to improve alignment with more career paths.`,
        category: 'Improvement Area',
      });
    }

    if (topMatches.length > 5) {
      insights.push({
        type: 'opportunity',
        message: `You have ${topMatches.length} viable career options. This diversity gives you flexibility in your career journey.`,
        category: 'Career Diversity',
      });
    }

    if (topMatches.length === 0) {
      insights.push({
        type: 'suggestion',
        message: `No strong career matches found with your current skills. Try adding more skills or exploring different interest areas.`,
        category: 'Getting Started',
      });
    }

    return insights;
  }

  private findCommonGaps(careers: CareerMatchWithDetails[]): string[] {
    const gapCounts = new Map<string, number>();
    for (const career of careers) {
      for (const gap of career.skillGaps || []) {
        gapCounts.set(gap, (gapCounts.get(gap) || 0) + 1);
      }
    }
    return Array.from(gapCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([gap]) => gap);
  }

  generateSuggestedPrompts(matches: CareerMatchWithDetails[]): string[] {
    const prompts: string[] = [];

    if (matches.length > 0) {
      const top = matches[0];
      prompts.push(`What skills do I need to become a ${top.career}?`);
    }

    if (matches.length >= 2) {
      prompts.push(
        `How do ${matches[0].career} and ${matches[1].career} compare in terms of career growth?`,
      );
    }

    const highGrowth = matches.find((c) => (c.growthRate || 0) >= 25);
    if (highGrowth) {
      prompts.push(
        `What is the career outlook for ${highGrowth.career} in the next 5 years?`,
      );
    }

    prompts.push('What courses should I take to improve my skills?');
    prompts.push('How can I transition into a tech career?');

    return prompts;
  }
}
