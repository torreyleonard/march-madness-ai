export interface Bracket {
	year: number
	regions: BracketRegion[]
	finalfour: FinalFour[][][]
}

export type BracketRegion = BracketGame[][][]

export interface BracketGame {
	seed: number
	team: string|null
	score: number|null
	round_of: number
}

export interface FinalFour {
	seed: number
	team: string|null
	score: number|null
	round_of: number
}

export interface DetailedBracketGame extends BracketGame {
	region?: number|string
	year: number
}

export interface RegionsByRound {
	64: DetailedBracketGame[][]
	32: DetailedBracketGame[][]
	16: DetailedBracketGame[][]
	8: DetailedBracketGame[][]
}

export interface BracketByRegion {
	0: RegionsByRound
	1: RegionsByRound
	2: RegionsByRound
	3: RegionsByRound
}