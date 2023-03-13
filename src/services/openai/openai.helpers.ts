import { openai } from ".";
import { DetailedBracketGame } from "../bracket";
import { randomIntFromInterval } from '../../util/helpers.util';

export const predictGameResult = async (
	game: DetailedBracketGame[]
): Promise<DetailedBracketGame[]> => {
	if (process.env.DEBUG_MODE === "true") {
		return [
			{
				...game[0],
				score: randomIntFromInterval(50, 100),
			},
			{
				...game[1],
				score: randomIntFromInterval(50, 100),
			},
		];
	}

	const { data } = await openai.createCompletion({
		model: process.env.OPENAI_MODEL_ID,
		prompt: JSON.stringify(game),
		max_tokens: 100,
	});
	
	const result = `${data.choices[0].text.split("]")[0].trim()}]`;
	return JSON.parse(result);
};