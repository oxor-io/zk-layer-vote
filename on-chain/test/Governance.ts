import { ethers } from 'hardhat';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { expect } from 'chai';

import {
    TokenL2,
    VotesTokenL1,
    GovernorL1,
    StateRootL1
} from '../../typechain-types';

describe('Governance tests', () => {
    async function deployFixture() {
        // Contracts are deployed using the first signer/account by default
        const [voter, dao, scrollVerifier, verifier] =
            await ethers.getSigners();

        // deploy test vote token
        const TokenL1Factory = await ethers.getContractFactory('VotesTokenL1');
        const voteTokenL1 = (await TokenL1Factory.deploy()) as VotesTokenL1;

        // deploy stateRootL1
        const StateRootL1Factory = await ethers.getContractFactory('StateRootL1');
        const stateRootL1 = (await StateRootL1Factory.deploy()) as StateRootL1;

        await voteTokenL1.delegate(voter.address);
        expect(await voteTokenL1.getVotes(voter.address)).to.eq(parseUnits('100000', 'ether'));

        // deploy governor contract
        const GovernorL1Factory = await ethers.getContractFactory('GovernorL1');
        const governor = (await GovernorL1Factory.deploy(
            voteTokenL1.address,
            scrollVerifier.address,
            verifier.address,
            stateRootL1.address
        )) as GovernorL1;

        return {
            voter,
            dao,
            voteTokenL1,
            stateRootL1,
            governor,
            scrollVerifier,
            verifier
        };
    }

    it('should init correctly', async () => {
        const { voter, dao, voteTokenL1, stateRootL1, governor, scrollVerifier, verifier } =
            await loadFixture(deployFixture);

        // check distributor
        expect(await governor.token()).to.eq(voteTokenL1.address);
        expect(await governor.stateRootStorage()).to.eq(stateRootL1.address);
        expect(await governor.verifiers(0)).to.eq(verifier.address);
        expect(await governor.verifiers(534351)).to.eq(scrollVerifier.address);
    });

    it.only('vote through new method', async () => {
        const { voter, dao, voteTokenL1, stateRootL1, governor, scrollVerifier, verifier } =
            await loadFixture(deployFixture);

        // create proposal
        await governor.propose(
            [scrollVerifier.address],
            [100],
            ['0x00'],
            '123'
        );

        const proposalId = parseUnits('35928371837687212312510759377445004591634905092141210148714412203328748565927', 'wei');

        // wait 1 blocks to start voting
        await mine(1);

        let voteItem = await governor.proposalVotes(proposalId);
        expect(voteItem.forVotes).to.eq(parseUnits('0', 'ether'));

        // vote with castVote
        // console.log(await governor.state(proposalId));
        // s

        // console.log(await governor.proposalVotes(proposalId));
        // voteItem = await governor.proposalVotes(proposalId);
        // expect(voteItem.forVotes).to.eq(parseUnits('100000', 'ether'));


        // vote with castVoteFromL2
        await governor.castVoteCC(
            proposalId, 
            voter.address, 
            parseUnits('1', 'wei'),
            voter.address, // TODO
            parseUnits('123', 'ether'), 
            1, 
            '0x00'
        );

        voteItem = await governor.proposalVotes(proposalId);
        expect(voteItem.forVotes).to.eq(parseUnits('123', 'ether'));
    });
});
