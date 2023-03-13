import { Bracket, RegionsByRound, BracketByRegion, BracketRegion } from ".";
import * as _ from "lodash";

export function replaceBracketScores(bracket: Bracket): Bracket {
	const newBracket = _.cloneDeep(bracket);

	newBracket.regions.forEach((region) => {
		region.map((round, roundNum) => {
			round.forEach((game) => {
				game.forEach((team) => {
					team.team = roundNum === 0 ? team.team : null;
					team.score = null;
				});
			});
		});
	});

	newBracket.finalfour.forEach((side) => {
		side.forEach((game) => {
			game.forEach((team) => {
				team.seed = null;
				team.team = null;
				team.score = null;
			});
		});
	});

	return newBracket;
}

export const regionsByRound = (region: BracketRegion, year: number): RegionsByRound => {
	const bracketByRound: RegionsByRound = {
		64: [],
		32: [],
		16: [],
		8: [],
	};

	region.forEach((round, roundNum) => {
		round.forEach((game) => {
			bracketByRound[64 / Math.pow(2, roundNum)].push(
				game.map((team) => ({
					...team,
					region: region.indexOf(round),
					year,
				}))
			);
		});
	});

	return bracketByRound;
}

export const bracketByRegion = (bracket: Bracket): BracketByRegion => ({
	0: regionsByRound(bracket.regions[0], bracket.year),
	1: regionsByRound(bracket.regions[1], bracket.year),
	2: regionsByRound(bracket.regions[2], bracket.year),
	3: regionsByRound(bracket.regions[3], bracket.year),
})

export const regionNumberToName = (region: number): string => {
	switch (region) {
		case 0:
			return "South";
		case 1:
			return "Midwest";
		case 2:
			return "East";
		case 3:
			return "West";
	}
}