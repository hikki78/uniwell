# UniWell

## Algos

### Mood Score System
UniWell includes a sophisticated mood tracking system that calculates a daily mood score based on five key questions:

1. **How are you feeling today?** - Choose from options (Great, Good, Fine, Ok, Not bad, Bad)
2. **How would you rate the last music you played?** - Rate on a scale from 0-10
3. **Have you completed all the tasks today?** - Choose from (Yes, Mostly done, No)
4. **How would you rate your productivity today?** - Rate on a scale from 0-10
5. **How would you rate your health today?** - Rate on a scale from 0-10

The system calculates an overall mood score (out of 50 points) and displays it as a percentage, along with a personalized salutation based on your score:
- 90-100%: "Excellent mood!"
- 80-89%: "Great mood!"
- 70-79%: "Good mood!"
- 60-69%: "Positive mood!"
- 50-59%: "Decent mood!"
- 40-49%: "Fair mood"
- 30-39%: "Could be better"
- 20-29%: "Not so great"
- 0-19%: "Having a rough day"

Your mood history is displayed in a weekly overview chart, helping you visualize patterns in your emotional well-being.

### Wellness Score Algorithm
UniWell features a comprehensive wellness score that provides an overall metric of your daily well-being. The score is calculated using a weighted algorithm that considers multiple aspects of your wellness activities:

- **30% Mood Score** - Based on your daily mood tracking responses
- **20% Screen Time** - Calculated inversely based on how well you're staying within your screen time limits
- **20% Meditation** - Based on the percentage of your meditation target achieved
- **20% Water Intake** - Based on the percentage of your daily water intake goal achieved
- **10% Custom Activities** - Based on the percentage of your custom activities completed

The algorithm has the following notable characteristics:
- If no custom activities are set, the 10% is redistributed evenly among the other categories
- Screen time is scored inversely, so staying below your limit improves your score
- All scores are capped at their respective maximum contributions
- The wellness score has a minimum value of 10 to ensure the display remains meaningful
- The score updates in real-time as you engage with different wellness activities

This holistic approach ensures that your wellness score accurately reflects your overall wellness habits and provides motivation to maintain a balanced routine across different dimensions of well-being.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 