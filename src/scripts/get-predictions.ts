import { promises as fs } from "fs";
import * as path from "path";
import { predictGameResult } from '../services/openai/openai.helpers';
import {
	BracketByRegion,
	DetailedBracketGame,
} from "../services/bracket";
import { bracketByRegion, regionNumberToName } from "../services/bracket/bracket.helpers";

let predictionString = "";

(async () => {
	const bracket: BracketByRegion = await fs
		.readFile(path.join(process.cwd(), "data", "prediction.json"), "utf8")
		.then((data) => JSON.parse(data))
		.then((data) => bracketByRegion(data));

	const finalFour: DetailedBracketGame[][] = [[], []];
	const championship: DetailedBracketGame[] = [];

	console.log("Predicting games...");

	await Promise.all(Object.keys(bracket).map(async (region) => {
		const regionalBracket = bracket[region];
		for (const round of [64, 32, 16, 8]) {
			let string = `\n--------[${regionNumberToName(Number(region))}: Round of ${round}]--------`
			const nextRound = Number(round) / 2;
			for (let i = 0; i < regionalBracket[round].length; i++) {
				const game = regionalBracket[round][i];
				const result: DetailedBracketGame[] = await predictGameResult(game)

				game[0].score = result[0].score;
				game[1].score = result[1].score;

				const sorted = result.sort((a, b) => b.score - a.score);
				const winner = sorted[0];

				const nextGame = {
					seed: winner.seed,
					team: winner.team,
					round_of: 32,
					region: region,
					score: winner.score,
					year: winner.year,
				};

				if (nextRound !== 4) {
					const nextGameIndex = ((i + 1) / 2) % 1 === 0 ? 0 : 1;
					regionalBracket[String(nextRound)][
						Math.ceil((i + 1) / 2) - 1
					][nextGameIndex] = nextGame;
				} else {
					const finalFourPair = Number(winner.region) % 2 === 0 ? 0 : 1;
					finalFour[finalFourPair][winner.region > 1 ? 1 : 0] = nextGame;
				}
			}
			for (const game of regionalBracket[round]) {
				const sorted = game.sort((a, b) => b.score - a.score);
				const winner = sorted[0];
				const loser = sorted[1];
				string += `\n[${regionNumberToName(Number(region))}:${round}] ${winner.seed} ${winner.team} vs ${loser.seed} ${loser.team} (${winner.score} - ${loser.score})`
			}
			predictionString += string
			console.log(string)
		}
	}))

	predictionString += "\n--------[Final Four]--------"
	console.log("--------[Final Four]--------")

	for (const game of finalFour) {
		const result: DetailedBracketGame[] = await predictGameResult(game)
		const sorted = result.sort((a, b) => b.score - a.score);
		const winner = sorted[0];
		const loser = sorted[1];

		const string = `[Final Four] ${winner.seed} ${winner.team} vs ${loser.seed} ${loser.team} (${winner.score} - ${loser.score})`
		predictionString += `\n${string}`
		console.log(string)

		championship.push({
			...winner,
			score: winner.score,
		})
	}

	const championshipResults: DetailedBracketGame[] = await predictGameResult(championship)

	const sorted = championshipResults.sort((a, b) => b.score - a.score);
	const winner = sorted[0];
	const loser = sorted[1];

	console.log("--------[Championship]--------")
	predictionString += "\n--------[Championship]--------"

	const string = `[Championship] ${winner.seed} ${winner.team} vs ${loser.seed} ${loser.team} (${winner.score} - ${loser.score})`
	predictionString += `\n${string}`
	console.log(string)

	await fs.writeFile(
		path.join(process.cwd(), "bracket.txt"),
		predictionString.trim(),
		"utf8"
	);
})();
