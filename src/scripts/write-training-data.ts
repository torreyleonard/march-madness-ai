import { promises as fs } from "fs";
import * as path from "path";
import { Bracket, DetailedBracketGame } from "../services/bracket";

(async () => {
	const dataDir = path.join(process.cwd(), "data");

	const historicalDir = path.join(dataDir, "historical");

	const files = await fs
		.readdir(historicalDir)
		.then((files) =>
			files.filter((file) => path.extname(file) === ".json")
		);

	const brackets: Bracket[] = [];

	for (const file of files) {
		await fs
			.readFile(path.join(historicalDir, file), "utf8")
			.then((data) => JSON.parse(data))
			.then((data) => brackets.push(data))
			.catch((error) => console.error(error));
	}

	const games: {
		empty: DetailedBracketGame[];
		result: DetailedBracketGame[];
	}[] = [];

	for (const bracket of brackets) {
		for (let i = 0; i < bracket.regions.length; i++) {
			const region = bracket.regions[i];
			for (const round of region) {
				for (const game of round) {
					games.push({
						result: game.map((team) => ({
							...team,
							region: i,
							year: bracket.year,
						})),
						empty: game.map((team) => ({
							...team,
							region: i,
							year: bracket.year,
							score: null,
						})),
					});
				}
			}
		}
	}

	const trainingData: string[] = [];

	for (const game of games) {
		trainingData.push(
			JSON.stringify({
				prompt: JSON.stringify(game.empty),
				completion: ` ${JSON.stringify(game.result)}`,
			})
		);
	}

	await fs.writeFile(
		path.join(dataDir, "../training-data.jsonl"),
		trainingData.join("\n")
	);
})();
