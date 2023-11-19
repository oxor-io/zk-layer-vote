import { ethers } from "hardhat";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { expect } from "chai";

import {
  TokenL2,
  VotesTokenL1,
  GovernorL1,
  StateRootL1,
} from "../typechain-types";

const SCROLL_VERIFIER = "0xce380d41e3304192a7190068cBAEa7F875fbc42e";
const STATE_ROOT_STORAGE = "0xbb8c8E79c34C6420716A6937bF7E3B9226Cc81f5";

describe("Governance tests", () => {
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, voter] = await ethers.getSigners();

    // deploy test vote token
    const TokenL1Factory = await ethers.getContractFactory(
      "VotesTokenL1",
      deployer
    );

    const voteTokenL1 = (await TokenL1Factory.deploy()) as VotesTokenL1;
    const stateRootL1 = await ethers.getContractAt(
      "StateRootL1",
      STATE_ROOT_STORAGE
    );

    await voteTokenL1.delegate(voter.address);
    expect(await voteTokenL1.getVotes(voter.address)).to.eq(
      parseUnits("100000", "ether")
    );

    // deploy governor contract
    const GovernorL1Factory = await ethers.getContractFactory("GovernorL1");
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
      verifier,
    };
  }

  it("should init correctly", async () => {
    const {
      voter,
      dao,
      voteTokenL1,
      stateRootL1,
      governor,
      scrollVerifier,
      verifier,
    } = await loadFixture(deployFixture);

    // check distributor
    expect(await governor.token()).to.eq(voteTokenL1.address);
    expect(await governor.stateRootStorage()).to.eq(stateRootL1.address);
    expect(await governor.verifiers(0)).to.eq(verifier.address);
    expect(await governor.verifiers(534351)).to.eq(scrollVerifier.address);
  });

  it("vote through new method", async () => {
    const {
      voter,
      dao,
      voteTokenL1,
      stateRootL1,
      governor,
      scrollVerifier,
      verifier,
    } = await loadFixture(deployFixture);

    // create proposal
    await governor.propose([scrollVerifier.address], [100], ["0x00"], "123");

    const proposalId = parseUnits(
      "35928371837687212312510759377445004591634905092141210148714412203328748565927",
      "wei"
    );

    let stateRoot = await governor.proposalStateRoots(proposalId, 534351);
    console.log(stateRoot);

    stateRoot = await stateRootL1.stateRoots(534351);
    console.log(stateRoot);

    // wait 1 blocks to start voting
    await mine(1);

    let voteItem = await governor.proposalVotes(proposalId);
    expect(voteItem.forVotes).to.eq(parseUnits("0", "ether"));

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
      parseUnits("1", "wei"),
      parseUnits("123", "ether"),
      1,
      "0x00"
    );

    voteItem = await governor.proposalVotes(proposalId);
    expect(voteItem.forVotes).to.eq(parseUnits("123", "ether"));
  });
});
