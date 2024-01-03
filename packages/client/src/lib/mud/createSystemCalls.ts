/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import type { Entity } from '@latticexyz/recs'
import type { SetupNetworkResult } from './setupNetwork'

export type SystemCalls = ReturnType<typeof createSystemCalls>

export function createSystemCalls({ worldContract, waitForTransaction }: SetupNetworkResult) {
	const createWakeupObjective = async (alarmTime: number, timezoneHrs: number) => {
		const tx = await worldContract.write.newObjective([alarmTime, timezoneHrs])
		await waitForTransaction(tx)
	}

	const enterDailyCheckInChallenge = async (
		wakeupObjective: Entity,
		challengeDays: number[],
		numWeeks: number
	) => {
		const tx = await worldContract.write.SunStakedCheckIn_enter([
			wakeupObjective as `0x${string}`,
			numWeeks,
			challengeDays
		])
		await waitForTransaction(tx)
		console.log('Entered daily check-in challenge')
	}

	const recordEntry = async (challengeId: Entity) => {
		const tx = await worldContract.write.SunStakedCheckIn_confirmWakeup([challengeId])
		await waitForTransaction(tx)
	}

	const nextDeadlineTimestamp = async (challengeId: Entity) => {
		return Number(await worldContract.read.nextDeadlineTimestamp([challengeId]))
	}

	return {
		createWakeupObjective,
		enterDailyCheckInChallenge,
		recordEntry,
		nextDeadlineTimestamp
	}
}
